"use client";

import { useQuery } from "convex/react";

import EmptyState from "@/components/EmptyState";
import LoaderSpinner from "@/components/LoaderSpinner";
import PodcastCard from "@/components/PodcastCard";
import ProfileCard from "@/components/ProfileCard";
import { api } from "@/convex/_generated/api";

const ProfilePage = ({
  params,
}: {
  params: {
    profileId: string;
  };
}) => {
  const user = useQuery(api.users.getUserById, {
    clerkId: params.profileId,
  });
  const podcastsData = useQuery(api.podcasts.getPodcastByAuthorId, {
    authorId: params.profileId,
  });

  if (!podcastsData) return <LoaderSpinner />;

  // If user doesn't exist, show message to create account
  if (user === null) {
    return (
      <section className="mt-9 flex flex-col">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <EmptyState
            title="User not found"
            search={false}
            buttonText="Go to Home"
            buttonLink="/"
          />
          <p className="text-14 text-gray-1 mt-4 text-center max-w-md">
            This user profile doesn't exist or the user hasn't created an account yet.
          </p>
        </div>
      </section>
    );
  }

  if (!user) return <LoaderSpinner />;

  return (
    <section className="mt-9 flex flex-col">
      <h1 className="text-20 font-bold text-white-1 max-md:text-center">
        Podcaster Profile
      </h1>
      <div className="mt-6 flex flex-col gap-6 max-md:items-center md:flex-row">
        <ProfileCard
          profileId={params.profileId}
          podcastData={podcastsData!}
          imageUrl={user?.imageUrl || ""}
          userFirstName={user?.name || "User"}
        />
      </div>
      <section className="mt-9 flex flex-col gap-5">
        <h1 className="text-20 font-bold text-white-1">All Podcasts</h1>
        {podcastsData && podcastsData.podcasts.length > 0 ? (
          <div className="podcast_grid">
            {podcastsData?.podcasts
              ?.slice(0, 4)
              .map((podcast) => (
                <PodcastCard
                  key={podcast._id}
                  imgUrl={podcast.imageUrl!}
                  title={podcast.podcastTitle!}
                  description={podcast.podcastDescription}
                  podcastId={podcast._id}
                />
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <EmptyState
              title="No podcasts created yet"
              search={false}
              buttonText="Create Your First Podcast"
              buttonLink="/create-podcast"
            />
            <p className="text-14 text-gray-1 mt-4 text-center max-w-md">
              Start your podcasting journey by uploading your first audio content and sharing it with the world.
            </p>
          </div>
        )}
      </section>
    </section>
  );
};

export default ProfilePage;
