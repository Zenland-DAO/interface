"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { useConnection } from "wagmi";
import { useAgent } from "@/hooks";
import { AgentCheckLoader } from "@/components/ui/loaders/AgentCheckLoader";

export function AgentHeaderActions() {
  const { address, isConnected } = useConnection();

  // Only query if we have an address
  const { data: agent, isLoading: isAgentLoading } = useAgent(address || "");

  // Show loader while connecting wallet or fetching agent status
  // We only show loader if we have an address but still loading agent data
  if (isConnected && address && isAgentLoading) {
    return (
      <div className="flex justify-end">
         <AgentCheckLoader />
      </div>
    );
  }

  // If agent is active, show Dashboard button
  if (agent?.isActive) {
    return (
      <Link href="/agents/dashboard">
        <Button variant="primary" size="lg" className="shadow-sm hover:shadow-md bg-primary-600 hover:bg-primary-700 text-white border-none">
          Agent Dashboard
        </Button>
      </Link>
    );
  }

  // Default: Show "Become an Agent" button
  // This covers:
  // 1. Not connected
  // 2. Connected but not an agent
  // 3. Connected, agent record exists but isActive is false
  return (
    <Link href="/agents/register">
      <Button variant="outline" size="lg" className="shadow-sm hover:shadow-md">
        Become an Agent
      </Button>
    </Link>
  );
}
