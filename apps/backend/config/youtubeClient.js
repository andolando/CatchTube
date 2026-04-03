// src/lib/youtube-client.js
import { google } from 'googleapis';
import prisma from './prisma.js';
import dotenv from 'dotenv';

dotenv.config();

export function buildYoutubeClient(user) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

  oauth2Client.setCredentials({
    access_token: user.youtubeAccessToken,
    refresh_token: user.youtubeRefreshToken,
    expiry_date: user.tokenExpiresAt.getTime(),
  });

  oauth2Client.on('tokens', async (tokens) => {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        youtubeAccessToken: tokens.access_token,
        tokenExpiresAt: new Date(tokens.expiry_date),
      },
    });
  });

  return google.youtube({ version: 'v3', auth: oauth2Client });
}
