import { google } from 'googleapis';
import prisma from '../config/prisma.js';

export const importUserPlaylists = async (accessToken, userId) => {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  let nextPageToken = undefined;
  const allChannels = [];

  do {
    const response = await youtube.subscriptions.list({
      part: ['snippet'],
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
        part: ['snippet', 'contentDetails'],
        id: channelIds,
      });

      const channelsData = channelsResponse.data.items ?? [];

      channelsData.forEach((channel) => {
        allChannels.push({
          youtubeChannelId: channel.id,
          name: channel.snippet?.title ?? '',
          thumbnailUrl: channel.snippet?.thumbnails?.high?.url ?? null,
          uploadPlaylistId:
            channel.contentDetails?.relatedPlaylists?.uploads ?? '',
        });
      });
    }

    nextPageToken = response.data.nextPageToken ?? undefined;
  } while (nextPageToken);

  // await Promise.allSettled(
  //     allChannels.map(channel => {
  //         return prisma.channel.upsert({
  //             where: { youtubeChannelId: channel.youtubeChannelId },
  //             update: {
  //                 name: channel.name,
  //                 thumbnail: channel.thumbnail,
  //                 uploadsPlaylistId: channel.uploadsPlaylistId
  //             },
  //             create: {
  //                 youtubeChannelId: channel.youtubeChannelId,
  //                 name: channel.name,
  //                 thumbnail: channel.thumbnail,
  //                 uploadsPlaylistId: channel.uploadsPlaylistId
  //             }
  //         })
  //     })
  // )

  // await Promise.allSettled(
  //   allChannels.map(async (channelData) => {
  //     const channel = await prisma.channel.upsert({
  //       where: { youtubeChannelId: channelData.youtubeChannelId },
  //       update: {
  //         name: channelData.name,
  //         thumbnailUrl: channelData.thumbnail,
  //         uploadsPlaylistId: channelData.uploadsPlaylistId,
  //       },
  //       create: channelData,
  //     });

  //     await prisma.userChannel.upsert({
  //       where: {
  //         userId_channelId: {
  //           userId,
  //           channelId: channel.id,
  //         },
  //       },
  //       update: {},
  //       create: {
  //         userId,
  //         channelId: channel.id,
  //         source: 'YOUTUBE_IMPORT',
  //         isActive: true,
  //       },
  //     });
  //   }),
  // );

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
          source: 'YOUTUBE_IMPORT',
          isActive: true,
        },
      });

      console.log(`UserChannel créé pour : ${channel.name}`);
    } catch (err) {
      console.error(` Erreur pour ${channelData.name}:`, err.message);
    }
  }

  console.log('Toutes les chaines', allChannels.length);

  return allChannels.length;
};
