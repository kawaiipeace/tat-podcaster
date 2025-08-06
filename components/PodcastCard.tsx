import { PodcastCardProps } from '@/types'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

const PodcastCard = ({
  imgUrl, title, description, podcastId
}: PodcastCardProps) => {
  const router = useRouter()

  const handleViews = () => {
    // increase views

    router.push(`/podcasts/${podcastId}`, {
      scroll: true
    })
  }

  return (
    <div className="cursor-pointer" onClick={handleViews}>
      {/* Mobile Stack View */}
      <figure className="flex gap-4 md:flex-col md:gap-2">
        <Image 
          src={imgUrl}
          width={174}
          height={174}
          alt={title}
          className="aspect-square h-[80px] w-[80px] flex-shrink-0 rounded-xl md:h-fit md:w-full md:size-auto 2xl:size-[200px]"
        />
        <div className="flex flex-col justify-center md:justify-start">
          <h1 className="text-14 font-bold text-white-1 md:text-16 md:truncate">{title}</h1>
          <h2 className="text-12 font-normal capitalize text-white-4 md:truncate line-clamp-2 md:line-clamp-1">{description}</h2>
        </div>
      </figure>
    </div>
  )
}

export default PodcastCard