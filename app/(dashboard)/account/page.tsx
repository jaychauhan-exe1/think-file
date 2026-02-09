"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Shield, Key, Trash2, Brain, Activity, CheckCircle2, Sparkles } from "lucide-react"
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { updateProfile, deleteAccount } from '@/lib/actions/account'
import { toast } from 'sonner'
import { getUserUsage } from '@/lib/actions/usage'

export default function AccountPage() {
    const { data: session, isPending } = authClient.useSession()
    const [name, setName] = useState("")
    const [username, setUsername] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [usage, setUsage] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || "")
            setUsername(session.user.username || "")
        }
    }, [session])

    useEffect(() => {
        async function fetchUsage() {
            const data = await getUserUsage()
            setUsage(data)
        }
        fetchUsage()
    }, [])

    if (isPending) return <div className="p-8">Loading...</div>
    if (!session) return null

    const handleSaveProfile = async () => {
        setIsLoading(true)
        const res = await updateProfile({ name, username })
        if (res.success) {
            toast.success("Profile updated successfully")
        } else {
            toast.error(res.error || "Failed to update profile")
        }
        setIsLoading(false)
    }

    const handleDeleteAccount = async () => {
        if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            setIsLoading(true)
            const res = await deleteAccount()
            if (res.success) {
                await authClient.signOut()
                toast.success("Account deleted")
                router.push("/login")
            } else {
                toast.error(res.error || "Failed to delete account")
            }
            setIsLoading(false)
        }
    }

    const handleChangePassword = async () => {
        const oldPassword = prompt("Enter current password:")
        if (!oldPassword) return
        const newPassword = prompt("Enter new password:")
        if (!newPassword) return

        setIsLoading(true)
        const { error } = await authClient.changePassword({
            newPassword,
            currentPassword: oldPassword,
            revokeOtherSessions: true
        })

        if (error) {
            toast.error(error.message || "Failed to change password")
        } else {
            toast.success("Password changed successfully")
        }
        setIsLoading(false)
    }

    const handleToggle2FA = async () => {
        const isEnabled = (session.user as any).twoFactorEnabled
        const password = prompt(`Please enter your password to ${isEnabled ? 'disable' : 'enable'} 2FA:`)
        if (!password) return

        setIsLoading(true)
        if (isEnabled) {
            const { error } = await authClient.twoFactor.disable({
                password
            })
            if (error) {
                toast.error(error.message || "Failed to disable 2FA")
            } else {
                toast.success("2FA Disabled successfully")
            }
        } else {
            const { data, error } = await authClient.twoFactor.enable({
                password
            })
            if (error) {
                toast.error(error.message || "Failed to enable 2FA")
            } else {
                toast.success("2FA Enabled! Make sure to save your recovery codes.")
            }
        }
        setIsLoading(false)
    }

    const isPro = session.user.plan === "PRO"

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className={`text-3xl font-bold tracking-tight flex items-center gap-3 ${isPro ? 'text-primary' : ''}`}>
                        <User className={`w-8 h-8 ${isPro ? 'text-primary' : 'text-primary'}`} />
                        Account Profile
                    </h2>
                    <p className="text-muted-foreground font-medium">
                        Manage your personal information and security settings.
                    </p>
                </div>
                <Badge className={`${isPro ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'} border-primary/20 gap-2 h-7 px-3`}>
                    {isPro ? <Sparkles className="w-3 h-3" /> : null}
                    {session.user.plan || 'FREE'} PLAN
                </Badge>
            </div>

            <div className="grid gap-8">
                {/* AI Usage Section */}
                <Card className={`shadow-none border-border/50 bg-card/40 backdrop-blur-sm rounded-[2rem] overflow-hidden ${isPro ? 'ring-1 ring-primary/20 bg-primary/[0.02]' : ''}`}>
                    <CardHeader className="p-10 pb-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-primary" />
                                    AI Workload & Usage
                                </CardTitle>
                                <CardDescription>Your current resource consumption and limits.</CardDescription>
                            </div>
                            <Badge variant="outline" className="rounded-full flex items-center gap-2">
                                <Activity className="w-3 h-3 text-emerald-500" />
                                Live Metrics
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="px-10 pb-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm font-bold">
                                    <span>Questions Today</span>
                                    <span className="text-primary">{usage?.questionsToday || 0} / {usage?.questionsLimit || 10}</span>
                                </div>
                                <div className="h-3 w-full bg-muted rounded-full overflow-hidden border border-border/30">
                                    <div
                                        className={`h-full transition-all duration-1000 ${isPro ? 'bg-primary' : 'bg-primary/60'}`}
                                        style={{ width: `${Math.min(((usage?.questionsToday || 0) / (usage?.questionsLimit || 10)) * 100, 100)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Resets in 12 hours</p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm font-bold">
                                    <span>Workspace Slots</span>
                                    <span className="text-primary">{usage?.filebooksCount || 0} / {isPro ? "∞" : (usage?.filebooksLimit || 5)}</span>
                                </div>
                                <div className="h-3 w-full bg-muted rounded-full overflow-hidden border border-border/30">
                                    <div
                                        className={`h-full transition-all duration-1000 ${isPro ? 'bg-primary' : 'bg-primary/60'}`}
                                        style={{ width: isPro ? '10%' : `${Math.min(((usage?.filebooksCount || 0) / (usage?.filebooksLimit || 5)) * 100, 100)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{isPro ? 'Unlimited Storage' : 'Permanent Storage'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Information */}
                <Card className={`shadow-none border-border/50 bg-card/40 backdrop-blur-sm rounded-[2rem] overflow-hidden ${isPro ? 'border-primary/30' : ''}`}>
                    <CardHeader className="p-10 pb-6">
                        <CardTitle className="text-xl">Profile Snapshot</CardTitle>
                        <CardDescription>Update your basic details.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-10 pb-10 space-y-10">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="relative group">
                                <Avatar className={`h-28 w-28 border-4 border-background ring-2 ${isPro ? 'ring-primary' : 'ring-primary/20'}`}>
                                    <AvatarImage src={session.user.image || ""} />
                                    <AvatarFallback className={`text-3xl font-bold ${isPro ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                                        {session.user.name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                {isPro && (
                                    <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground p-1.5 rounded-full border-4 border-background shadow-lg">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 w-full space-y-4">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold ml-1">Full Name</Label>
                                        <Input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="h-12 rounded-xl bg-background/50 border-border/30 focus:border-primary font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold ml-1">Email Address</Label>
                                        <Input value={session.user.email} disabled className="h-12 rounded-xl bg-muted/30 border-border/30 font-medium" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold ml-1">Username</Label>
                                    <Input
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Add a username"
                                        className="h-12 rounded-xl bg-background/50 border-border/30 focus:border-primary font-medium"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="px-10 py-6 border-t border-border/30 bg-muted/20 flex justify-end">
                        <Button
                            onClick={handleSaveProfile}
                            disabled={isLoading}
                            className={`rounded-xl font-bold px-8 h-12 ${isPro ? 'shadow-lg shadow-primary/20' : ''}`}
                        >
                            {isLoading ? "Saving..." : "Save Profile"}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Security Section */}
                <Card className={`shadow-none border-border/50 bg-card/40 backdrop-blur-sm rounded-[2rem] overflow-hidden ${isPro ? 'border-primary/30' : ''}`}>
                    <CardHeader className="p-10 pb-6">
                        <CardTitle className="text-xl">Security & Access</CardTitle>
                        <CardDescription>Keep your account safe and secure.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-10 pb-10 space-y-6">
                        <div className="flex items-center justify-between p-5 rounded-2xl bg-background/50 border border-border/30 hover:border-primary/30 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                    <Key className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold">Password</p>
                                    <p className="text-xs text-muted-foreground font-medium">Reset your account password</p>
                                </div>
                            </div>
                            <Button variant="outline" onClick={handleChangePassword} className="rounded-xl border-border/50 hover:bg-muted font-bold">Change Password</Button>
                        </div>
                        <div className="flex items-center justify-between p-5 rounded-2xl bg-background/50 border border-border/30 hover:border-primary/30 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                    <Shield className={`w-5 h-5 ${(session.user as any).twoFactorEnabled ? 'text-primary-foreground' : ''}`} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold">Two-Factor Authentication</p>
                                        {(session.user as any).twoFactorEnabled && (
                                            <Badge className="bg-emerald-500 text-white border-none h-4 px-1 text-[10px]">ENABLED</Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium">Add an extra layer of security</p>
                                </div>
                            </div>
                            <Button
                                variant={(session.user as any).twoFactorEnabled ? "destructive" : "outline"}
                                onClick={handleToggle2FA}
                                className="rounded-xl border-border/50 font-bold"
                            >
                                {(session.user as any).twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="shadow-none border-destructive/20 bg-destructive/5 rounded-[2rem] overflow-hidden">
                    <CardHeader className="p-10 pb-6">
                        <CardTitle className="text-xl text-destructive flex items-center gap-2">
                            <Trash2 className="w-5 h-5" />
                            Danger Zone
                        </CardTitle>
                        <CardDescription>Permanently delete your account and all your data.</CardDescription>
                    </CardHeader>
                    <CardFooter className="px-10 pb-10 flex justify-start">
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={isLoading}
                            className="rounded-xl font-bold px-8 h-12"
                        >
                            {isLoading ? "Deleting..." : "Delete Account"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
