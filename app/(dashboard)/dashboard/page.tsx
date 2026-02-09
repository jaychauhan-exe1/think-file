import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    FileText,
    MessageSquare,
    Sparkles,
    Clock,
    Plus,
    ArrowRight,
    Zap,
    TrendingUp,
    ShieldCheck,
    Star
} from "lucide-react"
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import Link from 'next/link'
import { getDashboardStats, getRecentActivity } from '@/lib/actions/filebook'

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) return null

    const stats = await getDashboardStats()
    const recentFilebooks = await getRecentActivity()

    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? "Good Morning" : currentHour < 18 ? "Good Afternoon" : "Good Evening";

    const isPro = session.user.plan === "PRO"

    return (
        <div className="space-y-10 p-4 md:p-0">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {greeting}, {session.user.name?.split(" ")[0]}!
                        </h1>
                        {isPro && (
                            <Badge className="bg-primary text-primary-foreground gap-1 px-2 py-0.5">
                                <Sparkles className="w-3 h-3" />
                                PRO
                            </Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground font-medium">
                        Welcome back to your {isPro ? 'Premium' : ''} workspace. Here's what's happening.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button className={`rounded-full h-11 px-6 font-bold group ${isPro ? 'shadow-lg shadow-primary/20 bg-primary' : ''}`} asChild>
                        <Link href="/filebook">
                            <Plus className="mr-2 h-4 w-4" />
                            New Filebook
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Filebooks", value: stats.filebookCount, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Documents", value: stats.documentCount, icon: Zap, color: "text-orange-500", bg: "bg-orange-500/10" },
                    { label: "AI Messages", value: stats.chatCount, icon: MessageSquare, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                ].map((stat, i) => (
                    <Card key={i} className="shadow-none border-border/50 bg-card/40 backdrop-blur-sm rounded-3xl overflow-hidden group hover:bg-card transition-colors duration-500">
                        <CardContent className="p-8 flex items-center gap-6">
                            <div className={`h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary`}>
                                <stat.icon className="h-7 w-7" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                                <p className="text-3xl font-bold mt-1">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <Card className="lg:col-span-2 shadow-none border-border/50 bg-card/40 backdrop-blur-sm rounded-3xl overflow-hidden">
                    <CardHeader className="p-10 pb-6 flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                Recent Filebooks
                            </CardTitle>
                            <CardDescription>Your most recently accessed workspaces.</CardDescription>
                        </div>
                        <Button variant="ghost" className="rounded-full font-bold text-xs uppercase tracking-wider" asChild>
                            <Link href="/my-files">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="px-10 pb-10">
                        {recentFilebooks.length === 0 ? (
                            <div className="py-12 text-center border-2 border-dashed border-border/30 rounded-3xl">
                                <p className="text-muted-foreground font-medium">No activity yet. Create your first filebook!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentFilebooks.map((fb) => (
                                    <Link
                                        key={fb.id}
                                        href={`/filebook/${fb.id}`}
                                        className="flex items-center justify-between p-5 rounded-3xl border border-border/30 bg-background/40 hover:bg-background transition-all group"
                                    >
                                        <div className="flex items-center gap-5 px-1">
                                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">{fb.name}</h4>
                                                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                                    {fb._count.documents} files • {new Date(fb.updatedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions / Tips */}
                <div className="space-y-6">
                    {/* Upgrade Promo */}
                    {session.user.plan !== "PRO" && (
                        <Card className="shadow-none border-primary/20 bg-primary/5 rounded-[2.5rem] overflow-hidden p-8 space-y-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xl font-bold">Try Pro Features</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                                    Get deep reasoning models, unlimited filebooks, and premium support today.
                                </p>
                            </div>
                            <Button className="w-full rounded-full h-12 font-bold group" asChild>
                                <Link href="/upgrade-pro">
                                    Upgrade Now
                                </Link>
                            </Button>
                        </Card>
                    )}

                    {/* Tips Card */}
                    <Card className="shadow-none border-border/50 bg-card/40 backdrop-blur-sm rounded-[2.5rem] overflow-hidden p-8 space-y-6">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Quick Tips</h4>
                        <div className="space-y-5">
                            {[
                                { icon: TrendingUp, text: "Try @mentions in chat to focus on specific files." },
                                { icon: ShieldCheck, text: "Enable 2FA in settings for enhanced security." },
                                { icon: Star, text: "Mark important projects as featured for visibility." },
                            ].map((tip, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="mt-1">
                                        <tip.icon className="h-4 w-4 text-primary" />
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground/80 leading-snug">{tip.text}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
