"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, Send, FileText, History, MoreHorizontal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { createFilebook } from "@/lib/actions/filebook";

export default function FilebookPage() {
    const [step, setStep] = useState<"name" | "editor">("name");
    const [filebookName, setFilebookName] = useState("");
    const [isUploaded, setIsUploaded] = useState(false);
    const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [filebookId, setFilebookId] = useState<string>("");
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [error, setError] = useState<string | null>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (filebookName.trim()) {
            setLoading(true);
            setError(null);
            try {
                const fb = await createFilebook(filebookName);
                // Redirect to the new filebook page
                window.location.href = `/filebook/${fb.id}`;
            } catch (err: any) {
                console.error("Failed to create filebook", err);
                setError(err.message || "Failed to create filebook");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !filebookId) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("filebookId", filebookId);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                setIsUploaded(true);
                setMessages([{ role: "ai", content: `Hello! I've processed your document "${file.name}" for the filebook "${filebookName}". How can I help you today?` }]);
            } else {
                console.error("Upload failed");
            }
        } catch (error) {
            console.error("Error uploading file", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !isUploaded || loading) return;

        const userMessage = input;
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/askgemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: userMessage, filebookId }),
            });

            const data = await res.json();
            if (data.answer) {
                setMessages((prev) => [...prev, { role: "ai", content: data.answer }]);
            } else {
                setMessages((prev) => [...prev, { role: "ai", content: "Sorry, I couldn't process that question." }]);
            }
        } catch (error) {
            console.error("Error sending message", error);
            setMessages((prev) => [...prev, { role: "ai", content: "An error occurred while trying to get an answer." }]);
        } finally {
            setLoading(false);
        }
    };

    if (step === "name") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
                <div className="w-full max-w-lg space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Name your Filebook</h1>
                        <p className="text-muted-foreground">Give your filebook a name to get started.</p>
                    </div>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <Input
                            type="text"
                            placeholder="Enter a name for your filebook"
                            className={cn(
                                "h-14 text-xl px-6 rounded-xl border border-border bg-background focus-visible:ring-0 focus-visible:ring-offset-0",
                                error && "border-destructive focus-visible:ring-destructive"
                            )}
                            value={filebookName}
                            onChange={(e) => setFilebookName(e.target.value)}
                            autoFocus
                        />
                        {error && (
                            <p className="text-sm font-medium text-destructive px-1">{error}</p>
                        )}
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
                                    {isUploaded ? "Session Active" : loading ? "Processing..." : "Waiting for document"}
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
                                className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group relative"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleUpload}
                                    accept=".pdf,.txt,.csv,.doc,.docx"
                                />
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    {loading ? (
                                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    ) : (
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                    )}
                                </div>
                                <h3 className="text-xl font-bold">{loading ? "Processing document..." : "Upload a document"}</h3>
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
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="max-w-[85%] p-4 rounded-xl text-md border border-border bg-muted/50 italic animate-pulse">
                                            Thinking...
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 border-t border-border">
                        <div className="flex items-center gap-2 mb-2 px-1">
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">
                                Current Model: <span className="text-primary/70">Gemini 2.5 Flash</span>
                            </span>
                        </div>
                        <form onSubmit={handleSendMessage} className="relative">
                            <Input
                                placeholder={isUploaded ? "Ask anything..." : "Upload a document to start chatting"}
                                disabled={!isUploaded || loading}
                                className="h-12 pr-12 pl-4 rounded-xl bg-muted/30 border-border focus-visible:ring-0 focus-visible:ring-offset-0"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!isUploaded || !input.trim() || loading}
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
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {isUploaded ? "Document Indexed" : loading ? "Indexing..." : "Awaiting File"}
                                    </p>
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
