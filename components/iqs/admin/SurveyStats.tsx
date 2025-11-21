"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { collection, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

type ResponseDoc = {
  surveyId: string;
  token: string;
  submittedAt?: Timestamp;
  answers?: Record<string, number | string>;
};

type Question = { id: string; label: string; type: "likert" | "text" };

function mean(nums: number[]) {
  if (!nums.length) return 0;
  return +(nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2);
}

export default function SurveyStats({
  surveyId,
  questions,
  title = "Estatísticas do Inquérito",
}: {
  surveyId: string;
  questions: Question[]; // passar as perguntas do inquérito (para mapear q1..q9 e textos)
  title?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<ResponseDoc[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const rq = query(
        collection(db, "iqsResponses"),
        where("surveyId", "==", surveyId),
        orderBy("submittedAt", "desc")
      );
      const snap = await getDocs(rq);
      const rows = snap.docs.map((d) => d.data() as ResponseDoc);
      if (mounted) {
        setResponses(rows);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [surveyId]);

  // Estatística por pergunta (apenas tipo likert)
  const data = useMemo(() => {
    const likertQs = questions.filter((q) => q.type === "likert");
    return likertQs.map((q, idx) => {
      // by convention q1..qN
      const key = `q${idx + 1}`;
      const vals = responses
        .map((r) => Number((r.answers ?? {})[key]))
        .filter((n) => Number.isFinite(n) && n >= 1 && n <= 5) as number[];

      // distribuição 1..5
      const dist = [1, 2, 3, 4, 5].map((n) => vals.filter((v) => v === n).length);
      const avg = mean(vals);
      return {
        id: key,
        label: q.label,
        media: avg,
        c1: dist[0],
        c2: dist[1],
        c3: dist[2],
        c4: dist[3],
        c5: dist[4],
        total: vals.length,
      };
    });
  }, [responses, questions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">A carregar…</p>
          ) : !data.length ? (
            <p className="text-sm text-muted-foreground">Sem perguntas de tipo Likert.</p>
          ) : (
            <div className="space-y-8">
              {/* Médias por pergunta */}
              <section>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Média por pergunta (1–5)
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer>
                    <BarChart data={data}>
                      <XAxis dataKey="id" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Bar dataKey="media">
                        <LabelList dataKey="media" position="top" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Distribuição (soma de contagens 1..5) */}
              <section>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Distribuição de respostas (contagem 1–5)
                </h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer>
                    <BarChart data={data}>
                      <XAxis dataKey="id" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="c1" stackId="a" />
                      <Bar dataKey="c2" stackId="a" />
                      <Bar dataKey="c3" stackId="a" />
                      <Bar dataKey="c4" stackId="a" />
                      <Bar dataKey="c5" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Dica: passa o rato nas barras para ver os valores exactos.
                </p>
              </section>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
