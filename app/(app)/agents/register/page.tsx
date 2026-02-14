"use client";

import Link from "next/link";
import { Card, CardBody } from "@/components/ui";
import { RegistrationForm } from "@/components/app/agents/register";

export default function AgentRegisterPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <Link
          href="/agents"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Agents
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mt-2">
          Become an Agent
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Register as a dispute resolution agent and help the community
        </p>
      </div>

      {/* Requirements Info */}
      <Card variant="outlined">
        <CardBody className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900)] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[var(--color-primary-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">
                Agent Requirements
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-[var(--text-secondary)]">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-primary-500)]">•</span>
                  <span>Stablecoin stake determines your Maximum Arbitratable Value (MAV = 20× stake)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-primary-500)]">•</span>
                  <span>DAO token stake required for protocol alignment (can be slashed for misconduct)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-primary-500)]">•</span>
                  <span>Respond to assigned disputes within the deadline (7 days by default)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-primary-500)]">•</span>
                  <span>Fair and impartial dispute resolution expected</span>
                </li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Registration Form */}
      <RegistrationForm />

      {/* FAQ */}
      <Card variant="outlined">
        <CardBody className="p-5">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-[var(--text-primary)]">
                What is MAV (Maximum Arbitratable Value)?
              </h4>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                MAV determines the maximum escrow value you can be assigned to resolve.
                It&apos;s calculated as 20× your stablecoin stake. For example, a $100 stake
                gives you a $2,000 MAV.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[var(--text-primary)]">
                What are the two fees for?
              </h4>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                <strong>Assignment Fee:</strong> Charged when you&apos;re assigned to an escrow
                (even without disputes). <strong>Dispute Fee:</strong> Charged only when you
                resolve a dispute. Both are percentages of the escrow amount.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[var(--text-primary)]">
                When can my stake be slashed?
              </h4>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Your DAO token stake can be slashed by DAO governance if you fail to respond
                to disputes within the deadline or if misconduct is determined through a
                governance proposal.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[var(--text-primary)]">
                Can I withdraw my stake?
              </h4>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Yes, you can unstake when you have no active cases. First, set yourself as
                unavailable, then wait 30 days (engagement cooldown), after which you can
                execute the unstake to withdraw both stakes.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[var(--text-primary)]">
                What is &quot;Gasless&quot; approval?
              </h4>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Tokens that support EIP-2612 permit allow you to sign an approval message
                instead of sending a separate transaction. This saves gas costs. USDC and
                the DAO token support this feature; USDT does not.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
