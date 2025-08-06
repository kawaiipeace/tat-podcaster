"use client";
import { useMutation } from "convex/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { api } from "@/convex/_generated/api";
import { useAudio } from '@/providers/AudioProvider';
import { PodcastDetailPlayerProps } from "@/types";
import { cachePodcastForOffline, isPodcastCachedForOffline } from "@/lib/pwa";

import LoaderSpinner from "./LoaderSpinner";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

const PodcastDetailPlayer = ({
  audioUrl,
  podcastTitle,
  author,
  imageUrl,
  podcastId,
  imageStorageId,
  audioStorageId,
  isOwner,
  authorImageUrl,
  authorId,
}: PodcastDetailPlayerProps) => {
  const router = useRouter();
  const { setAudio } = useAudio();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCachedForOffline, setIsCachedForOffline] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const deletePodcast = useMutation(api.podcasts.deletePodcast);

  // Check if podcast is cached for offline on component mount
  useEffect(() => {
    const checkOfflineStatus = async () => {
      if (audioUrl) {
        const cached = await isPodcastCachedForOffline(audioUrl);
        setIsCachedForOffline(cached);
      }
    };
    
    checkOfflineStatus();
  }, [audioUrl]);

  const handleDownloadForOffline = async () => {
    if (!audioUrl || isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      const success = await cachePodcastForOffline(audioUrl, podcastId);
      
      if (success) {
        setIsCachedForOffline(true);
        toast({
          title: "ดาวน์โหลดสำเร็จ",
          description: "พอดแคสต์นี้สามารถฟังแบบออฟไลน์ได้แล้ว",
        });
      } else {
        toast({
          title: "ดาวน์โหลดไม่สำเร็จ",
          description: "ไม่สามารถบันทึกพอดแคสต์สำหรับฟังออฟไลน์ได้",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Download for offline failed:', error);
      toast({
        title: "ดาวน์โหลดไม่สำเร็จ",
        description: "เกิดข้อผิดพลาดในการดาวน์โหลด",
        variant: "destructive",
      });
    }
    
    setIsDownloading(false);
  };

  const handleDelete = async () => {
    try {
      await deletePodcast({ podcastId, imageStorageId, audioStorageId });
      toast({
        title: "ลบพอดแคสต์แล้ว",
      });
      router.push("/");
    } catch (error) {
      console.error("Error deleting podcast", error);
      toast({
        title: "เกิดข้อผิดพลาดในการลบพอดแคสต์",
        variant: "destructive",
      });
    }
  };

  const handlePlay = () => {
    setAudio({
      title: podcastTitle,
      audioUrl,
      imageUrl,
      author,
      podcastId,
    });
  };

  if (!imageUrl || !authorImageUrl) return <LoaderSpinner />;

  return (
    <div className="mt-6 flex w-full justify-between max-md:justify-center">
      <div className="flex flex-col gap-8 max-md:items-center md:flex-row">
        <Image
          src={imageUrl}
          width={250}
          height={250}
          alt="Podcast image"
          className="aspect-square rounded-lg"
        />
        <div className="flex w-full flex-col gap-5 max-md:items-center md:gap-9">
          <article className="flex flex-col gap-2 max-md:items-center">
            <h1 className="text-32 font-extrabold tracking-[-0.32px] text-white-1">
              {podcastTitle}
            </h1>
            <figure
              className="flex cursor-pointer items-center gap-2"
              onClick={() => {
                router.push(`/profile/${authorId}`);
              }}
            >
              <Image
                src={authorImageUrl}
                width={30}
                height={30}
                alt="Caster icon"
                className="size-[30px] rounded-full object-cover"
              />
              <h2 className="text-16 font-normal text-white-3">{author}</h2>
            </figure>
          </article>

          <Button
            onClick={handlePlay}
            className="text-16 w-full max-w-[250px] bg-[--accent-color] font-extrabold text-white-1"
          >
            <Image
              src="/icons/Play.svg"
              width={20}
              height={20}
              alt="random play"
            />{" "}
            &nbsp; เล่นพอดแคสต์
          </Button>
          
          <Button
            onClick={handleDownloadForOffline}
            disabled={isDownloading || isCachedForOffline}
            className={`text-16 w-full max-w-[250px] font-extrabold ${
              isCachedForOffline 
                ? 'bg-green-600 text-white-1' 
                : 'bg-gray-600 hover:bg-gray-500 text-white-1'
            }`}
          >
            {isDownloading ? (
              <LoaderSpinner />
            ) : isCachedForOffline ? (
              <>
                <Image
                  src="/icons/verified.svg"
                  width={20}
                  height={20}
                  alt="downloaded"
                />
                &nbsp; ดาวน์โหลดแล้ว
              </>
            ) : (
              <>
                <Image
                  src="/icons/download.svg"
                  width={20}
                  height={20}
                  alt="download"
                />
                &nbsp; ดาวน์โหลดสำหรับออฟไลน์
              </>
            )}
          </Button>
        </div>
      </div>
      {isOwner && (
        <div className="relative mt-2">
          <Image
            src="/icons/three-dots.svg"
            width={20}
            height={30}
            alt="Three dots icon"
            className="cursor-pointer"
            onClick={() => setIsDeleting((prev) => !prev)}
          />
          {isDeleting && (
            <div
              className="absolute -left-32 -top-2 z-10 flex w-32 cursor-pointer justify-center gap-2 rounded-md bg-black-6 py-1.5 hover:bg-black-2"
              onClick={handleDelete}
            >
              <Image
                src="/icons/delete.svg"
                width={16}
                height={16}
                alt="Delete icon"
              />
              <h2 className="text-16 font-normal text-white-1">ลบ</h2>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PodcastDetailPlayer;
