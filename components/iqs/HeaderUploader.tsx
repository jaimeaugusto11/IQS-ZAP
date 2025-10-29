/* eslint-disable @typescript-eslint/no-explicit-any */
// components/iqs/HeaderUploader.tsx
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
    <div className="space-y-2 ">
      <UploadDropzone
      
        endpoint="imageUploader"
        onUploadBegin={() => setIsUploading(true)}
        onClientUploadComplete={(res) => {
          // tentar primeiro o que o servidor devolveu
          const fromServer =
            res?.[0]?.serverData?.url ??
            res?.[0]?.url ??           // algumas versões expõem diretamente
            (res?.[0] as any)?.ufsUrl; // fallback duro
          if (fromServer) {
            setUrl(fromServer);
            onChange(fromServer);
          }
          setIsUploading(false);
        }}
        onUploadError={(err) => {
          console.error("Erro no upload:", err);
          setIsUploading(false);
        }}
        className="border-dashed border-2 rounded-lg p-4 cursor-pointer bg-gray-300"
      />

      {isUploading && (
        <div className="flex items-center text-sm text-muted-foreground gap-2 animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin" />
          A carregar imagem...
        </div>
      )}

      {url && !isUploading && (
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Prévia:</div>
          <Image
            src={url}
            alt="Imagem carregada"
            className="rounded-md border w-full max-w-xs object-cover"
            width={200}
            height={200}
          />
        </div>
      )}

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
