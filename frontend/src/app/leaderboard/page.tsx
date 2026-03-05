"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import NavSearch from "@/components/NavSearch";
import { useZkWhisper } from "@/hooks/useZkWhisper";

/* ─── Shared navbar component ─── */
function Navbar() {
    return (
        <nav
            style={{
                position: "sticky",
                top: 0,
                zIndex: 100,
                backdropFilter: "blur(24px) saturate(1.2)",
                WebkitBackdropFilter: "blur(24px) saturate(1.2)",
                background: "rgba(7,7,13,0.78)",
                borderBottom: "1px solid var(--line)",
            }}
        >
            <div
                style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    padding: "0 20px",
                    height: 60,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                    <img src="/logo.png" alt="Civic Echo" style={{ width: 32, height: 32, borderRadius: 8 }} />
                    <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>Civic Echo</span>
                </Link>

                <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {[
                        { href: "/map", label: "Map" },
                        { href: "/reports", label: "Reports" },
                        { href: "/create", label: "+ Create" },
                        { href: "/leaderboard", label: "Leaderboard" },
                        { href: "/dashboard", label: "Dashboard" },
                    ].map((l) => (
                        <Link
                            key={l.label}
                            href={l.href}
                            style={{
                                fontSize: 13, fontWeight: 500, color: "var(--text-2)",
                                textDecoration: "none", padding: "6px 14px", borderRadius: 8,
                            }}
                        >{l.label}</Link>
                    ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Link
                        href="/map"
                        style={{
                            fontSize: 13, fontWeight: 600, color: "#07070d",
                            background: "var(--accent)", padding: "8px 20px",
                            borderRadius: 10, textDecoration: "none",
                            boxShadow: "0 2px 12px var(--accent-glow)",
                        }}
                    >Open Map →</Link>
                    <NavSearch />
                    <WalletMultiButton />
                </div>
            </div>
        </nav>
    );
}

/* ─── Helper ─── */
function truncAddr(a: string) { return a.slice(0, 4) + "…" + a.slice(-4); }

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function LeaderboardPage() {
    const { reports } = useZkWhisper();

    /* Aggregate stats from live data */
    const reporters = useMemo(() => {
        const map = new Map<string, { addr: string; reports: number; echoes: number; petitions: number }>();
        for (const r of reports) {
            const existing = map.get(r.reporter) ?? { addr: r.reporter, reports: 0, echoes: 0, petitions: 0 };
            existing.reports++;
            existing.echoes += r.upvotes;
            if (r.isPetition) existing.petitions++;
            map.set(r.reporter, existing);
        }
        return [...map.values()].sort((a, b) => b.echoes - a.echoes);
    }, [reports]);

    const districts = useMemo(() => {
        const map = new Map<string, { name: string; reports: number; echoes: number }>();
        for (const r of reports) {
            const existing = map.get(r.district) ?? { name: r.district, reports: 0, echoes: 0 };
            existing.reports++;
            existing.echoes += r.upvotes;
            map.set(r.district, existing);
        }
        return [...map.values()].sort((a, b) => b.reports - a.reports);
    }, [reports]);

    const categories = useMemo(() => {
        const map = new Map<string, number>();
        for (const r of reports) {
            map.set(r.category, (map.get(r.category) ?? 0) + 1);
        }
        return [...map.entries()].sort((a, b) => b[1] - a[1]);
    }, [reports]);

    const statCard = (label: string, value: string | number, color: string) => (
        <div
            style={{
                background: "var(--bg-elevated, #141422)",
                border: "1px solid var(--line)",
                borderRadius: 14, padding: "24px 20px",
                textAlign: "center",
            }}
        >
            <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: "var(--font-mono)" }}>
                {typeof value === "number" ? value.toLocaleString() : value}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>{label}</div>
        </div>
    );

    const MEDALS = ["🥇", "🥈", "🥉"];

    return (
        <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
            <Navbar />

            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 20px 80px" }}>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-1)", marginBottom: 6 }}>
                        🏆 Leaderboard
                    </h1>
                    <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 36 }}>
                        Top reporters and most active districts across Nepal
                    </p>
                </motion.div>

                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 40 }}>
                    {statCard("Total Reports", reports.length, "var(--cyan)")}
                    {statCard("Active Petitions", reports.filter((r) => r.isPetition).length, "var(--accent)")}
                    {statCard("Community Echoes", reports.reduce((s, r) => s + r.upvotes, 0), "var(--purple)")}
                    {statCard("Active Districts", districts.length, "var(--danger)")}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    {/* Top Reporters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{
                            background: "var(--bg-elevated, #141422)",
                            border: "1px solid var(--line)",
                            borderRadius: 14, padding: 24,
                        }}
                    >
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 20 }}>
                            Top Reporters
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {reporters.map((r, i) => (
                                <div
                                    key={r.addr}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 12,
                                        padding: "10px 14px", borderRadius: 10,
                                        background: i < 3 ? "rgba(255,255,255,0.02)" : "transparent",
                                        border: i < 3 ? "1px solid var(--line)" : "1px solid transparent",
                                    }}
                                >
                                    <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>
                                        {i < 3 ? MEDALS[i] : `#${i + 1}`}
                                    </span>
                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-2)", flex: 1 }}>
                                        {truncAddr(r.addr)}
                                    </span>
                                    <span style={{ fontSize: 12, color: "var(--text-3)" }}>{r.reports} reports</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
                                        ▲ {r.echoes}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Active Districts */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        style={{
                            background: "var(--bg-elevated, #141422)",
                            border: "1px solid var(--line)",
                            borderRadius: 14, padding: 24,
                        }}
                    >
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 20 }}>
                            Most Active Districts
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {districts.map((d, i) => {
                                const maxReports = districts[0].reports;
                                return (
                                    <div key={d.name}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)" }}>
                                                {d.name}
                                            </span>
                                            <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                                                {d.reports} reports · {d.echoes} echoes
                                            </span>
                                        </div>
                                        <div style={{ height: 6, borderRadius: 999, background: "var(--bg-secondary)", overflow: "hidden" }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(d.reports / maxReports) * 100}%` }}
                                                transition={{ duration: 0.6, delay: i * 0.05 }}
                                                style={{
                                                    height: "100%", borderRadius: 999,
                                                    background: `linear-gradient(90deg, var(--accent), var(--cyan))`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Category breakdown */}
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginTop: 28, marginBottom: 14 }}>
                            By Category
                        </h3>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {categories.map(([cat, count]) => (
                                <span
                                    key={cat}
                                    style={{
                                        fontSize: 12, padding: "4px 12px", borderRadius: 999,
                                        background: "rgba(255,255,255,0.04)",
                                        border: "1px solid var(--line)",
                                        color: "var(--text-2)", textTransform: "capitalize",
                                    }}
                                >
                                    {cat} ({count})
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
