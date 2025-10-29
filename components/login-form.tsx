"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Next.js 13+ (app router)
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const USERS = [
  { nome: "Jaime André", mec: "2281" },
  { nome: "Hosana Joaquim", mec: "2236" },
];

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [mec, setMec] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = USERS.find((u) => u.mec === mec);

    if (user) {
      // Guarda no localStorage
      localStorage.setItem("user", JSON.stringify(user));
      setError("");
      // Redireciona para a página admin
      router.push("https://iqs-zap.vercel.app/form/admin");
    } else {
      setError("MEC inválido. Tente novamente.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Entra na conta admin</CardTitle>
          <CardDescription>
            Insira seu número mecanográfico para aceder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="mec">MEC Number</FieldLabel>
                <Input
                  id="mec"
                  type="text"
                  placeholder="xxxx"
                  value={mec}
                  onChange={(e) => setMec(e.target.value)}
                  required
                />
              </Field>

              {error && (
                <p className="text-red-600 text-sm mt-1">{error}</p>
              )}

              <Field>
                <Button type="submit">Entrar</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
