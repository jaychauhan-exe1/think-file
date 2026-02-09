import React from 'react'
import { getFeaturedFilebooks } from '@/lib/actions/filebook'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, MessageSquare, Sparkles, User, Calendar, Trash2, ShieldOff, ArrowRight } from "lucide-react"
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { approveFeatured, deleteFilebook } from '@/lib/actions/filebook'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function FeaturedFilesPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    const featuredFiles = await getFeaturedFilebooks()
    const isAdmin = session?.user?.role === "admin";

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Featured Collections</h2>
                    <p className="text-muted-foreground">
                        Hand-picked community collections for deep analysis and research.
                    </p>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 gap-2 px-3 py-1">
                    <Sparkles className="w-4 h-4" />
                    {featuredFiles.length} Featured
                </Badge>
            </div>

            {featuredFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-3xl bg-muted/30">
                    <Sparkles className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold">No featured files yet</h3>
                    <p className="text-muted-foreground">Check back later for curated community content.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredFiles.map((file: any) => (
                        <Card key={file.id} className="group shadow-none bg-card/40 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 rounded-2xl overflow-hidden flex flex-col">
                            <CardHeader className="p-6 pb-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/10">
                                        <FileText className="text-primary w-6 h-6" />
                                    </div>
                                    <Badge variant="outline" className="rounded-full text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-background">
                                        {file._count.documents} Docs
                                    </Badge>
                                </div>
                                <CardTitle className="text-xl font-bold line-clamp-1">{file.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 pt-0 space-y-4 flex-1">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Avatar className="h-6 w-6 border border-border">
                                        <AvatarImage src={file.user.image || ""} />
                                        <AvatarFallback className="text-[10px]">{file.user.name?.charAt(0) || "U"}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium truncate">{file.user.name || "Community Member"}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground/60">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(file.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-6 pt-0 border-t border-border/50 bg-muted/10 group-hover:bg-primary/5 transition-colors flex flex-col gap-3">
                                <Button className="w-full rounded-xl gap-2 font-bold group/btn" variant="ghost" asChild>
                                    <Link href={`/filebook/${file.id}`}>
                                        View Filebook
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>

                                {isAdmin && (
                                    <div className="w-full grid grid-cols-2 gap-2 pt-2 border-t border-border/30">
                                        <form className="w-full" action={async () => {
                                            'use server'
                                            await approveFeatured(file.id, false)
                                        }}>
                                            <Button variant="outline" size="sm" className="w-full rounded-lg text-[10px] uppercase font-bold tracking-wider h-8 border-orange-500/30 text-orange-500 hover:bg-orange-500/10 hover:border-orange-500/50">
                                                <ShieldOff className="w-3 h-3 mr-1" />
                                                Un-feature
                                            </Button>
                                        </form>
                                        <form className="w-full" action={async () => {
                                            'use server'
                                            await deleteFilebook(file.id)
                                        }}>
                                            <Button variant="outline" size="sm" className="w-full rounded-lg text-[10px] uppercase font-bold tracking-wider h-8 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50">
                                                <Trash2 className="w-3 h-3 mr-1" />
                                                Delete
                                            </Button>
                                        </form>
                                    </div>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

