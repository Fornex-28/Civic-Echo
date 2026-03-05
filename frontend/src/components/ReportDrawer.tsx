"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CivicReport, CATEGORY_META } from "@/lib/types";

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

interface ReportDrawerProps {
    report: CivicReport | null;
    onClose: () => void;
    onEcho: (reportId: string) => void;
    isVerified: boolean;
}

export default function ReportDrawer({
    report,
    onClose,
    onEcho,
    isVerified,
}: ReportDrawerProps) {
    return (
        <AnimatePresence>
            {report && (() => {
                const meta = CATEGORY_META[report.category] ?? CATEGORY_META.other;
                return (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-30 bg-black/40"
                            onClick={onClose}
                        />

                        {/* Drawer */}
                        <motion.div
                            key="drawer"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 28, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-40 glass-card rounded-t-2xl max-h-[70vh] overflow-y-auto"
                            style={{
                                borderTop: `2px solid ${meta.color}`,
                            }}
                        >
                            {/* Image header */}
                            {report.imageUrl && (
                                <div style={{ position: "relative", width: "100%", height: 200 }}>
                                    <img
                                        src={report.imageUrl}
                                        alt={report.title}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                    <div style={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: 60,
                                        background: "linear-gradient(transparent, rgba(16,16,32,1))",
                                    }} />
                                </div>
                            )}

                            <div style={{ padding: report.imageUrl ? "0 24px 24px" : "24px" }}>
                                {/* Handle bar */}
                                {!report.imageUrl && (
                                    <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "var(--text-3)" }} />
                                )}

                                {/* Category + Status badges */}
                                <div className="flex items-center justify-between mb-4" style={{ flexWrap: "wrap", gap: 8 }}>
                                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                        <span
                                            className="px-3 py-1 rounded-full text-xs font-bold"
                                            style={{
                                                background: `${meta.color}20`,
                                                color: meta.color,
                                                border: `1px solid ${meta.color}`,
                                            }}
                                        >
                                            {meta.emoji} {meta.label}
                                        </span>
                                        <span
                                            className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                                            style={{
                                                background: report.isPetition
                                                    ? "rgba(0, 255, 136, 0.15)"
                                                    : "rgba(255, 45, 85, 0.15)",
                                                color: report.isPetition ? "var(--accent)" : "var(--danger)",
                                            }}
                                        >
                                            {report.isPetition ? "PETITION" : "REPORT"}
                                        </span>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10 cursor-pointer"
                                        style={{ color: "var(--text-3)" }}
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-1)", lineHeight: 1.3 }}>
                                    {report.title}
                                </h3>

                                {/* Location + time */}
                                <div className="flex items-center gap-4 mb-3" style={{ fontSize: 12 }}>
                                    <span style={{ color: "var(--text-2)" }}>
                                        📍 {report.district}, Ward {report.wardNumber}
                                    </span>
                                    <span className="font-mono" style={{ color: "var(--text-3)" }}>
                                        {report.locationLat.toFixed(4)}, {report.locationLng.toFixed(4)}
                                    </span>
                                    <span style={{ color: "var(--text-3)", marginLeft: "auto" }}>
                                        {timeAgo(report.createdAt)}
                                    </span>
                                </div>

                                {/* Description */}
                                {report.description && (
                                    <p className="text-sm mb-4" style={{ color: "var(--text-2)", lineHeight: 1.6 }}>
                                        {report.description}
                                    </p>
                                )}

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3 mb-5">
                                    <div className="rounded-lg p-3 text-center" style={{ background: "var(--bg-secondary)" }}>
                                        <p className="text-2xl font-bold" style={{
                                            color: report.isPetition ? "var(--accent)" : meta.color
                                        }}>
                                            {report.upvotes}
                                        </p>
                                        <p className="text-xs" style={{ color: "var(--text-3)" }}>Echoes</p>
                                    </div>
                                    <div className="rounded-lg p-3 text-center" style={{ background: "var(--bg-secondary)" }}>
                                        <p className="text-2xl font-bold" style={{ color: "var(--cyan)" }}>
                                            {Math.min(100, Math.round((report.upvotes / 100) * 100))}%
                                        </p>
                                        <p className="text-xs" style={{ color: "var(--text-3)" }}>Petition threshold</p>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                {!report.isPetition && (
                                    <div className="mb-5">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span style={{ color: "var(--text-3)" }}>{report.upvotes} / 100 echoes</span>
                                            <span style={{ color: "var(--danger)" }}>
                                                {100 - report.upvotes} more needed
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
                                            <motion.div
                                                className="h-full rounded-full"
                                                style={{
                                                    background: `linear-gradient(90deg, ${meta.color}, var(--purple))`,
                                                }}
                                                initial={{ width: "0%" }}
                                                animate={{ width: `${Math.min(100, report.upvotes)}%` }}
                                                transition={{ duration: 0.6, ease: "easeOut" }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Echo button */}
                                {isVerified && !report.isPetition && (
                                    <button
                                        onClick={() => onEcho(report.id)}
                                        className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                                        style={{
                                            background: `linear-gradient(135deg, ${meta.color}, var(--purple))`,
                                            boxShadow: `0 0 20px ${meta.color}40`,
                                        }}
                                    >
                                        🔊 Echo This Report
                                    </button>
                                )}

                                {!isVerified && !report.isPetition && (
                                    <div
                                        className="w-full py-3 rounded-xl text-center font-medium text-sm"
                                        style={{
                                            background: "var(--bg-secondary)",
                                            color: "var(--text-3)",
                                            border: "1px solid var(--line)",
                                        }}
                                    >
                                        🔗 Connect wallet to echo this report
                                    </div>
                                )}

                                {report.isPetition && (
                                    <div
                                        className="w-full py-3 rounded-xl text-center font-semibold"
                                        style={{
                                            background: "rgba(0, 255, 136, 0.1)",
                                            color: "var(--accent)",
                                            border: "1px solid var(--accent)",
                                        }}
                                    >
                                        ✅ This report has become an On-Chain Petition
                                    </div>
                                )}

                                {/* Reporter hash */}
                                <p className="mt-4 text-xs font-mono text-center" style={{ color: "var(--text-3)" }}>
                                    Reporter: {report.reporter.slice(0, 8)}...{report.reporter.slice(-8)}
                                </p>
                            </div>
                        </motion.div>
                    </>
                );
            })()}
        </AnimatePresence>
    );
}
