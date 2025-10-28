// ------------------------------------------
// file: app/iqs/[token]/client-content.tsx
// Dividido para forçar client component
// ------------------------------------------
"use client";
import { IQSHeader } from "@/components/iqs/IQSHeader";
import { IQSForm } from "@/components/iqs/IQSForm";
import { useTokenValidation } from "@/lib/iqs/useTokenValidation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ShieldAlert } from "lucide-react";
import { useSurveyByToken } from "@/hooks/useSurveyByToken";

export default function ClientContent({ token }: { token: string }) {
  const status = useTokenValidation(token);
  const { loading, survey, error } = useSurveyByToken(token);

  if (loading)
    return (
      <div className="flex items-center gap-2 text-muted-foreground p-6">
        <Loader2 className="h-4 w-4 animate-spin" />A carregar formulário…
      </div>
    );
  if (error)
    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );

  if (!survey)
    return (
      <Alert>
        <AlertTitle>Formulário não encontrado</AlertTitle>
        <AlertDescription>
          Verifique o token ou contacte o administrador.
        </AlertDescription>
      </Alert>
    );

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <IQSHeader
        title={survey.title}
        subtitle={survey.description ?? "Inquérito de Satisfação ZAP"}
        imageUrl={survey.headerImageUrl?? ""}
      />

      {status.state === "loading" && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />A validar token…
        </div>
      )}

      {status.state === "invalid" && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Token inválido</AlertTitle>
          <AlertDescription>
            O link de acesso é inválido ou expirou.
          </AlertDescription>
        </Alert>
      )}

      {status.state === "used" && (
        <Alert>
          <AlertTitle>Este inquérito já foi respondido.</AlertTitle>
          <AlertDescription>Obrigado pela sua participação!</AlertDescription>
        </Alert>
      )}

      {status.state === "valid" && <IQSForm token={token} survey={survey} />}
    </main>
  );
}
