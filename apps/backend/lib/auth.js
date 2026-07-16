import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../config/prisma.js";
import { sendOTP } from "../services/emailService.js";

import dotenv from "dotenv";
dotenv.config();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          await sendOTP(email, otp);
        }
      },
    }),
  ],

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/youtube",
        "https://www.googleapis.com/auth/youtube.readonly",
      ],
      authorizationUrlWithParams: {
        scope: "openid profile email https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.readonly",
        access_type: "offline",
        prompt: "consent"
      }
    },
  },

  trustedOrigins: [process.env.FRONTEND_URL],
});
