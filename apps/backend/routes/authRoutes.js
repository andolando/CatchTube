import { Router } from 'express';
import passport from '../config/passport.js';
import {
  googleCallback,
  logout,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// router.get(
//   '/google',
//   passport.authenticate('google', {
//     scope: [
//       'profile',
//       'email',
//       'https://www.googleapis.com/auth/youtube',
//       'https://www.googleapis.com/auth/youtube.readonly',
//     ],
//   }),
// );

router.get(
  '/google',
  passport.authenticate('google', {
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.readonly',
    ],
    accessType: 'offline',
    prompt: 'consent',
  }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  googleCallback,
);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;
