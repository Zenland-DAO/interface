"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { formatAmount } from "@/components/app/escrows/create/schema";
import {
  CheckCircle2,
  Activity,
  CircleDollarSign,
  TrendingUp,
  Shield,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  Plus,
  Minus,
  ArrowLeft,
  Slash,
  Clock,
  LogOut,
  LogIn,
  Pencil
} from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Icon,
} from "@/components/ui";
import { StakeManagementModal } from "@/components/app/agents/dashboard/StakeManagementModal";
import { FeeManagementModal } from "@/components/app/agents/dashboard/FeeManagementModal";
import { useAgent, useRegistryParameters } from "@/hooks";
import { useConnection } from "wagmi";
import { AgentAvailabilityModal } from "@/components/app/agents/shared/AgentAvailabilityModal";

// Local types to satisfy compiler until codegen catches up
interface AgentCase {
  id: string;
  escrow: string;
  invitedAt: string | number | null;
  resolvedAt: string | number | null;
  timedOut: boolean;
  escrowRef?: {
    id: string;
    amount: string | bigint;
    token: string;
    state: string;
  };
}

interface ExtendedAgent {
  id: string;
  isActive: boolean;
  isAvailable: boolean;
  contact: string;
  description: string;
  stablecoinToken: string;
  stablecoinStake: string | bigint;
  daoTokenStake: string | bigint;
  stablecoinDecimals: number;
  totalEarnings: string | bigint;
  totalSlashed: string | bigint;
  totalResolved: number;
  activeCases: number;
  disputeFeeBps: number;
  assignmentFeeBps: number;
  registrationTime: string | number;
  lastEngagementTimestamp: string | number;
  cases?: {
    items: AgentCase[];
    totalCount: number;
  };
}

function toBigInt(value: string | bigint | number | null | undefined, fallback = 0n): bigint {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(value);
  try {
    return BigInt(value);
  } catch {
    return fallback;
  }
}

export function AgentDashboardClient() {
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [stakeTab, setStakeTab] = useState<"increase" | "withdraw">("increase");

  const { address, isConnected } = useConnection();
  const { data: rawAgent, isLoading, error } = useAgent(address || "");
  const agent = rawAgent as unknown as ExtendedAgent;

  const displayAddress = useMemo(() => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  const { parameters } = useRegistryParameters();

  const formattedJoinedDate = useMemo(() => {
    if (!agent?.registrationTime) return "";
    try {
      return new Date(parseInt(String(agent.registrationTime)) * 1000).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric"
      });
    } catch {
      return "";
    }
  }, [agent?.registrationTime]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-20 h-20 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 mb-6">
          <Shield size={40} />
        </div>
        <Heading level={2} className="mb-2">Connect Your Wallet</Heading>
        <Text variant="muted" className="mb-8 max-w-md">
          Please connect your wallet to view your agent dashboard and manage your cases.
        </Text>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
            <div className="h-4 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
          </div>
          <div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Card key={i} className="h-24" />)}
        </div>
        <Card className="h-64" />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <Card variant="outlined" className="border-warning-200 dark:border-warning-900/30">
        <CardBody className="p-12 text-center flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-warning-50 dark:bg-warning-900/20 flex items-center justify-center text-warning-500">
            <AlertCircle size={40} />
          </div>
          <div className="space-y-2">
            <Heading level={3}>Not Registered as Agent</Heading>
            <Text variant="muted" className="max-w-md mx-auto">
              You are not currently registered as an agent on this network.
              Register now to start resolving disputes and earning fees.
            </Text>
          </div>
          <Link href="/agents/register">
            <Button variant="primary" size="lg">Become an Agent</Button>
          </Link>
        </CardBody>
      </Card>
    );
  }

  const cases = agent.cases?.items || [];
  const activeCount = agent.activeCases || 0;

  // Format stats
  // We use formatAmount directly in the UI for consistency

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back Navigation */}
      <Link href="/agents" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text-tertiary)] hover:text-primary-500 transition-colors group">
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        Back to Agents
      </Link>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Agent Dashboard
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Monitor your performance and manage assigned dispute cases
          </p>
        </div>
      </div>

      {/* Page Header Information */}
      <Card variant="elevated" className="border-none shadow-2xl shadow-primary-500/5 relative overflow-hidden group transition-all duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-primary-500/10" />

        <CardBody className="flex flex-col lg:flex-row lg:items-center gap-6 md:gap-8 p-6 md:p-10 relative">
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-primary-500/20">
              {agent.id.slice(2, 3).toUpperCase()}
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-6 text-center lg:text-left">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-col items-center lg:items-start gap-2">
                  <Heading level={2} className="truncate tracking-tight m-0 text-3xl">
                    {agent.contact ? agent.contact.split("|")[0].trim() : displayAddress}
                  </Heading>
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                    {formattedJoinedDate && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-neutral-100 dark:bg-neutral-800 text-[var(--text-tertiary)] border border-[var(--border-secondary)]">
                        <Clock size={10} />
                        Joined {formattedJoinedDate}
                      </span>
                    )}
                  </div>
                </div>
                <code className="text-[var(--text-tertiary)] text-[10px] font-mono block opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                  {address}
                </code>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col items-center lg:items-end gap-3">
                {/* Status + Toggle (same row) */}
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${agent.isAvailable ? "bg-success-500/10 text-success-500 border-success-500/20" : "bg-neutral-500/10 text-neutral-500 border-neutral-500/20"}`}>
                    <div className={`w-2 h-2 rounded-full ${agent.isAvailable ? "bg-success-500 animate-pulse" : "bg-neutral-500"}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                      {agent.isAvailable ? "Online" : "Offline"}
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="font-black uppercase tracking-widest text-[10px] h-9 px-5 shadow-lg shadow-primary-500/20"
                    onClick={() => setIsAvailabilityModalOpen(true)}
                    leftIcon={agent.isAvailable ? <LogOut size={14} /> : <LogIn size={14} />}
                  >
                    {agent.isAvailable ? "Set Unavailable" : "Set Available"}
                  </Button>
                </div>

                {/* Edit Profile - Blue outline */}
                <Link href="/agents/edit?mode=profile" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto font-bold uppercase tracking-widest text-[10px] h-9 px-5 border-primary-500/30 text-primary-500 hover:bg-primary-500/5 hover:border-primary-500"
                    leftIcon={<Pencil size={14} />}
                  >
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </div>

            <p className="text-[var(--text-secondary)] text-sm line-clamp-3 italic max-w-2xl leading-relaxed mx-auto lg:mx-0">
              {agent.description || "Expert dispute resolver maintaining the integrity of the Zenland ecosystem."}
            </p>
          </div>
        </CardBody>
      </Card>


      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Cases", value: activeCount, icon: Activity, color: "primary" as const },
          { label: "Total Resolved", value: agent.totalResolved, icon: CheckCircle2, color: "success" as const },
          { label: "Total Earnings", value: `$${formatAmount(toBigInt(agent.totalEarnings), agent.stablecoinDecimals || 18)}`, icon: CircleDollarSign, color: "warning" as const },
          { label: "Total Slashed", value: `$${formatAmount(toBigInt(agent.totalSlashed), agent.stablecoinDecimals || 18)}`, icon: Slash, color: "error" as const },
        ].map((stat, i) => (
          <Card key={i} variant="elevated" className="border-none shadow-lg shadow-neutral-500/5 group">
            <CardBody className="p-6 flex items-center gap-4">
              <Icon icon={stat.icon} boxed boxColor={stat.color} size="md" className="group-hover:scale-110 transition-transform" />
              <div>
                <Text variant="muted" className="text-[10px] font-bold uppercase tracking-widest">{stat.label}</Text>
                <Heading level={3} className="text-2xl font-black">{stat.value}</Heading>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Cases */}
        <div className="lg:col-span-2">
          <Card variant="elevated" className="border-none shadow-xl shadow-neutral-500/5">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--border-secondary)] px-8 py-6">
              <Heading level={4} className="text-lg">Recent Dispute Cases</Heading>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 uppercase tracking-tighter">
                  {cases.length} assigned
                </span>
                {cases.length > 0 && (
                  <Link href="/agents/cases" className="text-[10px] font-bold uppercase tracking-widest text-primary-500 hover:text-primary-400 transition-colors">
                    View All →
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {cases.length === 0 ? (
                <div className="p-12 text-center">
                  <Text variant="muted" className="italic">No cases assigned yet. You&apos;ll be notified when a dispute requires your review.</Text>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-secondary)] max-h-[400px] overflow-y-auto">
                  {cases.slice(0, 5).map((c) => (
                    <div key={c.id} className="p-6 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10 transition-colors group">
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black group-hover:text-primary-500 transition-colors">Dispute #{c.id.slice(0, 8)}</span>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase border ${c.resolvedAt ? "bg-success-500/10 text-success-600 border-success-500/10" : "bg-warning-500/10 text-warning-600 border-warning-500/10"}`}>
                              {c.resolvedAt ? "Resolved" : "Active"}
                            </span>
                          </div>
                          <Text variant="muted" className="text-xs">
                            Escrow #{c.escrow.slice(0, 8)} • {c.escrowRef ? `${formatAmount(toBigInt(c.escrowRef.amount), agent.stablecoinDecimals || 18)} USDC` : "Loading..."}
                          </Text>
                        </div>
                        <Link href={`/disputes/${c.id}`}>
                          <Button variant="outline" size="sm" className="h-9 px-4 group-hover:border-primary-500 group-hover:text-primary-500">
                            {c.resolvedAt ? "View" : "Review"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Info Column */}
        <div className="space-y-6">
          <Card variant="outlined" className="bg-primary-500/5 border-primary-500/10">
            <CardBody className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-primary-500">
                <TrendingUp size={18} />
                <span className="text-sm font-black uppercase tracking-widest">Fee Configuration</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--text-tertiary)]">Assignment Fee</span>
                  <span className="font-mono font-bold">{agent.assignmentFeeBps / 100}%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--text-tertiary)]">Dispute Resolution</span>
                  <span className="font-mono font-bold">{agent.disputeFeeBps / 100}%</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-primary-500 mt-2 h-8"
                rightIcon={<ChevronRight size={14} />}
                onClick={() => setIsFeeModalOpen(true)}
              >
                Update Fees
              </Button>
            </CardBody>
          </Card>

          {/* Stake & Capacity */}
          <Card variant="elevated" className="border-none shadow-xl shadow-primary-500/5 overflow-hidden">
            <CardBody className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <Icon icon={ShieldCheck} boxed boxColor="primary" size="sm" />
                <Heading level={4} className="text-sm font-black uppercase tracking-widest">Stake & Capacity</Heading>
              </div>

              {/* Stablecoin Stake */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <Text variant="muted" className="text-[10px] font-bold uppercase tracking-widest">Stablecoin Stake (MAV)</Text>
                  <span className="text-xs font-black">${formatAmount(toBigInt(agent.stablecoinStake), agent.stablecoinDecimals || 18)} <span className="text-[10px] text-neutral-400 font-normal">USDC</span></span>
                </div>
                <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: '100%' }} />
                </div>
                <Text variant="muted" className="text-[10px]">
                  Provides <span className="text-[var(--text-primary)] font-bold">${formatAmount(toBigInt(agent.stablecoinStake) * BigInt(parameters?.mavMultiplier || 20), agent.stablecoinDecimals || 18, 0)}</span> MAV coverage.
                </Text>
              </div>

              {/* DAO Token Stake */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <Text variant="muted" className="text-[10px] font-bold uppercase tracking-widest">DAO Token Stake</Text>
                  <span className="text-xs font-black">{formatAmount(toBigInt(agent.daoTokenStake), 18)} <span className="text-[10px] text-neutral-400 font-normal">ZEN</span></span>
                </div>
                <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-success-500 rounded-full" style={{ width: '100%' }} />
                </div>
                <Text variant="muted" className="text-[10px]">
                  Required for governance and protocol security.
                </Text>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[var(--border-secondary)] flex flex-col gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full shadow-lg shadow-primary-500/10"
                  leftIcon={<Plus size={14} />}
                  onClick={() => {
                    setStakeTab("increase");
                    setIsStakeModalOpen(true);
                  }}
                >
                  Increase Stake
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  leftIcon={<Minus size={14} />}
                  onClick={() => {
                    setStakeTab("withdraw");
                    setIsStakeModalOpen(true);
                  }}
                >
                  Withdraw Stake
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <StakeManagementModal
        isOpen={isStakeModalOpen}
        onClose={() => setIsStakeModalOpen(false)}
        agentData={agent}
        mode={stakeTab}
      />

      <FeeManagementModal
        isOpen={isFeeModalOpen}
        onClose={() => setIsFeeModalOpen(false)}
        initialAssignmentFee={agent.assignmentFeeBps}
        initialDisputeFee={agent.disputeFeeBps}
      />

      <AgentAvailabilityModal
        isOpen={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
        isAvailable={agent.isAvailable}
        activeCases={agent.activeCases || 0}
      />
    </div>
  );
}
