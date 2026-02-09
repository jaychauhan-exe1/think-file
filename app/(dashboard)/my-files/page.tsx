"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Plus,
    Search,
    FileText,
    Clock,
    LayoutGrid,
    List,
    ChevronRight,
    Trash2,
    Loader2,
    X,
    Sparkles,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getFilebooks, deleteFilebook, requestFeatured } from "@/lib/actions/filebook";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface Filebook {
    id: string;
    name: string;
    createdAt: Date;
    isFeatured: boolean;
    isFeaturedRequest: boolean;
    _count: {
        documents: number;
    };
}

type ViewMode = "list" | "grid";

export default function MyFiles() {
    const [filebooks, setFilebooks] = useState<Filebook[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [filebookToDelete, setFilebookToDelete] = useState<Filebook | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const { data: session } = authClient.useSession();
    const isPro = session?.user?.plan === "PRO";

    useEffect(() => {
        async function fetchFilebooks() {
            try {
                const data = await getFilebooks();
                setFilebooks(data);
            } catch (error) {
                console.error("Failed to fetch filebooks", error);
            } finally {
                setLoading(false);
            }
        }
        fetchFilebooks();
    }, []);

    // Filter filebooks based on search query
    const filteredFilebooks = useMemo(() => {
        if (!searchQuery.trim()) return filebooks;
        const query = searchQuery.toLowerCase();
        return filebooks.filter((fb: Filebook) =>
            fb.name.toLowerCase().includes(query)
        );
    }, [filebooks, searchQuery]);

    const handleDeleteClick = (e: React.MouseEvent, project: Filebook) => {
        e.stopPropagation();
        e.preventDefault();
        setFilebookToDelete(project);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!filebookToDelete) return;

        setIsDeleting(true);
        try {
            await deleteFilebook(filebookToDelete.id);
            // Refresh the list
            const data = await getFilebooks();
            setFilebooks(data);
            setDeleteDialogOpen(false);
            setFilebookToDelete(null);
        } catch (error) {
            console.error("Failed to delete filebook", error);
            // Keep dialog open on error so user knows something went wrong
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setFilebookToDelete(null);
    };

    const handleRequestFeatured = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        e.preventDefault();
        try {
            await requestFeatured(id);
            toast.success("Featured request sent! Admin will review it soon.");
            // Refresh
            const data = await getFilebooks();
            setFilebooks(data);
        } catch (error) {
            toast.error("Failed to send request");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-8 p-4 md:p-8">
                <div className="h-20 w-1/3 bg-muted rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map(i => <div key={i} className="h-32 bg-muted rounded-2xl" />)}
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col gap-8 p-4 md:p-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">
                                {isPro ? 'Premium' : 'Filebook'} History
                            </h1>
                            {isPro && (
                                <Badge className="bg-primary text-primary-foreground gap-1 px-2 py-0.5">
                                    <Sparkles className="w-3 h-3" />
                                    PRO
                                </Badge>
                            )}
                        </div>
                        <p className="text-muted-foreground">Manage and access all your {isPro ? 'premium' : ''} filebooks.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/filebook">
                            <Button className={`rounded-xl h-10 px-6 font-semibold ${isPro ? 'bg-primary shadow-lg shadow-primary/20' : ''}`}>
                                <Plus className="mr-2 h-4 w-4" />
                                New Filebook
                            </Button>
                        </Link>
                    </div>
                </div>

                {filebooks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-3xl bg-muted/20">
                        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
                            <Plus className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">No filebooks yet</h2>
                        <p className="text-muted-foreground mt-2 max-w-xs mx-auto">Create your first filebook to start organizing your documents.</p>
                        <Link href="/filebook" className="mt-8">
                            <Button className="rounded-xl h-12 px-8 font-bold">Create Filebook</Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="p-6 border border-border bg-card rounded-2xl flex items-center gap-4 shadow-none">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Filebooks</p>
                                    <p className="text-2xl font-bold">{filebooks.length}</p>
                                </div>
                            </Card>
                            <Card className="p-6 border border-border bg-card rounded-2xl flex items-center gap-4 shadow-none">
                                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Last Activity</p>
                                    <p className="text-2xl font-bold truncate">Recently</p>
                                </div>
                            </Card>
                        </div>

                        {/* Toolbar */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-6">
                                <button className="text-sm font-bold border-b-2 border-primary pb-2 px-2 tracking-wide">
                                    All Filebooks
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Search Input */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search filebooks..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 pr-9 h-9 w-48 md:w-64 rounded-lg bg-muted/50 border-border focus-visible:ring-1 focus-visible:ring-primary"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                {/* View Toggle */}
                                <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setViewMode("grid")}
                                        className={cn(
                                            "h-7 w-7 rounded-md transition-all",
                                            viewMode === "grid"
                                                ? "bg-background text-foreground"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setViewMode("list")}
                                        className={cn(
                                            "h-7 w-7 rounded-md transition-all",
                                            viewMode === "list"
                                                ? "bg-background text-foreground"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Search Results Info */}
                        {searchQuery && (
                            <div className="text-sm text-muted-foreground">
                                Found <span className="font-semibold text-foreground">{filteredFilebooks.length}</span> filebook{filteredFilebooks.length !== 1 ? 's' : ''} matching "{searchQuery}"
                            </div>
                        )}

                        {/* No Results */}
                        {filteredFilebooks.length === 0 && searchQuery && (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-semibold">No filebooks found</h3>
                                <p className="text-muted-foreground mt-1">Try searching with different keywords</p>
                            </div>
                        )}

                        {/* Grid View */}
                        {viewMode === "grid" && filteredFilebooks.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredFilebooks.map((project) => (
                                    <Link
                                        key={project.id}
                                        href={`/filebook/${project.id}`}
                                        className="group"
                                    >
                                        <Card className={`p-5 border bg-card rounded-2xl hover:bg-muted/30 transition-all shadow-none h-full flex flex-col ${isPro ? 'border-primary/20 hover:border-primary/50 ring-1 ring-primary/5' : 'border-border hover:border-primary/30'}`}>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                                                    <FileText className="h-6 w-6 text-primary" />
                                                </div>
                                                <div className="flex gap-1">
                                                    {project.isFeatured ? (
                                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none h-8 w-8 p-0 flex items-center justify-center rounded-full" title="Featured">
                                                            <Sparkles className="h-4 w-4" />
                                                        </Badge>
                                                    ) : project.isFeaturedRequest ? (
                                                        <Badge variant="outline" className="border-primary/30 text-primary h-8 w-8 p-0 flex items-center justify-center rounded-full opacity-60" title="Pending Review">
                                                            <Clock className="h-3 h-3" />
                                                        </Badge>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary"
                                                            onClick={(e) => handleRequestFeatured(e, project.id)}
                                                            title="Request to Feature"
                                                        >
                                                            <Sparkles className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={(e) => handleDeleteClick(e, project)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-foreground text-lg mb-2 line-clamp-2">{project.name}</h3>
                                            <div className="flex items-center gap-3 mt-auto pt-3 border-t border-border">
                                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                                    <FileText className="h-3 w-3" />
                                                    {project._count.documents} file{project._count.documents !== 1 ? 's' : ''}
                                                </span>
                                                <span className="h-1 w-1 rounded-full bg-border" />
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    {new Date(project.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* List View */}
                        {viewMode === "list" && filteredFilebooks.length > 0 && (
                            <div className="space-y-3">
                                {filteredFilebooks.map((project) => (
                                    <div
                                        key={project.id}
                                        className={`group flex items-center justify-between p-5 rounded-2xl bg-card border transition-all shadow-none ${isPro ? 'border-primary/20 hover:border-primary/50' : 'border-border hover:bg-muted/30'}`}
                                    >
                                        <Link
                                            href={`/filebook/${project.id}`}
                                            className="flex items-center gap-5 flex-1 cursor-pointer"
                                        >
                                            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                <FileText className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-foreground">{project.name}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                                                        {project._count.documents} files
                                                    </span>
                                                    <span className="h-1 w-1 rounded-full bg-border" />
                                                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                                                        Created {new Date(project.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>

                                        <div className="flex items-center gap-4 text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                {project.isFeatured ? (
                                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none h-9 px-3 gap-2 rounded-xl">
                                                        <Sparkles className="h-3.5 w-3.5" />
                                                        <span className="text-[10px] font-bold">FEATURED</span>
                                                    </Badge>
                                                ) : project.isFeaturedRequest ? (
                                                    <Badge variant="outline" className="border-primary/30 text-primary h-9 px-3 gap-2 rounded-xl opacity-60">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        <span className="text-[10px] font-bold">PENDING</span>
                                                    </Badge>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary"
                                                        onClick={(e) => handleRequestFeatured(e, project.id)}
                                                        title="Request to Feature"
                                                    >
                                                        <Sparkles className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={(e) => handleDeleteClick(e, project)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-foreground">"{filebookToDelete?.name}"</span>?
                            This will permanently remove the project and all its documents. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={handleDeleteCancel}
                            disabled={isDeleting}
                            className="rounded-xl"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
