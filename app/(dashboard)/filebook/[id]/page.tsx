"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, Send, FileText, ArrowLeft, Sparkles, Loader2, AtSign, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFilebookById, getChatMessages, saveChatMessage } from "@/lib/actions/filebook";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface Message {
    id?: string;
    role: "user" | "ai";
    content: string;
    createdAt?: Date;
}

interface Document {
    id: string;
    name: string;
    createdAt: Date;
}

export default function FilebookDetailPage() {
    const params = useParams();
    const router = useRouter();
    const filebookId = params.id as string;

    const [filebook, setFilebook] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [showMentionDropdown, setShowMentionDropdown] = useState(false);
    const [mentionedDoc, setMentionedDoc] = useState<Document | null>(null);
    const [mentionSearch, setMentionSearch] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        async function loadFilebook() {
            try {
                const data = await getFilebookById(filebookId);
                setFilebook(data);

                // Load chat history
                const chatHistory = await getChatMessages(filebookId);
                setMessages(chatHistory.map(msg => ({
                    id: msg.id,
                    role: msg.role as "user" | "ai",
                    content: msg.content,
                    createdAt: msg.createdAt
                })));
            } catch (error) {
                console.error("Failed to load filebook", error);
                router.push("/my-files");
            } finally {
                setLoading(false);
            }
        }
        loadFilebook();
    }, [filebookId, router]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !filebookId) return;

        setPendingFile(file);
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("filebookId", filebookId);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                const welcomeMsg: Message = {
                    role: "ai",
                    content: `I've successfully processed "${file.name}" (${data.chunksProcessed} chunks). You can now ask me questions about this document!`
                };

                setMessages(prev => [...prev, welcomeMsg]);
                await saveChatMessage(filebookId, "ai", welcomeMsg.content);

                // Reload filebook to update document count
                const updatedFilebook = await getFilebookById(filebookId);
                setFilebook(updatedFilebook);
            } else {
                alert(data.error || "Upload failed. Please try again.");
            }
        } catch (error) {
            console.error("Error uploading file", error);
            alert("An error occurred while uploading the file.");
        } finally {
            setUploading(false);
            setPendingFile(null);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Handle input change with @ detection
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInput(value);

        // Check if user typed @
        const lastAtIndex = value.lastIndexOf('@');
        if (lastAtIndex !== -1 && !mentionedDoc) {
            const textAfterAt = value.slice(lastAtIndex + 1);
            // Show dropdown if @ is at the end or followed by search text (no space yet)
            if (!textAfterAt.includes(' ')) {
                setShowMentionDropdown(true);
                setMentionSearch(textAfterAt.toLowerCase());
            } else {
                setShowMentionDropdown(false);
                setMentionSearch("");
            }
        } else {
            setShowMentionDropdown(false);
            setMentionSearch("");
        }
    };

    // Select a document from mention dropdown
    const handleSelectMention = (doc: Document) => {
        // Remove @search from input
        const lastAtIndex = input.lastIndexOf('@');
        const newInput = lastAtIndex !== -1 ? input.slice(0, lastAtIndex) : input;
        setInput(newInput);
        setMentionedDoc(doc);
        setShowMentionDropdown(false);
        setMentionSearch("");
        inputRef.current?.focus();
    };

    // Remove mentioned document
    const handleRemoveMention = () => {
        setMentionedDoc(null);
    };

    // Toggle mention dropdown with @ button
    const handleMentionButtonClick = () => {
        if (showMentionDropdown) {
            setShowMentionDropdown(false);
        } else {
            setShowMentionDropdown(true);
            setMentionSearch("");
        }
        inputRef.current?.focus();
    };

    // Filter documents based on search
    const filteredDocuments = filebook?.documents?.filter((doc: Document) =>
        doc.name.toLowerCase().includes(mentionSearch)
    ) || [];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowMentionDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || sending || !filebook?.documents?.length) return;

        // Create display message with mention
        const displayContent = mentionedDoc
            ? `@${mentionedDoc.name} ${input}`.trim()
            : input;

        const userMessage: Message = { role: "user", content: displayContent };
        setMessages(prev => [...prev, userMessage]);

        const questionToSend = input;
        const docIdToSend = mentionedDoc?.id;

        setInput("");
        setMentionedDoc(null);
        setSending(true);

        // Save user message
        const currentModel = "gemini-2.5-flash";
        await saveChatMessage(filebookId, "user", userMessage.content, currentModel);

        try {
            const res = await fetch("/api/askgemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: questionToSend,
                    filebookId,
                    documentId: docIdToSend // Pass specific document if mentioned
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                if (res.status === 403) {
                    const limitMessage: Message = {
                        role: "ai",
                        content: data.error || "Usage limit reached."
                    };
                    setMessages(prev => [...prev, limitMessage]);
                    return;
                }
                throw new Error(data.error || "Failed to get answer");
            }

            const data = await res.json();
            const aiMessage: Message = {
                role: "ai",
                content: data.answer || "Sorry, I couldn't process that question."
            };

            setMessages(prev => [...prev, aiMessage]);

            // Save AI response
            await saveChatMessage(filebookId, "ai", aiMessage.content, currentModel);
        } catch (error) {
            console.error("Error sending message", error);
            const errorMessage: Message = {
                role: "ai",
                content: "An error occurred while trying to get an answer."
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!filebook) {
        return null;
    }

    const hasDocuments = filebook.documents && filebook.documents.length > 0;

    return (
        <div className="flex h-[calc(100vh-7rem)] gap-4 overflow-hidden">
            {/* Main Column (65%) */}
            <div className="flex-[0.65] flex flex-col gap-4">
                <Card className="flex-1 flex flex-col overflow-hidden border border-border bg-card rounded-2xl relative">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-border bg-card flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/my-files">
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">{filebook.name}</h2>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest leading-none">
                                    {hasDocuments ? `${filebook._count.documents} document${filebook._count.documents !== 1 ? 's' : ''}` : "No documents"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 rounded-lg"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Add Document
                                    </>
                                )}
                            </Button>
                            <input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleUpload}
                                accept=".pdf,.txt,.csv,.doc,.docx,.xlsx,.xls"
                            />
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {!hasDocuments ? (
                            <div
                                className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group relative"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    {uploading ? (
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    ) : (
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                    )}
                                </div>
                                <h3 className="text-xl font-bold">{uploading ? "Processing document..." : "Upload your first document"}</h3>
                                <p className="text-muted-foreground mt-1">PDF, Excel, Word, CSV, or text files</p>
                            </div>
                        ) : (
                            <>
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                            <Sparkles className="h-8 w-8 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold">Ready to chat!</h3>
                                        <p className="text-muted-foreground mt-1 max-w-md">
                                            Ask me anything about your {filebook._count.documents} document{filebook._count.documents !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {messages.map((m, i) => (
                                            <div key={m.id || i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                                                <div className={cn(
                                                    "max-w-[85%] p-4 rounded-xl text-md border border-border",
                                                    m.role === "user"
                                                        ? "bg-primary text-primary-foreground border-primary"
                                                        : "bg-muted/50"
                                                )}>
                                                    {m.role === "ai" ? (
                                                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:my-2 prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-muted prose-pre:p-3 prose-pre:rounded-lg">
                                                            <ReactMarkdown>{m.content}</ReactMarkdown>
                                                        </div>
                                                    ) : (
                                                        m.content
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {sending && (
                                            <div className="flex justify-start">
                                                <div className="max-w-[85%] px-4 py-3 rounded-xl text-md border border-border bg-muted/50 flex items-center gap-1">
                                                    <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce-dot" style={{ animationDelay: '0ms' }}></span>
                                                    <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce-dot" style={{ animationDelay: '150ms' }}></span>
                                                    <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce-dot" style={{ animationDelay: '300ms' }}></span>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 border-t border-border">
                        {/* Pending File Attachment */}
                        {pendingFile && uploading && (
                            <div className="mb-3">
                                <div className="inline-flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-xl border border-border">
                                    <div className="relative w-10 h-10 flex items-center justify-center">
                                        {/* Circular progress loader */}
                                        <svg className="w-10 h-10 absolute" viewBox="0 0 40 40">
                                            <circle
                                                cx="20"
                                                cy="20"
                                                r="17"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                className="text-muted-foreground/20"
                                            />
                                            <circle
                                                cx="20"
                                                cy="20"
                                                r="17"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                className="text-primary animate-spin-loader"
                                                strokeDasharray="106.8"
                                                strokeDashoffset="80"
                                            />
                                        </svg>
                                        <FileText className="w-4 h-4 text-primary z-10" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium truncate max-w-[200px]">
                                            {pendingFile.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">Processing document...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Mentioned Document Tag */}
                        {mentionedDoc && (
                            <div className="mb-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span className="truncate max-w-[200px]">{mentionedDoc.name}</span>
                                    <button
                                        type="button"
                                        onClick={handleRemoveMention}
                                        className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between mb-2 px-1">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-primary" />
                                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">
                                    Current Model: <span className="text-primary/70">Gemini 2.5 Flash</span>
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSendMessage} className="relative">
                            {/* Mention Dropdown */}
                            {showMentionDropdown && hasDocuments && (
                                <div
                                    ref={dropdownRef}
                                    className="absolute bottom-full left-0 mb-2 w-72 max-h-48 overflow-y-auto bg-popover border border-border rounded-xl shadow-lg z-50"
                                >
                                    <div className="p-2">
                                        <p className="text-xs text-muted-foreground px-2 py-1 font-medium">Mention a document</p>
                                        {filteredDocuments.length > 0 ? (
                                            <div className="space-y-1">
                                                {filteredDocuments.map((doc: Document) => (
                                                    <button
                                                        key={doc.id}
                                                        type="button"
                                                        onClick={() => handleSelectMention(doc)}
                                                        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                                                    >
                                                        <FileText className="w-4 h-4 text-primary shrink-0" />
                                                        <span className="text-sm truncate">{doc.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground px-2 py-2">No documents found</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* @ Button */}
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                disabled={!hasDocuments || sending || uploading}
                                onClick={handleMentionButtonClick}
                                className={cn(
                                    "absolute left-1.5 top-1.5 h-9 w-9 rounded-lg",
                                    showMentionDropdown && "bg-muted"
                                )}
                            >
                                <AtSign className="h-4 w-4" />
                            </Button>

                            <Input
                                ref={inputRef}
                                placeholder={hasDocuments ? (mentionedDoc ? `Ask about ${mentionedDoc.name}...` : "Ask anything... (@ to mention)") : "Upload a document to start chatting"}
                                disabled={!hasDocuments || sending || uploading}
                                className="h-12 pr-12 pl-12 rounded-xl bg-muted/30 border-border focus-visible:ring-0 focus-visible:ring-offset-0"
                                value={input}
                                onChange={handleInputChange}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!hasDocuments || !input.trim() || sending || uploading}
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
                <Card className="flex-1 p-6 space-y-8 border border-border bg-card rounded-2xl overflow-y-auto">
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Details</h3>
                        <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-4">
                            <div className="flex items-start gap-3">
                                <FileText className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold">Documents</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {filebook._count.documents} file{filebook._count.documents !== 1 ? 's' : ''} uploaded
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold">Chat History</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {messages.length} message{messages.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {hasDocuments && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Uploaded Files</h3>
                            <div className="space-y-2">
                                {filebook.documents.map((doc: any) => (
                                    <div key={doc.id} className="p-3 rounded-xl border border-border bg-muted/20 flex items-center gap-3">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{doc.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(doc.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
