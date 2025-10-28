/* eslint-disable @typescript-eslint/no-explicit-any */
// ------------------------------------------
// file: app/iqs/admin/[id]/page.tsx
// Editar inquérito (update título/descrição/perguntas/header)
// ------------------------------------------
"use client";
import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { HeaderUploader } from "@/components/iqs/HeaderUploader";
import { toast } from "sonner";

const qSchemaE = z.object({
  id: z.string(),
  label: z.string().min(1),
  type: z.enum(["likert", "text"]),
  required: z.boolean().optional(),
  maxLength: z.number().optional(),
});
const formSchemaE = z.object({
  title: z.string().min(3),
  department: z.string().optional(),
  description: z.string().optional(),
  headerImageUrl: z.string().url().optional(),
  questions: z.array(qSchemaE).min(1),
});

type FormDataE = z.infer<typeof formSchemaE>;

export default function EditSurvey() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const form = useForm<FormDataE>({
    resolver: zodResolver(formSchemaE),
    defaultValues: {
      title: "",
      department: "",
      description: "",
      headerImageUrl: "",
      questions: [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "iqsSurveys", id));
      const data = snap.data() as any;
      form.reset({
        title: data.title ?? "",
        department: data.department ?? "",
        description: data.description ?? "",
        headerImageUrl: data.headerImageUrl ?? "",
        questions: data.questions ?? [],
      });
    })();
  }, [id, form]);

  async function onSave(v: FormDataE) {
    await updateDoc(doc(db, "iqsSurveys", id), v);
    toast.success("Alterações guardadas.");
  }

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Editar Inquérito</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Título</Label>
                <Input {...form.register("title")} />
              </div>
              <div>
                <Label>Departamento</Label>
                <Input {...form.register("department")} />
              </div>
              <div className="md:col-span-2">
                <Label>Descrição</Label>
                <Textarea {...form.register("description")} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Imagem de Header</Label>
                <HeaderUploader
                  onChange={(url) =>
                    form.setValue("headerImageUrl", url, { shouldDirty: true })
                  }
                  value={form.watch("headerImageUrl")}
                />

                <Input readOnly value={form.watch("headerImageUrl") ?? ""} />
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
                      id: "",
                      label: "Nova pergunta",
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
                  <div key={f.id} className="rounded-lg border p-4">
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
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit">Guardar</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
