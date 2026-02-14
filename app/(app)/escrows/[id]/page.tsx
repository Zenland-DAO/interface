"use client";

import { use } from "react";
import { EscrowDetailClient } from "@/components/app/escrows/detail";

interface EscrowDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function EscrowDetailPage({ params }: EscrowDetailPageProps) {
  const { id } = use(params);

  return <EscrowDetailClient id={id} />;
}
