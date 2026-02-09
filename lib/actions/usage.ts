"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { startOfDay, endOfDay } from "date-fns";

export async function checkFilebookLimit() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) return { allowed: false, error: "Unauthorized" };

    const count = await prisma.filebook.count({
        where: { userId: session.user.id }
    });

    const isPro = session.user.plan === "PRO";
    const limit = isPro ? 9999 : 5;

    if (count >= limit) {
        return { 
            allowed: false, 
            error: `You have reached the maximum limit of ${limit} filebooks. ${isPro ? "You have reached the extreme limit of 9999 filebooks." : "Upgrade to Pro for unlimited filebooks!"}` 
        };
    }

    return { allowed: true };
}

export async function checkMessageLimit(modelName: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) return { allowed: false, error: "Unauthorized" };

    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    // 1. PROJECT-WIDE RPM PROTECTION (Max 5 RPM)
    // Check if the system has sent too many requests in the last minute
    const systemRpmCount = await prisma.chatMessage.count({
        where: {
            role: "assistant", // Count AI responses as successful requests
            createdAt: { gte: oneMinuteAgo }
        }
    });

    if (systemRpmCount >= 4) {
        return { 
            allowed: false, 
            error: "Systems are busy. Please wait 30-60 seconds and try again." 
        };
    }

    // 2. PROJECT-WIDE DAILY QUOTA (Max 50 RPD)
    // We stop at 48 to leave a small buffer
    const projectDailyCount = await prisma.chatMessage.count({
        where: {
            role: "assistant",
            model: modelName,
            createdAt: { gte: start, lte: end }
        }
    });

    if (projectDailyCount >= 48) {
        return { 
            allowed: false, 
            error: `Total daily quota for ${modelName} has been reached by the community. Try another model or come back tomorrow!` 
        };
    }

    // 3. INDIVIDUAL USER LIMIT (Optimized for 50 users)
    const userCount = await prisma.chatMessage.count({
        where: {
            role: "user",
            filebook: { userId: session.user.id },
            model: modelName,
            createdAt: { gte: start, lte: end }
        }
    });

    const isPro = session.user.plan === "PRO";
    const userLimit = isPro ? 100 : 10;

    if (userCount >= userLimit) {
        return { 
            allowed: false, 
            error: `Your daily limit for ${modelName} (${userCount}/${userLimit}) is reached. ${isPro ? "Please try again tomorrow!" : "Upgrade to Pro for 100 daily questions!"}` 
        };
    }

    return { allowed: true };
}

export async function getUserUsage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) return null;

    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    const questionsToday = await prisma.chatMessage.count({
        where: {
            role: "user",
            filebook: { userId: session.user.id },
            createdAt: { gte: start, lte: end }
        }
    });

    const filebooksCount = await prisma.filebook.count({
        where: { userId: session.user.id }
    });

    const isPro = session.user.plan === "PRO";

    return {
        questionsToday,
        questionsLimit: isPro ? 100 : 10,
        filebooksCount,
        filebooksLimit: isPro ? 9999 : 5,
        plan: session.user.plan
    };
}
