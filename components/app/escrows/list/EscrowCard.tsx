"use client";

import Link from "next/link";
import { Card, CardBody, Text, Heading, Badge } from "@/components/ui";
import { formatAmount } from "@/components/app/escrows/create/schema";
import { Clock, Shield } from "lucide-react";
import type { GqlEscrow } from "@zenland/sdk/react";

interface EscrowCardProps {
  escrow: Pick<GqlEscrow, "id" | "buyer" | "seller" | "amount" | "token" | "state" | "createdAt" | "buyerProtectionTime">;
  currentUserAddress?: string;
}

const STATE_COLORS: Record<string, "primary" | "success" | "warning" | "danger" | "neutral"> = {
  INITIALIZED: "neutral",
  FUNDED: "primary",
  FULFILLED: "success",
  COMPLETED: "success",
  DISPUTED: "danger",
  REFUNDED: "neutral",
  RELEASED: "success",
};

export function EscrowCard({ escrow, currentUserAddress }: EscrowCardProps) {
  const isBuyer = currentUserAddress?.toLowerCase() === escrow.buyer.toLowerCase();
  const isSeller = currentUserAddress?.toLowerCase() === escrow.seller.toLowerCase();

  const role = isBuyer && isSeller ? "Both" : isBuyer ? "Buyer" : isSeller ? "Seller" : "Observer";
  const date = new Date(Number(escrow.createdAt) * 1000).toLocaleDateString();

  return (
    <Link href={`/escrows/${escrow.id}`} className="group block text-left">
      <Card
        variant="elevated"
        className="transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl dark:group-hover:shadow-primary-900/10 border-white/50 dark:border-neutral-800"
      >
        <CardBody className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={STATE_COLORS[escrow.state] || "neutral"} size="sm">
                  {escrow.state}
                </Badge>
                <Text variant="muted" className="text-xs font-mono">
                  {escrow.id.slice(0, 10)}...
                </Text>
              </div>
              <Heading level={4} className="group-hover:text-primary-500 transition-colors mt-2">
                Escrow Interaction
              </Heading>
            </div>
            <div className="text-right">
              <Text className="text-xl font-bold text-primary-600 dark:text-primary-400">
                {formatAmount(BigInt(escrow.amount), 6)} USDT
              </Text>
              <Text variant="muted" className="text-xs flex items-center justify-end gap-1 mt-1">
                <Clock size={12} />
                {date}
              </Text>
              {Number(escrow.buyerProtectionTime) > 0 && (
                <div className="mt-2 flex items-center justify-end gap-1.5 text-primary-500">
                  <Shield size={10} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {Math.floor(Number(escrow.buyerProtectionTime) / 86400)}d Protected
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border-secondary)] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isBuyer ? "bg-primary-500" : "bg-neutral-300"}`} />
                <Text className="text-xs font-medium">Buyer</Text>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isSeller ? "bg-success-500" : "bg-neutral-300"}`} />
                <Text className="text-xs font-medium">Seller</Text>
              </div>
            </div>

            <Badge variant="neutral" className="text-[10px] uppercase tracking-wider font-bold">
              Role: {role}
            </Badge>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
