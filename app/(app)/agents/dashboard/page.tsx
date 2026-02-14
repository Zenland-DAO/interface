import { AgentDashboardClient } from "./AgentDashboardClient";
import { AgentActionsProvider } from "@/hooks";

export const metadata = {
  title: "Agent Dashboard | Zenland",
  description: "Manage your dispute resolution cases",
};

export default function AgentDashboardPage() {
  return (
    <AgentActionsProvider>
      <AgentDashboardClient />
    </AgentActionsProvider>
  );
}
