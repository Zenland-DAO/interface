"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Heading,
  Text,
  NumberInput,
  Card,
  CardBody,
} from "@/components/ui";
import {
  ShieldCheck,
  Lock,
  Unlock,
  Clock,
} from "lucide-react";
import {
  useAgentActions,
  useTokenApproval,
  useTokenBalance,
  useRegistryParameters,
} from "@/hooks";
import {
  parseUnits,
} from "viem";
import type { Address } from "viem";
import {
  getDaoToken,
  getTokenByAddress,
  getContractAddresses,
  toPermitParams,
} from "@/lib/contracts";
import { formatAmount } from "@/lib/utils";
import { useChainId } from "wagmi";
import { useConnection } from "wagmi";

interface StakeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentData: AgentData; // From indexer
  defaultTab?: "increase" | "withdraw";
  mode?: "increase" | "withdraw"; // If provided, locks the modal to this specific mode
}

// Minimal shape used by this modal. (Indexer types are intentionally not coupled here.)
interface AgentData {
  stablecoinToken?: string;
  isAvailable?: boolean;
  activeCases?: number;
  lastEngagementTimestamp?: string | number;
}

/**
 * Modal for managing agent staking and withdrawal.
 */
export function StakeManagementModal({
  isOpen,
  onClose,
  agentData,
  defaultTab = "increase",
  mode
}: StakeManagementModalProps) {
  const chainId = useChainId();
  // If mode is locked, we respect that, otherwise fall back to internal state or defaultTab
  const [internalTab, setInternalTab] = useState<"increase" | "withdraw">(defaultTab);

  const activeTab = mode || internalTab;

  // Header content changes based on mode
  const headerContent = useMemo(() => {
    if (activeTab === "increase") {
      return {
        title: "Increase Stake",
        description: "Add collateral to increase your Maximum Arbitratable Value (MAV)"
      };
    }
    return {
      title: "Withdraw Stake",
      description: "Manage your retirement and withdraw available collateral"
    };
  }, [activeTab]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
            <ShieldCheck size={24} />
          </div>
          <div>
            <Heading level={3}>{headerContent.title}</Heading>
            <Text variant="muted">{headerContent.description}</Text>
          </div>
        </div>
      </ModalHeader>

      {/* Only show tabs if no specific mode is enforced */}
      {!mode && (
        <div className="flex border-b border-[var(--border-secondary)] px-6">
          <button
            onClick={() => setInternalTab("increase")}
            className={`px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === "increase"
                ? "border-primary-500 text-primary-500"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            Increase Stake
          </button>
          <button
            onClick={() => setInternalTab("withdraw")}
            className={`px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === "withdraw"
                ? "border-primary-500 text-primary-500"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            Withdraw Stake
          </button>
        </div>
      )}

      <ModalBody className="p-6">
        {activeTab === "increase" ? (
          <IncreaseStakeTab agentData={agentData} chainId={chainId} />
        ) : (
          <WithdrawStakeTab agentData={agentData} onClose={onClose} />
        )}
      </ModalBody>
    </Modal>
  );
}

function IncreaseStakeTab({
  agentData,
  chainId,
}: {
  agentData: AgentData;
  chainId: number;
}) {
  const { address: userAddress } = useConnection();
  const [tokenType, setTokenType] = useState<"stable" | "dao">("stable");
  const [amount, setAmount] = useState("");
  const [permitSigned, setPermitSigned] = useState(false);

  const stablecoinConfig = useMemo(() => {
    if (!agentData?.stablecoinToken) return undefined;
    // agentData comes from indexer, so it may not be a strict Address type.
    return getTokenByAddress(chainId, agentData.stablecoinToken as Address);
  }, [chainId, agentData?.stablecoinToken]);

  const daoTokenConfig = useMemo(() => getDaoToken(chainId), [chainId]);

  const selectedTokenConfig = tokenType === "stable" ? stablecoinConfig : daoTokenConfig;

  const parsedAmount = useMemo(() => {
    if (!amount || !selectedTokenConfig) return BigInt(0);
    try {
      return parseUnits(amount, selectedTokenConfig.decimals);
    } catch {
      return BigInt(0);
    }
  }, [amount, selectedTokenConfig]);

  const addresses = useMemo(() => getContractAddresses(chainId), [chainId]);
  const agentRegistryAddress = addresses?.agentRegistry;

  const { balance: tokenBalance, isLoading: isBalanceLoading } = useTokenBalance({
    tokenAddress: selectedTokenConfig?.address,
    ownerAddress: userAddress as Address | undefined,
    enabled: !!selectedTokenConfig?.address && !!userAddress,
  });

  const hasSufficientBalance = useMemo(() => {
    if (!selectedTokenConfig) return true;
    if (!amount || parsedAmount <= 0n) return true;
    if (tokenBalance === undefined) return true; // don't block while loading
    return tokenBalance >= parsedAmount;
  }, [selectedTokenConfig, amount, parsedAmount, tokenBalance]);

  const {
    isApproved,
    isApproving,
    isPermit,
    permitSignature,
    approve
  } = useTokenApproval(
    selectedTokenConfig?.address,
    agentRegistryAddress,
    parsedAmount
  );

  // If user changes token/amount or approvals become satisfied via allowance,
  // we should reset the permit hint so it doesn't stick around.
  useEffect(() => {
    if (!selectedTokenConfig) {
      setPermitSigned(false);
      return;
    }
    // Once we're actually approved (either allowance or permit state), we only
    // want to show the hint right after signing permit (not indefinitely).
    if (!isApproved) {
      setPermitSigned(false);
    }
  }, [selectedTokenConfig, isApproved, parsedAmount]);

  const {
    increaseStablecoinStake,
    increaseStablecoinStakeWithPermit,
    increaseDaoTokenStake,
    increaseDaoTokenStakeWithPermit,
    isSubmitting,
    isConfirming,
    isSuccess
  } = useAgentActions();

  const handleAction = async () => {
    if (!selectedTokenConfig) return;
    if (!agentRegistryAddress) return;
    if (parsedAmount <= 0n) return;

    // Two-step UX:
    // 1) First click: sign permit (USDC/ZEN) or submit approve tx (USDT), then stop.
    // 2) Second click: submit the staking tx (with permit if available).
    //
    // This also avoids a subtle bug where we sign a permit and then immediately
    // compute `isPermit` in the same click (React state updates async), causing
    // us to accidentally call the non-permit stake function.
    if (!isApproved) {
      setPermitSigned(false);
      const ok = await approve();
      if (!ok) return;

      // If this token supports permit, `approve()` signed typed data and cached
      // the signature. Ask user to click again to submit the actual stake tx.
      if (selectedTokenConfig.supportsPermit) {
        setPermitSigned(true);
      }
      return;
    }

    const permit = toPermitParams(permitSignature);
    const shouldUsePermitPath = isPermit && permit.deadline !== 0n;

    let success = false;
    if (tokenType === "stable") {
      success = shouldUsePermitPath
        ? await increaseStablecoinStakeWithPermit(parsedAmount, permit)
        : await increaseStablecoinStake(parsedAmount);
    } else {
      success = shouldUsePermitPath
        ? await increaseDaoTokenStakeWithPermit(parsedAmount, permit)
        : await increaseDaoTokenStake(parsedAmount);
    }

    if (success) {
      setAmount("");
      setPermitSigned(false);
    }
  };

  const isPending = isSubmitting || isConfirming || isApproving;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
        <button
          onClick={() => setTokenType("stable")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
            tokenType === "stable"
              ? "bg-white dark:bg-neutral-700 shadow-sm text-primary-500"
              : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          }`}
        >
          {stablecoinConfig?.symbol || "Stablecoin"}
        </button>
        <button
          onClick={() => setTokenType("dao")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
            tokenType === "dao"
              ? "bg-white dark:bg-neutral-700 shadow-sm text-primary-500"
              : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          }`}
        >
          ZEN
        </button>
      </div>

      <div className="space-y-2">
        <NumberInput
          label={`Amount of ${selectedTokenConfig?.symbol}`}
          value={amount}
          onChange={setAmount}
          placeholder="0.00"
          disabled={isPending}
        />
        {selectedTokenConfig && userAddress && (
          <div className="flex items-center justify-between px-1">
            <Text variant="muted" className="text-xs">
              Balance: {tokenBalance === undefined && isBalanceLoading
                ? "Loading…"
                : tokenBalance === undefined
                  ? "—"
                  : `${formatAmount(tokenBalance, selectedTokenConfig.decimals, 4)} ${selectedTokenConfig.symbol}`}
            </Text>
          </div>
        )}
        {!hasSufficientBalance && (
          <Text className="text-xs px-1 text-error-600 dark:text-error-400">
            Insufficient balance
          </Text>
        )}
        <Text variant="muted" className="text-xs px-1">
          Increasing your stake increases your Maximum Arbitratable Value (MAV).
        </Text>
      </div>

      <Button
        variant="primary"
        className="w-full"
        onClick={handleAction}
        isLoading={isPending}
        disabled={!amount || parseFloat(amount) <= 0 || !hasSufficientBalance}
      >
        {!isApproved
          ? selectedTokenConfig?.supportsPermit
            ? `Sign Permit for ${selectedTokenConfig?.symbol}`
            : `Approve ${selectedTokenConfig?.symbol}`
          : `Stake ${selectedTokenConfig?.symbol}`}
      </Button>

      {permitSigned && !isPending && (
        <Text variant="muted" className="text-xs px-1">
          Permit signed — click again to stake
        </Text>
      )}

      {isSuccess && (
        <Card variant="outlined" className="bg-success-500/10 border-success-500/20">
          <CardBody className="py-3 px-4 flex items-center gap-3 text-success-600 dark:text-success-400">
            <ShieldCheck size={18} />
            <Text className="text-sm font-medium">Stake updated successfully!</Text>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function WithdrawStakeTab({
  agentData,
  onClose,
}: {
  agentData: AgentData;
  onClose: () => void;
}) {
  const {
    executeUnstake,
    isSubmitting,
    isConfirming
  } = useAgentActions();

  const { parameters } = useRegistryParameters();

  const isAvailable = agentData?.isAvailable;
  const activeCases = agentData?.activeCases || 0;

  // NOTE: avoid calling Date.now() during render (React rule of purity).
  // We only need minute-level precision for enabling the button.
  const [nowSec, setNowSec] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const t = setInterval(() => setNowSec(Math.floor(Date.now() / 1000)), 30_000);
    return () => clearInterval(t);
  }, []);

  // For withdrawal, we need to know the on-chain cooldown.
  // (Fallback to 30 days if parameters haven't loaded yet.)
  const lastEngagement = agentData?.lastEngagementTimestamp
    ? parseInt(String(agentData.lastEngagementTimestamp))
    : 0;
  const cooldownPeriod = parameters?.unstakeCooldown ?? 30 * 24 * 60 * 60;
  const cooldownEnd = lastEngagement + cooldownPeriod;
  const canUnstake = !isAvailable && activeCases === 0 && nowSec > cooldownEnd;

  const handleUnstake = async () => {
    const ok = await executeUnstake();
    if (ok) onClose();
  };

  const isPending = isSubmitting || isConfirming;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Status Card */}
        <Card variant="outlined" className={isAvailable ? "bg-primary-500/5 border-primary-500/10" : "bg-warning-500/5 border-warning-500/10"}>
          <CardBody className="p-4 flex items-start gap-4">
            <div className={`mt-1 p-2 rounded-lg ${isAvailable ? "bg-primary-500/10 text-primary-500" : "bg-warning-500/10 text-warning-500"}`}>
              {isAvailable ? <Unlock size={20} /> : <Lock size={20} />}
            </div>
            <div className="space-y-1">
              <Heading level={4}>{isAvailable ? "Status: Active" : "Status: Retiring"}</Heading>
              <Text variant="muted" className="text-xs">
                {isAvailable
                  ? "You are currently accepting new disputes. To withdraw your stake, you must first disable availability."
                  : "Availability disabled. You are no longer assigned to new cases."}
              </Text>
            </div>
          </CardBody>
        </Card>

        {/* Withdrawal Prerequisites */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${activeCases === 0 ? "bg-success-500/10 text-success-500" : "bg-neutral-100 dark:bg-neutral-800 text-[var(--text-tertiary)]"}`}>
              {activeCases === 0 ? "✓" : "1"}
            </div>
            <Text className="text-sm font-medium">All active cases resolved ({activeCases} pending)</Text>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${!isAvailable ? "bg-success-500/10 text-success-500" : "bg-neutral-100 dark:bg-neutral-800 text-[var(--text-tertiary)]"}`}>
              {!isAvailable ? "✓" : "2"}
            </div>
            <Text className="text-sm font-medium">Availability set to Disabled</Text>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${nowSec > cooldownEnd ? "bg-success-500/10 text-success-500" : "bg-neutral-100 dark:bg-neutral-800 text-[var(--text-tertiary)]"}`}>
              {nowSec > cooldownEnd ? "✓" : "3"}
            </div>
            <div className="flex-1">
              <Text className="text-sm font-medium">Security cooldown passed</Text>
              {lastEngagement > 0 && nowSec < cooldownEnd && (
                <Text variant="muted" className="text-[10px]">
                  Ends: {new Date(cooldownEnd * 1000).toLocaleDateString()}
                </Text>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <Button
          variant="primary"
          className="w-full"
          disabled={!canUnstake}
          onClick={handleUnstake}
          isLoading={isPending}
        >
          Withdraw All Stake
        </Button>
      </div>

      {!canUnstake && !isAvailable && (
        <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg flex gap-3">
          <Clock className="text-[var(--text-tertiary)] shrink-0" size={16} />
          <Text className="text-[10px] italic leading-relaxed">
            The security cooldown ensures that no malicious actions were taken before exiting the protocol.
            Once all conditions are met, the button above will enable.
          </Text>
        </div>
      )}
    </div>
  );
}
