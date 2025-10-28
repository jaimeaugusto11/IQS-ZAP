// ------------------------------------------
// file: lib/iqs/useTokenValidation.ts
// Hook para validar token em Firestore
// ------------------------------------------
"use client";
import { useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { IQSTokenDoc } from "@/lib/iqs/types";

export function useTokenValidation(token?: string | null) {
  const [status, setStatus] = useState<
    | { state: "idle" }
    | { state: "loading" }
    | { state: "invalid" }
    | { state: "used"; department?: string }
    | { state: "valid"; department?: string }
  >({ state: "idle" });

  useEffect(() => {
    if (!token) {
      setStatus({ state: "invalid" });
      return;
    }
    setStatus({ state: "loading" });
    (async () => {
      const snap = await getDoc(doc(db, "iqsTokens", token));
      if (!snap.exists()) { setStatus({ state: "invalid" }); return; }
      const data = snap.data() as IQSTokenDoc;
      if (!data.valid) { setStatus({ state: "invalid" }); return; }
      if (data.used) { setStatus({ state: "used", department: data.department }); return; }
      setStatus({ state: "valid", department: data.department });
    })();
  }, [token]);

  return useMemo(() => status, [status]);
}