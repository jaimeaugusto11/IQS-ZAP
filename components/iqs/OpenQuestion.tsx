// ------------------------------------------
// file: components/iqs/OpenQuestion.tsx
// Pergunta aberta com contador
// ------------------------------------------
"use client";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function OpenQuestion({
  value, 
  label,
  onChange,
  max = 500,
}: {
  value: string;
  label:string
  onChange: (v: string) => void;
  max?: number;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={max}
        placeholder="Introduza a sua resposta"
        className="min-h-28"
        defaultValue={""}
      />
      <div className="text-right text-xs text-muted-foreground">
        {value.length}/{max}
      </div>
    </div>
  );
}
