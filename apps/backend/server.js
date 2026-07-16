import dns from "node:dns";
import net from "node:net";

dns.setDefaultResultOrder("ipv4first")

if (typeof net.setDefaultAutoSelectFamily === "function") {
  net.setDefaultAutoSelectFamily(false);
}

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import { sessionMiddleware } from './config/session.js';
import passport from './config/passport.js';
import boss from './config/pgBoss.js';
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
dotenv.config();

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
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(sessionMiddleware);
// app.use(passport.initialize());
// app.use(passport.session());

// app.use('/auth', authRoutes);
app.use('/search', searchRoutes);

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
