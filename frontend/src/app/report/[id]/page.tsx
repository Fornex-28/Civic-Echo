"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useZkWhisper } from "@/hooks/useZkWhisper";
import { CATEGORY_META } from "@/lib/types";

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function ReportDetailPage() {
    const params = useParams();
    const reportId = params.id as string;
    const { reports } = useZkWhisper();

    const report = useMemo(
        () => reports.find((r) => r.id === reportId),
        [reportId, reports]
    );

    if (!report) {
        return (
            <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
                <nav style={{ backdropFilter: "blur(24px)", background: "rgba(7,7,13,0.78)", borderBottom: "1px solid var(--line)" }}>
                    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", height: 60, display: "flex", alignItems: "center" }}>
                        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                            <img src="/logo.png" alt="Civic Echo" style={{ width: 32, height: 32, borderRadius: 8 }} />
                            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>Civic Echo</span>
                        </Link>
                    </div>
                </nav>
                <div style={{ textAlign: "center", padding: "120px 20px" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-1)", marginBottom: 8 }}>Report Not Found</h1>
                    <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 24 }}>This report doesn&apos;t exist or has been closed.</p>
                    <Link href="/" style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>← Back to Home</Link>
                </div>
            </div>
        );
    }

    const threshold = 100;
    const progress = Math.min(100, Math.round((report.upvotes / threshold) * 100));
    const catMeta = CATEGORY_META[report.category] ?? CATEGORY_META.other;

    return (
        <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
            {/* Navbar */}
            <nav style={{ position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(24px)", background: "rgba(7,7,13,0.78)", borderBottom: "1px solid var(--line)" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                        <img src="/logo.png" alt="Civic Echo" style={{ width: 32, height: 32, borderRadius: 8 }} />
                        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>Civic Echo</span>
                    </Link>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Link href="/map" style={{ fontSize: 13, fontWeight: 600, color: "#07070d", background: "var(--accent)", padding: "8px 20px", borderRadius: 10, textDecoration: "none" }}>Open Map →</Link>
                        <WalletMultiButton />
                    </div>
                </div>
            </nav>

            {/* Hero image */}
            {report.imageUrl && (
                <div style={{ position: "relative", width: "100%", height: 320, overflow: "hidden" }}>
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
                        height: 120,
                        background: "linear-gradient(transparent, var(--bg-primary))",
                    }} />
                </div>
            )}

            <div style={{ maxWidth: 800, margin: "0 auto", padding: report.imageUrl ? "0 20px 80px" : "40px 20px 80px" }}>
                {/* Breadcrumb */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-3)", marginBottom: 28 }}>
                    <Link href="/" style={{ color: "var(--text-3)", textDecoration: "none" }}>Home</Link>
                    <span>›</span>
                    <Link href="/#reports" style={{ color: "var(--text-3)", textDecoration: "none" }}>Reports</Link>
                    <span>›</span>
                    <span style={{ color: "var(--text-2)" }}>{report.district}</span>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Status + Category badges */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                        <span style={{
                            fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 999,
                            background: report.isPetition ? "var(--accent-dim)" : "var(--danger-dim)",
                            color: report.isPetition ? "var(--accent)" : "var(--danger)",
                        }}>
                            {report.isPetition ? "🟢 PETITION" : "🔴 REPORT"}
                        </span>
                        <span style={{
                            fontSize: 11, fontWeight: 600, padding: "3px 12px", borderRadius: 999,
                            background: `${catMeta.color}20`,
                            color: catMeta.color,
                        }}>
                            {catMeta.emoji} {catMeta.label}
                        </span>
                        <span style={{
                            fontSize: 11, fontWeight: 500, padding: "3px 12px", borderRadius: 999,
                            background: report.status === "active" ? "rgba(0,200,255,0.08)" : "var(--accent-dim)",
                            color: report.status === "active" ? "var(--cyan)" : "var(--accent)",
                            textTransform: "capitalize",
                        }}>
                            {report.status}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--text-3)", marginLeft: "auto" }}>{timeAgo(report.createdAt)}</span>
                    </div>

                    {/* Title */}
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text-1)", lineHeight: 1.35, marginBottom: 12 }}>
                        {report.title}
                    </h1>

                    {/* Location */}
                    <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 20 }}>
                        📍 {report.district}, Ward {report.wardNumber} — {report.locationLat.toFixed(4)}, {report.locationLng.toFixed(4)}
                    </p>

                    {/* Description */}
                    {report.description && (
                        <div style={{
                            background: "var(--bg-elevated, #141422)", border: "1px solid var(--line)",
                            borderRadius: 14, padding: 20, marginBottom: 28,
                        }}>
                            <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                Description
                            </h3>
                            <p style={{ fontSize: 14, color: "var(--text-1)", lineHeight: 1.7 }}>
                                {report.description}
                            </p>
                        </div>
                    )}
                </motion.div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
                    {/* Echoes card */}
                    <div style={{
                        background: "var(--bg-elevated, #141422)", border: "1px solid var(--line)",
                        borderRadius: 14, padding: "24px 20px", textAlign: "center",
                    }}>
                        <div style={{ fontSize: 32, fontWeight: 700, color: catMeta.color, fontFamily: "var(--font-mono)" }}>
                            {report.upvotes}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>Echoes</div>
                    </div>

                    {/* Threshold card */}
                    <div style={{
                        background: "var(--bg-elevated, #141422)", border: "1px solid var(--line)",
                        borderRadius: 14, padding: "24px 20px", textAlign: "center",
                    }}>
                        <div style={{ fontSize: 32, fontWeight: 700, color: "var(--cyan)", fontFamily: "var(--font-mono)" }}>
                            {progress}%
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>Petition Threshold</div>
                    </div>
                </div>

                {/* Progress bar */}
                {!report.isPetition && (
                    <div style={{ marginBottom: 28 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                            <span style={{ color: "var(--text-3)" }}>{report.upvotes} / {threshold} echoes</span>
                            <span style={{ color: "var(--danger)" }}>{threshold - report.upvotes} more needed</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 999, background: "var(--bg-secondary)", overflow: "hidden" }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                style={{
                                    height: "100%", borderRadius: 999,
                                    background: `linear-gradient(90deg, ${catMeta.color}, var(--purple))`,
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Evidence (IPFS) */}
                <div style={{
                    background: "var(--bg-elevated, #141422)", border: "1px solid var(--line)",
                    borderRadius: 14, padding: 20, marginBottom: 20,
                }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Evidence (IPFS)
                    </h3>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--cyan)", wordBreak: "break-all" }}>
                        {report.ipfsCid}
                    </p>
                </div>

                {/* Reporter */}
                <div style={{
                    background: "var(--bg-elevated, #141422)", border: "1px solid var(--line)",
                    borderRadius: 14, padding: 20, marginBottom: 28,
                }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Anonymous Reporter
                    </h3>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-2)" }}>
                        {report.reporter}
                    </p>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 12 }}>
                    <Link
                        href="/map"
                        style={{
                            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            padding: "14px 0", borderRadius: 12, fontSize: 14, fontWeight: 600,
                            background: report.isPetition
                                ? "rgba(0,232,123,0.1)"
                                : `linear-gradient(135deg, ${catMeta.color}, var(--purple))`,
                            color: report.isPetition ? "var(--accent)" : "#fff",
                            border: report.isPetition ? "1px solid var(--accent)" : "none",
                            textDecoration: "none",
                            boxShadow: report.isPetition ? "none" : `0 4px 16px ${catMeta.color}30`,
                        }}
                    >
                        {report.isPetition ? "✅ On-Chain Petition" : "🔊 Echo on Map"}
                    </Link>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                        }}
                        style={{
                            padding: "14px 24px", borderRadius: 12, fontSize: 14, fontWeight: 500,
                            background: "rgba(255,255,255,0.04)", border: "1px solid var(--line)",
                            color: "var(--text-2)", cursor: "pointer",
                        }}
                    >
                        📋 Share
                    </button>
                </div>
            </div>
        </div>
    );
}
