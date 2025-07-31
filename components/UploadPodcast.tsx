import React, { useState, useRef } from 'react'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Loader, Upload, Music, X } from 'lucide-react'
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
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const { startUpload } = useUploadFiles(generateUploadUrl)
  const getAudioUrl = useMutation(api.podcasts.getUrl)

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setAudio('')
    setUploadProgress(0)
    setCurrentStep('Preparing upload...')

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

      // ตรวจสอบขนาดไฟล์ (จำกัดไว้ที่ 25MB เพื่อ upload เร็วขึ้น)
      const maxSize = 25 * 1024 * 1024 // 25MB
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: 'Please upload a file smaller than 25MB',
          variant: 'destructive'
        })
        return
      }

      console.log('Starting upload for file:', file.name, 'Size:', file.size)
      setCurrentStep('Uploading file...')
      setUploadProgress(25)

      // อัปโหลดไฟล์พร้อม timeout
      const uploadTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Upload timeout after 60 seconds')), 60000)
      )

      const uploadPromise = startUpload([file])
      
      const uploaded = await Promise.race([uploadPromise, uploadTimeout]) as any[]
      
      if (!uploaded || !uploaded[0] || !uploaded[0].response) {
        throw new Error('Upload failed - no response received')
      }

      const storageId = uploaded[0].response.storageId
      console.log('Upload successful, storageId:', storageId)
      setUploadProgress(50)
      setCurrentStep('Processing file...')

      // ดึง URL ของไฟล์พร้อม retry
      let audioUrl = null
      let retries = 3
      
      while (retries > 0 && !audioUrl) {
        try {
          audioUrl = await getAudioUrl({ storageId })
          if (audioUrl) break
        } catch (error) {
          console.log(`Retry getting URL, attempts left: ${retries - 1}`)
          retries--
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
          }
        }
      }

      if (!audioUrl) {
        throw new Error('Failed to get audio URL after retries')
      }

      console.log('Got audio URL:', audioUrl)
      setUploadProgress(75)
      setCurrentStep('Loading audio metadata...')

      // คำนวณความยาวของเสียงแบบ Promise
      const getDuration = () => {
        return new Promise<number>((resolve, reject) => {
          const audioElement = new Audio(audioUrl)
          
          const timeoutId = setTimeout(() => {
            reject(new Error('Timeout loading audio metadata'))
          }, 10000) // 10 second timeout
          
          audioElement.addEventListener('loadedmetadata', () => {
            clearTimeout(timeoutId)
            resolve(audioElement.duration)
          })
          
          audioElement.addEventListener('error', () => {
            clearTimeout(timeoutId)
            reject(new Error('Error loading audio'))
          })
          
          audioElement.load()
        })
      }

      try {
        const duration = await getDuration()
        setAudioDuration(duration)
        console.log('Audio duration:', duration)
      } catch (error) {
        console.warn('Could not get audio duration:', error)
        setAudioDuration(0) // Set default duration if failed
      }

      setUploadProgress(100)
      setCurrentStep('Complete!')
      setAudioStorageId(storageId)
      setAudio(audioUrl)

      toast({
        title: 'Audio uploaded successfully',
        description: `File: ${file.name}`
      })
    } catch (error: any) {
      console.error('Error uploading audio:', error)
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload audio file. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      setCurrentStep('')
    }
  }

  const cancelUpload = () => {
    setIsUploading(false)
    setUploadProgress(0)
    setCurrentStep('')
    setAudio('')
    setAudioStorageId(null as any)
    setAudioDuration(0)
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
    if (!isUploading) {
      fileInputRef.current?.click()
    }
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
        } ${isUploading ? 'cursor-not-allowed opacity-75' : ''}`}
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
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Loader className="w-8 h-8 animate-spin text-[--accent-color]" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  cancelUpload()
                }}
                className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white"
              >
                <X size={12} />
              </Button>
            </div>
            <div className="w-full max-w-xs">
              <div className="bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-[--accent-color] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-white-2 text-sm mt-2">{currentStep}</p>
              <p className="text-gray-400 text-xs">{uploadProgress}%</p>
            </div>
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
              Supports MP3, WAV, M4A, etc. (Max: 25MB)
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
