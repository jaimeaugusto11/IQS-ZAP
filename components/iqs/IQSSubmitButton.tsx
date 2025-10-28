// ------------------------------------------
// file: components/iqs/IQSSubmitButton.tsx
// Botão com estado de loading e animação
// ------------------------------------------
"use client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function IQSSubmitButton({ loading }: { loading?: boolean }) {
  return (
    <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
      <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-gradient-to-r from-[#FFC613] to-[#D1196F] text-black hover:opacity-90">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enviar Resposta
      </Button>
    </motion.div>
  );
}