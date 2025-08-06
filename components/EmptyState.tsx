import { EmptyStateProps } from '@/types'
import Image from 'next/image'
import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'

const EmptyState = ({ title, search, buttonLink, buttonText }: EmptyStateProps) => {
  return (
    <section className="flex-center size-full flex-col gap-4 px-4">
      <div className="relative">
        <Image 
          src="/icons/emptyState.svg" 
          width={200} 
          height={200} 
          alt="empty state"
          className="opacity-80" 
        />
      </div>
      <div className="flex-center w-full max-w-[400px] flex-col gap-3">
        <h1 className="text-18 text-center font-semibold text-white-1">{title}</h1>
        {search && (
          <p className="text-14 text-center font-normal text-gray-1 leading-relaxed">
            Try adjusting your search terms or check your spelling. You can also browse all available content.
          </p>
        )}
        {buttonLink && buttonText && (
          <Button className="bg-[--accent-color] hover:bg-[--accent-color]/90 transition-all duration-300 mt-2">
            <Link href={buttonLink} className="gap-2 flex items-center">
              <Image
                src="/icons/discover.svg"
                width={18}
                height={18}
                alt='discover'
                className="brightness-0 invert"
              />
              <span className="text-14 font-bold text-white-1">{buttonText}</span>
            </Link>
          </Button>
        )}
      </div>
    </section>
  )
}

export default EmptyState