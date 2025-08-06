'use client'

import EmptyState from '@/components/EmptyState'
import LoaderSpinner from '@/components/LoaderSpinner'
import PodcastCard from '@/components/PodcastCard'
import PodcastDetailPlayer from '@/components/PodcastDetailPlayer'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import Image from 'next/image'
import React from 'react'

const PodcastDetails = ({ params: { podcastId } }: { params: { podcastId: Id<'podcasts'> } }) => {
  const { user } = useUser();

  const podcast = useQuery(api.podcasts.getPodcastById, { podcastId })

  const similarPodcasts = useQuery(api.podcasts.getPodcastByVoiceType, { podcastId })

  const isOwner = user?.id === podcast?.authorId;

  if(!similarPodcasts || !podcast) return <LoaderSpinner />

  return (
    <section className="flex w-full flex-col">
      <header className="mt-9 flex items-center justify-between">
        <h1 className="text-20 font-bold text-white-1">
          กำลังเล่น
        </h1>
        <figure className="flex gap-3">
          <Image
            src="/icons/headphone.svg"
            width={24}
            height={24}
            alt="headphone"
          />
          <h2 className="text-16 font-bold text-white-1">{podcast?.views}</h2>
        </figure>
      </header>



     {/* @ts-ignore */}
      <PodcastDetailPlayer
        isOwner={isOwner}
        podcastId={podcast._id}
        {...podcast}
      />

      <p className="text-white-2 text-16 pb-8 pt-[45px] font-medium max-md:text-center">{podcast?.podcastDescription}</p>

      <section className="mt-8 flex flex-col gap-5">
        <h1 className="text-20 font-bold text-white-1">พอดแคสต์ที่คล้ายกัน</h1>

        {similarPodcasts && similarPodcasts.length > 0 ? (
          <div className="podcast_stack">
            {similarPodcasts?.map(({ _id, podcastTitle, podcastDescription, imageUrl }) => (
              <PodcastCard
                key={_id}
                imgUrl={imageUrl as string}
                title={podcastTitle}
                description={podcastDescription}
                podcastId={_id}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <EmptyState
              title="ไม่พบพอดแคสต์ที่คล้ายกัน"
              buttonLink="/discover"
              buttonText="ค้นหาพอดแคสต์เพิ่มเติม"
            />
            <p className="text-14 text-gray-1 mt-4 text-center max-w-md">
              สำรวจหน้าค้นหาของเราเพื่อหาพอดแคสต์น่าสนใจเพิ่มเติมที่อาจใช่ของคุณ
            </p>
          </div>
        )}
      </section>

    </section>
  )
}

export default PodcastDetails