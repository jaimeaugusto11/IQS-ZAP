"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TokenDoc = { used: boolean; surveyId: string; createdAt?: any };
type ResponseDoc = { token: string; surveyId: string; submittedAt?: any; answers?: any; department?: string | null };

function toCSV(rows: Record<string, any>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      headers.map((h) => `"${String(r[h] ?? "").replaceAll('"', '""')}"`).join(",")
    ),
  ];
  return lines.join("\n");
}

export default function SurveyExportAll({
  surveyId,
  title = "Exportações avançadas",
}: {
  surveyId: string;
  title?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{ tokens: number; responses: number }>({
    tokens: 0,
    responses: 0,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const tq = query(collection(db, "iqsTokens"), where("surveyId", "==", surveyId));
      const rq = query(
        collection(db, "iqsResponses"),
        where("surveyId", "==", surveyId),
        orderBy("submittedAt", "desc")
      );
      const [tSnap, rSnap] = await Promise.all([getDocs(tq), getDocs(rq)]);
      if (mounted) {
        setSummary({ tokens: tSnap.size, responses: rSnap.size });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [surveyId]);

  async function handleExport() {
    setLoading(true);
    try {
      const tq = query(collection(db, "iqsTokens"), where("surveyId", "==", surveyId));
      const rq = query(
        collection(db, "iqsResponses"),
        where("surveyId", "==", surveyId),
        orderBy("submittedAt", "desc")
      );
      const [tSnap, rSnap] = await Promise.all([getDocs(tq), getDocs(rq)]);
      const tokens = tSnap.docs.map((d) => ({ id: d.id, ...(d.data() as TokenDoc) }));
      const responses = rSnap.docs.map((d) => ({ id: d.id, ...(d.data() as ResponseDoc) }));

      const responded = new Set(responses.map((r) => r.token));
      const pendentes = tokens.filter((t) => !responded.has(t.id));

      const csvRespondidos = toCSV(
        responses.map((r) => ({
          token: r.token,
          submittedAt: r.submittedAt?.toDate?.().toISOString?.() ?? "",
          department: r.department ?? "",
        }))
      );
      const csvPendentes = toCSV(
        pendentes.map((p) => ({
          token: p.id,
          createdAt: p.createdAt?.toDate?.().toISOString?.() ?? "",
        }))
      );
      const jsonRespostas = JSON.stringify(responses, null, 2);

      const zip = new JSZip();
      zip.file(`respondidos_${surveyId}.csv`, csvRespondidos);
      zip.file(`pendentes_${surveyId}.csv`, csvPendentes);
      zip.file(`respostas_${surveyId}.json`, jsonRespostas);

      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, `iqs_export_${surveyId}.zip`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="text-sm text-muted-foreground">
            Tokens: <strong>{summary.tokens}</strong> • Respostas:{" "}
            <strong>{summary.responses}</strong>
          </div>
          <Button onClick={handleExport} disabled={loading}>
            {loading ? "A preparar ZIP…" : "Descarregar ZIP (CSV + JSON)"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
