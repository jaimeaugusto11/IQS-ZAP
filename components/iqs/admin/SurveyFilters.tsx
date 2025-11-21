"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export type SurveyFilter = {
  from?: string; // ISO date
  to?: string;   // ISO date
  department?: string;
  status?: "all" | "respondido" | "pendente";
  tokenQuery?: string;
};

export default function SurveyFilters({
  value,
  onChange,
}: {
  value?: SurveyFilter;
  onChange: (next: SurveyFilter) => void;
}) {
  const [local, setLocal] = useState<SurveyFilter>({
    from: value?.from ?? "",
    to: value?.to ?? "",
    department: value?.department ?? "",
    status: value?.status ?? "all",
    tokenQuery: value?.tokenQuery ?? "",
  });

  function apply() {
    onChange(local);
  }

  function reset() {
    const empty: SurveyFilter = { status: "all" };
    setLocal(empty);
    onChange(empty);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <Label>De</Label>
              <Input
                type="date"
                value={local.from ?? ""}
                onChange={(e) => setLocal((s) => ({ ...s, from: e.target.value }))}
              />
            </div>
            <div>
              <Label>Até</Label>
              <Input
                type="date"
                value={local.to ?? ""}
                onChange={(e) => setLocal((s) => ({ ...s, to: e.target.value }))}
              />
            </div>
            <div>
              <Label>Departamento</Label>
              <Input
                placeholder="ex.: Formação"
                value={local.department ?? ""}
                onChange={(e) =>
                  setLocal((s) => ({ ...s, department: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Estado</Label>
              <select
                className="h-10 w-full rounded-md border px-3"
                value={local.status ?? "all"}
                onChange={(e) =>
                  setLocal((s) => ({ ...s, status: e.target.value as SurveyFilter["status"] }))
                }
              >
                <option value="all">Todos</option>
                <option value="respondido">Respondido</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>
            <div>
              <Label>Token</Label>
              <Input
                placeholder="Pesquisar por token"
                value={local.tokenQuery ?? ""}
                onChange={(e) =>
                  setLocal((s) => ({ ...s, tokenQuery: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={apply}>Aplicar filtros</Button>
            <Button variant="secondary" onClick={reset}>
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
