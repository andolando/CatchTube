import { createMainPlaylist } from '../services/playlistService.js';
import { importUserPlaylists } from '../services/youtubeService.js';
import prisma from '../config/prisma.js';

export const googleCallback = async (req, res) => {
  try {
    const user = req.user;
    const playlistExists = await prisma.playlist.findFirst({
      where: {
        userId: user.id,
        isMain: true,
      },
    });

    if (!playlistExists) {
      await createMainPlaylist(user.youtubeAccessToken, user.id);
      await importUserPlaylists(user.youtubeAccessToken, user.id);
    }
    // Redirige vers le dashboard frontend, a faire apres l'implementation du dashboard
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);

    // res.json({
    //   message: 'Connexion réussie',
    //   user: {
    //     id: user.id,
    //     name: user.name,
    //     email: user.email,
    //     avatar: user.avatar,
    //   },
    // });

    console.log(
      'initialisation de playlist et import des abonnements faits apres premiere connexion',
    );
  } catch (err) {
    console.error('Erreur callback Google:', err);
  }
};

// export const logout = (req, res) => {
//   req.logout((err) => {
//     if (err) {
//       console.error('Erreur lors de la déconnexion:', err);
//       return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
//     }

//     if (req.session) {
//       req.session.destroy((err) => {
//         if (err) {
//           console.error('Erreur lors de la destruction de la session:', err);
//           return res
//             .status(500)
//             .json({ message: 'Erreur lors de la déconnexion' });
//         }
//       });

//       res.clearCookie('connect.sid', { path: '/' });
//       return res.status(200).json({ message: 'Déconnexion réussie' });
//     } else {
//       res.clearCookie('connect.sid', { path: '/' });
//       return res.status(200).json({ message: 'Déconnexion réussie' });
//     }
//   });
// };

export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy((err) => {
      if (err) {
        console.error('Erreur lors de la destruction de la session:', err);
        return res
          .status(500)
          .json({ message: 'Erreur lors de la déconnexion' });
      }
      res.clearCookie('connect.sid', { path: '/' });
      return res.status(200).json({ message: 'Déconnexion réussie' });
    });
  });
};
export const getMe = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  const {
    youtubeAccessToken,
    youtubeRefreshToken,
    tokenExpiresAt,
    ...safeUser
  } = req.user;
  res.json(safeUser);
};
