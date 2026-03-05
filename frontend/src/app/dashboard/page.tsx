"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useZkWhisper } from "@/hooks/useZkWhisper";
import { CATEGORY_META, type ReportCategory } from "@/lib/types";
import Navbar from "@/components/Navbar";

function truncAddr(a: string) { return a.slice(0, 4) + "…" + a.slice(-4); }

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

/* ── Achievement definitions ── */
const BADGES = [
    { id: "first-report", icon: "📝", label: "First Report", desc: "Submitted your first report", check: (r: number) => r >= 1 },
    { id: "five-reports", icon: "🔥", label: "Active Reporter", desc: "Submitted 5 or more reports", check: (r: number) => r >= 5 },
    { id: "ten-reports", icon: "🏆", label: "Veteran", desc: "Submitted 10+ reports", check: (r: number) => r >= 10 },
    { id: "petition-starter", icon: "📋", label: "Petition Starter", desc: "Had a report reach petition status", check: (_r: number, p: number) => p >= 1 },
    { id: "echo-magnet", icon: "🔊", label: "Echo Magnet", desc: "Received 50+ total echoes", check: (_r: number, _p: number, e: number) => e >= 50 },
    { id: "viral", icon: "🚀", label: "Gone Viral", desc: "A single report with 100+ echoes", check: (_r: number, _p: number, _e: number, max: number) => max >= 100 },
];

export default function DashboardPage() {
    const { publicKey, connected } = useWallet();
    const walletAddr = publicKey?.toBase58() ?? "";
    const { reports } = useZkWhisper();

    const myReports = useMemo(() => {
        if (!connected) return [];
        return reports.filter((r) => r.reporter === walletAddr).sort((a, b) => b.createdAt - a.createdAt);
    }, [connected, walletAddr, reports]);

    const allReports = useMemo(
        () => [...reports].sort((a, b) => b.createdAt - a.createdAt),
        [reports]
    );

    const displayReports = connected && myReports.length > 0 ? myReports : allReports;
    const totalEchoes = displayReports.reduce((s, r) => s + r.upvotes, 0);
    const petitionCount = displayReports.filter((r) => r.isPetition).length;
    const maxEchoSingle = displayReports.length > 0 ? Math.max(...displayReports.map((r) => r.upvotes)) : 0;

    /* ── Echo activity: reports you've echoed (tracked via localStorage) ── */
    const echoedReportIds = useMemo(() => {
        if (!connected || typeof window === "undefined") return new Set<string>();
        try {
            const raw = localStorage.getItem(`civic-echo-echoes:${walletAddr}`);
            return raw ? new Set<string>(JSON.parse(raw)) : new Set<string>();
        } catch { return new Set<string>(); }
    }, [connected, walletAddr]);

    const echoedReports = useMemo(
        () => reports.filter((r) => echoedReportIds.has(r.id)).slice(0, 5),
        [reports, echoedReportIds]
    );

    /* ── Category breakdown ── */
    const categoryBreakdown = useMemo(() => {
        const counts: Record<string, number> = {};
        displayReports.forEach((r) => {
            counts[r.category] = (counts[r.category] || 0) + 1;
        });
        return Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([cat, count]) => {
                const meta = CATEGORY_META[cat as ReportCategory] ?? CATEGORY_META.other;
                return { cat, count, ...meta };
            });
    }, [displayReports]);

    const cardStyle: React.CSSProperties = {
        background: "var(--bg-elevated, #141422)",
        border: "1px solid var(--line)",
        borderRadius: 14,
    };

    return (
        <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
            <Navbar />

            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px 80px" }}>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-1)", marginBottom: 6 }}>
                        📊 Dashboard
                    </h1>
                    <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 32 }}>
                        {connected
                            ? `Connected as ${truncAddr(walletAddr)}`
                            : "Connect your wallet to see your personal reports"}
                    </p>
                </motion.div>

                {!connected && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        style={{
                            textAlign: "center", padding: "64px 20px",
                            ...cardStyle, marginBottom: 32,
                        }}
                    >
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
                        <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-1)", marginBottom: 8 }}>
                            Connect Your Wallet
                        </p>
                        <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
                            Link your Phantom wallet to view your personal report history, echo activity, and achievements.
                        </p>
                        <WalletMultiButton />
                    </motion.div>
                )}

                {/* ── Stats row ── */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 28 }}>
                    {[
                        { label: connected ? "Your Reports" : "Total Reports", val: displayReports.length, c: "var(--cyan)" },
                        { label: "Total Echoes", val: totalEchoes, c: "var(--accent)" },
                        { label: "Petitions", val: petitionCount, c: "var(--purple)" },
                        { label: "Active", val: displayReports.filter((r) => r.status === "active").length, c: "var(--danger)" },
                        { label: "Echoes Given", val: echoedReportIds.size, c: "#eab308" },
                    ].map((s) => (
                        <motion.div
                            key={s.label}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ ...cardStyle, padding: "22px 20px", textAlign: "center" }}
                        >
                            <div style={{ fontSize: 24, fontWeight: 700, color: s.c, fontFamily: "var(--font-mono)" }}>
                                {s.val}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{s.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* ── Two column: Achievements + Category Breakdown ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
                    {/* Achievement badges */}
                    <div style={{ ...cardStyle, padding: 20 }}>
                        <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", marginBottom: 16 }}>
                            🏅 Achievements
                        </h2>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            {BADGES.map((b) => {
                                const unlocked = b.check(displayReports.length, petitionCount, totalEchoes, maxEchoSingle);
                                return (
                                    <div
                                        key={b.id}
                                        style={{
                                            display: "flex", alignItems: "center", gap: 10,
                                            padding: "12px 14px", borderRadius: 10,
                                            background: unlocked ? "rgba(0,232,123,0.06)" : "rgba(255,255,255,0.02)",
                                            border: `1px solid ${unlocked ? "rgba(0,232,123,0.15)" : "rgba(255,255,255,0.04)"}`,
                                            opacity: unlocked ? 1 : 0.4,
                                            transition: "all 0.2s",
                                        }}
                                    >
                                        <span style={{ fontSize: 22 }}>{b.icon}</span>
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: unlocked ? "var(--accent)" : "var(--text-3)" }}>
                                                {b.label}
                                            </div>
                                            <div style={{ fontSize: 10, color: "var(--text-3)" }}>{b.desc}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Category breakdown */}
                    <div style={{ ...cardStyle, padding: 20 }}>
                        <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", marginBottom: 16 }}>
                            📊 Category Breakdown
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {categoryBreakdown.length > 0 ? categoryBreakdown.map((c) => (
                                <div key={c.cat}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                        <span style={{ fontSize: 12, color: "var(--text-1)", fontWeight: 500 }}>
                                            {c.emoji} {c.label}
                                        </span>
                                        <span style={{ fontSize: 12, color: c.color, fontWeight: 600 }}>
                                            {c.count}
                                        </span>
                                    </div>
                                    <div style={{ height: 6, borderRadius: 999, background: "var(--bg-secondary)", overflow: "hidden" }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (c.count / displayReports.length) * 100)}%` }}
                                            transition={{ duration: 0.6, ease: "easeOut" }}
                                            style={{ height: "100%", borderRadius: 999, background: c.color }}
                                        />
                                    </div>
                                </div>
                            )) : (
                                <p style={{ fontSize: 13, color: "var(--text-3)", textAlign: "center", padding: 20 }}>No data yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Echo Activity (if connected) ── */}
                {connected && echoedReports.length > 0 && (
                    <div style={{ ...cardStyle, marginBottom: 28, overflow: "hidden" }}>
                        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--line)" }}>
                            <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)" }}>
                                🔊 Your Echo Activity
                            </h2>
                        </div>
                        {echoedReports.map((r, i) => {
                            const rCat = CATEGORY_META[r.category] ?? CATEGORY_META.other;
                            return (
                                <Link
                                    key={r.id}
                                    href={`/report/${r.id}`}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 12,
                                        padding: "12px 24px",
                                        borderBottom: i < echoedReports.length - 1 ? "1px solid var(--line)" : "none",
                                        textDecoration: "none", transition: "background 0.15s",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                    <span style={{ fontSize: 16 }}>{rCat.emoji}</span>
                                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {r.title}
                                    </span>
                                    <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, flexShrink: 0 }}>
                                        ▲ {r.upvotes}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* ── Report History ── */}
                <div style={{ ...cardStyle, overflow: "hidden" }}>
                    <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)" }}>
                            {connected && myReports.length > 0 ? "📋 Your Reports" : "📋 All Reports"}
                        </h2>
                        <Link
                            href="/create"
                            style={{
                                fontSize: 12, fontWeight: 600, color: "#07070d",
                                background: "var(--accent)", padding: "6px 16px",
                                borderRadius: 8, textDecoration: "none",
                            }}
                        >
                            + New Report
                        </Link>
                    </div>

                    {displayReports.length === 0 && (
                        <div style={{ textAlign: "center", padding: "48px 20px" }}>
                            <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
                            <p style={{ fontSize: 14, color: "var(--text-2)" }}>No reports yet</p>
                        </div>
                    )}

                    {displayReports.map((r, i) => {
                        const rCat = CATEGORY_META[r.category] ?? CATEGORY_META.other;
                        return (
                            <Link
                                key={r.id}
                                href={`/report/${r.id}`}
                                style={{
                                    display: "flex", alignItems: "center", gap: 14,
                                    padding: "14px 24px",
                                    borderBottom: i < displayReports.length - 1 ? "1px solid var(--line)" : "none",
                                    textDecoration: "none",
                                    transition: "background 0.15s",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                                <span style={{
                                    fontSize: 10, fontWeight: 700, padding: "2px 9px",
                                    borderRadius: 999,
                                    background: r.isPetition ? "var(--accent-dim)" : "var(--danger-dim)",
                                    color: r.isPetition ? "var(--accent)" : "var(--danger)",
                                    flexShrink: 0,
                                }}>
                                    {r.isPetition ? "PETITION" : "REPORT"}
                                </span>
                                <span style={{ fontSize: 16, flexShrink: 0 }}>{rCat.emoji}</span>
                                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {r.title}
                                </span>
                                <span style={{ fontSize: 12, color: "var(--text-3)", flexShrink: 0 }}>{r.district}</span>
                                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", flexShrink: 0 }}>▲ {r.upvotes}</span>
                                <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{timeAgo(r.createdAt)}</span>
                                <span style={{
                                    fontSize: 10, fontWeight: 500, padding: "2px 8px",
                                    borderRadius: 999, textTransform: "capitalize",
                                    background: r.status === "active" ? "rgba(0,200,255,0.08)" : r.status === "settled" ? "rgba(59,130,246,0.1)" : "var(--accent-dim)",
                                    color: r.status === "active" ? "var(--cyan)" : r.status === "settled" ? "#3b82f6" : "var(--accent)",
                                    flexShrink: 0,
                                }}>
                                    {r.status}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
