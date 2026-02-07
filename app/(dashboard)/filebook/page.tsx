"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, Send, FileText, History, MoreHorizontal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { createFilebook } from "@/lib/actions/filebook";
import { useRouter } from "next/navigation";

export default function FilebookPage() {
    const [step, setStep] = useState<"name" | "editor">("name");
    const [filebookName, setFilebookName] = useState("");
    const [isUploaded, setIsUploaded] = useState(false);
    const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (filebookName.trim()) {
            setLoading(true);
            try {
                await createFilebook(filebookName);
                setStep("editor");
            } catch (error) {
                console.error("Failed to create filebook", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleUpload = () => {
        setIsUploaded(true);
        setMessages([{ role: "ai", content: `Hello! I've processed your document for "${filebookName}". How can I help you today?` }]);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !isUploaded) return;

        setMessages([...messages, { role: "user", content: input }]);
        setInput("");

        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { role: "ai", content: "I'm analyzing the document to answer your question. Since I'm still being developed, I'll be able to provide real insights soon!" },
            ]);
        }, 1000);
    };

    if (step === "name") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
                <div className="w-full max-w-lg space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Name your Filebook</h1>
                        <p className="text-muted-foreground">Give your project a name to get started.</p>
                    </div>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <Input
                            type="text"
                            placeholder="Enter a name for your filebook"
                            className="h-14 text-xl px-6 rounded-xl border border-border bg-background focus-visible:ring-0 focus-visible:ring-offset-0"
                            value={filebookName}
                            onChange={(e) => setFilebookName(e.target.value)}
                            autoFocus
                        />
                        <Button
                            type="submit"
                            className="w-full h-14 text-lg font-semibold rounded-xl"
                            disabled={!filebookName.trim() || loading}
                        >
                            {loading ? "Creating..." : "Start Building"}
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full gap-4 overflow-hidden">
            {/* Main Column (65%) */}
            <div className="flex-[0.65] flex flex-col gap-4">
                <Card className="flex-1 flex flex-col overflow-hidden border border-border bg-card rounded-2xl relative">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-border bg-card flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">{filebookName}</h2>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest leading-none">
                                    {isUploaded ? "Session Active" : "Waiting for document"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <History className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {!isUploaded ? (
                            <div
                                className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                                onClick={handleUpload}
                            >
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-bold">Upload a document</h3>
                                <p className="text-muted-foreground mt-1">PDF, Excel, Word, or CSV</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((m, i) => (
                                    <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                                        <div className={cn(
                                            "max-w-[85%] p-4 rounded-xl text-md border border-border",
                                            m.role === "user"
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-muted/50"
                                        )}>
                                            {m.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 border-t border-border">
                        <form onSubmit={handleSendMessage} className="relative">
                            <Input
                                placeholder={isUploaded ? "Ask anything..." : "Upload a document to start chatting"}
                                disabled={!isUploaded}
                                className="h-12 pr-12 pl-4 rounded-xl bg-muted/30 border-border focus-visible:ring-0 focus-visible:ring-offset-0"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!isUploaded || !input.trim()}
                                className="absolute right-1.5 top-1.5 h-9 w-9 rounded-lg"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </Card>
            </div>

            {/* Side Column (35%) */}
            <div className="flex-[0.35] flex flex-col gap-4">
                <Card className="flex-1 p-6 space-y-8 border border-border bg-card rounded-2xl">
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Details</h3>
                        <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-4">
                            <div className="flex items-start gap-3">
                                <FileText className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold">Status</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{isUploaded ? "Document Indexed" : "Awaiting File"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Quick Actions</h3>
                        <div className="grid grid-cols-1 gap-2">
                            <Button variant="outline" className="justify-start gap-3 h-12 rounded-xl">
                                <History className="h-4 w-4" />
                                <span>Recent Chats</span>
                            </Button>
                            <Button variant="outline" className="justify-start gap-3 h-12 rounded-xl">
                                <Sparkles className="h-4 w-4" />
                                <span>Get Summary</span>
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
