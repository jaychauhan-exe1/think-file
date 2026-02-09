import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MessageSquare, MapPin, Sparkles } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center space-y-4 mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-4">
                        <Sparkles className="w-4 h-4" />
                        Get in Touch
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight text-foreground">
                        Let's start a <span className="text-primary font-pacifico">conversation</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Have questions about ThinkFile? Our team is here to help you optimize your research workflow.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Contact Form */}
                    <Card className="shadow-none border-border/50 bg-card/50 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
                        <CardContent className="p-8 md:p-12">
                            <form className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">First Name</label>
                                        <Input placeholder="John" className="h-12 rounded-xl bg-background border-border/50 focus-visible:ring-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">Last Name</label>
                                        <Input placeholder="Doe" className="h-12 rounded-xl bg-background border-border/10 focus-visible:ring-primary" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
                                    <Input type="email" placeholder="john@example.com" className="h-12 rounded-xl bg-background border-border/50 focus-visible:ring-primary" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">Message</label>
                                    <Textarea
                                        placeholder="How can we help you?"
                                        className="min-h-[150px] rounded-xl bg-background border-border/50 focus-visible:ring-primary resize-none"
                                    />
                                </div>
                                <Button className="w-full h-14 rounded-full font-bold text-lg group">
                                    Send Message
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Contact Info */}
                    <div className="space-y-8 lg:pt-8">
                        <div className="grid gap-6">
                            {[
                                {
                                    icon: Mail,
                                    title: "Email Us",
                                    value: "hello@thinkfile.ai",
                                    desc: "Our support team usually responds within 2 hours.",
                                },
                                {
                                    icon: MessageSquare,
                                    title: "Live Chat",
                                    value: "Active 24/7",
                                    desc: "Available for PRO plan members directly in the dashboard.",
                                },
                                {
                                    icon: MapPin,
                                    title: "Office",
                                    value: "San Francisco, CA",
                                    desc: "123 Innovation Way, AI District",
                                }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-6 p-6 rounded-3xl border border-border/50 hover:border-primary/30 transition-colors group">
                                    <div className={`h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 transition-transform`}>
                                        <item.icon className="h-7 w-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg">{item.title}</h3>
                                        <p className="font-bold text-primary">{item.value}</p>
                                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Social/Trust */}
                        <div className="p-8 rounded-[2rem] bg-muted/30 border border-border/50">
                            <h4 className="font-bold mb-4">Join our community</h4>
                            <p className="text-sm text-muted-foreground mb-6">
                                Connect with over 10,000+ researchers and power users on our social platforms.
                            </p>
                            <div className="flex gap-4">
                                <div className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center hover:border-primary cursor-pointer transition-colors font-bold">𝕏</div>
                                <div className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center hover:border-primary cursor-pointer transition-colors font-bold">in</div>
                                <div className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center hover:border-primary cursor-pointer transition-colors font-bold">gh</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
