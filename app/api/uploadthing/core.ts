// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const auth = async (req: Request) => ({ id: "fakeId" });

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // IMPORTANTE: devolver a URL para o cliente
      return {
        uploadedBy: metadata.userId,
        url: file.url ?? file.ufsUrl, // algumas versões expõem `url`, outras `ufsUrl`
        key: file.key,                // opcional, pode ser útil
        name: file.name,              // opcional
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
