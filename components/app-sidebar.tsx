"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import {
    LayoutDashboard,
    Sparkle,
    FileText,
    Settings,
    HelpCircle,
    Search,
    Plus,
    MessageSquare,
    Clock,
    MoreHorizontal,
    ChevronUp,
    User,
    LogOut,
    Sparkles,
    ShieldCheck,
    ChevronRight,
    Mail,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuAction,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { authClient } from "@/lib/auth-client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { getFilebooks } from "@/lib/actions/filebook"

interface Filebook {
    id: string;
    name: string;
    createdAt: Date;
    _count: {
        documents: number;
    };
}

const data = {
    navMain: [
        {
            title: "Main Menu",
            items: [
                {
                    title: "Dashboard",
                    url: "/dashboard",
                    icon: LayoutDashboard,
                },
                {
                    title: "Featured Files",
                    url: "/featured-files",
                    icon: Sparkle,
                },
                {
                    title: "My Files",
                    url: "/my-files",
                    icon: FileText,
                },
            ],
        },

    ],
}

export function AppSidebar() {
    const { data: session } = authClient.useSession()
    const isAdmin = session?.user?.role === "admin"

    // Add Admin link if user is admin
    const navItems = isAdmin
        ? [
            ...data.navMain[0].items,
            {
                title: "Admin Panel",
                url: "/admin",
                icon: ShieldCheck,
            }
        ]
        : data.navMain[0].items;

    const navGroups = [
        {
            ...data.navMain[0],
            items: navItems
        },
        ...data.navMain.slice(1)
    ]
    const pathname = usePathname()
    const [recentFilebooks, setRecentFilebooks] = useState<Filebook[]>([])

    useEffect(() => {
        async function fetchRecentFilebooks() {
            try {
                const data = await getFilebooks()
                // Get only the 4 most recent filebooks
                setRecentFilebooks(data.slice(0, 4))
            } catch (error) {
                console.error("Failed to fetch filebooks", error)
            }
        }
        fetchRecentFilebooks()
    }, [])

    const handleLogout = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    window.location.href = "/login"
                }
            }
        })
    }

    return (
        <Sidebar collapsible="icon" className="border border-border bg-sidebar m-2 h-[calc(100vh-1rem)]! rounded-2xl overflow-hidden">
            <SidebarHeader className="h-16 flex">
                <Link href="/" className="flex gap-1 group">
                    <div className="w-8 h-8">
                        <svg width="32" height="32" viewBox="0 0 512 625" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="256" cy="312" r="256" fill="#F44800" />
                            <path d="M338.572 177C327.906 177 316.906 176.167 305.572 174.5C294.572 172.5 283.406 170.333 272.072 168V282.5H346.072V312H272.072V500H218.072V159C216.406 158.667 214.739 158.5 213.072 158.5C211.739 158.5 210.239 158.5 208.572 158.5C199.906 158.5 191.739 159.667 184.072 162C176.406 164.333 169.739 168.333 164.072 174C158.739 179.667 154.406 187.333 151.072 197C148.072 206.333 146.572 218.167 146.572 232.5C146.572 250.5 148.739 265.667 153.072 278C157.739 290 163.072 298.5 169.072 303.5C129.406 303.5 109.572 281.667 109.572 238C109.572 222 112.239 207.167 117.572 193.5C122.906 179.833 131.239 168 142.572 158C153.906 147.667 168.239 139.667 185.572 134C203.239 128 224.239 125 248.572 125C256.906 125 264.739 125.333 272.072 126C279.739 126.667 287.072 127.333 294.072 128C301.072 128.667 308.239 129.333 315.572 130C322.906 130.667 330.739 131 339.072 131C347.406 131 355.239 130.667 362.572 130C369.906 129 376.906 127.333 383.572 125C382.906 136.667 381.239 146 378.572 153C376.239 159.667 373.072 164.833 369.072 168.5C365.072 171.833 360.406 174.167 355.072 175.5C350.072 176.5 344.572 177 338.572 177Z" fill="white" />
                        </svg>

                    </div>
                    <span className="font-pacifico text-2xl font-normal tracking-tight text-primary transition-all group-data-[collapsible=icon]:hidden">
                        Think File
                    </span>
                </Link>
            </SidebarHeader>

            <SidebarContent>
                {navGroups.map((group: any) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item: any) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={pathname === item.url}
                                            tooltip={item.title}
                                        >
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}

                <SidebarGroup>
                    <SidebarGroupLabel>File History</SidebarGroupLabel>
                    <SidebarGroupAction title="New Filebook" asChild>
                        <Link href="/filebook">
                            <Plus />
                        </Link>
                    </SidebarGroupAction>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {recentFilebooks.length === 0 ? (
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        className="text-muted-foreground italic"
                                        tooltip="No filebooks yet"
                                    >
                                        <FileText className="opacity-50" />
                                        <span className="text-xs">No filebooks yet</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ) : (
                                <>
                                    {recentFilebooks.map((filebook: any) => (
                                        <SidebarMenuItem key={filebook.id}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={pathname === `/filebook/${filebook.id}`}
                                                tooltip={filebook.name}
                                            >
                                                <Link href={`/filebook/${filebook.id}`}>
                                                    <FileText />
                                                    <span className="truncate">{filebook.name}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip="View All Filebooks"
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            <Link href="/my-files">
                                                <ChevronRight className="h-4 w-4" />
                                                <span className="text-xs font-medium">View All</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-auto">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Contact Us">
                                    <Link href="/contact">
                                        <Mail className="h-4 w-4" />
                                        <span>Contact Us</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Help">
                                    <HelpCircle />
                                    <span>Help & Support</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-border ">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild suppressHydrationWarning>
                                <SidebarMenuButton
                                    size="lg"
                                    className="!p-2 !rounded-md"
                                >
                                    <Avatar className="h-8 w-8 rounded-full">
                                        <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                                        <AvatarFallback className="rounded-full bg-primary/10 text-primary">
                                            {session?.user?.name?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                        <div className="flex items-center gap-2">
                                            <span className="truncate font-semibold">{session?.user?.name || "User"}</span>
                                            {session?.user?.plan === "PRO" && (
                                                <Badge className="h-4 px-1 text-[10px] bg-primary text-primary-foreground border-none">PRO</Badge>
                                            )}
                                        </div>
                                        <span className="truncate text-xs text-muted-foreground">{session?.user?.email || "user@example.com"}</span>
                                    </div>
                                    <ChevronUp className="ml-auto group-data-[collapsible=icon]:hidden" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="top"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                                            <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                                                {session?.user?.name?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <div className="flex items-center gap-2">
                                                <span className="truncate font-semibold">{session?.user?.name || "User"}</span>
                                                {session?.user?.plan === "PRO" && (
                                                    <Badge className="h-4 px-1 text-[10px] bg-primary text-primary-foreground border-none">PRO</Badge>
                                                )}
                                            </div>
                                            <span className="truncate text-xs text-muted-foreground">{session?.user?.email || "user@example.com"}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    {session?.user?.plan !== "PRO" && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/upgrade-pro" className="w-full flex items-center cursor-pointer">
                                                <Sparkles className="mr-2 h-4 w-4" />
                                                Upgrade to Pro
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem asChild>
                                        <Link href="/account" className="w-full flex items-center cursor-pointer">
                                            <User className="mr-2 h-4 w-4" />
                                            Account
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/billing" className="w-full flex items-center cursor-pointer">
                                            <ShieldCheck className="mr-2 h-4 w-4" />
                                            Billing
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings" className="w-full flex items-center cursor-pointer">
                                            <Settings className="mr-2 h-4 w-4" />
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="focus:bg-destructive focus:text-primary-foreground group/logout">
                                    <LogOut className="mr-2 h-4 w-4 group-hover/logout:text-primary-foreground" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
