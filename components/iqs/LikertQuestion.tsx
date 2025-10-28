// ------------------------------------------
// components/iqs/LikertQuestion.tsx
// ------------------------------------------
"use client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  label: string;
  value?: number;
  onChange: (v: 1 | 2 | 3 | 4 | 5) => void;
  index: number;
  gridClass?: string;
};

export function LikertQuestion({
  name,
  label,
  value,
  onChange,
  index,
  gridClass = "grid grid-cols-[minmax(320px,1fr)_repeat(5,72px)]",
}: Props) {
  const isEven = index % 2 === 1;

  return (
    <div
      role="row"
      className={cn(
        gridClass,
        "items-center border-b",
        isEven ? "bg-muted/20" : "bg-background"
      )}
    >
      {/* Pergunta */}
      <div className="p-0 text-sm leading-snug text-foreground">{label}</div>

      {/* Escala 1–5 */}
      <RadioGroup
        id={name}
        value={value ? String(value) : ""}
        onValueChange={(v) => onChange(Number(v) as 1 | 2 | 3 | 4 | 5)}
        className="col-span-5 grid grid-cols-5 text-center"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className="flex flex-col items-center justify-center p-1"
          >
            <RadioGroupItem
              id={`${name}-${n}`}
              value={String(n)}
              className="
    h-4 w-4 rounded-full border-2 border-gray-300
    bg-white
    hover:border-gray-500
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400
    data-[state=checked]:bg-amber-400
    data-[state=checked]:border-amber-400
    transition-colors duration-200
  "
              aria-label={`${n}`}
            />
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
