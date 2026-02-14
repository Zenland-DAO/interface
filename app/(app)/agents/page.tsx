import { PageHeader } from "@/components/shared";
import { AgentsClient } from "./AgentsClient";
import { AgentHeaderActions } from "@/components/app/agents/AgentHeaderActions";

export const metadata = {
  title: "Agents | Zenland",
  description: "Browse and select dispute resolution agents",
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
