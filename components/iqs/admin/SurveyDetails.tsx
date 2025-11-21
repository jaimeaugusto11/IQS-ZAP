"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TokenDoc = {
  valid: boolean;
  used: boolean;
  surveyId: string;
  createdAt?: Timestamp;
  usedAt?: Timestamp;
  emailHash?: string; // opcional
  // podes adicionar outros campos se existirem no teu schema
};

type ResponseDoc = {
  token: string;
  surveyId: string; // **recomendado** para facilitar query
  submittedAt?: Timestamp;
  department?: string | null;
  answers?: unknown;
};

type RowRespondido = {
  token: string;
  submittedAt: string;
  department: string;
};

type RowPendente = {
  token: string;
  createdAt: string;
};

function toCSV(rows: Record<string, string>[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => `"${String(r[h] ?? "").replaceAll('"', '""')}"`)
        .join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function fmt(ts?: Timestamp) {
  return ts ? ts.toDate().toLocaleString("pt-PT") : "";
}

export default function SurveyDetails({
  surveyId,
  title = "Detalhes do Inquérito",
}: {
  surveyId: string;
  title?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<{ id: string; data: TokenDoc }[]>([]);
  const [responses, setResponses] = useState<{ id: string; data: ResponseDoc }[]>(
    []
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      // Tokens do inquérito
      const tq = query(
        collection(db, "iqsTokens"),
        where("surveyId", "==", surveyId)
      );
      const tSnap = await getDocs(tq);
      const tList = tSnap.docs.map((d) => ({ id: d.id, data: d.data() as TokenDoc }));

      // Respostas do inquérito
      // Requer responses com surveyId guardado no submit
      const rq = query(
        collection(db, "iqsResponses"),
        where("surveyId", "==", surveyId),
        orderBy("submittedAt", "desc")
      );
      const rSnap = await getDocs(rq);
      const rList = rSnap.docs.map((d) => ({ id: d.id, data: d.data() as ResponseDoc }));

      if (mounted) {
        setTokens(tList);
        setResponses(rList);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [surveyId]);

  const stats = useMemo(() => {
    const total = tokens.length;
    const usados = tokens.filter((t) => t.data.used).length;
    const pendentes = total - usados;
    const taxa = total ? Math.round((usados / total) * 100) : 0;

    return { total, usados, pendentes, taxa };
  }, [tokens]);

  const respondidosRows: RowRespondido[] = useMemo(() => {
    return responses.map((r) => ({
      token: r.data.token,
      submittedAt: fmt(r.data.submittedAt),
      department: r.data.department ?? "",
    }));
  }, [responses]);

  const pendentesRows: RowPendente[] = useMemo(() => {
    const respondedTokens = new Set(responses.map((r) => r.data.token));
    return tokens
      .filter((t) => !respondedTokens.has(t.id))
      .map((t) => ({
        token: t.id,
        createdAt: fmt(t.data.createdAt),
      }));
  }, [tokens, responses]);

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              toCSV(
                respondidosRows.map((r) => ({
                  token: r.token,
                  submittedAt: r.submittedAt,
                  department: r.department,
                })),
                `iqs_${surveyId}_respondidos.csv`
              )
            }
          >
            Download respondidos
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toCSV(
                pendentesRows.map((p) => ({
                  token: p.token,
                  createdAt: p.createdAt,
                })),
                `iqs_${surveyId}_pendentes.csv`
              )
            }
          >
            Download pendentes
          </Button>
        </div>
      </motion.div>

      {/* Resumo */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 md:grid-cols-4"
      >
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Total de convites</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{stats.total}</CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Respondidos</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{stats.usados}</CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Pendentes</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {stats.pendentes}
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Taxa de resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.taxa}%</div>
            <div className="mt-2 h-2 w-full rounded bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.taxa}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                className="h-2 rounded bg-gradient-to-r from-[#FFC613] to-[#D1196F]"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Listas */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 md:grid-cols-2"
      >
        <Card className="shadow">
          <CardHeader>
            <CardTitle className="text-lg">Respostas recebidas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">A carregar…</p>
            ) : respondidosRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ainda sem respostas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-4">Token</th>
                      <th className="py-2 pr-4">Data</th>
                      <th className="py-2">Departamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {respondidosRows.map((r) => (
                      <tr key={r.token} className="border-t">
                        <td className="py-2 pr-4 font-mono">{r.token}</td>
                        <td className="py-2 pr-4">{r.submittedAt}</td>
                        <td className="py-2">{r.department}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow">
          <CardHeader>
            <CardTitle className="text-lg">Respondentes pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">A carregar…</p>
            ) : pendentesRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem pendentes 🎉</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-4">Token</th>
                      <th className="py-2">Criado em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendentesRows.map((p) => (
                      <tr key={p.token} className="border-t">
                        <td className="py-2 pr-4 font-mono">{p.token}</td>
                        <td className="py-2">{p.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
