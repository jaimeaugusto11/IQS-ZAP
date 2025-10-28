// ------------------------------------------
// file: components/iqs/IQSHeader.tsx
// Cabeçalho com imagem e card transparente sobreposto
// ------------------------------------------
"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export function IQSHeader({
  title,
  subtitle,
  imageUrl,
}: {
  title: string;
  subtitle: string;
  imageUrl: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl h-[800px]">
      {/* Imagem principal — cobre todo o header */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Image
          src={imageUrl}
          alt="IQS Header"
          fill
          className="object-cover object-center right-0"
          priority
        />
      </motion.div>

      {/* Card transparente sobre a imagem */}
      <div className="absolute inset-0 flex items-center justify-end">
        <div className="bg-white/60 backdrop-blur-[2px] border border-white/30 text-[#d1196f] rounded-sm  shadow-lg p-8 w-11/12 max-w-[400px] text-start  h-3/4 mr-20 flex flex-col justify-center gap-12">
          <h1 className="text-2xl font-semibold leading-tight mb-1 whitespace-pre-line">
            {title}
          </h1>
          <div className="text-md opacity-100 font-bold ">
            {new Date().toLocaleDateString("pt-PT")}
          </div>
          <div className="flex flex-col gap-5">
            <p className="text-md opacity-100 text-[#d1196f]  whitespace-pre-line">{subtitle}</p>
           
          </div>
        </div>
      </div>

      {/* Rodapé sobreposto (parte inferior da imagem) */}
      
    </div>
  );
}
