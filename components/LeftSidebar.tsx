'use client';

import { sidebarLinks } from '@/constants'
import { cn } from '@/lib/utils'
import { SignedIn, SignedOut, useClerk } from '@clerk/nextjs';
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'
import { Button } from './ui/button';
import { useAudio } from '@/providers/AudioProvider';

const LeftSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { audio } = useAudio();
  const { user } = useClerk();

  return (
    <section className={cn("left_sidebar h-[calc(100vh-1px)]", {
      'h-[calc(100vh-140px)]': audio?.audioUrl
    })}>
      <nav className="flex flex-col gap-6">
        <Link href="/" className="flex cursor-pointer items-center gap-1 pb-10 max-lg:justify-center">
          <Image src="/icons/logo.png" alt="logo" width={23} height={27} />
          <h1 className="text-20 font-extrabold text-white max-lg:hidden">Tourism Brief Talk</h1>
        </Link>

        {sidebarLinks.map(({ route, label, imgURL }) => {
          const isActive = pathname === route || pathname.startsWith(`${route}/`);

          return <Link href={
            route === '/profile' && user?.id ? `${route}/${user?.id}` : route
          } key={label} className={cn("flex gap-3 items-center py-4 max-lg:px-4 justify-center lg:justify-start", {
            'bg-nav-focus border-r-4 border-[--accent-color]': isActive
          })}>
            <Image src={imgURL} alt={label} width={24} height={24} />
            <p>{label}</p>
          </Link>
        })}
      </nav>
      
      {/* Social Media Section */}
      <div className="flex flex-col gap-4 mt-8 px-4">
        <h3 className="text-14 font-semibold text-white-1 max-lg:text-center">ติดตามเรา</h3>
        <div className="flex flex-col gap-3">
          {/* Apple Podcasts */}
          <Link 
            href="https://podcasts.apple.com/search?term=Tourism%20Brief%20Talk" 
            target="_blank"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-black-3 transition-colors max-lg:justify-center"
          >
            <div className="w-8 h-8 bg-gradient-to-b from-pink-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
              </svg>
            </div>
            <span className="text-12 text-white-2 max-lg:hidden">Apple Podcasts</span>
          </Link>
          
          {/* YouTube */}
          <Link 
            href="https://www.youtube.com/results?search_query=Tourism+Brief+Talk" 
            target="_blank"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-black-3 transition-colors max-lg:justify-center"
          >
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                <path d="M23.498 6.186a2.99 2.99 0 0 0-2.106-2.106C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.392.535A2.99 2.99 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.99 2.99 0 0 0 2.106 2.106c1.887.535 9.392.535 9.392.535s7.505 0 9.392-.535a2.99 2.99 0 0 0 2.106-2.106C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <span className="text-12 text-white-2 max-lg:hidden">YouTube</span>
          </Link>
        </div>
      </div>
      
      <SignedOut>
        <div className="flex-center w-full pb-14 max-lg:px-4 lg:pr-8">
          <Button asChild className="text-16 w-full bg-[--accent-color] font-extrabold">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </SignedOut>
      <SignedIn>
        <div className="flex-center w-full pb-14 max-lg:px-4 lg:pr-8">
          <Button className="text-16 w-full bg-[--accent-color] font-extrabold" onClick={() => signOut(() => router.push('/'))}>
            Log Out
          </Button>
        </div>
      </SignedIn>
    </section>
  )
}

export default LeftSidebar