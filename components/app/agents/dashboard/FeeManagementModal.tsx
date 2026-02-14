"use client";

import { useMemo, useState } from "react";
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
    Percent,
    Settings2,
    AlertCircle,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import { useAgentActions } from "@/hooks";
import {
    MIN_FEE_BPS,
    MAX_FEE_BPS
} from "@/lib/constants/agent";

interface FeeManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialAssignmentFee: number;
    initialDisputeFee: number;
}

/**
 * Modal for managing agent assignment and dispute resolution fees.
 */
export function FeeManagementModal({
    isOpen,
    onClose,
    initialAssignmentFee,
    initialDisputeFee
}: FeeManagementModalProps) {
    const [activeTab, setActiveTab] = useState<"assignment" | "dispute">("assignment");
    // We keep draft values optional to avoid syncing derived state in effects.
    // If the indexer refetches and props change, the UI will update automatically.
    const [assignmentFeeDraft, setAssignmentFeeDraft] = useState<string | null>(null);
    const [disputeFeeDraft, setDisputeFeeDraft] = useState<string | null>(null);
    const [activeAction, setActiveAction] = useState<"assignment" | "dispute" | null>(null);

    const {
        updateDisputeFee,
        updateAssignmentFee,
        isLoading,
        isSubmitting,
        isConfirming,
        isSuccess
    } = useAgentActions();

    // Button states - MUST coerce to number as indexer may return strings
    const currentAssignmentBps = Number(initialAssignmentFee || 0);
    const currentDisputeBps = Number(initialDisputeFee || 0);

    const assignmentFee = useMemo(
        () => assignmentFeeDraft ?? (currentAssignmentBps / 100).toString(),
        [assignmentFeeDraft, currentAssignmentBps]
    );
    const disputeFee = useMemo(
        () => disputeFeeDraft ?? (currentDisputeBps / 100).toString(),
        [disputeFeeDraft, currentDisputeBps]
    );

    // Validation for fees
    const assignmentFeeVal = parseFloat(assignmentFee);
    const assignmentFeeBps = isNaN(assignmentFeeVal) ? 0 : Math.round(assignmentFeeVal * 100);
    const assignmentFeeError = (assignmentFee && (assignmentFeeBps < MIN_FEE_BPS || assignmentFeeBps > MAX_FEE_BPS))
        ? `Fee must be between ${MIN_FEE_BPS / 100}% and ${MAX_FEE_BPS / 100}%`
        : undefined;

    const disputeFeeVal = parseFloat(disputeFee);
    const disputeFeeBps = isNaN(disputeFeeVal) ? 0 : Math.round(disputeFeeVal * 100);
    const disputeFeeError = (disputeFee && (disputeFeeBps < MIN_FEE_BPS || disputeFeeBps > MAX_FEE_BPS))
        ? `Fee must be between ${MIN_FEE_BPS / 100}% and ${MAX_FEE_BPS / 100}%`
        : undefined;

    // Unchanged if typing current value OR if transaction just succeeded for this tab
    const isAssignmentUnchanged = assignmentFeeBps === currentAssignmentBps || (isSuccess && activeAction === "assignment");
    const isDisputeUnchanged = disputeFeeBps === currentDisputeBps || (isSuccess && activeAction === "dispute");

    const handleUpdateAssignmentFee = async () => {
        if (assignmentFeeError) return;
        if (assignmentFeeBps === currentAssignmentBps) {
            return;
        }
        setActiveAction("assignment");
        await updateAssignmentFee(assignmentFeeBps);
    };

    const handleUpdateDisputeFee = async () => {
        if (disputeFeeError) return;
        if (disputeFeeBps === currentDisputeBps) {
            return;
        }
        setActiveAction("dispute");
        await updateDisputeFee(disputeFeeBps);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalHeader onClose={onClose}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                        <Settings2 size={24} />
                    </div>
                    <div>
                        <Heading level={3}>Fee Configuration</Heading>
                        <Text variant="muted">Set your assignment and dispute resolution fees</Text>
                    </div>
                </div>
            </ModalHeader>

            <div className="grid grid-cols-2 gap-3 p-1 mx-6 mt-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                <button
                    onClick={() => setActiveTab("assignment")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "assignment"
                        ? "bg-white dark:bg-neutral-700 shadow-sm text-primary-500"
                        : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                        }`}
                >
                    <Percent size={14} />
                    Assignment Fee
                </button>
                <button
                    onClick={() => setActiveTab("dispute")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "dispute"
                        ? "bg-white dark:bg-neutral-700 shadow-sm text-primary-500"
                        : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                        }`}
                >
                    <Settings2 size={14} />
                    Dispute Fee
                </button>
            </div>

            <ModalBody className="p-6 space-y-6">
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {activeTab === "assignment" ? (
                        <Card variant="outlined" className="border-[var(--border-secondary)]">
                            <CardBody className="p-5 space-y-5">
                                <div className="flex items-center gap-2">
                                    <Percent size={18} className="text-success-500" />
                                    <span className="text-sm font-bold">Assignment Fee</span>
                                </div>

                                <NumberInput
                                    value={assignmentFee}
                                    onChange={setAssignmentFeeDraft}
                                    placeholder="0.00"
                                    suffix="%"
                                    disabled={isLoading}
                                    error={assignmentFeeError}
                                />

                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleUpdateAssignmentFee}
                                    disabled={isLoading || !!assignmentFeeError || isAssignmentUnchanged}
                                    isLoading={isLoading && activeAction === "assignment"}
                                    className="w-full"
                                >
                                    Update Assignment Fee
                                </Button>
                            </CardBody>
                        </Card>
                    ) : (
                        <Card variant="outlined" className="border-[var(--border-secondary)]">
                            <CardBody className="p-5 space-y-5">
                                <div className="flex items-center gap-2">
                                    <Settings2 size={18} className="text-primary-500" />
                                    <span className="text-sm font-bold">Dispute Resolution Fee</span>
                                </div>

                                <NumberInput
                                    value={disputeFee}
                                    onChange={setDisputeFeeDraft}
                                    placeholder="0.00"
                                    suffix="%"
                                    disabled={isLoading}
                                    error={disputeFeeError}
                                />

                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleUpdateDisputeFee}
                                    disabled={isLoading || !!disputeFeeError || isDisputeUnchanged}
                                    isLoading={isLoading && activeAction === "dispute"}
                                    className="w-full"
                                >
                                    Update Dispute Fee
                                </Button>
                            </CardBody>
                        </Card>
                    )}
                </div>

                {/* Status Indicators */}
                {isLoading && (
                    <div className="p-4 rounded-xl flex items-center gap-3 bg-primary-500/5 border border-primary-500/10 text-primary-600 dark:text-primary-400">
                        <Loader2 size={20} className="animate-spin" />
                        <div className="text-sm font-medium">
                            {isSubmitting && "Waiting for signature..."}
                            {isConfirming && "Confirming on-chain..."}
                            {!isSubmitting && !isConfirming && "Indexing update..."}
                        </div>
                    </div>
                )}

                {isSuccess && (
                    <div className="p-4 rounded-xl flex items-center gap-3 bg-success-500/5 border border-success-500/10 text-success-600 dark:text-success-400">
                        <CheckCircle2 size={20} />
                        <div className="text-sm font-medium">Fee updated successfully!</div>
                    </div>
                )}

                {/* Protocol Limits Banner */}
                <div className="p-3 bg-warning-500/5 border border-warning-500/10 rounded-lg flex gap-3">
                    <AlertCircle className="text-warning-500 shrink-0" size={16} />
                    <Text variant="muted" className="text-[10px] leading-relaxed">
                        Individual transactions required for each update. Protocol limits: 0.1% to 10.0%.
                    </Text>
                </div>
            </ModalBody>
        </Modal>
    );
}
