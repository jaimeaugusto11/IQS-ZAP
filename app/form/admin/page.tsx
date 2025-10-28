/* eslint-disable @typescript-eslint/no-explicit-any */
// ------------------------------------------
// file: app/iqs/admin/page.tsx
// Lista de inquéritos (CRUD) - layout moderno e empresarial
// ------------------------------------------
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

interface IQSSurvey {
  id: string;
  title: string;
  department: string;
  archived?: boolean;
  archivedAt?: any;
}

export default function AdminListPage() {
  const [items, setItems] = useState<IQSSurvey[]>([]);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "iqsSurveys"));
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as IQSSurvey)));
    })();
  }, []);

  async function archive(id: string) {
    await updateDoc(doc(db, "iqsSurveys", id), { archived: true, archivedAt: new Date() as any });
    toast.success("Inquérito arquivado.");
    setItems(prev => prev.filter(x => x.id !== id));
  }

  return (
    <main className="mx-auto max-w-7xl p-8 space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Inquéritos</h1>
        <Button asChild className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 shadow-md transition">
          <Link href="/form/admin/new">Novo Inquérito</Link>
        </Button>
      </div>

      {/* Lista de cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => (
          <Card key={s.id} className="border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1">
            <CardHeader className="pb-0">
              <CardTitle className="text-xl font-semibold text-gray-800">{s.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-4">
              <div className="text-sm text-gray-500">{s.department}</div>
              <div className="flex gap-3">
                <Button asChild variant="outline" className="px-4 py-2 text-gray-700 hover:bg-gray-100 transition">
                  <Link href={`/form/admin/${s.id}`}>Editar</Link>
                </Button>
                <Button variant="destructive" className="px-4 py-2" onClick={() => archive(s.id)}>
                  Arquivar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
