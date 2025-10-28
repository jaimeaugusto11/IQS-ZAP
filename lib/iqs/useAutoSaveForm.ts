// ------------------------------------------
// file: lib/iqs/useAutoSaveForm.ts
// Auto-salvamento no localStorage por token
// ------------------------------------------
"use client";
import { useEffect } from "react";

export function useAutoSaveForm<T>(key: string, value: T, setValue: (v: T)=>void) {
  // Restaurar quando monta
  useEffect(() => {
    const raw = localStorage.getItem(key);
    if (raw) {
      try { setValue(JSON.parse(raw)); } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Guardar quando muda
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
}