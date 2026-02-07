"use client"
import { authClient } from "@/lib/auth-client"
export default function DashboardPage() {
    const { data: session } = authClient.useSession()
    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? "Good Morning" : currentHour < 18 ? "Good Afternoon" : "Good Evening";
    return (
        <div className="p-4">
            <div>
                <h1 className="text-lg">Hello, {greeting},</h1>
                <h2 className="text-2xl font-bold">{session?.user?.name?.split(" ")[0]}</h2>
            </div>
        </div>
    )
}
