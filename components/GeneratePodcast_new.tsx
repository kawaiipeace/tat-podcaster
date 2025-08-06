import { GeneratePodcastProps } from '@/types'
import React from 'react'
import { Label } from './ui/label'
import { Button } from './ui/button'

const GeneratePodcast = (props: GeneratePodcastProps) => {
  return (
    <div>
      <div className="flex flex-col gap-2.5">
        <Label className="text-16 font-bold text-white-1 opacity-50">
          AI Podcast Generation (Disabled)
        </Label>
        <div className="p-4 bg-black-1 border border-gray-800 rounded-lg">
          <p className="text-14 text-gray-1">
            AI podcast generation feature has been disabled. Please use the upload options instead.
          </p>
        </div>
      </div>
      <div className="mt-5 w-full max-w-[200px]">
        <Button 
          className="text-16 bg-gray-600 py-4 font-bold text-white-1 cursor-not-allowed" 
          disabled
        >
          AI Generation Disabled
        </Button>
      </div>
    </div>
  )
}

export default GeneratePodcast
