"use client"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Button } from "./ui/button"
import Link from "next/link"
import { useState } from "react"
import { Moon, Sun } from "lucide-react"

export const Navbar = () => {
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto h-20 flex justify-between items-center px-4">
        {/* Logo */}
        <Link href="/" className="group">
          <span className="font-pacifico relative font-normal text-3xl tracking-tight text-primary">
            Think File
            <hr className="w-[0%] left-[50%] translate-x-[-50%] h-0.5 rounded-full bg-primary absolute group-hover:w-[50%] transition-all duration-300" />
          </span>


        </Link>


        {/* Center Menu */}
        <nav className="hidden lg:block">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-muted font-medium text-[15px]">
                  Product
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[300px] grid gap-3">
                    <NavigationMenuLink href="#" className="flex flex-col gap-1 p-3 rounded-lg hover:bg-muted transition-colors">
                      <span className="font-bold">Getting Started</span>
                      <span className="text-sm text-muted-foreground">Setup your account and start analyzing.</span>
                    </NavigationMenuLink>
                    <NavigationMenuLink href="#" className="flex flex-col gap-1 p-3 rounded-lg hover:bg-muted transition-colors">
                      <span className="font-bold">AI Workflow</span>
                      <span className="text-sm text-muted-foreground">Learn how our LLM processes your data.</span>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="#" className="px-4 py-2 hover:bg-muted rounded-md text-[15px] font-medium transition-colors font-sans">Pricing</Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="#" className="px-4 py-2 hover:bg-muted rounded-md text-[15px] font-medium transition-colors font-sans">Team</Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="#" className="px-4 py-2 hover:bg-muted rounded-md text-[15px] font-medium transition-colors font-sans">About</Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Right Actions */}
        <div className="flex gap-4 items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={changeMode}
            className="rounded-full w-10 h-10 transition-colors"
          >
            {mode === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>

          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" className="font-semibold px-6 font-sans">Login</Button>
          </Link>

          <Link href="/sign-up">
            <Button variant="default" className="font-bold px-6 transition-all font-sans border border-primary/20">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
