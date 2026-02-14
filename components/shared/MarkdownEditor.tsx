"use client";

import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Heading as HeadingIcon } from "lucide-react";

import { Button, Text } from "@/components/ui";
import { MarkdownRenderer } from "./MarkdownRenderer";

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  rows?: number;
  placeholder?: string;
  error?: string | null;
  className?: string;
}

type ActionId = "bold" | "italic" | "heading" | "ul" | "ol" | "link";

function setSelection(textarea: HTMLTextAreaElement, start: number, end: number) {
  textarea.focus();
  textarea.setSelectionRange(start, end);
}

function wrapSelection(
  value: string,
  start: number,
  end: number,
  prefix: string,
  suffix: string,
  fallbackText: string
) {
  const hasSelection = end > start;
  const selectedText = hasSelection ? value.slice(start, end) : fallbackText;
  const nextValue = value.slice(0, start) + prefix + selectedText + suffix + value.slice(end);

  const nextStart = start + prefix.length;
  const nextEnd = nextStart + selectedText.length;

  return { nextValue, nextSelectionStart: nextStart, nextSelectionEnd: nextEnd };
}

function insertAtLineStart(value: string, caretIndex: number, prefix: string) {
  const lineStart = value.lastIndexOf("\n", Math.max(0, caretIndex - 1)) + 1;
  const nextValue = value.slice(0, lineStart) + prefix + value.slice(lineStart);
  const nextCaret = caretIndex + prefix.length;
  return { nextValue, nextCaret };
}

function insertLinkTemplate(value: string, start: number, end: number) {
  const selected = end > start ? value.slice(start, end) : "link text";
  const template = `[${selected}](https://example.com)`;

  const nextValue = value.slice(0, start) + template + value.slice(end);

  // Select the URL part to make editing easy.
  const urlStart = start + template.indexOf("(") + 1;
  const urlEnd = start + template.indexOf(")");

  return { nextValue, nextSelectionStart: urlStart, nextSelectionEnd: urlEnd };
}

export function MarkdownEditor({
  value,
  onChange,
  onBlur,
  rows = 4,
  placeholder,
  error,
  className,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const pendingSelectionRef = useRef<{ start: number; end: number } | null>(null);

  // Auto-size textarea height to content (no internal scroll).
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset then set to scrollHeight so it shrinks/grows with content.
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  // Apply selection after React commits the new textarea value.
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    const pending = pendingSelectionRef.current;
    if (!textarea || !pending) return;

    pendingSelectionRef.current = null;
    setSelection(textarea, pending.start, pending.end);
  }, [value]);

  const actions = useMemo(
    () =>
      [
        { id: "bold" as const, label: "Bold", icon: <Bold size={14} /> },
        { id: "italic" as const, label: "Italic", icon: <Italic size={14} /> },
        { id: "heading" as const, label: "Heading", icon: <HeadingIcon size={14} /> },
        { id: "ul" as const, label: "Bullets", icon: <List size={14} /> },
        { id: "ol" as const, label: "Numbered", icon: <ListOrdered size={14} /> },
        { id: "link" as const, label: "Link", icon: <LinkIcon size={14} /> },
      ],
    []
  );

  const applyAction = useCallback(
    (actionId: ActionId) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart ?? 0;
      const end = textarea.selectionEnd ?? 0;

      // Keep logic small and focused for testability.
      if (actionId === "bold") {
        const { nextValue, nextSelectionStart, nextSelectionEnd } = wrapSelection(
          value,
          start,
          end,
          "**",
          "**",
          "bold"
        );
        pendingSelectionRef.current = { start: nextSelectionStart, end: nextSelectionEnd };
        onChange(nextValue);
        return;
      }

      if (actionId === "italic") {
        const { nextValue, nextSelectionStart, nextSelectionEnd } = wrapSelection(
          value,
          start,
          end,
          "_",
          "_",
          "italic"
        );
        pendingSelectionRef.current = { start: nextSelectionStart, end: nextSelectionEnd };
        onChange(nextValue);
        return;
      }

      if (actionId === "heading") {
        const { nextValue, nextCaret } = insertAtLineStart(value, start, "### ");
        pendingSelectionRef.current = { start: nextCaret, end: nextCaret };
        onChange(nextValue);
        return;
      }

      if (actionId === "ul") {
        const { nextValue, nextCaret } = insertAtLineStart(value, start, "- ");
        pendingSelectionRef.current = { start: nextCaret, end: nextCaret };
        onChange(nextValue);
        return;
      }

      if (actionId === "ol") {
        const { nextValue, nextCaret } = insertAtLineStart(value, start, "1. ");
        pendingSelectionRef.current = { start: nextCaret, end: nextCaret };
        onChange(nextValue);
        return;
      }

      if (actionId === "link") {
        const { nextValue, nextSelectionStart, nextSelectionEnd } = insertLinkTemplate(
          value,
          start,
          end
        );
        pendingSelectionRef.current = { start: nextSelectionStart, end: nextSelectionEnd };
        onChange(nextValue);
      }
    },
    [onChange, value]
  );

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {actions.map((action) => (
            <Button
              key={action.id}
              type="button"
              variant="outline"
              size="sm"
              // Prevent focus moving to the button, otherwise the textarea selection can be lost.
              onMouseDown={(e) => {
                e.preventDefault();
                applyAction(action.id);
              }}
              className="h-8 px-2.5"
              title={action.label}
              aria-label={action.label}
            >
              {action.icon}
            </Button>
          ))}
        </div>

        <div className="ml-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => setShowPreview((v) => !v)}
          >
            {showPreview ? "Hide preview" : "Preview"}
          </Button>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        rows={rows}
        placeholder={placeholder}
        className={`
          mt-2 w-full p-4 rounded-xl border resize-none overflow-hidden
          bg-[var(--bg-primary)] text-sm outline-none
          transition-all duration-200
          ${error ? "border-error-500 ring-1 ring-error-500/20" : "border-[var(--border-secondary)] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"}
        `}
      />

      {showPreview && (
        <div className="mt-2 animate-slide-down">
          <Text variant="muted" className="text-[10px] font-bold tracking-widest uppercase">
            Preview
          </Text>
          <div className="mt-2 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
            {value.trim() ? (
              <MarkdownRenderer content={value} />
            ) : (
              <Text variant="muted" className="text-sm">
                Nothing to preview yet.
              </Text>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
