/* eslint-disable @typescript-eslint/no-explicit-any */
// ------------------------------------------
// file: components/iqs/SurveyStatsSection.tsx
// Estatísticas + download + Power Automate (convite + lembrete)
// ------------------------------------------
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type TokenRow = {
  id: string;
  email?: string;
  used: boolean;
  token: string;
};

type Props = {
  surveyId: string;
};

export function SurveyStatsSection({ surveyId }: Props) {
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [initialSent, setInitialSent] = useState(false);
  const [surveyTitle, setSurveyTitle] = useState<string>("");
  const [surveyImageUrl, setSurveyImageUrl] = useState<string>(""); // imagem do IQS
  const [emailSubject, setEmailSubject] = useState<string>(""); // assunto do e-mail

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // 1) Tokens deste inquérito
        const qTokens = query(
          collection(db, "iqsTokens"),
          where("surveyId", "==", surveyId)
        );
        const snap = await getDocs(qTokens);
        const rows: TokenRow[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            token: d.id,
            email: data.email,
            used: !!data.used,
          };
        });
        setTokens(rows);

        // 2) Metadados do inquérito (título, imagem, initialSent, assunto guardado)
        const surveySnap = await getDoc(doc(db, "iqsSurveys", surveyId));
        if (surveySnap.exists()) {
          const sdata = surveySnap.data() as any;
          setInitialSent(!!sdata.initialSent);
          setSurveyTitle(sdata.title ?? "IQS");
          setSurveyImageUrl(sdata.headerImageUrl ?? "");
          setEmailSubject(sdata.emailSubject ?? "");
        }
      } catch (e: any) {
        console.error(e);
        toast.error("Falha ao carregar estatísticas.");
      } finally {
        setLoading(false);
      }
    })();
  }, [surveyId]);

  const { total, responded, pending, percent } = useMemo(() => {
    const total = tokens.length;
    const responded = tokens.filter((t) => t.used).length;
    const pending = total - responded;
    const percent = total === 0 ? 0 : Math.round((responded / total) * 100);
    return { total, responded, pending, percent };
  }, [tokens]);

  const respondedList = tokens.filter((t) => t.used);
  const pendingList = tokens.filter((t) => !t.used);

  const trimmedSubject = emailSubject.trim();
  const subjectMissing = trimmedSubject.length === 0;

  // Helpers: XLSX download
  function downloadExcel(rows: TokenRow[], filename: string) {
    const data = rows.map((r) => ({
      email: r.email ?? "",
      token: r.token,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dados");
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    const blob = new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, filename);
  }

  // Envio inicial: TODOS (convite de primeira vez)
  async function sendInitialToAutomate() {
    try {
      if (!tokens.length) {
        toast.info("Não existem destinatários para este inquérito.");
        return;
      }
      if (initialSent) {
        toast.info("Os convites iniciais já foram enviados. Use o lembrete.");
        return;
      }
      if (subjectMissing) {
        toast.error("Defina o assunto do e-mail antes de enviar.");
        return;
      }

      const url = process.env.NEXT_PUBLIC_IQS_AUTOMATE_URL;
      if (!url) {
        toast.error("URL do Power Automate não está configurada.");
        return;
      }

      const payload = {
        surveyId,
        surveyTitle,
        surveyImageUrl,     // imagem do header
        emailSubject: trimmedSubject,
        type: "initial",
        recipients: tokens.map((t) => ({
          email: t.email,
          token: t.token,
        })), // [email, token]
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Erro ${res.status}`);
      }

      await updateDoc(doc(db, "iqsSurveys", surveyId), {
        initialSent: true,
        initialSentAt: serverTimestamp(),
        emailSubject: trimmedSubject,
      });
      setInitialSent(true);

      toast.success("Convites iniciais enviados para o Power Automate.");
    } catch (e: any) {
      console.error(e);
      toast.error("Falha ao enviar convites iniciais para o Power Automate.");
    }
  }

  // Lembrete: apenas pendentes
  async function sendPendingToAutomate() {
    try {
      if (!pendingList.length) {
        toast.info("Não existem pendentes.");
        return;
      }
      if (subjectMissing) {
        toast.error("Defina o assunto do e-mail antes de enviar.");
        return;
      }

      const url = process.env.NEXT_PUBLIC_IQS_AUTOMATE_URL;
      if (!url) {
        toast.error("URL do Power Automate não está configurada.");
        return;
      }

      const payload = {
        surveyId,
        surveyTitle,
        surveyImageUrl,
        emailSubject: trimmedSubject,
        type: "reminder",
        recipients: pendingList.map((p) => ({
          email: p.email,
          token: p.token,
        })), // [email, token]
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Erro ${res.status}`);
      }

      await updateDoc(doc(db, "iqsSurveys", surveyId), {
        lastReminderAt: serverTimestamp(),
        emailSubject: trimmedSubject,
      });

      toast.success("Base de pendentes enviada para o Power Automate.");
    } catch (e: any) {
      console.error(e);
      toast.error("Falha ao enviar pendentes para o Power Automate.");
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Estatísticas do Inquérito</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            A carregar estatísticas…
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <StatBox label="Total de convites" value={total} />
              <StatBox label="Respostas recebidas" value={responded} />
              <StatBox label="Pendentes" value={pending} />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                Taxa de resposta: {percent}%
              </p>
              <Progress value={percent} className="h-2" />
            </div>

            {/* Assunto do e-mail para convite/lembrete */}
            <div className="space-y-2">
              <Label htmlFor="email-subject">
                Assunto do e-mail (convite / lembrete)
              </Label>
              <Input
                id="email-subject"
                placeholder="Ex.: IQS ZAP — Inquérito de Satisfação Formação 2025"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Este assunto será usado tanto no envio inicial como nos
                lembretes. Os botões ficam desativados sem assunto.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-semibold">
                  Download — Respostas recebidas
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    downloadExcel(
                      respondedList,
                      `iqs_respondidos_${surveyId}.xlsx`
                    )
                  }
                  disabled={!respondedList.length}
                >
                  Exportar XLSX (respondidos)
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">
                  Download — Não responderam
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    downloadExcel(
                      pendingList,
                      `iqs_pendentes_${surveyId}.xlsx`
                    )
                  }
                  disabled={!pendingList.length}
                >
                  Exportar XLSX (pendentes)
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold">
                Envio por e-mail via Power Automate
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                <Button
                  className="w-full"
                  variant="default"
                  onClick={sendInitialToAutomate}
                  disabled={initialSent || !tokens.length || subjectMissing}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Enviar convites iniciais (todos)
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={sendPendingToAutomate}
                  disabled={!pendingList.length || subjectMissing}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Enviar lembrete (pendentes)
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Depois de enviado uma vez, apenas é possível reenviar lembretes
                para quem ainda não respondeu.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
