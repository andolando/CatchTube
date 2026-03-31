import { google } from 'googleapis';
import prisma from '../config/prisma.js';

export const createMainPlaylist = async (accessToken, userId) => {
  console.log('=== createMainPlaylist ===');
  console.log('userId:', userId);
  console.log('accessToken:', accessToken);

  const test = await fetch(
    'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' +
      accessToken,
  );
  const info = await test.json();
  console.log('=== Token Info ===');
  console.log(info);

  const existingPlaylist = await prisma.playlist.findFirst({
    where: { userId: userId, isMain: true },
  });

  if (existingPlaylist) return existingPlaylist;

  const authClient = new google.auth.OAuth2();

  authClient.setCredentials({ access_token: accessToken });
  console.log('credentials set:', authClient.credentials);
  const youtube = google.youtube({ version: 'v3', auth: authClient });

  const response = await youtube.playlists.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: 'CatchTube - Nouvelles videos',
        description:
          'Playlist gérée automatiquement issues de vos abonnements YouTube.',
      },
      status: {
        privacyStatus: 'private',
      },
    },
  });

  console.log('Response:', response.data.status);

  const youtubePlaylist = response.data.id;
  const playlist = await prisma.playlist.create({
    data: {
      name: 'CatchTube - Nouvelles videos',
      isMain: true,
      userId: userId,
      youtubePlaylistId: youtubePlaylist,
    },
  });
  console.log('Playlist cree avec succes :', playlist.name);

  return playlist;
};
