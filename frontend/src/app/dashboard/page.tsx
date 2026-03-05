"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import NavSearch from "@/components/NavSearch";
import { useZkWhisper } from "@/hooks/useZkWhisper";

function truncAddr(a: string) { return a.slice(0, 4) + "…" + a.slice(-4); }

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardPage() {
    const { publicKey, connected } = useWallet();
    const walletAddr = publicKey?.toBase58() ?? "";
    const { reports } = useZkWhisper();

    /* Find reports by connected wallet (or show all for demo) */
    const myReports = useMemo(() => {
        if (!connected) return [];
        return reports.filter((r) => r.reporter === walletAddr);
    }, [connected, walletAddr, reports]);

    const allReports = useMemo(
        () => [...reports].sort((a, b) => b.createdAt - a.createdAt),
        [reports]
    );

    const displayReports = connected && myReports.length > 0 ? myReports : allReports;
    const totalEchoes = displayReports.reduce((s, r) => s + r.upvotes, 0);

    return (
        <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
            {/* Navbar */}
            <nav
                style={{
                    position: "sticky", top: 0, zIndex: 100,
                    backdropFilter: "blur(24px)", background: "rgba(7,7,13,0.78)",
                    borderBottom: "1px solid var(--line)",
                }}
            >
                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                        <img src="/logo.png" alt="Civic Echo" style={{ width: 32, height: 32, borderRadius: 8 }} />
                        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>Civic Echo</span>
                    </Link>

                    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                        {[{ href: "/map", label: "Map" }, { href: "/reports", label: "Reports" }, { href: "/create", label: "+ Create" }, { href: "/leaderboard", label: "Leaderboard" }, { href: "/dashboard", label: "Dashboard" }].map((l) => (
                            <Link key={l.label} href={l.href} style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)", textDecoration: "none", padding: "6px 14px", borderRadius: 8 }}>{l.label}</Link>
                        ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <NavSearch />
                        <WalletMultiButton />
                    </div>
                </div>
            </nav>

            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 20px 80px" }}>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-1)", marginBottom: 6 }}>
                        📊 Dashboard
                    </h1>
                    <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 36 }}>
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
                            background: "var(--bg-elevated, #141422)",
                            border: "1px solid var(--line)",
                            borderRadius: 14, marginBottom: 32,
                        }}
                    >
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
                        <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-1)", marginBottom: 8 }}>
                            Connect Your Wallet
                        </p>
                        <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
                            Link your Phantom wallet to view your personal report history and echo activity.
                        </p>
                        <WalletMultiButton />
                    </motion.div>
                )}

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 32 }}>
                    {[
                        { label: "Your Reports", val: displayReports.length, c: "var(--cyan)" },
                        { label: "Total Echoes", val: totalEchoes, c: "var(--accent)" },
                        { label: "Petitions", val: displayReports.filter((r) => r.isPetition).length, c: "var(--purple)" },
                        { label: "Active", val: displayReports.filter((r) => r.status === "active").length, c: "var(--danger)" },
                    ].map((s) => (
                        <div
                            key={s.label}
                            style={{
                                background: "var(--bg-elevated, #141422)",
                                border: "1px solid var(--line)",
                                borderRadius: 14, padding: "24px 20px", textAlign: "center",
                            }}
                        >
                            <div style={{ fontSize: 26, fontWeight: 700, color: s.c, fontFamily: "var(--font-mono)" }}>
                                {s.val}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Reports table */}
                <div
                    style={{
                        background: "var(--bg-elevated, #141422)",
                        border: "1px solid var(--line)",
                        borderRadius: 14, overflow: "hidden",
                    }}
                >
                    <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)" }}>
                            {connected && myReports.length > 0 ? "Your Reports" : "All Reports"}
                        </h2>
                        <Link
                            href="/map"
                            style={{
                                fontSize: 12, fontWeight: 600, color: "#07070d",
                                background: "var(--accent)", padding: "6px 16px",
                                borderRadius: 8, textDecoration: "none",
                            }}
                        >
                            + New Report
                        </Link>
                    </div>

                    {displayReports.map((r, i) => (
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
                            <span
                                style={{
                                    fontSize: 10, fontWeight: 700, padding: "2px 9px",
                                    borderRadius: 999,
                                    background: r.isPetition ? "var(--accent-dim)" : "var(--danger-dim)",
                                    color: r.isPetition ? "var(--accent)" : "var(--danger)",
                                    flexShrink: 0,
                                }}
                            >
                                {r.isPetition ? "PETITION" : "REPORT"}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {r.title}
                            </span>
                            <span style={{ fontSize: 12, color: "var(--text-3)", flexShrink: 0 }}>{r.district}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", flexShrink: 0 }}>▲ {r.upvotes}</span>
                            <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{timeAgo(r.createdAt)}</span>
                            <span
                                style={{
                                    fontSize: 10, fontWeight: 500, padding: "2px 8px",
                                    borderRadius: 999, textTransform: "capitalize",
                                    background: r.status === "active" ? "rgba(0,200,255,0.08)" : r.status === "petition" ? "var(--accent-dim)" : "rgba(255,255,255,0.04)",
                                    color: r.status === "active" ? "var(--cyan)" : r.status === "petition" ? "var(--accent)" : "var(--text-3)",
                                    flexShrink: 0,
                                }}
                            >
                                {r.status}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
