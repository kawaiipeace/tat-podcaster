import { useRef, useState } from 'react';
import { Button } from './ui/button'
import { Label } from './ui/label';
import { GenerateThumbnailProps } from '@/types';
import { Loader } from 'lucide-react';
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
        title: "Thumbnail uploaded successfully",
      })
    } catch (error) {
      setIsImageLoading(false);
      console.error(error)
      toast({ title: 'Error uploading thumbnail', variant: 'destructive' })
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
      toast({ title: 'Error uploading image', variant: 'destructive' })
    }
  }

  return (
    <>
      <div className="generate_thumbnail">
        <Button
          type="button"
          variant="plain"
          className="text-16 bg-black-6 font-bold text-white-1"
        >
          Upload Thumbnail Image
        </Button>
      </div>
      
      <div className="image_div" onClick={() => imageRef?.current?.click()}>
        <Input
          type="file"
          className="hidden"
          ref={imageRef}
          onChange={(e) => uploadImage(e)}
        />
        {!isImageLoading ? (
          <Image
            src="/icons/upload-image.svg"
            width={40}
            height={40}
            alt="upload"
          />
        ) : (
          <div className="text-16 flex-center font-medium text-white-1">
            Uploading
            <Loader size={20} className="animate-spin ml-2" />
          </div>
        )}
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-12 font-bold text-[--accent-color]">
            Click to upload
          </h2>
          <p className="text-12 font-normal text-gray-1">
            SVG, PNG, JPG, or GIF (max. 1080x1080px)
          </p>
        </div>
      </div>
      
      {image && (
        <div className="flex-center w-full">
          <Image
            src={image}
            width={200}
            height={200}
            className="mt-5"
            alt="thumbnail"
          />
        </div>
      )}
    </>
  );
}

export default GenerateThumbnail
