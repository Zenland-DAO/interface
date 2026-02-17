import type { Metadata } from "next";
import { PageHeader } from "@/components/shared";
import { AgentsClient } from "./AgentsClient";
import { AgentHeaderActions } from "@/components/app/agents/AgentHeaderActions";

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

  return (
    <div className="space-y-6">
      <PageHeader
        title={isSelectMode ? "Select an Agent" : "Agents"}
        description={
          isSelectMode
            ? "Choose an agent for your escrow"
            : "Browse verified dispute resolution agents"
        }
        actions={!isSelectMode ? <AgentHeaderActions /> : undefined}
      />

      {/* Agents Grid (Includes Search & Sort internally now) */}
      <AgentsClient isSelectMode={isSelectMode} />
    </div>
  );
}
