import React from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Check, Sparkles, Zap, ShieldCheck, MessageSquare } from "lucide-react"
import { Footer } from '@/components/Footer'
import Link from 'next/link'

const pricingPlans = [
    {
        name: "Free",
        price: "$0",
        description: "Perfect for students and casual researchers.",
        features: [
            "Up to 5 filebooks",
            "10 pages per document",
            "Standard AI model",
            "Basic chat history",
            "Community support"
        ],
        buttonText: "Start for Free",
        buttonVariant: "outline" as const,
        highlight: false
    },
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
        buttonText: "Get Pro Now",
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

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background selection:bg-primary/30 font-sans tracking-tight pt-24">
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="max-w-3xl mx-auto mb-20 space-y-6">
                    <Badge variant="secondary" className="px-4 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20 animate-fade-in inline-flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        Simple Transparent Pricing
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-tight">
                        Choose the plan that's
                        <span className="font-pacifico font-normal text-primary ml-3">
                            right for you
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                        Unlock the full potential of your documents with our flexible pricing options.
                        No hidden fees, cancel anytime.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {pricingPlans.map((plan, i) => (
                        <Card key={i} className={`relative shadow-none border-border/50 rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 flex flex-col ${plan.highlight ? 'border-primary ring-1 ring-primary/20 shadow-2xl shadow-primary/10' : 'bg-card/40 backdrop-blur-sm hover:bg-card'}`}>
                            {plan.highlight && (
                                <div className="absolute top-0 right-0 left-0 bg-primary text-primary-foreground py-1 text-xs font-bold uppercase tracking-widest text-center">
                                    Most Popular
                                </div>
                            )}
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-2xl font-bold uppercase tracking-widest text-muted-foreground">{plan.name}</CardTitle>
                                <div className="mt-4 flex items-baseline gap-1">
                                    <span className="text-5xl font-bold">{plan.price}</span>
                                    {plan.period && <span className="text-muted-foreground font-medium">{plan.period}</span>}
                                </div>
                                <p className="mt-4 text-muted-foreground font-medium">{plan.description}</p>
                            </CardHeader>
                            <CardContent className="p-8 pt-4 flex-1">
                                <div className="space-y-4">
                                    {plan.features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center border border-primary/10">
                                                <Check className="w-3 h-3 text-primary" />
                                            </div>
                                            <span className="text-sm font-medium text-foreground/80">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="p-8 pt-4">
                                <Button variant={plan.buttonVariant} className="w-full h-12 text-lg rounded-2xl group" asChild>
                                    <Link href={plan.name === 'Pro' ? '/upgrade-pro' : '/sign-up'}>
                                        {plan.buttonText}
                                        {plan.highlight && <Zap className="ml-2 w-4 h-4 fill-current group-hover:scale-125 transition-transform" />}
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* FAQ Section Preview or Features */}
                <div className="mt-32 max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 text-left">
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold flex items-center gap-3">
                                <ShieldCheck className="text-primary w-6 h-6" />
                                Enterprise-grade security
                            </h3>
                            <p className="text-muted-foreground font-medium">
                                We take security seriously. All documents are encrypted at rest and in transit. Pro and Enterprise users get additional privacy controls.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold flex items-center gap-3">
                                <MessageSquare className="text-primary w-6 h-6" />
                                24/7 Priority Support
                            </h3>
                            <p className="text-muted-foreground font-medium">
                                Pro members get access to expedited support via chat and email. Enterprise members receive a dedicated account manager.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
