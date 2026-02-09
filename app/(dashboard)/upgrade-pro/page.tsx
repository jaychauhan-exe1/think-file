"use client";

import React from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Check, Sparkles, Zap, ShieldCheck, MessageSquare, ArrowRight } from "lucide-react"

const proPlans = [
    {
        name: "Pro",
        price: "$19",
        period: "/month",
        description: "Ideal for power users and professionals.",
        features: [
            "Unlimited filebooks",
            "Unlimited pages per document",
            "Advanced AI models (Gemini 2.0 Pro)",
            "Persistent chat history",
            "Priority support",
            "Export analysis as PDF/Docx",
            "Early access to new features"
        ],
        buttonText: "Upgrade to Pro",
        buttonVariant: "default" as const,
        highlight: true
    },
    {
        name: "Enterprise",
        price: "Custom",
        description: "For teams requiring maximum security and scale.",
        features: [
            "Everything in Pro",
            "Dedicated account manager",
            "Custom AI model fine-tuning",
            "SSO & advanced security",
            "Full API access",
            "Custom data retention policies"
        ],
        buttonText: "Contact Sales",
        buttonVariant: "outline" as const,
        highlight: false
    }
]

import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function UpgradeProPage() {
    const { data: session, isPending } = authClient.useSession()
    const router = useRouter()

    useEffect(() => {
        if (!isPending && session?.user?.plan === "PRO") {
            router.push("/dashboard")
        }
    }, [session, isPending, router])

    if (isPending) return null
    if (session?.user?.plan === "PRO") return null

    return (
        <div className="space-y-12 py-10">
            <div className="text-center max-w-2xl mx-auto space-y-4">
                <Badge variant="secondary" className="px-4 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20 gap-2">
                    <Sparkles className="w-4 h-4" />
                    Think File Pro
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Upgrade your workflow</h2>
                <p className="text-xl text-muted-foreground font-medium">
                    Choose the plan that's right for your professional needs.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {proPlans.map((plan, i) => (
                    <Card key={i} className={`relative shadow-none border-border/50 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 flex flex-col ${plan.highlight ? 'border-primary ring-1 ring-primary/20 shadow-2xl shadow-primary/10 bg-card' : 'bg-card/40 backdrop-blur-sm'}`}>
                        {plan.highlight && (
                            <div className="absolute top-0 right-0 left-0 bg-primary text-primary-foreground py-1.5 text-[10px] font-bold uppercase tracking-widest text-center">
                                Recommended
                            </div>
                        )}
                        <CardHeader className="p-10 pb-4">
                            <CardTitle className="text-xl font-bold uppercase tracking-widest text-muted-foreground">{plan.name}</CardTitle>
                            <div className="mt-6 flex items-baseline gap-1">
                                <span className="text-6xl font-bold">{plan.price}</span>
                                {plan.period && <span className="text-muted-foreground font-medium text-lg">{plan.period}</span>}
                            </div>
                            <p className="mt-4 text-muted-foreground font-medium text-base leading-relaxed">{plan.description}</p>
                        </CardHeader>
                        <CardContent className="p-10 pt-4 flex-1">
                            <div className="space-y-5">
                                {plan.features.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/10 shrink-0">
                                            <Check className="w-3.5 h-3.5 text-primary" />
                                        </div>
                                        <span className="text-sm font-semibold text-foreground/80">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="p-10 pt-4">
                            <Button variant={plan.buttonVariant} className="w-full h-14 text-lg rounded-2xl group" size="lg">
                                {plan.buttonText}
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <div className="max-w-3xl mx-auto bg-muted/30 p-8 rounded-3xl border border-border/50">
                <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                    <div className="space-y-2">
                        <h4 className="font-bold text-lg">Looking for a custom plan?</h4>
                        <p className="text-sm text-muted-foreground font-medium">We offer special pricing for academic institutions and non-profits.</p>
                    </div>
                    <Button variant="outline" className="rounded-xl h-12 px-8 font-bold border-border/50 bg-background">
                        Get in touch
                    </Button>
                </div>
            </div>
        </div>
    )
}
