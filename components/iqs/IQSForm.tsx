/* eslint-disable @typescript-eslint/no-explicit-any */
// ------------------------------------------
// file: components/iqs/IQSForm.tsx
// Formulário dinâmico (RHF + Firestore + Backend-driven)
// ------------------------------------------
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { LikertQuestion } from "./LikertQuestion";
import { OpenQuestion } from "./OpenQuestion";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { IQSSurvey } from "@/lib/iqs/types";
import { z } from "zod";
import { forwardRef, useRef } from "react";

// ------------------------------------------
// Schema dinâmico baseado no backend
// ------------------------------------------
function buildSchema(survey: IQSSurvey) {
  const shape: Record<string, any> = {};
  for (const q of survey.questions) {
    if (q.type === "likert") {
      shape[q.id] = z.number().min(1).max(5);
    } else {
      shape[q.id] = z.string().max(q.maxLength ?? 500);
    }
  }
  return z.object(shape);
}

// ------------------------------------------
// Componente principal
// ------------------------------------------
export const IQSForm = forwardRef<HTMLDivElement, { token: string; survey: IQSSurvey }>(
  ({ token, survey }, ref) => {
    const router = useRouter();
    const schema = buildSchema(survey);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: Object.fromEntries(
      survey.questions.map((q) => [q.id, q.type === "likert"])
    ),
    mode: "onChange",
  });

  async function onSubmit(data: any) {
    try {
      await runTransaction(db, async (tx) => {
        const tokenRef = doc(db, "iqsTokens", token);
        const tokenSnap = await tx.get(tokenRef);
        if (!tokenSnap.exists()) throw new Error("Token inválido");

        const t = tokenSnap.data() as any;
        if (t.used) throw new Error("Este inquérito já foi respondido");

        const respRef = doc(collection(db, "iqsResponses"));
        tx.set(respRef, {
          token,
          surveyId: survey.id,
          department: survey.department ?? null,
          answers: data,
          submittedAt: serverTimestamp(),
          version: 1,
        });

        tx.update(tokenRef, { used: true, usedAt: serverTimestamp() });
      });

      toast.success("Respostas enviadas com sucesso!");
      router.replace("/form/obrigado");
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao enviar respostas");
    }
  }

  // ------------------------------------------
  // Renderização
  // ------------------------------------------

 
 

  return (

    
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>{survey.title}</CardTitle>
        
      </CardHeader>

      <Separator />
      
      <CardContent className="space-y-8 p-6">
        <div></div>
        <div ref={ref}>
        {/* Introdução */}
        <p className="text-sm text-muted-foreground">
          Por favor, leia atentamente cada afirmativa e responda conforme o seu
          grau de concordância:{" "}
          <span className="font-bold block mt-1">
            1 = Discordo Totalmente | 2 = Discordo | 3 = Neutro | 4 = Concordo |
            5 = Concordo Totalmente.
          </span>
        </p>
        </div>

        
        {/* Formulário */}
        <Form {...form}>
          <form  onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Cabeçalho dos números 1–5 (somente no topo) */}
            {survey.questions.some((q) => q.type === "likert") && (
              <div className="grid grid-cols-[minmax(320px,1fr)_repeat(5,72px)] text-center text-sm font-medium text-gray-600">
                <div></div>
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n}>{n}</div>
                ))}
              </div>
            )}

            {/* Perguntas */}
            {survey.questions.map((q, i) => (
              <FormField
                key={q.id}
                control={form.control}
                name={q.id}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      {q.type === "likert" ? (
                        <LikertQuestion
                          name={q.id as string}
                          value={field.value as number}
                          onChange={field.onChange}
                          label={q.label}
                          index={i}
                        />
                      ) : (
                        <OpenQuestion
                          value={field.value as string}
                          onChange={field.onChange}
                          max={q.maxLength ?? 500}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            {/* Botão Enviar */}
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-12 w-full bg-gradient-to-r from-[#FFC613] to-[#D1196F] text-white font-semibold hover:opacity-90 transition"
            >
              {form.formState.isSubmitting ? "Enviando..." : "Enviar Resposta"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
);
IQSForm.displayName = "IQSForm";