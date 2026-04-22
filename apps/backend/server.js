import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
import authRoutes from './routes/authRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import { sessionMiddleware } from './config/session.js';
import passport from './config/passport.js';
import boss from './config/pgBoss.js';

try {
  await boss.start();
  console.log('Pg-boss started successfully');
} catch (error) {
  console.error('Pg-boss failed to start:', err);
}

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/search', searchRoutes);

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
