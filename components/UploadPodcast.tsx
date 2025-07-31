import React, { useState, useRef } from 'react'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Loader, Upload, Music } from 'lucide-react'
import { useToast } from './ui/use-toast'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useUploadFiles } from '@xixixao/uploadstuff/react'
import { Id } from '@/convex/_generated/dataModel'

interface UploadPodcastProps {
  setAudio: (url: string) => void
  setAudioStorageId: (id: Id<"_storage">) => void
  audio: string
  setAudioDuration: (duration: number) => void
}

const UploadPodcast = ({
  setAudio,
  setAudioStorageId,
  audio,
  setAudioDuration
}: UploadPodcastProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const { startUpload } = useUploadFiles(generateUploadUrl)
  const getAudioUrl = useMutation(api.podcasts.getUrl)

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setAudio('')

    try {
      // ตรวจสอบประเภทไฟล์
      if (!file.type.startsWith('audio/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an audio file (MP3, WAV, etc.)',
          variant: 'destructive'
        })
        return
      }

      // ตรวจสอบขนาดไฟล์ (จำกัดไว้ที่ 50MB)
      const maxSize = 50 * 1024 * 1024 // 50MB
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: 'Please upload a file smaller than 50MB',
          variant: 'destructive'
        })
        return
      }

      // อัปโหลดไฟล์
      const uploaded = await startUpload([file])
      const storageId = (uploaded[0].response as any).storageId

      // ดึง URL ของไฟล์
      const audioUrl = await getAudioUrl({ storageId })

      if (!audioUrl) {
        throw new Error('Failed to get audio URL')
      }

      // คำนวณความยาวของเสียง
      const audioElement = new Audio(audioUrl)
      audioElement.addEventListener('loadedmetadata', () => {
        setAudioDuration(audioElement.duration)
      })

      setAudioStorageId(storageId)
      setAudio(audioUrl)

      toast({
        title: 'Audio uploaded successfully',
        description: `File: ${file.name}`
      })
    } catch (error) {
      console.error('Error uploading audio:', error)
      toast({
        title: 'Upload failed',
        description: 'Failed to upload audio file. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col gap-2.5">
      <Label className="text-16 font-bold text-white-1">
        Upload Audio File
      </Label>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragOver 
            ? 'border-[--accent-color] bg-[--accent-color]/10' 
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader className="w-8 h-8 animate-spin text-[--accent-color]" />
            <p className="text-white-2">Uploading audio...</p>
          </div>
        ) : audio ? (
          <div className="flex flex-col items-center gap-2">
            <Music className="w-8 h-8 text-green-500" />
            <p className="text-green-500 font-medium">Audio uploaded successfully!</p>
            <Button
              type="button"
              variant="outline"
              onClick={openFileDialog}
              className="mt-2"
            >
              Upload Different Audio
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <p className="text-white-2">
              Drag and drop your audio file here, or click to browse
            </p>
            <p className="text-sm text-gray-400">
              Supports MP3, WAV, M4A, etc. (Max: 50MB)
            </p>
          </div>
        )}
      </div>

      {audio && (
        <div className="mt-4">
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
      )}
    </div>
  )
}

export default UploadPodcast
