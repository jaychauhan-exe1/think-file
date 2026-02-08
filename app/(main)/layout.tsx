import { Navbar } from "@/components/Navbar";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Navbar />
            <main className="pt-20">
                {children}
            </main>
        </>
    );
}
