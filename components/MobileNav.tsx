"use client"

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { sidebarLinks } from "@/constants"
import { cn } from "@/lib/utils"
import { SignedIn, SignedOut, useClerk } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "./ui/button"


const MobileNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useClerk();

  return (
    <section>
      <Sheet>
        <SheetTrigger>
          <Image src="/icons/hamburger.svg" width={30} height={30} alt="menu" className="cursor-pointer" />
        </SheetTrigger>
        <SheetContent side="left" className="border-none bg-black-1 w-[280px] p-0">
          {/* Header */}
          <div className="flex cursor-pointer items-center gap-1 p-4 border-b border-gray-800">
            <Image src="/icons/logo.png" alt="logo" width={20} height={24} />
            <h1 className="text-18 font-extrabold text-white-1 ml-2">Tourism Brief Talk</h1>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
            {/* Navigation Links - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <nav className="flex flex-col gap-2 text-white-1">
                {sidebarLinks.map(({ route, label, imgURL }) => {
                  const isActive = pathname === route || pathname.startsWith(`${route}/`);
                  const href = route === '/profile' && user?.id ? `${route}/${user?.id}` : route;

                  return (
                    <SheetClose asChild key={route}>
                      <Link href={href} className={cn("flex gap-3 items-center py-2.5 px-3 rounded-lg justify-start transition-colors hover:bg-black-3", {
                        'bg-nav-focus border-r-4 border-[--accent-color]': isActive
                      })}>
                        <Image src={imgURL} alt={label} width={20} height={20} />
                        <p className="text-14 font-medium">{label}</p>
                      </Link>
                    </SheetClose>
                  )
                })}
              </nav>
              
              {/* Social Media Section - In scrollable area */}
              <div className="mt-6 pt-4 border-t border-gray-800">
                <h3 className="text-12 font-semibold text-white-1 mb-3 px-1">ติดตามเรา</h3>
                <div className="flex flex-col gap-2">
                  <Link 
                    href="https://podcasts.apple.com/search?term=Tourism%20Brief%20Talk" 
                    target="_blank"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-black-3 transition-colors"
                  >
                    <div className="w-6 h-6 bg-gradient-to-b from-pink-500 to-purple-600 rounded flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="currentColor">
                        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                      </svg>
                    </div>
                    <span className="text-12 text-white-2 font-medium">Apple Podcasts</span>
                  </Link>
                  
                  <Link 
                    href="https://www.youtube.com/results?search_query=Tourism+Brief+Talk" 
                    target="_blank"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-black-3 transition-colors"
                  >
                    <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="currentColor">
                        <path d="M23.498 6.186a2.99 2.99 0 0 0-2.106-2.106C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.392.535A2.99 2.99 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.99 2.99 0 0 0 2.106 2.106c1.887.535 9.392.535 9.392.535s7.505 0 9.392-.535a2.99 2.99 0 0 0 2.106-2.106C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                    <span className="text-12 text-white-2 font-medium">YouTube</span>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Fixed Bottom - Authentication */}
            <div className="flex-shrink-0 p-4 border-t border-gray-800 bg-black-1">
              <SignedOut>
                <SheetClose asChild>
                  <Button asChild className="text-14 w-full bg-[--accent-color] font-extrabold h-10 rounded-lg">
                    <Link href="/sign-in">Sign in</Link>
                  </Button>
                </SheetClose>
              </SignedOut>
              <SignedIn>
                <SheetClose asChild>
                  <Button 
                    className="text-14 w-full bg-[--accent-color] font-extrabold h-10 rounded-lg" 
                    onClick={() => signOut(() => router.push('/'))}
                  >
                    Log Out
                  </Button>
                </SheetClose>
              </SignedIn>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  )
}

export default MobileNav