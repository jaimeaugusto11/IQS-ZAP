/* eslint-disable @typescript-eslint/no-explicit-any */
// ------------------------------------------
// file: app/iqs/admin/page.tsx
// Lista de inquéritos (CRUD)
// ------------------------------------------
"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminListPage(){
  const [items,setItems] = useState<any[]>([]);
  useEffect(()=>{(async()=>{
    const snap = await getDocs(collection(db,"iqsSurveys"));
    setItems(snap.docs.map(d=>({ id:d.id, ...d.data()})));
  })();},[]);

  async function archive(id:string){
    await updateDoc(doc(db,"iqsSurveys",id),{ archived:true, archivedAt: new Date() as any });
    toast.success("Inquérito arquivado.");
    setItems(prev=>prev.filter(x=>x.id!==id));
  }

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inquéritos</h1>
        <Button asChild><Link href="/form/admin/new">Novo Inquérito</Link></Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((s)=> (
          <Card key={s.id} className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">{s.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{s.department}</div>
              <div className="flex gap-2">
                <Button asChild variant="secondary"><Link href={`/form/admin/${s.id}`}>Editar</Link></Button>
                <Button variant="destructive" onClick={()=>archive(s.id)}>Arquivar</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}