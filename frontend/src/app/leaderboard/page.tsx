"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useZkWhisper } from "@/hooks/useZkWhisper";
import { CATEGORY_META } from "@/lib/types";
import Navbar from "@/components/Navbar";

function truncAddr(a: string) { return a.slice(0, 4) + "…" + a.slice(-4); }

/* ── Tier system ── */
function getTier(echoes: number): { name: string; icon: string; color: string; bg: string } {
    if (echoes >= 500) return { name: "Diamond", icon: "💎", color: "#b9f2ff", bg: "rgba(185,242,255,0.08)" };
    if (echoes >= 200) return { name: "Platinum", icon: "⚡", color: "#e2e8f0", bg: "rgba(226,232,240,0.06)" };
    if (echoes >= 100) return { name: "Gold", icon: "🏆", color: "#fbbf24", bg: "rgba(251,191,36,0.08)" };
    if (echoes >= 50) return { name: "Silver", icon: "🥈", color: "#94a3b8", bg: "rgba(148,163,184,0.08)" };
    if (echoes >= 10) return { name: "Bronze", icon: "🥉", color: "#d97706", bg: "rgba(217,119,6,0.08)" };
    return { name: "Newcomer", icon: "🌱", color: "var(--accent)", bg: "var(--accent-dim)" };
}

type LeaderboardTab = "reporters" | "districts";

export default function LeaderboardPage() {
    const { reports } = useZkWhisper();
    const [tab, setTab] = useState<LeaderboardTab>("reporters");

    const reporters = useMemo(() => {
        const map = new Map<string, { addr: string; reports: number; echoes: number; petitions: number; topCategory: string }>();
        for (const r of reports) {
            const existing = map.get(r.reporter) ?? { addr: r.reporter, reports: 0, echoes: 0, petitions: 0, topCategory: r.category };
            existing.reports++;
            existing.echoes += r.upvotes;
            if (r.isPetition) existing.petitions++;
            map.set(r.reporter, existing);
        }
        return [...map.values()].sort((a, b) => b.echoes - a.echoes);
    }, [reports]);

    const districts = useMemo(() => {
        const map = new Map<string, { name: string; reports: number; echoes: number; petitions: number }>();
        for (const r of reports) {
            const existing = map.get(r.district) ?? { name: r.district, reports: 0, echoes: 0, petitions: 0 };
            existing.reports++;
            existing.echoes += r.upvotes;
            if (r.isPetition) existing.petitions++;
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

    const totalEchoes = reports.reduce((s, r) => s + r.upvotes, 0);
    const MEDALS = ["🥇", "🥈", "🥉"];

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
                        🏆 Leaderboard
                    </h1>
                    <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 32 }}>
                        Top reporters and most active districts across Nepal
                    </p>
                </motion.div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 32 }}>
                    {[
                        { label: "Total Reports", val: reports.length, c: "var(--cyan)" },
                        { label: "Active Petitions", val: reports.filter((r) => r.isPetition).length, c: "var(--accent)" },
                        { label: "Community Echoes", val: totalEchoes, c: "var(--purple)" },
                        { label: "Active Districts", val: districts.length, c: "var(--danger)" },
                        { label: "Reporters", val: reporters.length, c: "#eab308" },
                    ].map((s) => (
                        <div key={s.label} style={{ ...cardStyle, padding: "22px 20px", textAlign: "center" }}>
                            <div style={{ fontSize: 24, fontWeight: 700, color: s.c, fontFamily: "var(--font-mono)" }}>
                                {typeof s.val === "number" ? s.val.toLocaleString() : s.val}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tab switcher */}
                <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--line)" }}>
                    {(["reporters", "districts"] as LeaderboardTab[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            style={{
                                padding: "12px 24px", fontSize: 14, fontWeight: tab === t ? 600 : 400,
                                color: tab === t ? "var(--accent)" : "var(--text-3)",
                                background: "transparent", border: "none", cursor: "pointer",
                                borderBottom: tab === t ? "2px solid var(--accent)" : "2px solid transparent",
                                transition: "all 0.15s", textTransform: "capitalize",
                            }}
                        >
                            {t === "reporters" ? "🏅 Top Reporters" : "📍 Active Districts"}
                        </button>
                    ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
                    {/* Main content */}
                    <div>
                        {tab === "reporters" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ ...cardStyle, overflow: "hidden" }}>
                                {/* Top 3 podium */}
                                {reporters.length >= 3 && (
                                    <div style={{
                                        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12,
                                        padding: 24, borderBottom: "1px solid var(--line)",
                                        background: "linear-gradient(135deg, rgba(251,191,36,0.04), rgba(0,232,123,0.04))",
                                    }}>
                                        {[1, 0, 2].map((idx) => {
                                            const r = reporters[idx];
                                            const tier = getTier(r.echoes);
                                            const isFirst = idx === 0;
                                            return (
                                                <div key={r.addr} style={{
                                                    textAlign: "center", padding: isFirst ? "0 8px 8px" : "16px 8px 8px",
                                                    transform: isFirst ? "translateY(-8px)" : "none",
                                                }}>
                                                    <div style={{ fontSize: isFirst ? 40 : 28, marginBottom: 8 }}>{MEDALS[idx]}</div>
                                                    <div style={{
                                                        fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-1)",
                                                        marginBottom: 4, fontWeight: 600,
                                                    }}>
                                                        {truncAddr(r.addr)}
                                                    </div>
                                                    <span style={{
                                                        fontSize: 10, padding: "2px 10px", borderRadius: 999,
                                                        background: tier.bg, color: tier.color, fontWeight: 600,
                                                    }}>
                                                        {tier.icon} {tier.name}
                                                    </span>
                                                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)", marginTop: 8, fontFamily: "var(--font-mono)" }}>
                                                        ▲ {r.echoes}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                                                        {r.reports} reports
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Remaining reporters */}
                                {reporters.slice(3).map((r, i) => {
                                    const tier = getTier(r.echoes);
                                    return (
                                        <div
                                            key={r.addr}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 12,
                                                padding: "14px 24px",
                                                borderBottom: i < reporters.length - 4 ? "1px solid var(--line)" : "none",
                                            }}
                                        >
                                            <span style={{ fontSize: 13, color: "var(--text-3)", width: 28, textAlign: "center", fontWeight: 600 }}>
                                                #{i + 4}
                                            </span>
                                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-1)", flex: 1 }}>
                                                {truncAddr(r.addr)}
                                            </span>
                                            <span style={{
                                                fontSize: 10, padding: "2px 10px", borderRadius: 999,
                                                background: tier.bg, color: tier.color, fontWeight: 600,
                                            }}>
                                                {tier.icon} {tier.name}
                                            </span>
                                            <span style={{ fontSize: 12, color: "var(--text-3)" }}>{r.reports} reports</span>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>▲ {r.echoes}</span>
                                        </div>
                                    );
                                })}

                                {reporters.length === 0 && (
                                    <div style={{ textAlign: "center", padding: "48px 20px" }}>
                                        <div style={{ fontSize: 36, marginBottom: 10 }}>🏅</div>
                                        <p style={{ fontSize: 14, color: "var(--text-3)" }}>No reporters yet</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {tab === "districts" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ ...cardStyle, padding: 24 }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                    {districts.map((d, i) => {
                                        const maxReports = districts[0]?.reports || 1;
                                        return (
                                            <div key={d.name}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                        <span style={{ fontSize: 13, fontWeight: 600, color: i < 3 ? "var(--accent)" : "var(--text-3)", width: 24 }}>
                                                            {i < 3 ? MEDALS[i] : `#${i + 1}`}
                                                        </span>
                                                        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-1)" }}>
                                                            {d.name}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
                                                        <span style={{ color: "var(--text-3)" }}>{d.reports} reports</span>
                                                        <span style={{ color: "var(--accent)", fontWeight: 600 }}>▲ {d.echoes}</span>
                                                        {d.petitions > 0 && <span style={{ color: "var(--purple)" }}>📋 {d.petitions}</span>}
                                                    </div>
                                                </div>
                                                <div style={{ height: 6, borderRadius: 999, background: "var(--bg-secondary)", overflow: "hidden" }}>
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(d.reports / maxReports) * 100}%` }}
                                                        transition={{ duration: 0.6, delay: i * 0.04 }}
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
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {/* Tier Guide */}
                        <div style={{ ...cardStyle, padding: 20 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 14 }}>
                                🎖️ Tier System
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {[
                                    { name: "Diamond", icon: "💎", req: "500+", color: "#b9f2ff" },
                                    { name: "Platinum", icon: "⚡", req: "200+", color: "#e2e8f0" },
                                    { name: "Gold", icon: "🏆", req: "100+", color: "#fbbf24" },
                                    { name: "Silver", icon: "🥈", req: "50+", color: "#94a3b8" },
                                    { name: "Bronze", icon: "🥉", req: "10+", color: "#d97706" },
                                    { name: "Newcomer", icon: "🌱", req: "0+", color: "var(--accent)" },
                                ].map((t) => (
                                    <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
                                        <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>{t.icon}</span>
                                        <span style={{ color: t.color, fontWeight: 500, flex: 1 }}>{t.name}</span>
                                        <span style={{ color: "var(--text-3)" }}>{t.req} echoes</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Category breakdown */}
                        <div style={{ ...cardStyle, padding: 20 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 14 }}>
                                📊 By Category
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {categories.map(([cat, count]) => {
                                    const meta = (CATEGORY_META as any)[cat] || { emoji: "📌", label: cat, color: "#666" };
                                    return (
                                        <div key={cat} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                                            <span style={{ color: "var(--text-1)" }}>{meta.emoji} {meta.label}</span>
                                            <span style={{ color: meta.color, fontWeight: 600 }}>{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick link */}
                        <Link
                            href="/create"
                            style={{
                                ...cardStyle, padding: "16px 20px", textDecoration: "none",
                                textAlign: "center", fontSize: 14, fontWeight: 600,
                                color: "#07070d", background: "var(--accent)",
                                borderRadius: 12, border: "none",
                                boxShadow: "0 2px 12px var(--accent-glow)",
                            }}
                        >
                            + Submit a Report
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
