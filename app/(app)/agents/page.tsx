import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { AgentsClient } from "./AgentsClient";

export const metadata: Metadata = {
  ...pageMetadata({
    path: "/agents",
    title: "Agents",
    description:
      "Browse verified dispute resolution agents on Zenland. Find trusted arbitrators for your crypto escrow transactions with transparent fees and ratings.",
  }),
  keywords: [
    "escrow agents",
    "dispute resolution",
    "crypto arbitrators",
    "blockchain mediators",
    "trusted agents",
    "escrow arbitration",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

interface AgentsPageProps {
  searchParams: Promise<{ mode?: string }>;
}

export default async function AgentsPage({ searchParams }: AgentsPageProps) {
  const params = await searchParams;
  const isSelectMode = params.mode === "select";

  return <AgentsClient isSelectMode={isSelectMode} />;
}
