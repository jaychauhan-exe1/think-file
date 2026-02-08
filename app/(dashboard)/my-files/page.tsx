"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Search,
    FileText,
    Clock,
    MoreVertical,
    LayoutGrid,
    List,
    ChevronRight,
    Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getFilebooks } from "@/lib/actions/filebook";

export default function MyFiles() {
    const [filebooks, setFilebooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div className="flex flex-col gap-8 p-4 md:p-8 max-w-7xl mx-auto">
                <div className="h-20 w-1/3 bg-muted animate-pulse rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />)}
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Project History</h1>
                    <p className="text-muted-foreground">Manage and access all your past filebooks.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-border">
                        <Filter className="h-4 w-4" />
                    </Button>
                    <Link href="/filebook">
                        <Button className="rounded-xl h-10 px-6 font-semibold">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Project
                        </Button>
                    </Link>
                </div>
            </div>

            {filebooks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-3xl bg-muted/20">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
                        <Plus className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">No projects yet</h2>
                    <p className="text-muted-foreground mt-2 max-w-xs mx-auto">Create your first filebook to start organizing your documents.</p>
                    <Link href="/filebook" className="mt-8">
                        <Button className="rounded-xl h-12 px-8 font-bold">Create Filebook</Button>
                    </Link>
                </div>
            ) : (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-6 border border-border bg-card rounded-2xl flex items-center gap-4 shadow-none">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Projects</p>
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
                        <Card className="p-6 border border-border bg-card rounded-2xl flex items-center gap-4 shadow-none">
                            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                                <Search className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <Input placeholder="Quick search..." className="bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-xl font-bold placeholder:text-muted-foreground/30 shadow-none" />
                            </div>
                        </Card>
                    </div>

                    {/* Toolbar */}
                    <div className="flex items-center justify-between border-b border-border pb-4">
                        <div className="flex items-center gap-6">
                            <button className="text-sm font-bold border-b-2 border-primary pb-4 px-2 tracking-wide">All Projects</button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg bg-muted shadow-none">
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="space-y-3">
                        {filebooks.map((project) => (
                            <div
                                key={project.id}
                                className="group flex items-center justify-between p-5 rounded-2xl bg-card border border-border hover:bg-muted/30 transition-all cursor-pointer shadow-none"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                                        <FileText className="h-6 w-6 text-muted-foreground" />
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
                                </div>

                                <div className="flex items-center gap-4 text-muted-foreground">
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
