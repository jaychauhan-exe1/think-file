import React from 'react'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Target, Zap, Heart } from "lucide-react"
import { Footer } from '@/components/Footer'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background selection:bg-primary/30 font-sans tracking-tight pt-24">
            <div className="container mx-auto px-4 py-20">
                {/* Hero Section */}
                <div className="text-center max-w-4xl mx-auto mb-32 space-y-8">
                    <Badge variant="secondary" className="px-4 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20 animate-fade-in inline-flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        Our Mission
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-foreground leading-[1.05]">
                        Bridging the gap between
                        <span className="font-pacifico font-normal text-primary ml-4">
                            data and wisdom
                        </span>
                    </h1>
                    <p className="text-2xl text-muted-foreground font-medium leading-relaxed">
                        Think File was born out of a simple frustration: there's too much information and too little time.
                        We're building the intelligence layer for your personal and professional documents.
                    </p>
                </div>

                {/* Story Section */}
                <div className="grid lg:grid-cols-2 gap-20 items-center mb-40">
                    <div className="space-y-8">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">The Think File Story</h2>
                        <div className="space-y-6 text-lg text-muted-foreground font-medium leading-relaxed">
                            <p>
                                Founded in 2024, our team of AI researchers and product designers set out to create a tool
                                that doesn't just store files, but understands them.
                            </p>
                            <p>
                                We believed that documents shouldn't be static. They should be interactive. They should be
                                able to answer questions, summarize themselves, and provide context when you need it most.
                            </p>
                            <p>
                                Today, Think File is used by thousands of researchers, lawyers, students, and businesses
                                to turn mountains of paperwork into actionable insights.
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-[100px] -z-10"></div>
                        <Card className="border-border/50 bg-card/60 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                            <CardContent className="p-0">
                                <img
                                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
                                    alt="Our Team Working"
                                    className="w-full h-[500px] object-cover"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Values Grid */}
                <div className="mb-40">
                    <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
                        <h2 className="text-4xl font-bold">Our Core Values</h2>
                        <p className="text-muted-foreground font-medium">What drives us every single day.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            {
                                icon: Heart,
                                title: "User First",
                                desc: "We build features based on real needs, not hype. Your experience is our ultimate metric."
                            },
                            {
                                icon: Target,
                                title: "Radical Simplicity",
                                desc: "Complexity is easy. Simplicity is hard. We strive for powerful tools that feel intuitive."
                            },
                            {
                                icon: Zap,
                                title: "Relentless Speed",
                                desc: "Time is your most valuable asset. We optimize every millisecond of our AI processing."
                            }
                        ].map((value, i) => (
                            <Card key={i} className="shadow-none bg-card/40 backdrop-blur-sm border-border/50 p-8 rounded-3xl transition-all duration-500 hover:border-primary/50 hover:-translate-y-2">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/10">
                                    <value.icon className="text-primary w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                                <p className="text-muted-foreground font-medium leading-relaxed">{value.desc}</p>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="py-24 border-y border-border/50 grid grid-cols-2 md:grid-cols-4 gap-12 text-center mb-40">
                    {[
                        { label: "Files Analyzed", value: "2M+" },
                        { label: "Questions Answered", value: "15M+" },
                        { label: "Happy Users", value: "50k+" },
                        { label: "Response Time", value: "<1.2s" }
                    ].map((stat, i) => (
                        <div key={i} className="space-y-2">
                            <p className="text-4xl md:text-5xl font-bold tracking-tighter text-primary">{stat.value}</p>
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    )
}
