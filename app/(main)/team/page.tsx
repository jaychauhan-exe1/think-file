import React from 'react'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Github, Twitter, Linkedin, Sparkles } from "lucide-react"
import { Footer } from '@/components/Footer'

const team = [
    {
        name: "Alex Sterling",
        role: "Co-Founder & CEO",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        bio: "Former AI Lead at DeepMind, Alex is obsessed with making information accessible."
    },
    {
        name: "Sarah Chen",
        role: "Chief Product Officer",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        bio: "Product visionary who believes great design is invisible."
    },
    {
        name: "Marcus Wright",
        role: "Head of Engineering",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
        bio: "Full-stack wizard with a passion for distributed systems and vector databases."
    },
    {
        name: "Elena Rodriguez",
        role: "Director of AI Research",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
        bio: "NLP expert dedicated to improving the semantic understanding of our AI models."
    },
    {
        name: "David Kim",
        role: "Lead Designer",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        bio: "Bringing aesthetics and functionality together to create seamless user journeys."
    },
    {
        name: "Jordan Smith",
        role: "Head of Growth",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
        bio: "Focusing on scale and ensuring Think File reaches every desk in the world."
    }
]

export default function TeamPage() {
    return (
        <div className="min-h-screen bg-background selection:bg-primary/30 font-sans tracking-tight pt-24">
            <div className="container mx-auto px-4 py-20">
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                    <Badge variant="secondary" className="px-4 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20 animate-fade-in inline-flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        The Minds Behind the Magic
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-tight">
                        Meet the innovators
                        <span className="font-pacifico font-normal text-primary ml-3">
                            shaping the future
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                        A diverse group of researchers, designers, and engineers united by a common goal:
                        helping you think deeper and work smarter.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
                    {team.map((member, i) => (
                        <Card key={i} className="group shadow-none bg-card/40 backdrop-blur-sm border-border/50 rounded-3xl p-6 transition-all duration-500 hover:bg-card hover:border-primary/50 hover:-translate-y-2 overflow-hidden">
                            <CardContent className="p-0 space-y-6">
                                <div className="relative aspect-square rounded-2xl overflow-hidden bg-primary/5 border border-primary/10">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold tracking-tight">{member.name}</h3>
                                    <p className="text-primary font-bold text-sm uppercase tracking-widest">{member.role}</p>
                                </div>

                                <p className="text-muted-foreground font-medium leading-relaxed">
                                    {member.bio}
                                </p>

                                <div className="flex gap-4 pt-2">
                                    {[Github, Twitter, Linkedin].map((Icon, idx) => (
                                        <button key={idx} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all">
                                            <Icon className="w-5 h-5" />
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Join Us Section */}
                <div className="mt-40 text-center py-20 border border-primary/20 rounded-[3rem] bg-primary/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5"></div>
                    <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">Want to join the mission?</h2>
                        <p className="text-xl text-muted-foreground font-medium">
                            We're always looking for brilliant minds to help us push the boundaries of what's possible with AI.
                        </p>
                        <button className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl transition-all hover:scale-105 active:scale-95">
                            View Openings
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
