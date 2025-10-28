"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function IQSHeader({
  title,
  subtitle,
  imageUrl,
  scrollToForm,
}: {
  title: string;
  subtitle: string;
  imageUrl: string;
  scrollToForm: () => void;
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
        <div className="bg-white/60 backdrop-blur-[2px] border border-white/30 text-[#d1196f] rounded-sm shadow-lg p-8 w-11/12 max-w-[400px] text-start h-3/4 mr-20 flex flex-col justify-center gap-8">
          <h1 className="text-2xl font-semibold leading-tight whitespace-pre-line">
            {title}
          </h1>
          <div className="text-md font-bold">
            {new Date().toLocaleDateString("pt-PT")}
          </div>
          <p className="text-md text-[#d1196f] whitespace-pre-line font-medium">
            {subtitle}
          </p>

          {/* Botão no header */}
          <div className="flex justify-start mt-16">
            <Button
              type="button"
              onClick={scrollToForm}
              className="bg-gradient-to-r from-[#FFC613] to-[#D1196F] text-white text-lg px-8 py-3 rounded-md shadow-md hover:shadow-lg hover:translate-y-0.5 transition-all duration-200 font-medium"
            >
              Começar Inquérito
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
