"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, Send, FileText, ArrowLeft, Sparkles, Loader2, AtSign, X, Paperclip, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFilebookById, getChatMessages, saveChatMessage } from "@/lib/actions/filebook";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';

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
    const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { data: session } = authClient.useSession();
    const isPro = session?.user?.plan === "PRO";

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
                setMessages(chatHistory.map((msg: any) => ({
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

        // Client-side size check (2MB)
        const MAX_FILE_SIZE = 2 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            alert("File size exceeds 2MB limit. Please upload a smaller file.");
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

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

        // Basic local commands/greetings
        const lowerInput = questionToSend.toLowerCase().trim();
        const greetings = ["hello", "hi", "hey", "hola", "greetings"];

        if (greetings.includes(lowerInput)) {
            const aiId = Date.now().toString();
            const aiMsg: Message = {
                id: aiId,
                role: "ai",
                content: `Hello! I'm ThinkFile. How can I help you with your documents today?`
            };
            setMessages(prev => [...prev, aiMsg]);
            setSending(false);
            // Optional: still save to DB if desired
            await saveChatMessage(filebookId, "user", displayContent, selectedModel);
            await saveChatMessage(filebookId, "ai", aiMsg.content, selectedModel);
            return;
        }

        // Save user message to DB
        await saveChatMessage(filebookId, "user", displayContent, selectedModel);

        try {
            const res = await fetch("/api/askgemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: questionToSend,
                    filebookId,
                    documentId: docIdToSend,
                    model: selectedModel
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                let errorData;
                try { errorData = JSON.parse(text); } catch { errorData = { error: "Failed to get answer" }; }

                if (res.status === 403) {
                    const limitMessage: Message = {
                        role: "ai",
                        content: errorData.error || "Usage limit reached."
                    };
                    setMessages(prev => [...prev, limitMessage]);
                    return;
                }
                throw new Error(errorData.error || "Failed to get answer");
            }

            // Create a placeholder AI message for streaming
            const aiId = Date.now().toString();
            const initialAiMessage: Message = { id: aiId, role: "ai", content: "" };
            setMessages(prev => [...prev, initialAiMessage]);

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = "";

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    accumulatedContent += chunk;

                    // Update the last message (the placeholder) with accumulated content
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMsgIdx = newMessages.findIndex((m: any) => m.id === aiId);
                        if (lastMsgIdx !== -1) {
                            newMessages[lastMsgIdx] = { ...newMessages[lastMsgIdx], content: accumulatedContent };
                        }
                        return newMessages;
                    });
                }
            }
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
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold">{filebook.name}</h2>
                                    {isPro && (
                                        <Badge className="bg-primary text-primary-foreground h-4 px-1 text-[10px] animate-pulse">PRO</Badge>
                                    )}
                                </div>
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
                                        {messages.map((m: any, i: number) => (
                                            <div key={m.id || i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                                                <div className={cn(
                                                    "max-w-[85%] p-4 rounded-xl text-md border border-border transition-all",
                                                    m.role === "user"
                                                        ? `${isPro ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-primary'} text-primary-foreground border-primary`
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

                    {/* Chat Input Container */}
                    <div className="p-4 border-t border-border">
                        <div className="bg-muted/20 rounded-lg border border-border/60">

                            {/* Pending File UI */}
                            {pendingFile && uploading && (
                                <div className="px-4 py-2 border-b border-border bg-muted/30 flex items-center gap-3">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    <span className="text-xs font-medium truncate">{pendingFile.name} processing...</span>
                                </div>
                            )}

                            {/* Mentioned Doc UI */}
                            {mentionedDoc && (
                                <div className="px-4 py-2 border-b border-border bg-primary/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs font-medium text-primary">
                                        <FileText className="h-3 w-3" />
                                        <span>Focusing on: {mentionedDoc.name}</span>
                                    </div>
                                    <button onClick={handleRemoveMention} className="text-muted-foreground hover:text-primary">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}

                            <form onSubmit={handleSendMessage} className="flex flex-col">
                                <div className="relative">
                                    {/* Mention Dropdown */}
                                    {showMentionDropdown && hasDocuments && (
                                        <div ref={dropdownRef} className="absolute bottom-full left-4 mb-2 w-72 max-h-48 overflow-y-auto bg-popover border border-border rounded-xl shadow-xl z-50 p-2">
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground/60 px-2 py-1">Sources</p>
                                            {filteredDocuments.map((doc: Document) => (
                                                <button key={doc.id} type="button" onClick={() => handleSelectMention(doc)} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted text-left text-sm">
                                                    <FileText className="w-4 h-4 text-primary shrink-0" />
                                                    <span className="truncate">{doc.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <textarea
                                        ref={inputRef as any}
                                        value={input}
                                        onChange={(e) => {
                                            handleInputChange(e as any);
                                            // Auto-resize
                                            e.target.style.height = 'inherit';
                                            e.target.style.height = `${e.target.scrollHeight}px`;
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e as any);
                                            }
                                        }}
                                        placeholder="Ask anything. Type @ for sources..."
                                        className="w-full bg-transparent border-0 ring-0 outline-0 p-4 pb-12 resize-none min-h-[100px] text-sm placeholder:text-muted-foreground/50"
                                        disabled={!hasDocuments || sending || uploading}
                                    />
                                </div>

                                {/* Form Footer Actions */}
                                <div className="flex items-center justify-between p-3 pt-0">
                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-full text-muted-foreground/60 hover:text-primary hover:bg-primary/10"
                                            onClick={handleMentionButtonClick}
                                            disabled={!hasDocuments}
                                        >
                                            <AtSign className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-full text-muted-foreground/60 hover:text-primary hover:bg-primary/10"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Paperclip className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-muted-foreground/80 hover:text-primary gap-1 px-2">
                                                    Model <span className="text-primary/60">{selectedModel.includes("2.5") ? "2.5 Flash" : "3 Flash"}</span>
                                                    <ChevronDown className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuRadioGroup value={selectedModel} onValueChange={(val) => {
                                                    if (val === "gemini-3-flash-preview" && !isPro) {
                                                        toast.error("Gemini 3 Flash is a PRO feature");
                                                        return;
                                                    }
                                                    setSelectedModel(val);
                                                }}>
                                                    <DropdownMenuRadioItem value="gemini-2.5-flash" className="text-xs">
                                                        Gemini 2.5 Flash (Stable)
                                                    </DropdownMenuRadioItem>
                                                    <DropdownMenuRadioItem
                                                        value="gemini-3-flash-preview"
                                                        className={cn("text-xs flex items-center justify-between gap-2", !isPro && "opacity-50")}
                                                    >
                                                        Gemini 3 Flash (Preview)
                                                        {!isPro && <Badge className="text-[8px] h-3 px-1 ml-auto">PRO</Badge>}
                                                    </DropdownMenuRadioItem>
                                                </DropdownMenuRadioGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        <Button
                                            type="submit"
                                            size="icon"
                                            disabled={!input.trim() || sending || !hasDocuments}
                                            className={cn(
                                                "h-8 w-8 rounded-full transition-all",
                                                input.trim() ? "bg-primary text-primary-foreground scale-100" : "bg-muted text-muted-foreground scale-90"
                                            )}
                                        >
                                            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Side Column (35%) */}
            <div className="flex-[0.35] flex flex-col gap-4">
                <Card className="flex-1 p-6 space-y-8 border border-border bg-card rounded-2xl overflow-y-auto">
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Details</h3>
                        <div className={`p-4 rounded-xl border border-border space-y-4 ${isPro ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/5' : 'bg-muted/30'}`}>
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
