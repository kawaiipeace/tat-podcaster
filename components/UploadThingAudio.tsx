import React, { useState, useEffect } from 'react'
import { UploadButton } from '@uploadthing/react'
import { Label } from './ui/label'
import { useToast } from './ui/use-toast'
import { Music, Upload, Loader } from 'lucide-react'
import { Id } from '@/convex/_generated/dataModel'
import type { OurFileRouter } from '@/app/api/uploadthing/core'

interface UploadThingAudioProps {
  setAudio: (url: string) => void
  setAudioStorageId: (id: Id<"_storage"> | null) => void
  audio: string
  setAudioDuration: (duration: number) => void
}

const UploadThingAudio = ({
  setAudio,
  setAudioStorageId,  
  audio,
  setAudioDuration
}: UploadThingAudioProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { toast } = useToast()

  // Fix SSR/SSG hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleUploadComplete = (res: any[]) => {
    if (res && res[0]) {
      const fileUrl = res[0].url
      setAudio(fileUrl)
      
      // Set a placeholder storage ID since we're using UploadThing
      setAudioStorageId(null)
      
      // Calculate audio duration
      const audio = new Audio(fileUrl)
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(audio.duration)
      })
      
      toast({
        title: 'Audio uploaded successfully!',
        description: `File: ${res[0].name || 'audio file'}`
      })
    }
    setIsUploading(false)
  }

  const handleUploadError = (error: Error) => {
    console.error("Upload error:", error)
    toast({
      title: 'Upload failed',
      description: error.message || 'Failed to upload audio file',
      variant: 'destructive'
    })
    setIsUploading(false)
  }

  // Don't render UploadButton during SSR
  if (!isMounted) {
    return (
      <div className="flex flex-col gap-4">
        <Label className="text-16 font-bold text-white-1">
          Upload Audio File (UploadThing)
        </Label>
        
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Upload className="w-12 h-12 text-gray-400" />
            <div>
              <h3 className="text-white-2 font-medium mb-2">Loading upload component...</h3>
              <p className="text-gray-400 text-sm mb-4">Please wait</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Label className="text-16 font-bold text-white-1">
        Upload Audio File (UploadThing)
      </Label>
      
      {!audio ? (
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Upload className="w-12 h-12 text-gray-400" />
            <div>
              <h3 className="text-white-2 font-medium mb-2">Upload Audio File</h3>
              <p className="text-gray-400 text-sm mb-4">Click below to select and upload your audio file</p>
            </div>
            
            <UploadButton<OurFileRouter, "audioUploader">
              endpoint="audioUploader"
              onClientUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              onUploadBegin={() => setIsUploading(true)}
              appearance={{
                button: "bg-[--accent-color] hover:bg-[--accent-color]/80 text-white px-6 py-3 ut-ready:bg-[--accent-color] ut-uploading:cursor-not-allowed ut-uploading:bg-gray-600 min-w-[200px]",
                allowedContent: "text-gray-400 text-xs mt-2"
              }}
              content={{
                button: isUploading ? (
                  <div className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Uploading...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Choose Audio File
                  </div>
                ),
                allowedContent: "Audio files up to 32MB (MP3, WAV, M4A, etc.)"
              }}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <Music className="w-6 h-6 text-green-500" />
            <div>
              <p className="text-green-500 font-medium">Audio uploaded successfully!</p>
              <p className="text-sm text-gray-400">Using UploadThing CDN</p>
            </div>
          </div>
          
          <div>
            <Label className="text-14 font-bold text-white-1 mb-2 block">
              Preview Audio
            </Label>
            <audio 
              controls 
              src={audio}
              className="w-full"
              style={{
                backgroundColor: '#1a1a1a',
                borderRadius: '8px'
              }}
            />
          </div>
          
          <UploadButton<OurFileRouter, "audioUploader">
            endpoint="audioUploader" 
            onClientUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            onUploadBegin={() => setIsUploading(true)}
            appearance={{
              button: "bg-gray-600 hover:bg-gray-700 text-white text-sm px-4 py-2",
            }}
            content={{
              button: "Upload Different Audio"
            }}
          />
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-500 space-y-1">
        <p>✅ Direct upload to UploadThing CDN</p>
        <p>✅ No Vercel serverless timeout issues</p>
        <p>✅ Global CDN for fast delivery</p>
        <p>✅ Supports files up to 32MB</p>
      </div>
    </div>
  )
}

export default UploadThingAudio
