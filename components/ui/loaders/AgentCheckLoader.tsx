import { Icon } from "@/components/ui";
import { Loader2 } from "lucide-react";

export function AgentCheckLoader() {
  return (
    <div className="flex items-center justify-center p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 w-12 h-12">
      <Icon icon={Loader2} className="animate-spin text-primary-500" />
    </div>
  );
}
