import { google } from "googleapis";
import prisma from "../config/prisma.js";
import { buildYoutubeClient } from "../config/youtubeClient.js";
import dotenv from "dotenv";

dotenv.config();

const MAX_RETRIES = 5;

export const importUserPlaylists = async (accessToken, userId) => {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  const youtube = google.youtube({ version: "v3", auth: oauth2Client });

  let nextPageToken = undefined;
  const allChannels = [];

  do {
    const response = await youtube.subscriptions.list({
      part: ["snippet"],
      mine: true,
      maxResults: 50,
      pageToken: nextPageToken,
    });

    const items = response.data.items ?? [];

    const channelIds = items
      .map((item) => item.snippet?.resourceId?.channelId)
      .filter(Boolean);

    if (channelIds.length > 0) {
      const channelsResponse = await youtube.channels.list({
        part: ["snippet", "contentDetails"],
        id: channelIds,
      });

      const channelsData = channelsResponse.data.items ?? [];

      channelsData.forEach((channel) => {
        allChannels.push({
          youtubeChannelId: channel.id,
          name: channel.snippet?.title ?? "",
          thumbnailUrl: channel.snippet?.thumbnails?.high?.url ?? null,
          uploadPlaylistId:
            channel.contentDetails?.relatedPlaylists?.uploads ?? "",
        });
      });
    }

    nextPageToken = response.data.nextPageToken ?? undefined;
  } while (nextPageToken);

  for (const channelData of allChannels) {
    try {
      const channel = await prisma.channel.upsert({
        where: { youtubeChannelId: channelData.youtubeChannelId },
        update: {
          name: channelData.name,
          thumbnailUrl: channelData.thumbnailUrl,
          uploadPlaylistId: channelData.uploadPlaylistId,
        },
        create: channelData,
      });

      console.log(` Chaîne créée : ${channel.name}`);

      await prisma.userChannel.upsert({
        where: {
          userId_channelId: {
            userId,
            channelId: channel.id,
          },
        },
        update: {},
        create: {
          userId,
          channelId: channel.id,
          source: "YOUTUBE_IMPORT",
          isActive: true,
        },
      });

      console.log(`UserChannel créé pour : ${channel.name}`);
    } catch (err) {
      console.error(` Erreur pour ${channelData.name}:`, err.message);
    }
  }

  console.log("Toutes les chaines", allChannels.length);

  return allChannels.length;
};

// fetch all channels subsribed
export const fetchNewVideos = async () => {
  try {
    console.log("Fetching channels with active subscriptions...");
    const channels = await prisma.channel.findMany({
      where: {
        userChannels: {
          some: {
            isActive: true,
          },
        },
      },
      select: {
        id: true,
        youtubeChannelId: true,
        uploadPlaylistId: true,
        lastVideoPublishedAt: true,
      },
    });

    console.log(`Found ${channels.length} channels with active subscriptions.`);

    let totalNewVideos = 0;

    for (const channel of channels) {
      try {
        const newVideos = await fetchVideosForChannel(channel);
        totalNewVideos += newVideos.length;
      } catch (error) {
        console.log(error.message);
      }
    }

    async function fetchVideosForChannel(channel) {
      const userChannel = await prisma.userChannel.findFirst({
        where: { channelId: channel.id, isActive: true },
        select: {
          user: {
            select: {
              youtubeAccessToken: true,
              youtubeRefreshToken: true,
              tokenExpiresAt: true,
              id: true,
            },
          },
        },
      });

      if (!userChannel) return [];

      const youtube = buildYoutubeClient(userChannel.user);

      const publishedAfter = channel.lastVideoPublishedAt
        ? new Date(channel.lastVideoPublishedAt.getTime() + 1000).toISOString()
        : new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

      let pageToken = undefined;
      const newVideos = [];

      do {
        const response = await youtube.playlistItems.list({
          part: ["snippet", "contentDetails"],
          playlistId: channel.uploadPlaylistId,
          maxResults: 50,
          pageToken,
        });

        const items = response.data.items ?? [];

        for (const item of items) {
          const publishedAt = new Date(item.snippet.publishedAt);

          if (!channel.lastVideoPublishedAt) {
            const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
            if (publishedAt < twoHoursAgo) {
              pageToken = undefined;
              break;
            }
          } else {
            if (publishedAt <= channel.lastVideoPublishedAt) {
              pageToken = undefined;
              break;
            }
          }

          const video = await prisma.video.upsert({
            where: { youtubeVideoId: item.contentDetails.videoId },
            update: {},
            create: {
              youtubeVideoId: item.contentDetails.videoId,
              title: item.snippet.title,
              description: item.snippet.description ?? null,
              thumbnailUrl: item.snippet.thumbnails?.medium?.url ?? null,
              publishedAt,
              channelId: channel.id,
            },
          });

          newVideos.push(video);
        }

        pageToken = response.data.nextPageToken ?? undefined;
      } while (pageToken);

      if (newVideos.length > 0) {
        const mostRecent = newVideos.reduce((a, b) =>
          a.publishedAt > b.publishedAt ? a : b,
        );

        await prisma.channel.update({
          where: { id: channel.id },
          data: {
            lastVideoPublishedAt: mostRecent.publishedAt,
            lastCheckedAt: new Date(),
          },
        });
      } else {
        await prisma.channel.update({
          where: { id: channel.id },
          data: { lastCheckedAt: new Date() },
        });
      }
      return newVideos;
    }

    // console.log(
    //   `Total new videos fetched: ${totalNewVideos} et le process de verification est terminé.`,
    // );
  } catch (error) {
    console.log("Error fetching new videos:", error);
    throw error;
  }
};
export const addToPlaylist = async () => {
  console.log("Demmarage de l'ajout dans des playlists");

  let totalSynced = 0;
  let totalFailed = 0;

  const pendingVideos = await prisma.video.findMany({
    where: {
      playlistItems: {
        none: {},
      },
    },
    select: {
      id: true,
      youtubeVideoId: true,
      channelId: true,
      title: true,
    },
  });

  for (const video of pendingVideos) {
    try {
      await processVideo(video);
      totalSynced++;
    } catch (err) {
      totalFailed++;
      console.error(
        `[add-to-playlist] erreur vidéo ${video.youtubeVideoId} :`,
        err.message,
      );
    }
  }

  async function processVideo(video) {
    const userChannels = await prisma.userChannel.findMany({
      where: {
        channelId: video.channelId,
        isActive: true,
      },
      select: {
        user: {
          select: {
            id: true,
            youtubeAccessToken: true,
            youtubeRefreshToken: true,
            tokenExpiresAt: true,
            playlists: {
              where: { isMain: true },
              select: {
                id: true,
                youtubePlaylistId: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    for (const { user } of userChannels) {
      const playlist = user.playlists[0];

      if (!playlist) {
        console.log(
          `[add-to-playlist] user ${user.id} n'a pas de playlist principale, on skip`,
        );
        continue;
      }

      const playlistItem = await prisma.playlistItem.upsert({
        where: {
          playlistId_videoId: {
            playlistId: playlist.id,
            videoId: video.id,
          },
        },
        update: {},
        create: {
          playlistId: playlist.id,
          videoId: video.id,
          syncStatus: "PENDING",
        },
      });

      if (playlistItem.syncStatus === "SYNCED") {
        continue;
      }

      try {
        const youtube = buildYoutubeClient(user);

        const response = await youtube.playlistItems.insert({
          part: ["snippet"],
          requestBody: {
            snippet: {
              playlistId: playlist.youtubePlaylistId,
              resourceId: {
                kind: "youtube#video",
                videoId: video.youtubeVideoId,
              },
            },
          },
        });

        await prisma.playlistItem.update({
          where: { id: playlistItem.id },
          data: {
            syncStatus: "SYNCED",
            youtubeItemId: response.data.id,
            syncedAt: new Date(),
          },
        });

        console.log(
          `[add-to-playlist] "${video.title}" ajoutée à la playlist de user ${user.id}`,
        );
      } catch (err) {
        await prisma.playlistItem.update({
          where: { id: playlistItem.id },
          data: { syncStatus: "FAILED" },
        });
      }
    }
  }
};

export const retryFailedItems = async () => {
  const failedItems = await prisma.playlistItem.findMany({
    where: {
      syncStatus: "FAILED",
      retryCount: { lt: MAX_RETRIES },
    },
    select: {
      id: true,
      retryCount: true,
      video: {
        select: {
          youtubeVideoId: true,
          title: true,
        },
      },
      playlist: {
        select: {
          youtubePlaylistId: true,
          user: {
            select: {
              id: true,
              youtubeAccessToken: true,
              youtubeRefreshToken: true,
              tokenExpiresAt: true,
            },
          },
        },
      },
    },
  });

  let totalRecovered = 0;
  let totalAbandoned = 0;
  let totalFailed = 0;

  for (const item of failedItems) {
    const { user } = item.playlist;
    const isLastAttempt = item.retryCount + 1 >= MAX_RETRIES;

    try {
      const youtube = buildYoutubeClient(user);
      const response = await youtube.playlistItems.insert({
        part: ["snippet"],
        requestBody: {
          snippet: {
            playlistId: item.playlist.youtubePlaylistId,
            resourceId: {
              kind: "youtube#video",
              videoId: item.video.youtubeVideoId,
            },
          },
        },
      });

      await prisma.playlistItem.update({
        where: { id: item.id },
        data: {
          syncStatus: "SYNCED",
          youtubeItemId: response.data.id,
          syncedAt: new Date(),
          retryCount: 0,
        },
      });

      totalRecovered++;
    } catch (err) {
      if (isLastAttempt) {
        await prisma.playlistItem.update({
          where: { id: item.id },
          data: {
            syncStatus: "REMOVING",
            retryCount: { increment: 1 },
            lastFailedAt: new Date(),
          },
        });
        totalAbandoned++;
      } else {
        await prisma.playlistItem.update({
          where: { id: item.id },
          data: {
            retryCount: { increment: 1 },
            lastFailedAt: new Date(),
          },
        });
        totalFailed++;
      }
    }
  }
};

// fetch statistics of channels found by tavily
export const channelsStats = async (channels) => {
  try {
    const stats = [];
    for (const channel of channels) {
      
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channel)}&maxResults=10&key=${process.env.YOUTUBE_API_KEY}`,
      );
      const searchData = await searchResponse.json();

      if (!searchData.items || searchData.items.length === 0) {
        console.warn(`No data found for channel: ${channel}`);
        continue;
      }

      const channelId = searchData.items[0].id.channelId;

    
      const statsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${process.env.YOUTUBE_API_KEY}`,
      );
      const statsData = await statsResponse.json();

      if (!statsData.items || statsData.items.length === 0) {
        console.warn(`No stats found for channel ID: ${channelId}`);
        continue;
      }

      const channelStats = statsData.items[0];
      stats.push({
        nameChannel: channelStats.snippet.title,
        channelId: channelStats.id,
        subscriberCount: channelStats.statistics.subscriberCount || "0",
        description: channelStats.snippet.description,
        thumbnailUrl: channelStats.snippet.thumbnails.default.url,
        bannerUrl: channelStats.snippet.thumbnails.default.url || null,
      });
    }
    return stats;
  } catch (error) {
    console.error("Error fetching channel stats:", error);
    throw error;
  }
};
