import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, CreditCard, Receipt, Zap, ArrowUpRight, Crown } from "lucide-react"
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import Link from 'next/link'

export default async function BillingPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) return null

    const isPro = session.user.plan === 'PRO'

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <CreditCard className="w-8 h-8 text-primary" />
                        Billing & Subscription
                    </h2>
                    <p className="text-muted-foreground">
                        Manage your subscription plan, payment methods, and invoices.
                    </p>
                </div>
                {isPro ? (
                    <Badge className="bg-gradient-to-r from-orange-400 to-primary text-white border-none gap-2 px-4 py-1.5 rounded-full">
                        <Crown className="w-4 h-4 fill-white" />
                        PRO PLAN
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 gap-2 h-7 px-3">
                        FREE PLAN
                    </Badge>
                )}
            </div>

            <div className="grid gap-8">
                {/* Current Plan Card */}
                <Card className={`relative shadow-none border-border/50 overflow-hidden rounded-[2.5rem] ${isPro ? 'bg-card border-primary/30 ring-1 ring-primary/20 shadow-2xl shadow-primary/5' : 'bg-card/40 backdrop-blur-sm'}`}>
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        {isPro ? <Crown className="w-40 h-40" /> : <Zap className="w-40 h-40" />}
                    </div>
                    <CardHeader className="p-10 pb-6 relative z-10">
                        <CardTitle className="text-2xl font-bold">Current Subscription</CardTitle>
                        <CardDescription>You are currently on the <span className="text-foreground font-bold">{session.user.plan || 'Free'}</span> plan.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-10 pb-10 relative z-10">
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between p-6 rounded-3xl bg-background/50 border border-border/30">
                                <div className="space-y-1 text-left">
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Next Billing Date</p>
                                    <p className="text-lg font-bold">March 12, 2026</p>
                                </div>
                                <div className="space-y-1 text-left">
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Monthly Amount</p>
                                    <p className="text-2xl font-bold text-primary">{isPro ? '$19.00' : '$0.00'}</p>
                                </div>
                                <div className="space-y-1 text-left">
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Payment Method</p>
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4" />
                                        <p className="text-lg font-bold">•••• 4242</p>
                                    </div>
                                </div>
                            </div>

                            {!isPro && (
                                <div className="p-8 rounded-3xl bg-primary/5 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="space-y-2 text-left">
                                        <h4 className="text-xl font-bold flex items-center gap-2">
                                            <Zap className="w-5 h-5 text-primary" />
                                            Unlock Premium Features
                                        </h4>
                                        <p className="text-muted-foreground font-medium">Get unlimited filebooks, deep reasoning models, and priority support.</p>
                                    </div>
                                    <Button className="rounded-2xl h-14 px-8 text-lg font-bold group" asChild>
                                        <Link href="/upgrade-pro">
                                            Upgrade now
                                            <ArrowUpRight className="ml-2 w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    {isPro && (
                        <CardFooter className="px-10 py-6 border-t border-border/30 bg-muted/20">
                            <Button variant="ghost" className="text-destructive font-bold hover:bg-destructive/10 rounded-xl">Cancel Subscription</Button>
                        </CardFooter>
                    )}
                </Card>

                {/* Billing History */}
                <Card className="shadow-none border-border/50 bg-card/40 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-10 pb-6">
                        <div className="flex items-center gap-3">
                            <Receipt className="w-6 h-6 text-primary" />
                            <CardTitle className="text-xl">Billing History</CardTitle>
                        </div>
                        <CardDescription>Download your past invoices and receipts.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-10 pb-10">
                        <div className="space-y-4">
                            {[
                                { date: 'Feb 12, 2026', amount: '$19.00', status: 'Paid', id: '#INV-0045' },
                                { date: 'Jan 12, 2026', amount: '$19.00', status: 'Paid', id: '#INV-0032' },
                                { date: 'Dec 12, 2025', amount: '$19.00', status: 'Paid', id: '#INV-0021' },
                            ].map((invoice, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-border/30 bg-background/50 hover:bg-background transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center font-bold text-xs">PDF</div>
                                        <div>
                                            <p className="font-bold">{invoice.id}</p>
                                            <p className="text-xs text-muted-foreground font-medium">{invoice.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <p className="font-bold">{invoice.amount}</p>
                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3">
                                            {invoice.status}
                                        </Badge>
                                        <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
