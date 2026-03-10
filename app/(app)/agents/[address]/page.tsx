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
      {/* Agent Profile — back navigation is rendered inside the client component for i18n */}
      <AgentProfileClient address={address} isSelectMode={isSelectMode} />
    </div>
  );
}
