import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AgentProfileClient } from "./AgentProfileClient";

interface AgentProfilePageProps {
  params: Promise<{ address: string }>;
  searchParams: Promise<{ mode?: string }>;
}

export async function generateMetadata({ params }: AgentProfilePageProps) {
  const { address } = await params;
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  return {
    title: `Agent ${shortAddress} | Zenland`,
    description: `View agent profile for ${shortAddress}`,
  };
}

export default async function AgentProfilePage({ params, searchParams }: AgentProfilePageProps) {
  const { address } = await params;
  const resolvedSearchParams = await searchParams;
  const isSelectMode = resolvedSearchParams.mode === "select";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Navigation */}
      <Link
        href={isSelectMode ? "/agents?mode=select" : "/agents"}
        className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ChevronLeft size={16} />
        {isSelectMode ? "Back to Agent Selection" : "Back to Agents"}
      </Link>

      {/* Agent Profile */}
      <AgentProfileClient address={address} isSelectMode={isSelectMode} />
    </div>
  );
}
