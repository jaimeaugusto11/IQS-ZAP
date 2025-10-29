/* eslint-disable @typescript-eslint/no-explicit-any */
// ------------------------------------------
// file: app/iqs/admin/page.tsx
// Lista de inquéritos (CRUD) — UI/UX moderna e empresarial
// ------------------------------------------
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  query,
  orderBy,
  Timestamp,
  serverTimestamp,
  FirestoreDataConverter,
  DocumentData,
  WithFieldValue,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, Plus, Search, Archive, Edit3 } from "lucide-react";

// ----------------------
// Tipos
// ----------------------
interface IQSSurvey {
  id: string;
  title: string;
  department: string;
  archived: boolean;
  archivedAt: Timestamp | null;
  createdAt: Timestamp | null;
}

// ----------------------
// Firestore Converter (tipagem forte)
// ----------------------
const surveyConverter: FirestoreDataConverter<IQSSurvey> = {
  toFirestore(
    model: WithFieldValue<Omit<IQSSurvey, "id">>
  ): DocumentData {
    return {
      title: model.title,
      department: model.department,
      archived: model.archived ?? false,
      archivedAt: model.archivedAt ?? null,
      createdAt: model.createdAt ?? serverTimestamp(),
    };
  },
  fromFirestore(snapshot, options): IQSSurvey {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      title: String(data.title ?? ""),
      department: String(data.department ?? ""),
      archived: Boolean(data.archived ?? false),
      archivedAt: (data.archivedAt ?? null) as Timestamp | null,
      createdAt: (data.createdAt ?? null) as Timestamp | null,
    };
  },
};

// ----------------------
// Skeletons
// ----------------------
function CardSkeleton() {
  return (
    <Card className="border border-gray-200 rounded-xl shadow-sm">
      <div className="p-5">
        <div className="h-5 w-2/3 bg-gray-200/80 animate-pulse rounded mb-4" />
        <div className="h-4 w-24 bg-gray-200/80 animate-pulse rounded mb-6" />
        <div className="flex items-center justify-between">
          <div className="h-9 w-24 bg-gray-200/80 animate-pulse rounded" />
          <div className="flex gap-2">
            <div className="h-9 w-20 bg-gray-200/80 animate-pulse rounded" />
            <div className="h-9 w-24 bg-gray-200/80 animate-pulse rounded" />
          </div>
        </div>
      </div>
    </Card>
  );
}

// ----------------------
// Página
// ----------------------
export default function AdminListPage() {
  const [items, setItems] = useState<IQSSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [qText, setQText] = useState("");
  const [onlyActive, setOnlyActive] = useState(true);
  const [deptFilter, setDeptFilter] = useState<string>("");

  useEffect(() => {
    // Live updates
    const qCol = query(
      collection(db, "iqsSurveys").withConverter(surveyConverter),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      qCol,
      (snap) => {
        setItems(snap.docs.map((d) => d.data()));
        setLoading(false);
      },
      (err) => {
        console.error(err);
        toast.error("Não foi possível carregar os inquéritos.");
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const departments = useMemo(() => {
    const set = new Set(items.map((i) => i.department).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = useMemo(() => {
    const text = qText.trim().toLowerCase();
    return items
      .filter((i) => (onlyActive ? !i.archived : true))
      .filter((i) => (deptFilter ? i.department === deptFilter : true))
      .filter(
        (i) =>
          !text ||
          i.title.toLowerCase().includes(text) ||
          i.department.toLowerCase().includes(text)
      );
  }, [items, qText, deptFilter, onlyActive]);

  async function handleArchive(id: string) {
    try {
      await updateDoc(doc(db, "iqsSurveys", id), {
        archived: true,
        archivedAt: serverTimestamp(),
      });
      toast.success("Inquérito arquivado.");
    } catch (e) {
      console.error(e);
      toast.error("Falha ao arquivar o inquérito.");
    }
  }

  return (
    <main className="mx-auto max-w-7xl p-6 md:p-8 space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inquéritos</h1>
          <p className="text-sm text-muted-foreground">
            Gestão centralizada de inquéritos IQS: crie, edite, arquive e filtre rapidamente.
          </p>
        </div>

        <Button asChild className="gap-2 shadow-sm">
          {/* Mantive a rota original do teu snippet para evitar quebra */}
          <Link href="/form/admin/new">
            <Plus className="h-4 w-4" />
            Novo Inquérito
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            placeholder="Pesquisar por título ou departamento…"
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={onlyActive ? "default" : "outline"}
            className="w-full"
            onClick={() => setOnlyActive(true)}
          >
            Ativos
          </Button>
          <Button
            variant={!onlyActive ? "default" : "outline"}
            className="w-full"
            onClick={() => setOnlyActive(false)}
          >
            Todos
          </Button>
        </div>

        <div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Todos os departamentos</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista / Estado */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center space-y-2">
            <p className="text-base font-medium">Sem resultados</p>
            <p className="text-sm text-muted-foreground">
              Ajuste os filtros ou crie um novo inquérito.
            </p>
            <Button asChild className="mt-2">
              <Link href="/form/admin/new">Criar inquérito</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s, idx) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.02 * idx, type: "spring", stiffness: 220, damping: 22 }}
            >
              <Card className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-lg font-semibold leading-6">{s.title}</CardTitle>
                    <Badge variant={s.archived ? "destructive" : "secondary"}>
                      {s.archived ? "Arquivado" : "Ativo"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="mt-4 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Departamento:{" "}
                      <span className="text-foreground font-medium">{s.department || "—"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Button asChild variant="outline" className="gap-2">
                      <Link href={`/form/admin/${s.id}`}>
                        <Edit3 className="h-4 w-4" />
                        Editar
                      </Link>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="gap-2"
                          disabled={s.archived}
                          title={s.archived ? "Já arquivado" : "Arquivar inquérito"}
                        >
                          <Archive className="h-4 w-4" />
                          Arquivar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Arquivar inquérito?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação arquiva o inquérito e impede novas respostas. Pode ser
                            revertida manualmente no Firestore, se necessário.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleArchive(s.id)}>
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Rodapé simples */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>IQS ZAP • Admin</span>
      </div>
    </main>
  );
}
