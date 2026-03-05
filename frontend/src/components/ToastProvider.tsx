"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ToastType = "success" | "error" | "info" | "loading";

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    txHash?: string;
    duration?: number;
}

interface ToastContextType {
    toast: (type: ToastType, message: string, opts?: { txHash?: string; duration?: number }) => string;
    dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
    toast: () => "",
    dismiss: () => { },
});

export const useToast = () => useContext(ToastContext);

const ICONS: Record<ToastType, string> = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
    loading: "⏳",
};

const COLORS: Record<ToastType, string> = {
    success: "var(--accent)",
    error: "var(--danger)",
    info: "var(--cyan)",
    loading: "var(--text-2)",
};

export default function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback(
        (type: ToastType, message: string, opts?: { txHash?: string; duration?: number }) => {
            const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
            const duration = opts?.duration ?? (type === "loading" ? 0 : 4000);
            setToasts((prev) => [...prev, { id, type, message, txHash: opts?.txHash, duration }]);

            if (duration > 0) {
                setTimeout(() => dismiss(id), duration);
            }

            return id;
        },
        [dismiss]
    );

    return (
        <ToastContext.Provider value={{ toast, dismiss }}>
            {children}

            {/* Toast container */}
            <div
                style={{
                    position: "fixed",
                    bottom: 20,
                    right: 20,
                    zIndex: 9999,
                    display: "flex",
                    flexDirection: "column-reverse",
                    gap: 10,
                    maxWidth: 380,
                    pointerEvents: "none",
                }}
            >
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 80, scale: 0.95 }}
                            transition={{ duration: 0.25 }}
                            style={{
                                pointerEvents: "auto",
                                background: "rgba(20, 20, 34, 0.95)",
                                backdropFilter: "blur(16px)",
                                border: "1px solid var(--line)",
                                borderRadius: 12,
                                padding: "14px 18px",
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 10,
                                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                                cursor: "pointer",
                                borderLeft: `3px solid ${COLORS[t.type]}`,
                            }}
                            onClick={() => dismiss(t.id)}
                        >
                            <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>
                                {ICONS[t.type]}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: "var(--text-1)",
                                        lineHeight: 1.4,
                                        margin: 0,
                                    }}
                                >
                                    {t.message}
                                </p>
                                {t.txHash && (
                                    <a
                                        href={`https://explorer.solana.com/tx/${t.txHash}?cluster=devnet`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                            fontSize: 11,
                                            color: "var(--cyan)",
                                            textDecoration: "none",
                                            fontFamily: "var(--font-mono)",
                                            marginTop: 4,
                                            display: "inline-block",
                                        }}
                                    >
                                        View on Explorer →
                                    </a>
                                )}
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    dismiss(t.id);
                                }}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "var(--text-3)",
                                    cursor: "pointer",
                                    fontSize: 14,
                                    padding: 0,
                                    flexShrink: 0,
                                }}
                            >
                                ✕
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
