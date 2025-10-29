/* eslint-disable @typescript-eslint/no-explicit-any */
// ------------------------------------------
// file: app/iqs/admin/new/page.tsx
// UI do responsável para criar novo inquérito e gerar tokens (com UploadThing)
// ------------------------------------------
"use client";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import CryptoJS from "crypto-js";

import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  writeBatch,
} from "firebase/firestore";
import * as XLSX from "xlsx";

import { motion } from "framer-motion";
import type { IQSSurvey } from "@/lib/iqs/types";
import { HeaderUploader } from "@/components/iqs/HeaderUploader";
import { useRouter } from "next/navigation";

const qSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  type: z.enum(["likert", "text"]),
  required: z.boolean().optional(),
  maxLength: z.number().optional(),
});
const formSchema = z.object({
  title: z.string().min(3),
  department: z.string().optional(),
  description: z.string().optional(),
  headerImageUrl: z.string().url().optional(),
  questions: z.array(qSchema).min(1),
  baseUrl: z.string().url().min(1),
});

type FormData = z.infer<typeof formSchema>;

export default function NewSurveyPage() {
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      department: "Formação",
      description: "",
      baseUrl: "https://iqs-zap.vercel.app/form",
      questions: [
        {
          id: "q1",
          label: "A ZAP proporciona formação adequada às minhas necessidades.",
          type: "likert",
          required: true,
        },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const [emails, setEmails] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function onCreate(values: FormData) {
    try {
      setSaving(true);

      const survey: IQSSurvey = {
        title: values.title,
        department: values.department,
        description: values.description,
        headerImageUrl: values.headerImageUrl,
        createdAt: serverTimestamp() as any,
        questions: values.questions,
      };

      const surveyRef = await addDoc(collection(db, "iqsSurveys"), survey);
      toast.success("Inquérito criado. Agora gere os tokens.");
      if (emails.length > 0) {
        await generateTokensForEmails(surveyRef.id, values.baseUrl, emails);
      }
      toast.success("Inquérito criado.");
       router.back(); 
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao criar inquérito");
    } finally {
      setSaving(false);
    }
  }

  async function handleEmailsFile(file: File) {
    const data = await file.arrayBuffer();
    if (file.name.endsWith(".csv")) {
      const text = new TextDecoder().decode(new Uint8Array(data));
      const rows = text.split(/ ? /).map((l) => l.split(","));
      const header = rows.shift() || [];
      const idx = header.findIndex((h) => /email/i.test(h));
      const list = rows
        .map((r) => r[idx] || "")
        .map((s) => s.trim())
        .filter(Boolean);
      setEmails(list);
      toast.success(`${list.length} e-mails carregados.`);
      return;
    }
    const wb = XLSX.read(data, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
    const list = rows
      .map((r) => String(r.email || r.Email || r.EMail || r.E_MAIL).trim())
      .filter(Boolean);
    setEmails(list);
    toast.success(`${list.length} e-mails carregados.`);
  }

  async function generateTokensForEmails(
    surveyId: string,
    baseUrl: string,
    list: string[]
  ) {
    const batch = writeBatch(db);
    const out: Array<{ email: string; link: string }> = [];
    for (const email of list) {
      const token = CryptoJS.lib.WordArray.random(16).toString();
      const link = `${baseUrl}/${token}`; // rota pública usa só o token
      out.push({ email, link });
      const tokenRef = doc(db, "iqsTokens", token);
      batch.set(tokenRef, {
        valid: true,
        used: false,
        surveyId,
        createdAt: serverTimestamp(),
        emailHash: CryptoJS.SHA256(email).toString(),
      });
    }
    await batch.commit();
    // Export XLSX
    const header = ["email", "link"];
    const data = out.map((r) => [r.email, r.link]);
    const sheet = XLSX.utils.aoa_to_sheet([header, ...data]);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, sheet, "Tokens");
    XLSX.writeFile(workbook, `iqs_tokens_${surveyId}.xlsx`);

    toast.success("Tokens gerados e XLSX descarregado.");
  }

  



  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Novo Inquérito</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onCreate)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Título</Label>
                <Input
                  {...form.register("title")}
                  placeholder="Inquérito de Satisfação — Formação"
                />
              </div>
              <div>
                <Label>Departamento</Label>
                <Input
                  {...form.register("department")}
                  placeholder="Formação"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Descrição</Label>
                <Textarea
                  {...form.register("description")}
                  placeholder="Breve descrição do inquérito"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Imagem de Header (UploadThing)</Label>

                <HeaderUploader
                  value={form.watch("headerImageUrl")}
                  onChange={(url) =>
                    form.setValue("headerImageUrl", url, { shouldDirty: true })
                  }
                />

                <Input
                  readOnly
                  value={form.watch("headerImageUrl") ?? ""}
                  placeholder="URL da imagem"
                />
              </div>

              <div>
                <Label>Base URL (para links com token)</Label>
                <Input
                  {...form.register("baseUrl")}
                  placeholder="https://iqs.zap.co/iqs"
                  disabled
                />
              </div>
            </div>

            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Perguntas</h3>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    append({
                      id: `q${fields.length + 1}`,
                      label: `Pergunta ${fields.length + 1}`,
                      type: "likert",
                      required: true,
                    })
                  }
                >
                  Adicionar
                </Button>
              </div>
              <div className="space-y-4">
                {fields.map((f, idx) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border p-4"
                  >
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="md:col-span-2">
                        <Label>Pergunta #{idx + 1}</Label>
                        <Input
                          {...form.register(`questions.${idx}.label` as const)}
                        />
                      </div>
                      <div>
                        <Label>Tipo</Label>
                        <select
                          className="h-10 w-full rounded-md border px-3"
                          {...form.register(`questions.${idx}.type` as const)}
                        >
                          <option value="likert">Likert 1–5</option>
                          <option value="text">Texto</option>
                        </select>
                      </div>
                      <div>
                        <Label>Obrigatória?</Label>
                        <input
                          type="checkbox"
                          className="h-5 w-5"
                          {...form.register(
                            `questions.${idx}.required` as const
                          )}
                        />
                      </div>
                      <div>
                        <Label>Max length (texto)</Label>
                        <Input
                          type="number"
                          {...form.register(
                            `questions.${idx}.maxLength` as const,
                            { valueAsNumber: true }
                          )}
                        />
                      </div>
                      <div className="self-end justify-self-end">
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => remove(idx)}
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Carregar XLSX/CSV com coluna email</Label>
                <Input
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleEmailsFile(file);
                  }}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Carregados: {emails.length}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "A criar…" : "Criar Inquérito"}
              </Button>

              {/* Botão de voltar */}
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
              >
                Voltar / Desistir
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
