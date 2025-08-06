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
import { cn } from "@/lib/utils"
import { use, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import UploadThingAudio from "@/components/UploadThingAudio"
import GenerateThumbnail from "@/components/GenerateThumbnail"
import { Loader, Lock, LockKeyhole } from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"
import { useToast } from "@/components/ui/use-toast"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"
import { useIsSubscribed } from "@/hooks/useIsSubscribed"
import { useClerk } from "@clerk/nextjs"



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

      if(!audioUrl) {
        toast({
          title: 'กรุณาอัปโหลดไฟล์เสียง',
        })
        setIsSubmitting(false);
        throw new Error('Please provide audio file')
      }

      // Use default image if no image is uploaded
      const finalImageUrl = imageUrl || '/icons/logo.png';
      const finalImageStorageId = imageStorageId || undefined;
      
      // For UploadThing audio, we don't have storageId, only URL
      const finalAudioStorageId = audioStorageId || undefined;

      const podcast = await createPodcast({
        podcastTitle: data.podcastTitle,
        podcastDescription: data.podcastDescription,
        audioUrl,
        imageUrl: finalImageUrl,
        voiceType: 'uploaded',
        imagePrompt: imagePrompt || 'Default podcast thumbnail',
        voicePrompt: 'Uploaded audio file',
        views: 0,
        audioDuration,
        audioStorageId: finalAudioStorageId,
        imageStorageId: finalImageStorageId,
      })
      toast({ title: 'สร้างพอดแคสต์แล้ว' })
      setIsSubmitting(false);
      router.push('/')
    } catch (error : any) {
      console.error(error.message);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message? error.message : "ข้อผิดพลาดที่ไม่ทราบสาเหตุ",
        variant: 'destructive',
      })
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-10 flex flex-col">
      <h1 className="text-20 font-bold text-white-1">สร้างพอดแคสต์</h1>

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
                    ชื่อพอดแคสต์
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="input-class focus-visible:ring-offset-[--accent-color]"
                      placeholder="ป้อนชื่อพอดแคสต์ของคุณ"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-white-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="podcastDescription"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
                  <FormLabel className="text-16 font-bold text-white-1">
                    คำอธิบาย
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="input-class focus-visible:ring-offset-[--accent-color]"
                      placeholder="เขียนคำอธิบายสั้นๆ เกี่ยวกับพอดแคสต์ของคุณ"
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
                อัปโหลดไฟล์เสียง
              </Label>
              
              <UploadThingAudio
                setAudio={setAudioUrl}
                setAudioStorageId={setAudioStorageId}
                audio={audioUrl}
                setAudioDuration={setAudioDuration}
              />
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
                      กำลังสร้าง...
                      <Loader size={20} className="animate-spin ml-2" />
                    </>
                  ) : (
                    `สร้างและเผยแพร่พอดแคสต์`
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