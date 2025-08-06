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
        title: 'อัปโหลดไฟล์เสียงสำเร็จ!',
        description: `ไฟล์: ${res[0].name || 'ไฟล์เสียง'}`
      })
    }
    setIsUploading(false)
  }

  const handleUploadError = (error: Error) => {
    console.error("Upload error:", error)
    toast({
      title: 'การอัปโหลดล้มเหลว',
      description: error.message || 'ไม่สามารถอัปโหลดไฟล์เสียงได้',
      variant: 'destructive'
    })
    setIsUploading(false)
  }

  // Don't render UploadButton during SSR
  if (!isMounted) {
    return (
      <div className="flex flex-col gap-4">
        <Label className="text-16 font-bold text-white-1">
          อัปโหลดไฟล์เสียง (UploadThing)
        </Label>
        
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Upload className="w-12 h-12 text-gray-400" />
            <div>
              <h3 className="text-white-2 font-medium mb-2">กำลังโหลดระบบอัปโหลด...</h3>
              <p className="text-gray-400 text-sm mb-4">กรุณารอสักครู่</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Label className="text-16 font-bold text-white-1">
        อัปโหลดไฟล์เสียง (UploadThing)
      </Label>
      
      {!audio ? (
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Upload className="w-12 h-12 text-gray-400" />
            <div>
              <h3 className="text-white-2 font-medium mb-2">อัปโหลดไฟล์เสียง</h3>
              <p className="text-gray-400 text-sm mb-4">คลิกด้านล่างเพื่อเลือกและอัปโหลดไฟล์เสียงของคุณ</p>
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
                    กำลังอัปโหลด...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    เลือกไฟล์เสียง
                  </div>
                ),
                allowedContent: "ไฟล์เสียงขนาดไม่เกิน 32MB (MP3, WAV, M4A เป็นต้น)"
              }}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <Music className="w-6 h-6 text-green-500" />
            <div>
              <p className="text-green-500 font-medium">อัปโหลดไฟล์เสียงสำเร็จ!</p>
              <p className="text-sm text-gray-400">ใช้ UploadThing CDN</p>
            </div>
          </div>
          
          <div>
            <Label className="text-14 font-bold text-white-1 mb-2 block">
              ฟังตัวอย่างเสียง
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
              button: "อัปโหลดไฟล์เสียงอื่น"
            }}
          />
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-500 space-y-1">
        <p>✅ อัปโหลดตรงไปยัง UploadThing CDN</p>
        <p>✅ ไม่มีปัญหา timeout ของ Vercel serverless</p>
        <p>✅ CDN ทั่วโลกสำหรับการส่งมอบที่รวดเร็ว</p>
        <p>✅ รองรับไฟล์ขนาดไม่เกิน 32MB</p>
      </div>
    </div>
  )
}

export default UploadThingAudio
