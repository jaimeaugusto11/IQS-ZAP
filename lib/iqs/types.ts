/* eslint-disable @typescript-eslint/no-explicit-any */
// ------------------------------------------
// file: lib/iqs/types.ts
// Tipos partilhados
// ------------------------------------------
export type LikertValue = 1 | 2 | 3 | 4 | 5| 2 | 3 | 4 | 5;

export type IQSAnswers = {
  q1: LikertValue; q2: LikertValue; q3: LikertValue; q4: LikertValue; q5: LikertValue;
  q6: LikertValue; q7: LikertValue; q8: LikertValue; q9: LikertValue;
  q10_open: string;
};

export type IQSTokenDoc = {
  used: boolean;
  valid: boolean;
  surveyId: string;
  email?: string;
  department?: string;
  createdAt?: any; // Timestamp
  expiresAt?: any; // Timestamp
  emailHash?: string; // SHA-256 opcional para dedupe sem guardar email
};

export type IQSSurvey = {
  id?: string;
  title: string;
  department?: string;
  description?: string;
  headerImageUrl?: string;
  createdAt?: any;
  questions: Array<{ id: string; label: string; type: "likert" | "text"; required?: boolean; maxLength?: number }>;
};