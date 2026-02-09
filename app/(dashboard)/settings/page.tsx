"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Bell, Lock, Eye, Sparkles } from "lucide-react"
import { authClient } from '@/lib/auth-client'
import { updateSettings } from '@/lib/actions/account'
import { toast } from 'sonner'

export default function SettingsPage() {
    const { data: session, isPending } = authClient.useSession()
    const [settings, setSettings] = useState({
        compactSidebar: false,
        autoSummarization: true,
        deepReasoningMode: false,
        emailNotifications: true,
        inAppNotifs: true
    })
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (session?.user) {
            setSettings({
                compactSidebar: (session.user as any).compactSidebar ?? false,
                autoSummarization: (session.user as any).autoSummarization ?? true,
                deepReasoningMode: (session.user as any).deepReasoningMode ?? false,
                emailNotifications: (session.user as any).emailNotifications ?? true,
                inAppNotifs: (session.user as any).inAppNotifs ?? true
            })
        }
    }, [session])

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const handleSave = async () => {
        setIsLoading(true)
        const res = await updateSettings(settings)
        if (res.success) {
            toast.success("Settings saved successfully")
        } else {
            toast.error(res.error || "Failed to save settings")
        }
        setIsLoading(false)
    }

    const handleReset = () => {
        setSettings({
            compactSidebar: false,
            autoSummarization: true,
            deepReasoningMode: false,
            emailNotifications: true,
            inAppNotifs: true
        })
    }

    if (isPending) return <div className="p-8">Loading...</div>
    if (!session) return null

    const isPro = session.user.plan === "PRO"

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Settings className={`w-8 h-8 ${isPro ? 'text-primary' : 'text-primary'}`} />
                        General Settings
                    </h2>
                    <p className="text-muted-foreground font-medium">
                        Manage your application preferences and workspace configuration.
                    </p>
                </div>
                {isPro && (
                    <Badge className="bg-primary text-primary-foreground gap-2 h-7 px-3">
                        <Sparkles className="w-3 h-3" />
                        PRO SETTINGS ENABLED
                    </Badge>
                )}
            </div>

            <div className="grid gap-8">
                {/* Appearance Section */}
                <Card className={`shadow-none border-border/50 bg-card/40 backdrop-blur-sm rounded-3xl overflow-hidden ${isPro ? 'border-primary/20' : ''}`}>
                    <CardHeader className="p-8">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <Eye className="w-5 h-5 text-primary" />
                                <CardTitle className="text-xl">Appearance</CardTitle>
                            </div>
                        </div>
                        <CardDescription>
                            Customize how Think File looks on your screen.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-border/30 hover:border-primary/30 transition-colors">
                            <div className="space-y-0.5">
                                <Label className="text-base font-bold">Compact Sidebar</Label>
                                <p className="text-sm text-muted-foreground font-medium">Make the navigation sidebar smaller to save space.</p>
                            </div>
                            <Switch
                                checked={settings.compactSidebar}
                                onCheckedChange={() => handleToggle('compactSidebar')}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* AI Preferences */}
                <Card className={`shadow-none border-border/50 bg-card/40 backdrop-blur-sm rounded-3xl overflow-hidden ${isPro ? 'border-primary/20' : ''}`}>
                    <CardHeader className="p-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <CardTitle className="text-xl">AI Preferences</CardTitle>
                        </div>
                        <CardDescription>
                            Configure how the AI interacts with your documents.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-border/30 hover:border-primary/30 transition-colors">
                            <div className="space-y-0.5">
                                <Label className="text-base font-bold">Auto-Summarization</Label>
                                <p className="text-sm text-muted-foreground font-medium">Automatically generate summaries for newly uploaded files.</p>
                            </div>
                            <Switch
                                checked={settings.autoSummarization}
                                onCheckedChange={() => handleToggle('autoSummarization')}
                            />
                        </div>
                        <div className={`flex items-center justify-between p-4 rounded-2xl bg-background/50 border transition-colors ${!isPro ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/30 border-border/30'}`}>
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <Label className="text-base font-bold">Deep Reasoning Mode</Label>
                                    {!isPro && <Badge className="bg-primary text-primary-foreground text-[10px] h-4 px-1">PRO</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">Use more advanced models for complex logical analysis.</p>
                            </div>
                            <Switch
                                disabled={!isPro}
                                checked={settings.deepReasoningMode}
                                onCheckedChange={() => handleToggle('deepReasoningMode')}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card className={`shadow-none border-border/50 bg-card/40 backdrop-blur-sm rounded-3xl overflow-hidden ${isPro ? 'border-primary/20' : ''}`}>
                    <CardHeader className="p-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Bell className="w-5 h-5 text-primary" />
                            <CardTitle className="text-xl">Notifications</CardTitle>
                        </div>
                        <CardDescription>
                            Stay updated with your document processing and system alerts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-border/30 hover:border-primary/30 transition-colors">
                            <div className="space-y-0.5">
                                <Label className="text-base font-bold">Email Notifications</Label>
                                <p className="text-sm text-muted-foreground font-medium">Receive updates when your files are ready.</p>
                            </div>
                            <Switch
                                checked={settings.emailNotifications}
                                onCheckedChange={() => handleToggle('emailNotifications')}
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-border/30 hover:border-primary/30 transition-colors">
                            <div className="space-y-0.5">
                                <Label className="text-base font-bold">In-App Toast Alerts</Label>
                                <p className="text-sm text-muted-foreground font-medium">Show real-time notifications inside the app.</p>
                            </div>
                            <Switch
                                checked={settings.inAppNotifs}
                                onCheckedChange={() => handleToggle('inAppNotifs')}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="p-8 pt-0 border-t border-border/30 bg-muted/20">
                        <div className="flex justify-end w-full space-x-4">
                            <Button variant="ghost" className="rounded-xl font-bold" onClick={handleReset}>Reset to default</Button>
                            <Button
                                className={`rounded-xl font-bold px-8 ${isPro ? 'shadow-lg shadow-primary/20' : ''}`}
                                onClick={handleSave}
                                disabled={isLoading}
                            >
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
