"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import Image from "next/image";

export default function ThankYouPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <main className="max-w-3xl text-center space-y-5">
        {/* Ícone centralizado */}
        <motion.div
          className="flex justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Image src={"/icon.png"} alt="" width={100} height={100} className=" text-green-500" />
        </motion.div>

        <motion.h1
          className="text-3xl md:text-4xl font-bold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Obrigado por participar!
        </motion.h1>

        <motion.p
          className="text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          A sua opinião é essencial para a melhoria contínua da ZAP. As suas
          respostas foram registadas com sucesso.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          
        </motion.div>
      </main>
    </div>
  );
}
