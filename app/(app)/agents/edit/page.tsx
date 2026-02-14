import { AgentEditClient } from "./AgentEditClient";
import { AgentActionsProvider } from "@/hooks";

export const metadata = {
  title: "Edit Agent Profile | Zenland",
  description: "Update your agent profile information",
};

export default function AgentEditPage() {
  return (
    <AgentActionsProvider>
      <AgentEditClient />
    </AgentActionsProvider>
  );
}
