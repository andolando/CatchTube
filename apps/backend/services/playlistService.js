import { google } from "googleapis";
import prisma from "../config/prisma.js";

export const createMainPlaylist = async (accessToken, userId) => {
  console.log("userId:", userId);
  console.log("accessToken:", accessToken);

  const existingPlaylist = await prisma.playlist.findFirst({
    where: { userId: userId, isMain: true },
  });

  if (existingPlaylist) return existingPlaylist;

  const authClient = new google.auth.OAuth2();

  authClient.setCredentials({ access_token: accessToken });
  console.log("credentials set:", authClient.credentials);
  const youtube = google.youtube({ version: "v3", auth: authClient });

  const response = await youtube.playlists.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title: "CatchTube - Nouvelles videos",
        description:
          "Playlist gérée automatiquement issues de vos abonnements YouTube.",
      },
      status: {
        privacyStatus: "private",
      },
    },
  });

  console.log("Response:", response.data.status);

  const youtubePlaylist = response.data.id;
  const playlist = await prisma.playlist.create({
    data: {
      name: "CatchTube - Nouvelles videos",
      isMain: true,
      userId: userId,
      youtubePlaylistId: youtubePlaylist,
    },
  });
  console.log("Playlist cree avec succes :", playlist.name);

  return playlist;
};

export const EmptyPlaylistItem = async () => {
  try {
    const playlists = await prisma.playlist.findMany();
    if (!playlists) throw new Error("Y a pas de playlist sur l'app");

    for (let playlist of playlists) {
      const playlistItems = await prisma.playlistItem.deleteMany({
        where: {
          playlistId: playlist.id,
        },
      });

      // Supprimer aussi les videos et avoir le bon timing pour supprimer les videos afin d'eviter
      // qu' une video pas encore insere soit supprime deja.

      

      console.log("Supprime avec succes");
    }
  } catch (error) {
    console.log(
      "Erreur de la vidange des playlistItem ainsi que des videos",
      error.message,
    );
  }
};
