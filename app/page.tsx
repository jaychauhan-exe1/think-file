import React from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Upload,
  MessageSquare,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles
} from "lucide-react"
import Link from 'next/link'
import { Footer } from '@/components/Footer'

const HeroSection = () => {
  return (
    <section className="relative pt-24 pb-20 md:pt-36 md:pb-32 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left space-y-10">
            <div className="space-y-6">
              <Badge variant="secondary" className="px-4 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20 animate-fade-in inline-flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Document Intelligence
              </Badge>
              <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-foreground leading-[1.05]">
                Think deeper with
                <span className="font-pacifico font-normal text-primary ml-4">
                  your files
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Upload any document and start a conversation.
                Our AI extracts deep insights and answers your questions instantly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
              <Button size="lg" className="group">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg" className="">
                How it works
              </Button>
            </div>

            {/* Social Proof */}
            <div className="pt-10 flex flex-wrap justify-center lg:justify-start gap-10 items-center border-t border-border/50">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-border/50 bg-secondary overflow-hidden ring-1 ring-border/50">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 20}`}
                      alt="User avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="text-sm space-y-1 text-left">
                <div className="flex items-center gap-1 font-bold text-foreground">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="w-4 h-4 text-orange-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <span>4.9/5 Rating</span>
                </div>
                <p className="text-muted-foreground font-medium">Trusted by 20,000+ professionals</p>
              </div>
            </div>
          </div>

          {/* Right Visual (Using Shadcn Card) */}
          <div className="flex-1 relative w-full lg:max-w-[650px] animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Card className="shadow-none overflow-hidden relative z-10 bg-card/60 backdrop-blur-2xl border-border/50 rounded-3xl p-1 group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5"></div>

              <CardContent className="p-8 space-y-8">
                {/* Dropzone Area */}
                <div className="relative border-2 border-dashed border-primary/20 rounded-3xl p-16 text-center transition-all duration-500 hover:border-primary/50 hover:bg-primary/5 group/drop cursor-pointer">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/drop:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 space-y-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto transition-all duration-500 group-hover/drop:scale-110 group-hover/drop:rotate-3 border border-primary/10">
                      <Upload className="text-primary w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold tracking-tight">Launch your analysis</h3>
                      <p className="text-muted-foreground font-medium">Drop your document here to begin</p>
                    </div>
                    <Button variant="default" className="">
                      Choose File
                    </Button>
                  </div>

                  {/* Aesthetic Tags */}
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 opacity-60 group-hover/drop:opacity-100 transition-opacity">
                    {['PDF', 'DOCX', 'TXT'].map((tag) => (
                      <Badge key={tag} variant="outline" className="rounded-full border-primary/20 text-[10px] uppercase font-bold tracking-widest px-3">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center border border-orange-200/50 dark:border-orange-500/20">
                      <Zap className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold">Real-time Analysis</p>
                      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Ready for input</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="rounded-full bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5 py-1 px-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Secure
                  </Badge>
                </div>
              </CardContent>


            </Card>
            {/* Floating Chat Overlay */}
            <div className="absolute -left-22 bottom-32 bg-background/90 backdrop-blur-xl border border-border p-6 rounded-2xl max-w-[240px] animate-bounce-slow z-50 hidden md:block text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mt-1 outline outline-1 outline-primary/30">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">AI Intelligence</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Pro Assistant</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-foreground font-medium italic">
                "I've identified 3 key risks in the contract. Shall we proceed?"
              </p>
            </div>

            {/* Background Atmosphere */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-gradient-to-tr from-primary/10 via-transparent to-transparent rounded-full -z-10 blur-[100px] animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

const Page = () => {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 font-sans tracking-tight">
      <HeroSection />

      {/* Modern Features Grid */}
      <section className="py-32 relative overflow-hidden bg-muted/20 border-y border-border/50 text-center">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-24 space-y-4">
            <Badge variant="outline" className="rounded-full px-4 py-1 text-primary border-primary/20 bg-primary/5">Features</Badge>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">Engineered for depth</h2>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
              Advanced tools that help you master your documents with surgical precision.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: Zap, title: "Neural Summarization", desc: "Instantly boil down massive documents into essential action items with context-aware summarization." },
              { icon: MessageSquare, title: "Linguistic Precision", desc: "Interact with your data using complex queries. Our AI understands technical nuances and industry jargon." },
              { icon: ShieldCheck, title: "Zero-Knowledge Security", desc: "Your data stays yours. Private, encrypted, and isolated processing ensures absolute confidentiality." }
            ].map((feature, i) => (
              <Card key={i} className="shadow-none group bg-card/40 backdrop-blur-sm border-border/50 hover:bg-card hover:border-primary/50 hover:-translate-y-2 transition-all duration-500 rounded-3xl p-4 text-left">
                <CardHeader className="p-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:bg-primary group-hover:text-primary-foreground border border-primary/10 group-hover:rotate-6 group-hover:scale-110">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Massive CTA Section */}
      <section className="py-32 container mx-auto px-4 text-center">
        <Card className=" shadow-none border border-primary rounded-3xl p-10 md:p-32 text-center text-primary relative overflow-hidden">



          <CardContent className="relative z-10 max-w-4xl mx-auto space-y-10">
            <h2 className="text-5xl md:text-8xl font-bold tracking-tighter leading-none">
              <span className="font-pacifico font-normal">Think File</span> Pro.
            </h2>
            <p className="text-2xl md:text-3xl opacity-90 leading-tight font-light transition-all hover:opacity-100">
              Join the new generation of smart document workflows. <br className="hidden md:block" />
              Efficiency is just a drag and drop away.
            </p>

            <Button size="lg" variant="default" className="">
              Start Free Trial
            </Button>

          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  )
}

export default Page
