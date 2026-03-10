import type { Metadata } from "next";
import { AgentsClient } from "./AgentsClient";

export const metadata: Metadata = {
  title: "Agents | Zenland",
  description:
    "Browse verified dispute resolution agents on Zenland. Find trusted arbitrators for your crypto escrow transactions with transparent fees and ratings.",
  keywords: [
    "escrow agents",
    "dispute resolution",
    "crypto arbitrators",
    "blockchain mediators",
    "trusted agents",
    "escrow arbitration",
  ],
  openGraph: {
    title: "Agents | Zenland",
    description:
      "Browse verified dispute resolution agents on Zenland. Find trusted arbitrators for your crypto escrow transactions.",
    type: "website",
    url: "https://zen.land/agents",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agents | Zenland",
    description:
      "Browse verified dispute resolution agents on Zenland. Find trusted arbitrators for your crypto escrow transactions.",
  },
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
