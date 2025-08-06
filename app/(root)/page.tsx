"use client";
import PodcastCard from '@/components/PodcastCard'
import EmptyState from '@/components/EmptyState'
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import LoaderSpinner from '@/components/LoaderSpinner';

const Home = () => {
  const trendingPodcasts = useQuery(api.podcasts.getTrendingPodcasts);

  if(!trendingPodcasts) return <LoaderSpinner />

  return (
    <div className="mt-9 flex flex-col gap-9 md:overflow-hidden">
      <section className='flex flex-col gap-5'>
        <h1 className="text-20 font-bold text-white-1">Trending Podcasts</h1>

        {trendingPodcasts && trendingPodcasts.length > 0 ? (
          <div className="podcast_grid">
            {trendingPodcasts?.map(({ _id, podcastTitle, podcastDescription, imageUrl }) => (
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
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <EmptyState
              title="No trending podcasts available"
              buttonText="Create First Podcast"
              buttonLink="/create-podcast"
            />
            <p className="text-14 text-gray-1 mt-4 text-center max-w-md">
              Be the first to share your voice! Create a podcast and start the trending conversation.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

export default Home