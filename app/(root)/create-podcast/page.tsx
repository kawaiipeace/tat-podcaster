"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { use, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import GeneratePodcast from "@/components/GeneratePodcast"
import UploadPodcast from "@/components/UploadPodcast"
import UploadThingAudio from "@/components/UploadThingAudio"
import GenerateThumbnail from "@/components/GenerateThumbnail"
import { Loader, Lock, LockKeyhole, Wand2, Upload, Cloud } from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"
import { useToast } from "@/components/ui/use-toast"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"
import { useIsSubscribed } from "@/hooks/useIsSubscribed"
import { useClerk } from "@clerk/nextjs"

const voiceCategories = ['alloy', 'shimmer', 'nova', 'echo', 'fable', 'onyx'];

const formSchema = z.object({
  podcastTitle: z.string().min(2),
  podcastDescription: z.string().min(2),
})

const CreatePodcast = () => {
  const router = useRouter()
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(null)
  const [imageUrl, setImageUrl] = useState('');

  const [audioUrl, setAudioUrl] = useState('');
  const [audioStorageId, setAudioStorageId] = useState<Id<"_storage"> | null>(null)
  const [audioDuration, setAudioDuration] = useState(0);

  const [voiceType, setVoiceType] = useState<string | null>(null);
  const [voicePrompt, setVoicePrompt] = useState('');
  const [audioCreationMethod, setAudioCreationMethod] = useState<'ai' | 'upload' | 'uploadthing'>('ai');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPodcast = useMutation(api.podcasts.createPodcast)

  const { user } = useClerk();

  const isSubscribed = useIsSubscribed(user?.id!);

  const { toast } = useToast()

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      podcastTitle: "",
      podcastDescription: "",
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      if(!audioUrl || !imageUrl) {
        toast({
          title: audioCreationMethod === 'ai' 
            ? 'Please generate audio and image' 
            : 'Please upload audio and generate image',
        })
        setIsSubmitting(false);
        throw new Error('Please provide audio and image')
      }

      // สำหรับ AI generation ต้องมี voiceType
      if(audioCreationMethod === 'ai' && !voiceType) {
        toast({
          title: 'Please select AI voice type',
        })
        setIsSubmitting(false);
        throw new Error('Please select AI voice type')
      }

      const podcast = await createPodcast({
        podcastTitle: data.podcastTitle,
        podcastDescription: data.podcastDescription,
        audioUrl,
        imageUrl,
        voiceType: voiceType || 'uploaded', // ใช้ 'uploaded' สำหรับไฟล์ที่อัปโหลด
        imagePrompt,
        voicePrompt: audioCreationMethod === 'ai' ? voicePrompt : 'Uploaded audio file',
        views: 0,
        audioDuration,
        audioStorageId: audioStorageId!,
        imageStorageId: imageStorageId!,
      })
      toast({ title: 'Podcast created' })
      setIsSubmitting(false);
      router.push('/')
    } catch (error : any) {
      console.error(error.message);
      toast({
        title: 'Error',
        description: error.message? error.message : "Unknown error",
        variant: 'destructive',
      })
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-10 flex flex-col">
      <h1 className="text-20 font-bold text-white-1">Create Podcast</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-12 flex w-full flex-col"
        >
          <div className="flex flex-col gap-[30px] border-b border-black-5 pb-10">
            <FormField
              control={form.control}
              name="podcastTitle"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
                  <FormLabel className="text-16 font-bold text-white-1">
                    Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="input-class focus-visible:ring-offset-[--accent-color]"
                      placeholder="The Joe Rogan Podcast"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-white-1" />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2.5">
              <Label className="text-16 font-bold text-white-1">
                Select AI Voice
              </Label>

              <Select 
                onValueChange={(value) => setVoiceType(value)}
                disabled={audioCreationMethod === 'upload' || audioCreationMethod === 'uploadthing'}
              >
                <SelectTrigger
                  className={cn(
                    "text-16 w-full border-none bg-black-1 text-gray-1 focus-visible:ring-offset-[--accent-color]",
                    (audioCreationMethod === 'upload' || audioCreationMethod === 'uploadthing') && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <SelectValue
                    placeholder={
                      (audioCreationMethod === 'upload' || audioCreationMethod === 'uploadthing') 
                        ? "Not needed for uploaded audio" 
                        : "Select AI Voice"
                    }
                    className="placeholder:text-gray-1 "
                  />
                </SelectTrigger>
                <SelectContent className="text-16 flex border-none bg-black-1 font-bold text-white-1 focus:ring-[--accent-color]">
                  {voiceCategories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="capitalize relative  flex items-center focus:bg-[--accent-color]"
                    >
                      <span className="absolute left-0 top-0 bottom-0 inline-flex items-center justify-center">
                        
                      </span>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
                {voiceType && audioCreationMethod === 'ai' && (
                  <audio
                    src={`/${voiceType}.mp3`}
                    autoPlay
                    className="hidden"
                  />
                )}
              </Select>
            </div>

            <FormField
              control={form.control}
              name="podcastDescription"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
                  <FormLabel className="text-16 font-bold text-white-1">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="input-class focus-visible:ring-offset-[--accent-color]"
                      placeholder="Write a short podcast description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-white-1" />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col pt-10">
            <div className="flex flex-col gap-2.5 mb-8">
              <Label className="text-16 font-bold text-white-1">
                Audio Creation Method
              </Label>
              
              <Tabs 
                value={audioCreationMethod} 
                onValueChange={(value) => {
                  setAudioCreationMethod(value as 'ai' | 'upload' | 'uploadthing');
                  // Reset audio data when switching methods
                  setAudioUrl('');
                  setAudioStorageId(null);
                  setAudioDuration(0);
                  if (value === 'upload' || value === 'uploadthing') {
                    setVoiceType(null);
                    setVoicePrompt('');
                  }
                }}
                className="w-full"
              >
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="ai" className="flex items-center gap-2">
                    <Wand2 size={16} />
                    AI Generate
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload size={16} />
                    Upload (Convex)
                  </TabsTrigger>
                  <TabsTrigger value="uploadthing" className="flex items-center gap-2">
                    <Cloud size={16} />
                    Upload (CDN)
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="ai" className="mt-6">
                  <GeneratePodcast
                    setAudioStorageId={setAudioStorageId}
                    setAudio={setAudioUrl}
                    voiceType={voiceType!}
                    audio={audioUrl}
                    voicePrompt={voicePrompt}
                    setVoicePrompt={setVoicePrompt}
                    setAudioDuration={setAudioDuration}
                  />
                </TabsContent>
                
                <TabsContent value="upload" className="mt-6">
                  <UploadPodcast
                    setAudio={setAudioUrl}
                    setAudioStorageId={setAudioStorageId}
                    audio={audioUrl}
                    setAudioDuration={setAudioDuration}
                  />
                </TabsContent>
                
                <TabsContent value="uploadthing" className="mt-6">
                  <UploadThingAudio
                    setAudio={setAudioUrl}
                    setAudioStorageId={setAudioStorageId}
                    audio={audioUrl}
                    setAudioDuration={setAudioDuration}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <GenerateThumbnail
              setImage={setImageUrl}
              setImageStorageId={setImageStorageId}
              image={imageUrl}
              imagePrompt={imagePrompt}
              setImagePrompt={setImagePrompt}
            />

            <div className="mt-10 w-full">
              <Button
                type="submit"
                className="text-16 w-full bg-[--accent-color] py-4 font-extrabold text-white-1 transition-all duration-500 hover:bg-black-1"
              >
                  {isSubmitting ? (
                    <>
                      Submitting
                      <Loader size={20} className="animate-spin ml-2" />
                    </>
                  ) : (
                    `Submit & Publish Podcast`
                  )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
}

export default CreatePodcast