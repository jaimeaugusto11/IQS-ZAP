// ------------------------------------------
// file: lib/iqs/schema.ts
// Zod schema para validação
// ------------------------------------------
import { z } from "zod";

export const likert = z.union([
  z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)
]);

export const iqsSchema = z.object({
  q1: likert, q2: likert, q3: likert, q4: likert, q5: likert,
  q6: likert, q7: likert, q8: likert, q9: likert,
  q10_open: z.string().min(1, "Obrigatório").max(500, "Máximo 500 caracteres"),
});
export type IQSFormData = z.infer<typeof iqsSchema>;
