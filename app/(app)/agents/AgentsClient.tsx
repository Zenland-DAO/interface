"use client";

import Link from "next/link";
import {
  Button,
  Card,
  CardBody,
  Select,
  Heading,
  Text,
  Icon
} from "@/components/ui";
import { useAgents } from "@/hooks";
import {
  Search,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Shield,
  Info,
  Clock,
  Crown,
  Wallet,
  Coins,
  CircleDollarSign,
  FileText,
  CircleOff
} from "lucide-react";
import { useState } from "react";
import { useAgentSelectionSender } from "@/components/app/escrows/create/useAgentSelectionSender";
import { useConnection } from "wagmi";
import { formatAmount } from "@/components/app/escrows/create/schema";
import { ContactDisplay } from "@/components/app/agents/shared";

/** Multiplier for calculating maximum arbitrage coverage */
const ARBITRAGE_MULTIPLIER = 20;

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

/**
 * Calculate maximum coverage amount based on stablecoin stake
 */
function calculateMaxCoverage(stablecoinStake: string, decimals: number): string {
  const stake = BigInt(stablecoinStake);
  const maxCoverage = stake * BigInt(ARBITRAGE_MULTIPLIER);
  return formatAmount(maxCoverage, decimals, 0);
}

const SORT_OPTIONS = [
  { label: "Reputation", value: "reputation" },
  { label: "Stake Amount", value: "stake" },
  { label: "Lowest Fees", value: "fees" },
  { label: "Most Active", value: "cases" },
];

interface AgentsClientProps {
  isSelectMode?: boolean;
}

export function AgentsClient({ isSelectMode = false }: AgentsClientProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("reputation");
  const { address: userAddress } = useConnection();
  const { data, isLoading, error } = useAgents({ onlyActive: true });
  const { sendSelection } = useAgentSelectionSender();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-12 flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
          <div className="h-12 w-48 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-72" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="outlined" className="border-error-200 dark:border-error-900/30">
        <CardBody className="p-12 text-center flex flex-col items-center gap-4">
          <Icon icon={Shield} boxed boxColor="error" size="lg" />
          <div className="space-y-1">
            <Heading level={3}>Registry Error</Heading>
            <Text variant="muted">Unable to fetch agents from the registry. Please check your connection.</Text>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry Connection</Button>
        </CardBody>
      </Card>
    );
  }

  const agents = data?.items ?? [];
  const filteredAgents = agents.filter(agent =>
    agent.id.toLowerCase().includes(search.toLowerCase()) ||
    (agent.description && agent.description.toLowerCase().includes(search.toLowerCase())) ||
    (agent.contact && agent.contact.toLowerCase().includes(search.toLowerCase()))
  );

  // Handle select button click
  const handleSelect = (e: React.MouseEvent, agentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    sendSelection(agentId);
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Select Mode Banner */}
      {isSelectMode && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800">
          <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <Info size={20} />
          </div>
          <div className="flex-1">
            <Text className="font-semibold text-primary-800 dark:text-primary-200">
              Selecting agent for escrow creation
            </Text>
            <Text variant="muted" className="text-sm">
              Click &quot;Select&quot; on an agent card or view their profile for more details
            </Text>
          </div>
        </div>
      )}

      {/* Filters Header */}
      <div className="flex flex-col md:flex-row gap-4 items-end pt-2">
        <div className="flex-1 w-full space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] ml-1">
            Search Agents
          </label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-primary-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by name, address or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--border-secondary)] bg-[var(--bg-primary)] text-[var(--text-primary)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-neutral-300 dark:hover:border-neutral-700"
            />
          </div>
        </div>
        <div className="w-full md:w-64">
          <Select
            label="Sort By"
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={setSortBy}
          />
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => {
          const isCurrentUser = userAddress && agent.id.toLowerCase() === userAddress.toLowerCase();
          const maxCoverage = calculateMaxCoverage(String(agent.stablecoinStake), agent.stablecoinDecimals || 6);
          
          return (
            <Link
              key={agent.id}
              href={isSelectMode ? `/agents/${agent.id}?mode=select` : `/agents/${agent.id}`}
              className="group"
            >
              <Card
                variant="elevated"
                className="h-full border-white/50 dark:border-neutral-800 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl dark:group-hover:shadow-primary-900/10"
              >
                <CardBody className="p-5 h-full flex flex-col">
                  {/* Header: Avatar + Name + Status */}
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/20">
                        {agent.id.slice(2, 3).toUpperCase()}
                      </div>
                      {isCurrentUser && (
                        <div className="absolute -top-2 -left-2 px-1.5 py-0.5 rounded-md bg-amber-400 text-[8px] font-black text-amber-950 shadow-lg border border-amber-300 z-10 flex items-center gap-0.5">
                          <Crown size={8} fill="currentColor" />
                          YOU
                        </div>
                      )}
                    </div>
                    
                    {/* Name & Address */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Heading level={4} className="truncate group-hover:text-primary-500 transition-colors text-base">
                          {shortAddress(agent.id)}
                        </Heading>
                        {/* Status Badges */}
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border ${
                            agent.isActive
                              ? "bg-success-50 text-success-700 border-success-200 dark:bg-success-900/10 dark:text-success-400 dark:border-success-800"
                              : "bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${agent.isActive ? "bg-success-500" : "bg-neutral-400"}`} />
                            {agent.isActive ? "Active" : "Inactive"}
                          </span>
                          {!agent.isAvailable && agent.isActive && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border bg-warning-50 text-warning-700 border-warning-200 dark:bg-warning-900/10 dark:text-warning-400 dark:border-warning-800">
                              <CircleOff size={8} />
                              Busy
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Contact Icons */}
                      <div className="mt-1.5">
                        <ContactDisplay contact={agent.contact} variant="compact" />
                      </div>
                    </div>
                  </div>

                  {/* Stakes Section */}
                  <div className="mt-4 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-[var(--border-secondary)]">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
                          <Wallet size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Stablecoin</span>
                        </div>
                        <Text className="font-bold text-sm">
                          {formatAmount(BigInt(agent.stablecoinStake), agent.stablecoinDecimals || 6, 0)} <span className="text-[10px] font-normal text-[var(--text-tertiary)]">USD</span>
                        </Text>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
                          <Coins size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">DAO Token</span>
                        </div>
                        <Text className="font-bold text-sm">
                          {formatAmount(BigInt(agent.daoTokenStake), 18, 0)} <span className="text-[10px] font-normal text-[var(--text-tertiary)]">ZEN</span>
                        </Text>
                      </div>
                    </div>
                    {/* Max Coverage */}
                    <div className="mt-3 pt-3 border-t border-[var(--border-secondary)]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
                          <TrendingUp size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Max Coverage</span>
                        </div>
                        <Text className="font-bold text-sm text-primary-600 dark:text-primary-400">
                          ${maxCoverage}
                        </Text>
                      </div>
                    </div>
                  </div>

                  {/* Fees Section */}
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-lg border border-[var(--border-secondary)] text-center">
                      <div className="flex items-center justify-center gap-1 text-[var(--text-tertiary)] mb-1">
                        <CircleDollarSign size={10} />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Dispute Fee</span>
                      </div>
                      <Text className="font-bold text-lg leading-none">{(agent.disputeFeeBps / 100).toFixed(1)}%</Text>
                    </div>
                    <div className="p-2.5 rounded-lg border border-[var(--border-secondary)] text-center">
                      <div className="flex items-center justify-center gap-1 text-[var(--text-tertiary)] mb-1">
                        <FileText size={10} />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Assign Fee</span>
                      </div>
                      <Text className="font-bold text-lg leading-none">{(agent.assignmentFeeBps / 100).toFixed(1)}%</Text>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-3 flex-1">
                    <Text variant="muted" className="text-xs line-clamp-2 leading-relaxed">
                      {agent.description || "No professional summary provided by this agent."}
                    </Text>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-4 pt-3 border-t border-[var(--border-secondary)]">
                    {isSelectMode ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={(e) => handleSelect(e, agent.id)}
                        >
                          <CheckCircle2 size={14} className="mr-1" />
                          Select
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs px-3"
                        >
                          Details
                          <ArrowRight size={12} className="ml-1" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        {agent.registrationTime && (
                          <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
                            <Clock size={10} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              Joined {new Date(Number(agent.registrationTime) * 1000).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-primary-500 font-semibold text-sm">
                          <span>View</span>
                          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAgents.length === 0 && (
        <Card variant="outlined" className="border-dashed">
          <CardBody className="p-12 text-center flex flex-col items-center gap-4">
            <Icon icon={Search} boxed boxColor="neutral" size="lg" />
            <div className="space-y-1">
              <Heading level={3}>No Agents Found</Heading>
              <Text variant="muted">
                {search 
                  ? "Try adjusting your search terms or filters."
                  : "There are no active agents in the registry yet."
                }
              </Text>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
