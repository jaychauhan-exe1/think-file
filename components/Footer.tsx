
import Link from 'next/link'

export const Footer = () => {
    return (
        <div>
            <footer className="py-20 border-t border-border/50 text-center">
                <div className="container mx-auto px-4 text-center space-y-10">
                    <div className="flex flex-col items-center gap-6">
                        <Link href="/" className="group">
                            <span className="font-pacifico text-4xl tracking-tighter text-primary transition-all group-hover:scale-110 block">Think File</span>
                        </Link>
                        <p className="text-muted-foreground font-medium text-sm tracking-widest uppercase">Intelligent Document Architecture</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-12 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                        {['Privacy', 'Security', 'Terms', 'Status', 'Twitter'].map(link => (
                            <Link key={link} href="#" className="hover:text-primary transition-colors relative group">
                                {link}
                                <span className="absolute -bottom-1 left-[50%] -translate-x-1/2 w-0 h-0.5 bg-primary transition-all group-hover:w-[50%]"></span>
                            </Link>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-border/20">
                        <p className="text-xs text-muted-foreground/60 font-bold uppercase tracking-widest">
                            © 2026 Think File Ecosystem. All rights dedicated to innovation.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
