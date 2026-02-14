"use client";

import { useAgent } from "@/hooks";
import { useConnection } from "wagmi";
import { ProfileEditForm } from "@/components/app/agents/edit/ProfileEditForm";
import { Card, CardBody, Heading, Text, Button } from "@/components/ui";
import { AlertCircle, ChevronLeft, Shield } from "lucide-react";
import Link from "next/link";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

/**
 * Client component for editing agent profile.
 */
export function AgentEditClient() {
  return (
    <Suspense fallback={<div />}>
      <AgentEditClientContent />
    </Suspense>
  );
}

function AgentEditClientContent() {
  const { address, isConnected } = useConnection();
  const { data: agent, isLoading, error } = useAgent(address || "");
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as "profile" | "fees") || "profile";

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-20 h-20 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 mb-6">
          <Shield size={40} />
        </div>
        <Heading level={2} className="mb-2">Connect Your Wallet</Heading>
        <Text variant="muted" className="mb-8 max-w-md">
          Please connect your wallet to manage your agent profile.
        </Text>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        <Card className="h-96" />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card variant="outlined" className="border-warning-200 dark:border-warning-900/30">
          <CardBody className="p-12 text-center flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-warning-50 dark:bg-warning-900/20 flex items-center justify-center text-warning-500">
              <AlertCircle size={40} />
            </div>
            <div className="space-y-2">
              <Heading level={3}>Not an Agent</Heading>
              <Text variant="muted">
                You are not currently registered as an agent. You must register before you can edit your profile.
              </Text>
            </div>
            <Link href="/agents/register">
              <Button variant="primary">Become an Agent</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div>
        <Link
          href="/agents/dashboard"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-1 transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mt-2">
          {mode === "fees" ? "Configure Fees" : "Edit Profile"}
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          {mode === "fees"
            ? "Set your assignment and dispute resolution fees"
            : "Update your professional summary and contact information on-chain"
          }
        </p>
      </div>

      {/* Form */}
      <ProfileEditForm
        initialDescription={agent.description || ""}
        initialContact={agent.contact || ""}
        initialAssignmentFee={agent.assignmentFeeBps || 0}
        initialDisputeFee={agent.disputeFeeBps || 0}
        mode={mode}
      />
    </div>
  );
}
