// ------------------------------------------
// file: app/iqs/obrigado/page.tsx
// Página de agradecimento após envio
// ------------------------------------------
"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ThankYouPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 md:p-12 text-center space-y-6">
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
        <Link
          href="/form"
          className="inline-flex items-center rounded-lg border px-4 py-2 text-sm hover:bg-muted"
        >
          Voltar ao início
        </Link>
      </motion.div>
    </main>
  );
}
