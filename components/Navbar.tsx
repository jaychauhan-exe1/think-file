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

export const Navbar = () => {
  const [mode, setMode] = useState("light")

  const changeMode = () => {
    if (mode === "light") {
      setMode("dark")
      document.documentElement.classList.add("dark")
    } else {
      setMode("light")
      document.documentElement.classList.remove("dark")
    }
  }

  return (
    <div className="flex justify-between items-center p-4">
      <span className="font-pacifico ">Think File</span>
      <div>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="relative font-normal">Documentation</NavigationMenuTrigger>
              <NavigationMenuContent className="w-full">
                <NavigationMenuLink className="w-max">Getting Started</NavigationMenuLink>
                <NavigationMenuLink>Introduction</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <ul className="flex gap-5">
              <li>
                Pricing
              </li>
              <li>
                Contact Us
              </li>
              <li>
                About Us
              </li>
            </ul>


          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className="flex gap-2 items-center justify-between">
        <Button type="button" variant="default" onClick={changeMode}>d</Button>
        <Link href="/login">
          <Button type="button" variant="default">Login</Button>
        </Link>
        <Link href="/sign-up">
          <Button type="button" variant="outline">Sign Up</Button>
        </Link>
      </div>
    </div>
  )
}
