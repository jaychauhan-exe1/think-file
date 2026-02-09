import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
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
      },
      username: {
        type: "string",
      },
      plan: {
        type: "string",
      },
      compactSidebar: {
        type: "boolean",
      },
      autoSummarization: {
        type: "boolean",
      },
      deepReasoningMode: {
        type: "boolean",
      },
      emailNotifications: {
        type: "boolean",
      },
      inAppNotifs: {
        type: "boolean",
      },
      twoFactorEnabled: {
        type: "boolean",
      },
    },
  },
  plugins: [
    twoFactor()
  ]
});

