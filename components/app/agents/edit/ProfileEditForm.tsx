"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Heading,
  Text,
  toast,
  NumberInput
} from "@/components/ui";
import { useAgentActions } from "@/hooks";
import { useRouter } from "next/navigation";
import {
  MAX_DESCRIPTION_LENGTH,
  MIN_FEE_BPS,
  MAX_FEE_BPS
} from "@/lib/constants/agent";
import {
  buildContactString,
  parseContactString,
  parsedEntryToInput,
  validateContactStringStrict,
  byteLengthUtf8,
} from "@/lib/agents/contactCodec";
import { ContactFields, type ContactFieldsState } from "@/components/app/agents/shared/ContactFields";
import { AlertCircle, CheckCircle2, Loader2, Save, Percent, Settings2 } from "lucide-react";

export type EditMode = "profile" | "fees";

interface ProfileEditFormProps {
  initialDescription: string;
  initialContact: string;
  initialAssignmentFee: number;
  initialDisputeFee: number;
  mode?: EditMode;
}

// Defer state updates to avoid `react-hooks/set-state-in-effect`.
function defer(fn: () => void) {
  setTimeout(fn, 0);
}

/**
 * Form for editing agent profile metadata.
 */
export function ProfileEditForm({
  initialDescription,
  initialContact,
  initialAssignmentFee,
  initialDisputeFee,
  mode = "profile"
}: ProfileEditFormProps) {
  const router = useRouter();
  const [description, setDescription] = useState(initialDescription);

  const contactStateFromContactString = (contact: string): ContactFieldsState => {
    const parsed = parseContactString(contact);
    const primaryParsed = parsed[0];
    const secondaryParsed = parsed[1];
    return {
      primary: primaryParsed ? parsedEntryToInput(primaryParsed) : { kind: "", value: "", customName: "" },
      secondary: secondaryParsed ? parsedEntryToInput(secondaryParsed) : { kind: "", value: "", customName: "" },
    };
  };

  const [contactState, setContactState] = useState<ContactFieldsState>(contactStateFromContactString(initialContact));

  const [assignmentFee, setAssignmentFee] = useState((initialAssignmentFee / 100).toString());
  const [disputeFee, setDisputeFee] = useState((initialDisputeFee / 100).toString());
  const [activeAction, setActiveAction] = useState<"profile" | "assignment" | "dispute" | null>(null);

  const isProfileMode = mode === "profile";

  const {
    updateProfile,
    updateDisputeFee,
    updateAssignmentFee,
    isLoading,
    isSubmitting,
    isConfirming,
    isSuccess
  } = useAgentActions();

  // Sync local state with props when on-chain data changes
  useEffect(() => {
    if (isLoading) return;
    defer(() => {
      setDescription(initialDescription);
      setContactState(contactStateFromContactString(initialContact));
    });
  }, [initialDescription, initialContact, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    defer(() => setAssignmentFee((initialAssignmentFee / 100).toString()));
  }, [initialAssignmentFee, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    defer(() => setDisputeFee((initialDisputeFee / 100).toString()));
  }, [initialDisputeFee, isLoading]);

  // Clear active action on success or error (isSuccess handles success path)
  useEffect(() => {
    if (isLoading) return;
    defer(() => setActiveAction(null));
  }, [isLoading]);

  // Redirect on success (Only for profile mode)
  useEffect(() => {
    if (isSuccess && isProfileMode) {
      toast.success("Profile updated successfully!");
      const timer = setTimeout(() => {
        router.push("/agents/dashboard");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, isProfileMode, router]);

  const currentContact = buildContactString(contactState.primary, contactState.secondary);
  const profileContactValid = validateContactStringStrict(currentContact, { requirePrimary: true }).length === 0;

  const profileChanged = description.trim() !== initialDescription.trim() || currentContact !== initialContact.trim();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileChanged) {
      const descriptionBytes = byteLengthUtf8(description.trim());
      if (descriptionBytes > MAX_DESCRIPTION_LENGTH) {
        toast.error(`Description exceeds ${MAX_DESCRIPTION_LENGTH} bytes (${descriptionBytes}/${MAX_DESCRIPTION_LENGTH})`);
        return;
      }

      const contactErrors = validateContactStringStrict(currentContact, { requirePrimary: true });
      if (contactErrors.length > 0) {
        toast.error(contactErrors[0].message);
        return;
      }

      setActiveAction("profile");
      await updateProfile(description, currentContact);
    } else {
      toast.info("No profile changes detected");
    }
  };

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

  const handleUpdateAssignmentFee = async () => {
    if (assignmentFeeError) return;
    if (assignmentFeeBps === initialAssignmentFee) {
      toast.info("No changes to assignment fee");
      return;
    }
    setActiveAction("assignment");
    await updateAssignmentFee(assignmentFeeBps);
  };

  const handleUpdateDisputeFee = async () => {
    if (disputeFeeError) return;
    if (disputeFeeBps === initialDisputeFee) {
      toast.info("No changes to dispute resolution fee");
      return;
    }
    setActiveAction("dispute");
    await updateDisputeFee(disputeFeeBps);
  };

  if (isProfileMode) {
    const descriptionBytes = byteLengthUtf8(description.trim());
    return (
      <Card variant="elevated" className="overflow-hidden border-white/20 dark:border-white/5">
        <form onSubmit={handleUpdateProfile}>
          <CardBody className="p-8 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-[var(--border-secondary)]">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                  <Save size={20} />
                </div>
                <div>
                  <Heading level={3}>Profile Details</Heading>
                  <Text variant="muted">Update your public description and contact info</Text>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-[var(--text-tertiary)] ml-1">
                  Professional Summary
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell users why they should select you as their agent..."
                  disabled={isLoading}
                  className="w-full h-32 px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-[var(--border-secondary)] focus:border-primary-500 outline-none transition-all resize-none text-sm leading-relaxed"
                />
                <div className="flex justify-between items-center px-1">
                  <Text variant="muted" className="text-[10px]">
                    Visible to everyone in the agent list.
                  </Text>
                  <span className={`text-[10px] font-mono ${descriptionBytes > MAX_DESCRIPTION_LENGTH ? "text-error-500" : "text-[var(--text-tertiary)]"}`}>
                    {descriptionBytes}/{MAX_DESCRIPTION_LENGTH} bytes
                  </span>
                </div>
              </div>

              {/* Contact Grid */}
              <ContactFields
                value={contactState}
                onChange={setContactState}
              />
            </div>

            {/* Status Indicators */}
            {(isLoading || isSuccess) && (
              <div className={`p-4 rounded-xl flex items-center gap-3 border ${
                isSuccess
                  ? "bg-success-500/10 border-success-500/20 text-success-600 dark:text-success-400"
                  : "bg-primary-500/10 border-primary-500/20 text-primary-600 dark:text-primary-400"
              }`}>
                {isSuccess ? <CheckCircle2 size={20} /> : <Loader2 size={20} className="animate-spin" />}
                <div className="text-sm font-medium">
                  {isLoading && activeAction === "profile" && "Updating on-chain..."}
                  {isSuccess && "Update successful! Redirecting..."}
                </div>
              </div>
            )}
          </CardBody>

          <CardFooter className="bg-[var(--bg-tertiary)]/30 border-t border-[var(--border-secondary)] p-6 flex justify-end gap-3 rounded-b-xl">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !profileChanged || description.trim() === "" || !profileContactValid}
              isLoading={isLoading && activeAction === "profile"}
              className="px-8 shadow-lg shadow-primary-500/20"
            >
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>
    );
  }

  // Fees Mode
  return (
    <div className="space-y-6">
      {/* Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assignment Fee Card */}
        <Card variant="elevated" className="border-white/20 dark:border-white/5">
          <CardBody className="p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success-500/10 flex items-center justify-center text-success-500">
                <Percent size={20} />
              </div>
              <div>
                <Heading level={4} className="text-lg">Assignment Fee</Heading>
                <Text variant="muted" className="text-xs">Charged when assigned to a case</Text>
              </div>
            </div>

            <NumberInput
              label="Fee Percentage (%)"
              value={assignmentFee}
              onChange={setAssignmentFee}
              placeholder="0.00"
              suffix="%"
              disabled={isLoading}
              error={assignmentFeeError}
            />

            <Button
              onClick={handleUpdateAssignmentFee}
              disabled={isLoading || !!assignmentFeeError || assignmentFeeBps === initialAssignmentFee}
              isLoading={isLoading && activeAction === "assignment"}
              className="w-full"
            >
              Update Assignment Fee
            </Button>

            {/* Inline Status for Assignment Fee */}
            {activeAction === "assignment" && (isLoading || isSuccess) && (
              <div className={`p-3 rounded-xl flex items-center gap-2 border text-xs font-medium animate-slide-up ${
                isSuccess
                  ? "bg-success-500/10 border-success-500/20 text-success-600 dark:text-success-400"
                  : "bg-primary-500/10 border-primary-500/20 text-primary-600 dark:text-primary-400"
              }`}>
                {isSuccess ? <CheckCircle2 size={16} /> : <Loader2 size={16} className="animate-spin" />}
                <div>
                  {isSubmitting && "Waiting for signature..."}
                  {isConfirming && "Confirming on-chain..."}
                  {isSuccess && "Updated successfully!"}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Dispute Fee Card */}
        <Card variant="elevated" className="border-white/20 dark:border-white/5">
          <CardBody className="p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                <Settings2 size={20} />
              </div>
              <div>
                <Heading level={4} className="text-lg">Dispute Fee</Heading>
                <Text variant="muted" className="text-xs">Charged upon successful resolution</Text>
              </div>
            </div>

            <NumberInput
              label="Fee Percentage (%)"
              value={disputeFee}
              onChange={setDisputeFee}
              placeholder="0.00"
              suffix="%"
              disabled={isLoading}
              error={disputeFeeError}
            />

            <Button
              onClick={handleUpdateDisputeFee}
              disabled={isLoading || !!disputeFeeError || disputeFeeBps === initialDisputeFee}
              isLoading={isLoading && activeAction === "dispute"}
              className="w-full"
            >
              Update Dispute Fee
            </Button>

            {/* Inline Status for Dispute Fee */}
            {activeAction === "dispute" && (isLoading || isSuccess) && (
              <div className={`p-3 rounded-xl flex items-center gap-2 border text-xs font-medium animate-slide-up ${
                isSuccess
                  ? "bg-success-500/10 border-success-500/20 text-success-600 dark:text-success-400"
                  : "bg-primary-500/10 border-primary-500/20 text-primary-600 dark:text-primary-400"
              }`}>
                {isSuccess ? <CheckCircle2 size={16} /> : <Loader2 size={16} className="animate-spin" />}
                <div>
                  {isSubmitting && "Waiting for signature..."}
                  {isConfirming && "Confirming on-chain..."}
                  {isSuccess && "Updated successfully!"}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Protocol Limits Banner */}
      <Card variant="outlined" className="bg-warning-500/5 border-warning-500/10">
        <CardBody className="p-4 flex gap-3">
          <AlertCircle className="text-warning-500 shrink-0" size={18} />
          <Text variant="muted" className="text-xs">
            Individual transactions required for each update. Protocol limits: 0.1% to 10.0%.
          </Text>
        </CardBody>
      </Card>

      {/* Navigation Footer */}
      <div className="flex justify-center pt-4">
        <Button variant="ghost" onClick={() => router.back()} disabled={isLoading}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
