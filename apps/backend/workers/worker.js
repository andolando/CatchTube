import boss from '../config/pgBoss.js';
import { syncPlaylistsHandler } from '../jobs/addVideoToPlaylist.js';

const startWorker = async () => {
  await boss.start();
//   await boss.unschedule('sync-youtube-playlist');
//   await boss.createQueue('sync-youtube-playlist');
  await boss.schedule(
    'sync-youtube-playlist',
    '*/15 * * * *',
    {},
    { singletonKey: 'sync-youtube-playlist' },
  );

  await boss.work(
    'sync-youtube-playlist',
    { teamSize: 1, teamConcurrency: 1 },
    syncPlaylistsHandler,
  );
  console.log('Worker started and listening for jobs...');
};

startWorker().catch((error) => {
  console.error('Error starting worker:', error);
  process.exit(1);
});
