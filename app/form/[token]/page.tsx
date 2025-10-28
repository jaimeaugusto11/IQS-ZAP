"use client";
import { Suspense, use } from "react";
import ClientContent from "./client-content";

export default function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  // ✅ usa React.use() para resolver a Promise
  const { token } = use(params);

  return (
    <Suspense>
      <ClientContent token={token} />
    </Suspense>
  );
}
