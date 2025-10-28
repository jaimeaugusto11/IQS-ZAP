// ------------------------------------------
// file: components/iqs/HeaderUploader.tsx
// Upload de imagem com feedback e onChange
// ------------------------------------------
"use client";
import { useState } from "react";
import { UploadDropzone } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Image from "next/image";

type Props = {
  onChange: (url: string) => void;
  value?: string | null;
};

export function HeaderUploader({ onChange, value }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [url, setUrl] = useState<string | undefined>(value ?? undefined);

  return (
    <div className="space-y-2">
      {/* Upload */}
      <UploadDropzone
        endpoint="imageUploader"
        onUploadBegin={() => setIsUploading(true)}
        onClientUploadComplete={(res) => {
          const uploadedUrl = res?.[0]?.url;
          if (uploadedUrl) {
            setUrl(uploadedUrl);
            onChange(uploadedUrl);
          }
          setIsUploading(false);
        }}
        onUploadError={(e) => {
          console.error(e);
          setIsUploading(false);
        }}
      />

      {/* Estado de carregamento */}
      {isUploading && (
        <div className="flex items-center text-sm text-muted-foreground gap-2 animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin" />
          A carregar imagem...
        </div>
      )}

      {/* Prévia da imagem */}
      {url && !isUploading && (
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Prévia:</div>
          <Image
            src={url}
            alt="Imagem carregada"
            className="rounded-md border w-full max-w-xs object-cover"
          />
        </div>
      )}

      {/* Botão remover */}
      {url && !isUploading && (
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setUrl(undefined);
            onChange("");
          }}
        >
          Remover
        </Button>
      )}
    </div>
  );
}
