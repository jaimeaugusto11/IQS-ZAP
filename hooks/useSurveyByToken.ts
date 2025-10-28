// file: lib/iqs/useSurveyByToken.ts
"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { IQSTokenDoc, IQSSurvey } from "@/lib/iqs/types";

export function useSurveyByToken(token?: string) {
  const [data, setData] = useState<{ loading: boolean; survey?: IQSSurvey; error?: string }>({
    loading: true,
  });

  useEffect(() => {
    if (!token) {
      setData({ loading: false, error: "Token inválido" });
      return;
    }
    (async () => {
      try {
        // 1. Buscar o token
        const tokenSnap = await getDoc(doc(db, "iqsTokens", token));
        if (!tokenSnap.exists()) throw new Error("Token não encontrado");
        const tokenData = tokenSnap.data() as IQSTokenDoc;
        if (!tokenData.valid) throw new Error("Token inválido");

        // 2. Buscar o inquérito associado
        const surveySnap = await getDoc(doc(db, "iqsSurveys", tokenData.surveyId));
        if (!surveySnap.exists()) throw new Error("Formulário não encontrado");

        const surveyData = { id: surveySnap.id, ...surveySnap.data() } as IQSSurvey;
        setData({ loading: false, survey: surveyData });
      } catch (err: any) {
        setData({ loading: false, error: err.message });
      }
    })();
  }, [token]);

  return data;
}
