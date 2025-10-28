'use client';
import { useEffect, useRef, useState } from 'react';

export function useLocalAutosave<T>(token: string, initial: T) {
  const key = `iqs:${token}`;
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const id = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch {}
    }, 250);
    return () => clearTimeout(id);
  }, [key, state]);

  const clear = () => {
    try {
      localStorage.removeItem(key);
    } catch {}
  };

  return { state, setState, clear };
}
