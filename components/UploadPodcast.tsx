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
  const [lastError, setLastError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const { startUpload } = useUploadFiles(generateUploadUrl)
  const getAudioUrl = useMutation(api.podcasts.getUrl)

  const handleFileUpload = async (file: File, isRetry = false) => {
    setIsUploading(true)
    setAudio('')
    setUploadProgress(0)
    setCurrentStep('Preparing upload...')
    
    if (!isRetry) {
      setLastError(null)
      setRetryCount(0)
    }

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

      // ตรวจสอบขนาดไฟล์ (ลดเป็น 10MB เพื่อความเร็ว)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: 'Please upload a file smaller than 10MB for faster upload',
          variant: 'destructive'
        })
        return
      }

      console.log('Starting upload for file:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB')
      console.log('Environment:', process.env.NODE_ENV)
      setCurrentStep('Uploading file...')
      setUploadProgress(25)

      // สำหรับ Vercel production ใช้ timeout ที่ยาวขึ้น (3 นาที)
      const timeoutDuration = process.env.NODE_ENV === 'production' ? 180000 : 120000 // 3 min for prod, 2 min for dev
      const uploadTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Upload timeout after ${timeoutDuration / 1000} seconds. This might be due to Vercel's serverless limitations.`)), timeoutDuration)
      )

      const uploadPromise = startUpload([file])
      
      // เพิ่ม progress simulation ระหว่าง upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 5, 45))
      }, 2000)

      let uploaded
      try {
        uploaded = await Promise.race([uploadPromise, uploadTimeout]) as any[]
        clearInterval(progressInterval)
      } catch (error) {
        clearInterval(progressInterval)
        throw error
      }
      
      if (!uploaded || !uploaded[0] || !uploaded[0].response) {
        throw new Error('Upload failed - no response received')
      }

      const storageId = uploaded[0].response.storageId
      console.log('Upload successful, storageId:', storageId)
      setUploadProgress(50)
      setCurrentStep('Processing file...')

      // ดึง URL ของไฟล์พร้อม retry (เพิ่มสำหรับ Vercel)
      let audioUrl = null
      let retries = 5 // เพิ่มจาก 3 เป็น 5 สำหรับ production
      
      while (retries > 0 && !audioUrl) {
        try {
          console.log(`Attempting to get URL, retries left: ${retries}`)
          audioUrl = await getAudioUrl({ storageId })
          if (audioUrl) {
            console.log('Successfully got URL:', audioUrl)
            break
          }
        } catch (error) {
          console.log(`Retry getting URL, attempts left: ${retries - 1}`, error)
          retries--
          if (retries > 0) {
            // เพิ่ม delay สำหรับ production
            const delay = process.env.NODE_ENV === 'production' ? 2000 : 1000
            await new Promise(resolve => setTimeout(resolve, delay))
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
      
      let errorMessage = 'Failed to upload audio file. Please try again.'
      let errorTitle = 'Upload failed'
      
      if (error.message.includes('timeout')) {
        errorTitle = 'Upload timeout'
        errorMessage = 'Upload took too long on Vercel. Try:\n• Using a smaller file (under 5MB)\n• Check your internet connection\n• Vercel serverless functions have time limits'
      } else if (error.message.includes('network')) {
        errorTitle = 'Network error'
        errorMessage = 'Network connection issue. Please check your internet and try again.'
      } else if (error.message.includes('storage')) {
        errorTitle = 'Storage error'
        errorMessage = 'Convex storage issue. Please try again in a moment.'
      } else if (error.message.includes('serverless') || error.message.includes('function')) {
        errorTitle = 'Vercel limitation'
        errorMessage = 'Vercel serverless function timeout. Try:\n• Smaller file size\n• Check Convex dashboard\n• Try again in a few minutes'
      }
      
      setLastError(error.message)
      setRetryCount(prev => prev + 1)
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      setCurrentStep('')
    }
  }

  const retryUpload = () => {
    const fileInput = fileInputRef.current
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      handleFileUpload(fileInput.files[0], true)
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
              Supports MP3, WAV, M4A, etc. (Max: 10MB for optimal speed)
            </p>
            <div className="mt-2 text-xs text-gray-500 text-center">
              <p>💡 Tips for Vercel deployment:</p>
              <p>• Use MP3 format for best compression</p>
              <p>• Lower bitrate (128kbps) reduces file size</p>
              <p>• Files under 5MB upload fastest</p>
              <p>• Be patient - serverless functions take time</p>
            </div>
          </div>
        )}
      </div>

      {/* Show retry button if there was an error */}
      {lastError && !isUploading && !audio && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm mb-2">
            Last error: {lastError}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={retryUpload}
              className="bg-red-600 hover:bg-red-700 text-white border-red-500"
            >
              Retry Upload (Attempt {retryCount + 1})
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setLastError(null)
                setRetryCount(0)
              }}
              className="text-gray-400 hover:text-white"
            >
              Clear Error
            </Button>
          </div>
        </div>
      )}

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
