import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './prisma.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        console.log(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_CALLBACK_URL,
        );

        if (user) {
          user = await prisma.user.update({
            where: { googleId: profile.id },
            data: {
              youtubeAccessToken: accessToken,
              youtubeRefreshToken: refreshToken ?? user.youtubeRefreshToken,
              tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
            },
          });
        } else {
          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              email: profile.emails?.[0]?.value ?? '',
              name: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value ?? null,
              youtubeAccessToken: accessToken,
              youtubeRefreshToken: refreshToken ?? '',
              tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
            },
          });
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
