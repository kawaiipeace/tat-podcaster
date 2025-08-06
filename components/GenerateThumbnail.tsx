import { useRef, useState } from 'react';
import { Button } from './ui/button'
import { Label } from './ui/label';
import { GenerateThumbnailProps } from '@/types';
import { Loader, Upload, ImageIcon, X } from 'lucide-react';
import { Input } from './ui/input';
import Image from 'next/image';
import { useToast } from './ui/use-toast';
import { useMutation } from 'convex/react';
import { useUploadFiles } from '@xixixao/uploadstuff/react';
import { api } from '@/convex/_generated/api';

const GenerateThumbnail = ({ setImage, setImageStorageId, image }: GenerateThumbnailProps) => {
  const [isImageLoading, setIsImageLoading] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const { startUpload } = useUploadFiles(generateUploadUrl)
  const getImageUrl = useMutation(api.podcasts.getUrl);

  const handleImage = async (blob: Blob, fileName: string) => {
    setIsImageLoading(true);
    setImage('');

    try {
      const file = new File([blob], fileName, { type: 'image/png' });

      const uploaded = await startUpload([file]);
      const storageId = (uploaded[0].response as any).storageId;

      setImageStorageId(storageId);

      const imageUrl = await getImageUrl({ storageId });
      setImage(imageUrl!);
      setIsImageLoading(false);
      toast({
        title: "อัปโหลดภาพปกสำเร็จ",
      })
    } catch (error) {
      setIsImageLoading(false);
      console.error(error)
      toast({ title: 'เกิดข้อผิดพลาดในการอัปโหลดภาพปก', variant: 'destructive' })
    }
  }

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setIsImageLoading(true);

    try {
      const files = e.target.files;
      if (!files) return;
      const file = files[0];
      const blob = await file.arrayBuffer()
      .then((ab) => new Blob([ab]));

      handleImage(blob, file.name);
    } catch (error) {
      setIsImageLoading(false);
      console.error(error)
      toast({ title: 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ', variant: 'destructive' })
    }
  }

  const clearImage = () => {
    setImage('');
    setImageStorageId(null);
    if (imageRef.current) {
      imageRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-16 font-bold text-white-1">
            ภาพปกพอดแคสต์
          </Label>
          <p className="text-12 font-normal text-gray-1 mt-1">
            อัปโหลดภาพปกที่กำหนดเอง หรือเราจะใช้ภาพเริ่มต้น
          </p>
        </div>
        {image && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearImage}
            className="text-gray-400 hover:text-white border-gray-600 hover:border-gray-400"
          >
            <X size={16} className="mr-1" />
            ลบออก
          </Button>
        )}
      </div>

      {/* Upload Area */}
      {!image ? (
        <div 
          className="border-2 border-dashed border-gray-600 rounded-xl p-8 hover:border-[--accent-color] transition-colors cursor-pointer group"
          onClick={() => imageRef?.current?.click()}
        >
          <Input
            type="file"
            accept="image/*"
            className="hidden"
            ref={imageRef}
            onChange={(e) => uploadImage(e)}
          />
          
          {!isImageLoading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-[--accent-color] transition-colors">
                <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-16 font-semibold text-white-1 mb-2">
                  อัปโหลดภาพปก
                </h3>
                <p className="text-14 text-gray-400 mb-3">
                  ลากและวาง หรือคลิกเพื่อเรียกดู
                </p>
                <div className="flex items-center justify-center gap-2 text-12 text-gray-500">
                  <span>PNG, JPG, GIF ขนาดไม่เกิน 10MB</span>
                  <span>•</span>
                  <span>แนะนำ: 1080x1080px</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[--accent-color] flex items-center justify-center">
                <Loader className="w-8 h-8 text-white animate-spin" />
              </div>
              <div className="text-center">
                <h3 className="text-16 font-semibold text-white-1">
                  กำลังอัปโหลดภาพปก...
                </h3>
                <p className="text-14 text-gray-400">
                  กรุณารอสักครู่ขณะที่เราประมวลผลรูปภาพของคุณ
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Preview Area */
        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="relative group">
              <div className="w-48 h-48 rounded-lg overflow-hidden bg-gray-800 border border-gray-600">
                <Image
                  src={image}
                  width={192}
                  height={192}
                  className="w-full h-full object-cover"
                  alt="ตัวอย่างภาพปกพอดแคสต์"
                />
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => imageRef?.current?.click()}
                  className="bg-white/20 hover:bg-white/30 text-white border-none"
                >
                  <Upload size={16} className="mr-2" />
                  เปลี่ยนรูปภาพ
                </Button>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-16 font-semibold text-white-1">
                    ตัวอย่างภาพปก
                  </h3>
                  <p className="text-14 text-gray-400">
                    นี่คือวิธีที่ภาพปกของคุณจะปรากฏต่อผู้ฟัง
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded overflow-hidden">
                    <Image
                      src={image}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      alt="ตัวอย่างขนาดเล็ก"
                    />
                  </div>
                  <div>
                    <p className="text-14 font-medium text-white-1">ชื่อพอดแคสต์ของคุณ</p>
                    <p className="text-12 text-gray-400">ตัวอย่างในรายการพอดแคสต์</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Input
            type="file"
            accept="image/*"
            className="hidden"
            ref={imageRef}
            onChange={(e) => uploadImage(e)}
          />
        </div>
      )}
      
      {/* Info */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div>
            <p className="text-14 text-blue-300 font-medium mb-1">ไม่มีภาพปก? ไม่เป็นไร!</p>
            <p className="text-12 text-blue-200/80">
              หากคุณไม่อัปโหลดภาพปกที่กำหนดเอง เราจะใช้ภาพเริ่มต้นที่สวยงามให้กับพอดแคสต์ของคุณโดยอัตโนมัติ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenerateThumbnail
