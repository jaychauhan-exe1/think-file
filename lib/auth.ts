import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
      },
      username: {
        type: "string",
        required: false,
      },
      plan: {
        type: "string",
        required: false,
      },
      compactSidebar: {
        type: "boolean",
        required: false,
      },
      autoSummarization: {
        type: "boolean",
        required: false,
      },
      deepReasoningMode: {
        type: "boolean",
        required: false,
      },
      emailNotifications: {
        type: "boolean",
        required: false,
      },
      inAppNotifs: {
        type: "boolean",
        required: false,
      },
      twoFactorEnabled: {
        type: "boolean",
        required: false,
      },
    },
  },
  plugins: [
    twoFactor()
  ]
});

