import React from 'react'
import { getPendingFeaturedRequests, approveFeatured } from '@/lib/actions/filebook'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Check, X, User, Mail, Calendar, FileText, Eye } from "lucide-react"
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.role !== 'admin') {
        redirect('/dashboard')
    }

    const pendingRequests = await getPendingFeaturedRequests()

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <ShieldCheck className="text-primary w-8 h-8" />
                        Admin Dashboard
                    </h2>
                    <p className="text-muted-foreground">
                        Manage community content and system requests.
                    </p>
                </div>
                <Badge variant="outline" className="rounded-full bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5 py-1 px-4 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    System Active
                </Badge>
            </div>

            <div className="grid gap-6">
                <Card className="shadow-none border-border/50 bg-card/40 backdrop-blur-sm rounded-3xl">
                    <CardHeader>
                        <CardTitle className="text-xl">Featured Requests</CardTitle>
                        <CardDescription>
                            Users requesting to have their filebooks featured on the community page.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {pendingRequests.length === 0 ? (
                            <div className="py-12 text-center space-y-3">
                                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
                                    <Check className="w-6 h-6" />
                                </div>
                                <p className="text-muted-foreground font-medium">No pending requests at the moment.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendingRequests.map((request: any) => (
                                    <div key={request.id} className="flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-background/50 hover:bg-background transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground">{request.name}</h4>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {request.user.name}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {request.user.email}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(request.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="ghost" className="h-9 px-4 rounded-xl hover:bg-primary/10 hover:text-primary gap-2" asChild>
                                                <Link href={`/filebook/${request.id}`}>
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </Link>
                                            </Button>
                                            <form action={async () => {
                                                'use server'
                                                await approveFeatured(request.id, true)
                                            }}>
                                                <Button size="sm" variant="outline" className="h-9 px-4 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20 gap-2 border-border/50">
                                                    <Check className="w-4 h-4" />
                                                    Approve
                                                </Button>
                                            </form>
                                            <form action={async () => {
                                                'use server'
                                                await approveFeatured(request.id, false)
                                            }}>
                                                <Button size="sm" variant="ghost" className="h-9 px-4 rounded-xl hover:bg-destructive/10 hover:text-destructive gap-2">
                                                    <X className="w-4 h-4" />
                                                    Reject
                                                </Button>
                                            </form>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
