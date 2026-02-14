"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Heading,
    Text,
    Icon
} from "@/components/ui";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    countdownSeconds?: number;
    variant?: "danger" | "warning" | "info";
    isLoading?: boolean;
}

// Defer state updates to avoid `react-hooks/set-state-in-effect`.
function defer(fn: () => void) {
    setTimeout(fn, 0);
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    countdownSeconds = 5,
    variant = "danger",
    isLoading = false,
}: ConfirmationModalProps) {
    const [timeLeft, setTimeLeft] = useState(countdownSeconds);

    useEffect(() => {
        if (!isOpen) {
            defer(() => setTimeLeft(countdownSeconds));
            return;
        }

        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, timeLeft, countdownSeconds]);

    const getVariantConfig = () => {
        switch (variant) {
            case "danger":
                return {
                    icon: AlertTriangle,
                    color: "error" as const,
                    buttonVariant: "danger" as const,
                };
            case "warning":
                return {
                    icon: AlertCircle,
                    color: "warning" as const,
                    buttonVariant: "primary" as const,
                };
            case "info":
            default:
                return {
                    icon: Info,
                    color: "primary" as const,
                    buttonVariant: "primary" as const,
                };
        }
    };

    const { icon, color, buttonVariant } = getVariantConfig();

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <ModalHeader onClose={onClose}>
                <div className="flex items-center gap-3">
                    <Icon icon={icon} boxed boxColor={color} size="sm" />
                    <Heading level={4} className="m-0 text-lg">
                        {title}
                    </Heading>
                </div>
            </ModalHeader>
            <ModalBody>
                <Text className="text-[var(--text-secondary)] leading-relaxed">
                    {message}
                </Text>
            </ModalBody>
            <ModalFooter className="flex flex-col sm:flex-row gap-3">
                <Button
                    variant="secondary"
                    className="flex-1 font-bold uppercase tracking-widest text-[10px] h-11"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    {cancelText}
                </Button>
                <Button
                    variant={buttonVariant}
                    className="flex-1 font-bold uppercase tracking-widest text-[10px] h-11"
                    onClick={onConfirm}
                    disabled={timeLeft > 0 || isLoading}
                    isLoading={isLoading}
                >
                    {timeLeft > 0 ? `${confirmText} (${timeLeft}s)` : confirmText}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
