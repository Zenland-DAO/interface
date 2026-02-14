"use client";

/**
 * WizardProgress Component
 *
 * Horizontal step indicator for the escrow creation wizard.
 * Shows current progress and allows navigation to completed steps.
 */

import { useMemo } from "react";
import { Check } from "lucide-react";
import { type WizardStep } from "./types";

// =============================================================================
// TYPES
// =============================================================================

export interface WizardProgressProps {
  /** Current active step */
  currentStep: WizardStep;
  /** Callback when a step is clicked */
  onStepClick?: (step: WizardStep) => void;
  /** Whether step navigation is disabled */
  disabled?: boolean;
}

interface StepConfig {
  key: WizardStep;
  label: string;
  shortLabel: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STEPS: StepConfig[] = [
  { key: "form", label: "Fill Details", shortLabel: "Details" },
  { key: "review", label: "Review", shortLabel: "Review" },
  { key: "approve", label: "Approve", shortLabel: "Approve" },
  { key: "confirm", label: "Confirm", shortLabel: "Confirm" },
  { key: "success", label: "Complete", shortLabel: "Done" },
];

const STEP_ORDER: WizardStep[] = ["form", "review", "approve", "confirm", "success"];

// =============================================================================
// HELPERS
// =============================================================================

function getStepIndex(step: WizardStep): number {
  return STEP_ORDER.indexOf(step);
}

function isStepCompleted(step: WizardStep, currentStep: WizardStep): boolean {
  return getStepIndex(step) < getStepIndex(currentStep);
}

function isStepClickable(step: WizardStep, currentStep: WizardStep): boolean {
  // Can click on completed steps (except success - no going back from there)
  // Can't click on future steps
  // Can't click on current step
  if (currentStep === "success") return false;
  if (step === currentStep) return false;
  if (step === "success") return false;
  return isStepCompleted(step, currentStep);
}

// =============================================================================
// COMPONENT
// =============================================================================

export function WizardProgress({
  currentStep,
  onStepClick,
  disabled = false,
}: WizardProgressProps) {
  const currentIndex = useMemo(() => getStepIndex(currentStep), [currentStep]);

  return (
    <nav aria-label="Escrow creation progress" className="w-full">
      {/* Desktop View */}
      <ol className="hidden sm:flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = isStepCompleted(step.key, currentStep);
          const isCurrent = step.key === currentStep;
          const isClickable = !disabled && isStepClickable(step.key, currentStep);

          return (
            <li
              key={step.key}
              className={`
                flex items-center
                ${index < STEPS.length - 1 ? "flex-1" : ""}
              `}
            >
              {/* Step Circle + Label */}
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(step.key)}
                disabled={!isClickable}
                className={`
                  flex items-center gap-3 group
                  ${isClickable ? "cursor-pointer" : "cursor-default"}
                `}
              >
                {/* Circle */}
                <div
                  className={`
                    relative w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-300 shrink-0
                    ${
                      isCompleted
                        ? "bg-primary-500 text-white"
                        : isCurrent
                        ? "bg-primary-500 text-white ring-4 ring-primary-100 dark:ring-primary-900/30"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400"
                    }
                    ${isClickable ? "group-hover:ring-4 group-hover:ring-primary-100 dark:group-hover:ring-primary-900/30" : ""}
                  `}
                >
                  {isCompleted ? (
                    <Check size={20} strokeWidth={3} />
                  ) : (
                    <span className="font-bold text-sm">{index + 1}</span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`
                    font-medium text-sm whitespace-nowrap
                    transition-colors duration-200
                    ${
                      isCompleted || isCurrent
                        ? "text-[var(--text-primary)]"
                        : "text-[var(--text-tertiary)]"
                    }
                    ${isClickable ? "group-hover:text-primary-500" : ""}
                  `}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 mx-4">
                  <div
                    className={`
                      h-0.5 w-full transition-colors duration-300
                      ${
                        isCompleted
                          ? "bg-primary-500"
                          : "bg-neutral-200 dark:bg-neutral-700"
                      }
                    `}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile View - Compact */}
      <div className="sm:hidden">
        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-3">
          {STEPS.map((step) => {
            const isCompleted = isStepCompleted(step.key, currentStep);
            const isCurrent = step.key === currentStep;

            return (
              <div
                key={step.key}
                className={`
                  h-1.5 flex-1 rounded-full transition-colors duration-300
                  ${
                    isCompleted
                      ? "bg-primary-500"
                      : isCurrent
                      ? "bg-primary-500"
                      : "bg-neutral-200 dark:bg-neutral-700"
                  }
                `}
              />
            );
          })}
        </div>

        {/* Current Step Label */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Step {currentIndex + 1} of {STEPS.length}
          </span>
          <span className="text-sm text-[var(--text-secondary)]">
            {STEPS[currentIndex]?.label}
          </span>
        </div>
      </div>
    </nav>
  );
}

export default WizardProgress;
