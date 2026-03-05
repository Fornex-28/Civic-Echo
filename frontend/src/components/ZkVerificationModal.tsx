"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VerificationStatus } from "@/lib/types";

const ZK_STEPS = [
    { text: "Initializing ZK circuit...", delay: 400 },
    { text: "Generating Merkle tree from citizen registry...", delay: 600 },
    { text: "Computing witness for identity proof...", delay: 500 },
    { text: "Running Groth16 prover on R1CS constraints...", delay: 700 },
    { text: "Verifying Merkle root: 0x7a3f...c8e2", delay: 400 },
    { text: "Hashing nullifier to prevent double-identity...", delay: 500 },
    { text: "Proof π = (A, B, C) generated.", delay: 300 },
    { text: "Sending proof to on-chain verifier...", delay: 600 },
    { text: "Verifier.sol → pairing check passed ✓", delay: 400 },
    { text: "Citizenship status: VERIFIED ✓", delay: 300 },
];

interface ZkModalProps {
    status: VerificationStatus;
    onVerify: () => void;
    onClose: () => void;
}

export default function ZkVerificationModal({
    status,
    onVerify,
    onClose,
}: ZkModalProps) {
    const [visibleSteps, setVisibleSteps] = useState<string[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [done, setDone] = useState(false);

    const runSteps = useCallback(async () => {
        for (let i = 0; i < ZK_STEPS.length; i++) {
            await new Promise((r) => setTimeout(r, ZK_STEPS[i].delay));
            setVisibleSteps((prev) => [...prev, ZK_STEPS[i].text]);
            setCurrentStep(i + 1);
        }
        await new Promise((r) => setTimeout(r, 500));
        setDone(true);
    }, []);

    useEffect(() => {
        if (status === "verifying") {
            setVisibleSteps([]);
            setCurrentStep(0);
            setDone(false);
            runSteps();
        }
    }, [status, runSteps]);

    if (status === "unverified") {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="glass-card p-8 max-w-md w-full mx-4"
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg, var(--cyan), var(--purple))" }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-1)" }}>
                                ZK Identity Verification
                            </h2>
                            <p className="mb-6" style={{ color: "var(--text-2)", fontSize: "0.9rem", lineHeight: "1.6" }}>
                                Verify your Nepali citizenship using a Zero-Knowledge proof.
                                Your identity remains completely anonymous — only the proof is stored on-chain.
                            </p>
                            <button
                                onClick={onVerify}
                                className="w-full py-3 px-6 rounded-xl font-semibold text-white text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                                style={{
                                    background: "linear-gradient(135deg, var(--cyan), var(--purple))",
                                    boxShadow: "0 0 24px rgba(0,200,255,0.3)",
                                }}
                            >
                                Verify Nepali Citizenship
                            </button>
                            <p className="mt-4 text-xs" style={{ color: "var(--text-3)" }}>
                                Powered by simulated zk-SNARKs &amp; Solana
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    }

    if (status === "verifying") {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="glass-card p-6 max-w-lg w-full mx-4 font-mono text-sm"
                        style={{ border: "1px solid rgba(0, 255, 136, 0.2)" }}
                    >
                        {/* Header bar */}
                        <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid var(--line)" }}>
                            <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f56" }} />
                            <div className="w-3 h-3 rounded-full" style={{ background: "#ffbd2e" }} />
                            <div className="w-3 h-3 rounded-full" style={{ background: "#27c93f" }} />
                            <span className="ml-2 text-xs" style={{ color: "var(--text-3)" }}>
                                zk-proof-generator v2.1.0
                            </span>
                        </div>

                        {/* Terminal output */}
                        <div className="space-y-1 min-h-[280px] max-h-[360px] overflow-y-auto">
                            {visibleSteps.map((step, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="flex items-start gap-2"
                                >
                                    <span style={{ color: "var(--accent)" }}>$</span>
                                    <span style={{
                                        color: step.includes("✓") ? "var(--accent)" : "var(--text-2)"
                                    }}>
                                        {step}
                                    </span>
                                </motion.div>
                            ))}

                            {!done && (
                                <div className="flex items-center gap-2 mt-2">
                                    <span style={{ color: "var(--accent)" }}>$</span>
                                    <span className="terminal-cursor" style={{ color: "var(--text-3)" }} />
                                </div>
                            )}

                            {done && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 pt-4"
                                    style={{ borderTop: "1px solid var(--line)" }}
                                >
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">🛡️</div>
                                        <p className="font-bold text-lg" style={{ color: "var(--accent)" }}>
                                            Proof Validated Successfully
                                        </p>
                                        <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>
                                            You are now a verified citizen of the Civic Echo Network
                                        </p>
                                        <button
                                            onClick={onClose}
                                            className="mt-4 py-2 px-8 rounded-lg font-semibold text-black transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                                            style={{ background: "var(--accent)" }}
                                        >
                                            Enter the Network
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Progress bar */}
                        <div className="mt-4 h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
                            <motion.div
                                className="h-full rounded-full"
                                style={{ background: "linear-gradient(90deg, var(--cyan), var(--accent))" }}
                                initial={{ width: "0%" }}
                                animate={{ width: `${(currentStep / ZK_STEPS.length) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    }

    // status === "verified" → no modal
    return null;
}
