import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  // Audio uploader
  audioUploader: f({ audio: { maxFileSize: "32MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // Check if user is authenticated
      const { userId } = auth();
      
      if (!userId) throw new Error("Unauthorized");
      
      return { userId: userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Audio upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      
      return { uploadedBy: metadata.userId, fileUrl: file.url };
    }),
    
  // Image uploader  
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const { userId } = auth();
      if (!userId) throw new Error("Unauthorized");
      return { userId: userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Image upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      
      return { uploadedBy: metadata.userId, fileUrl: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
