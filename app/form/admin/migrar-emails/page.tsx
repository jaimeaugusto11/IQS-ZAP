/* eslint-disable @typescript-eslint/no-explicit-any */
// ------------------------------------------
// file: app/iqs/admin/migrar-emails/page.tsx
// Migração: preencher emails em iqsTokens com base num XLS/CSV [email, token]
// ------------------------------------------
"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import crypto from "crypto-js";

type Row = {
  email: string;
  token: string;
};

export default function MigrarEmailsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(0);

  async function handleFile(file: File) {
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

      const parsed: Row[] = json
        .map((r) => {
          const email =
            String(
              r.email ||
                r.Email ||
                r.EMail ||
                r.E_MAIL ||
                r.EMAIL ||
                ""
            ).trim();
          const token =
            String(
              r.token ||
                r.Token ||
                r.TOKEN ||
                ""
            ).trim();

          if (!email || !token) return null;
          return { email, token };
        })
        .filter(Boolean) as Row[];

      if (!parsed.length) {
        toast.error("Não foi possível encontrar colunas email/token.");
        return;
      }

      setRows(parsed);
      setDone(0);
      toast.success(`${parsed.length} registos carregados para migração.`);
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao ler o ficheiro.");
    }
  }

  async function runMigration() {
    if (!rows.length) {
      toast.error("Carrega primeiro o ficheiro com email e token.");
      return;
    }

    setProcessing(true);
    setDone(0);

    let processed = 0;
    let updated = 0;
    let notFound = 0;

    for (const row of rows) {
      try {
        const ref = doc(db, "iqsTokens", row.token);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          notFound++;
        } else {
          await updateDoc(ref, {
            email: row.email,
            emailHash: crypto.SHA256(row.email).toString(),
          });
          updated++;
        }
      } catch (e) {
        console.error("Erro ao actualizar token", row.token, e);
      } finally {
        processed++;
        setDone(Math.round((processed / rows.length) * 100));
      }
    }

    setProcessing(false);
    toast.success(
      `Migração concluída. Actualizados: ${updated}, não encontrados: ${notFound}.`
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Migrar e-mails para iqsTokens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Ficheiro XLSX/CSV com colunas email e token</Label>
            <Input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <p className="text-xs text-muted-foreground">
              O sistema não altera o token. Apenas preenche os campos{" "}
              <code>email</code> e <code>emailHash</code> nos documentos
              existentes de <code>iqsTokens</code>.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm">
              Registos carregados:{" "}
              <span className="font-semibold">{rows.length}</span>
            </p>
            {processing && (
              <div className="space-y-2">
                <Progress value={done} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {done}% concluído
                </p>
              </div>
            )}
          </div>

          <Button
            type="button"
            onClick={runMigration}
            disabled={processing || !rows.length}
          >
            {processing ? "A migrar…" : "Iniciar migração"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
