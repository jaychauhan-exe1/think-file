"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Moon, Settings, Sun } from "lucide-react"

const TITLE_MAP: Record<string, string> = {
    "/": "Home",
    "/dashboard": "Dashboard",
    "/dashboard/my-files": "My Files",
    "/dashboard/featured-files": "Featured Files",
    "/my-files": "My Files",
    "/featured-files": "Featured Files",
    "/filebook": "Filebook",
};

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [mode, setMode] = useState("light")

    const changeMode = () => {
        const newMode = mode === "light" ? "dark" : "light"
        setMode(newMode)
        if (newMode === "dark") {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }
    }
    const pathname = usePathname();

    // fallback for dynamic routes
    const title =
        TITLE_MAP[pathname] ??
        pathname
            .split("/")
            .filter(Boolean)
            .map(
                (segment) =>
                    segment.charAt(0).toUpperCase() + segment.slice(1)
            )
            .join(" / ");

    return (
        <SidebarProvider className="flex gap-3">
            <AppSidebar />

            <main className="w-full p-2">
                <div className="flex items-center justify-between bg-sidebar w-full py-3 px-2 rounded-2xl border border-border">
                    <div className="flex items-center gap-4 font-medium ">
                        <SidebarTrigger />
                        <span className="">
                            {title}
                        </span>
                    </div>
                    <div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={changeMode}
                            className="rounded-full w-10 h-10 transition-colors"
                        >
                            {mode === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"

                        >
                            <Settings />
                        </Button>

                    </div>

                </div>
                <div className="mt-3 p-4 bg-sidebar rounded-2xl border border-border h-[calc(100vh-6rem)]">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    );
}