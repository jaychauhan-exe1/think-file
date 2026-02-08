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

    if (count >= 5) {
        return { 
            allowed: false, 
            error: "You have reached the maximum limit of 5 filebooks. Please delete an existing filebook to create a new one." 
        };
    }

    return { allowed: true };
}

export async function checkMessageLimit(modelName?: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) return { allowed: false, error: "Unauthorized" };

    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    // Global daily limit (questions asked by user today)
    const globalCount = await prisma.chatMessage.count({
        where: {
            role: "user",
            filebook: { userId: session.user.id },
            createdAt: { gte: start, lte: end }
        }
    });

    if (globalCount >= 10) {
        return { 
            allowed: false, 
            error: "Daily question limit reached (10/10). Please try again tomorrow." 
        };
    }

    // Model specific limit
    if (modelName) {
        const modelCount = await prisma.chatMessage.count({
            where: {
                role: "user",
                model: modelName,
                filebook: { userId: session.user.id },
                createdAt: { gte: start, lte: end }
            }
        });

        if (modelCount >= 10) {
            return { 
                allowed: false, 
                error: `Daily limit for ${modelName} reached (10/10). Please try again tomorrow or use another model.` 
            };
        }
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

    return {
        questionsToday,
        questionsLimit: 10,
        filebooksCount,
        filebooksLimit: 5
    };
}
