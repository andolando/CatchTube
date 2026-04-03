
import {
  fetchNewVideos,
  addToPlaylist,
  retryFailedItems,
} from '../services/youtubeService.js';

export const syncPlaylistsHandler = async () => {
  console.log(
    'Demarrage de synchronisation et surveillance des nouvelles videos sur youtube',
  );

  try {
    await fetchNewVideos();
    await addToPlaylist();
    await retryFailedItems();

    console.log(
      'Synchronisation terminee. En attente de la prochaine execution...',
    );
  } catch (error) {
    console.error('Erreur lors de la synchronisation :', error);
  }
};
