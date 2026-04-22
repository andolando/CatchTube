import boss from "../config/pgBoss.js";
import { syncPlaylistsHandler } from "../jobs/addVideoToPlaylist.js";
import { EmptyPlaylistItem } from "../services/playlistService.js";

const startWorker = async () => {
  await boss.start();
  await boss.unschedule("sync-youtube-playlist");
  await boss.createQueue("sync-youtube-playlist");
  await boss.schedule(
    "sync-youtube-playlist",
    "0 */2 * * *",
    {},
    { singletonKey: "sync-youtube-playlist" },
  );

  await boss.work(
    "sync-youtube-playlist",
    { teamSize: 1, teamConcurrency: 1 },
    syncPlaylistsHandler,
  );
  console.log("Worker started and listening for jobs...");
};

startWorker().catch((error) => {
  console.error("Error starting worker:", error);
  process.exit(1);
});

const startEmptyVideos = async () => {
  await boss.start();
  await boss.unschedule("sync-empty-videos");
  await boss.createQueue("sync-empty-videos");
  await boss.schedule(
    "sync-empty-videos",
    "0 */3 * * *",
    {},
    { singletonKey: "sync-empty-videos" },
  );
  await boss.work(
    "sync-empty-videos",
    { teamSize: 1, teamConcurrency: 1 },
    EmptyPlaylistItem,
  );
  console.log("Working to trash videos already added");
};

startEmptyVideos().catch(() => {
  console.error("Error starting worker:", error);
  process.exit(1);
});
