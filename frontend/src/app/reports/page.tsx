"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useZkWhisper } from "@/hooks/useZkWhisper";
import type { ReportCategory } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";
import Link from "next/link";
import Navbar from "@/components/Navbar";

/* ─── Categories ─── */
const CATEGORIES: { key: ReportCategory | "all"; label: string; dot: string }[] = [
    { key: "all", label: "All Reports", dot: "#fff" },
    { key: "roads", label: "Roads", dot: "#f59e0b" },
    { key: "utilities", label: "Utilities", dot: "#3b82f6" },
    { key: "corruption", label: "Corruption", dot: "#ef4444" },
    { key: "hazards", label: "Hazards", dot: "#8b5cf6" },
    { key: "scam", label: "Scam", dot: "#f97316" },
];

type TimeFilter = "24h" | "7d" | "30d" | "all";
type SortBy = "echoes" | "newest" | "oldest";
type StatusFilter = "all" | "active" | "petition" | "settled";

const ITEMS_PER_PAGE = 12;

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function ReportsPage() {
    const [activeCategory, setActiveCategory] = useState<ReportCategory | "all">("all");
    const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
    const [sortBy, setSortBy] = useState<SortBy>("echoes");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const { reports } = useZkWhisper();

    const filteredReports = useMemo(() => {
        let list = [...reports];
        // Category
        if (activeCategory !== "all") list = list.filter((r) => r.category === activeCategory);
        // Status
        if (statusFilter !== "all") {
            list = list.filter((r) => {
                if (statusFilter === "petition") return r.isPetition;
                return r.status === statusFilter;
            });
        }
        // Time
        if (timeFilter !== "all") {
            const ms = timeFilter === "24h" ? 864e5 : timeFilter === "7d" ? 6048e5 : 2592e6;
            list = list.filter((r) => Date.now() - r.createdAt <= ms);
        }
        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (r) =>
                    r.title.toLowerCase().includes(q) ||
                    r.district.toLowerCase().includes(q) ||
                    r.category.toLowerCase().includes(q)
            );
        }
        // Sort
        if (sortBy === "echoes") list.sort((a, b) => b.upvotes - a.upvotes);
        else if (sortBy === "newest") list.sort((a, b) => b.createdAt - a.createdAt);
        else list.sort((a, b) => a.createdAt - b.createdAt);
        return list;
    }, [reports, activeCategory, statusFilter, timeFilter, searchQuery, sortBy]);

    const visibleReports = filteredReports.slice(0, visibleCount);
    const hasMore = visibleCount < filteredReports.length;

    const pill = (active: boolean): React.CSSProperties => ({
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 16px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        border: "1px solid",
        borderColor: active ? "var(--accent)" : "var(--line)",
        background: active ? "var(--accent-dim)" : "transparent",
        color: active ? "var(--accent)" : "var(--text-2)",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
    });

    return (
        <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
            <Navbar />

            {/* Header */}
            <div
                style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    padding: "40px 20px 24px",
                }}
            >
                <h1
                    style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: "var(--text-1)",
                        marginBottom: 6,
                    }}
                >
                    All Reports
                </h1>
                <p style={{ fontSize: 14, color: "var(--text-3)" }}>
                    {filteredReports.length} reports found
                </p>
            </div>

            {/* Category bar */}
            <section
                style={{
                    borderTop: "1px solid var(--line)",
                    borderBottom: "1px solid var(--line)",
                    background: "var(--bg-secondary)",
                }}
            >
                <div
                    style={{
                        maxWidth: 1200,
                        margin: "0 auto",
                        padding: "14px 20px",
                        display: "flex",
                        gap: 6,
                        overflowX: "auto",
                        scrollbarWidth: "none",
                    }}
                >
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.key}
                            onClick={() => setActiveCategory(cat.key === "all" ? "all" : cat.key)}
                            style={pill(activeCategory === cat.key)}
                        >
                            <span
                                style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: "50%",
                                    background: cat.dot,
                                    boxShadow: activeCategory === cat.key ? `0 0 6px ${cat.dot}` : "none",
                                }}
                            />
                            {cat.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Status filter tabs */}
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 20px 0", display: "flex", gap: 4, borderBottom: "1px solid var(--line)" }}>
                {(["all", "active", "petition", "settled"] as StatusFilter[]).map((s) => (
                    <button
                        key={s}
                        onClick={() => { setStatusFilter(s); setVisibleCount(ITEMS_PER_PAGE); }}
                        style={{
                            padding: "10px 18px", fontSize: 13, fontWeight: statusFilter === s ? 600 : 400,
                            color: statusFilter === s ? "var(--accent)" : "var(--text-3)",
                            background: "transparent", border: "none", cursor: "pointer",
                            borderBottom: statusFilter === s ? "2px solid var(--accent)" : "2px solid transparent",
                            transition: "all 0.15s", textTransform: "capitalize",
                        }}
                    >
                        {s === "all" ? "All" : s}
                    </button>
                ))}
            </div>

            {/* Filters + Search + Sort */}
            <div style={{
                maxWidth: 1200, margin: "0 auto", padding: "16px 20px 0",
                display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <input
                        type="text"
                        placeholder="Search reports..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            padding: "10px 18px", borderRadius: 10,
                            border: "1px solid var(--line)", background: "var(--bg-secondary)",
                            color: "var(--text-1)", fontSize: 13, width: 260, outline: "none",
                        }}
                    />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortBy)}
                        style={{
                            padding: "10px 14px", borderRadius: 10,
                            border: "1px solid var(--line)", background: "var(--bg-secondary)",
                            color: "var(--text-1)", fontSize: 13, outline: "none", cursor: "pointer",
                        }}
                    >
                        <option value="echoes">Most Echoes</option>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                    {(["24h", "7d", "30d", "all"] as TimeFilter[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTimeFilter(t)}
                            style={{
                                padding: "7px 14px", borderRadius: 8, fontSize: 12,
                                fontWeight: timeFilter === t ? 600 : 400,
                                background: timeFilter === t ? "var(--accent)" : "transparent",
                                color: timeFilter === t ? "#07070d" : "var(--text-3)",
                                border: "none", cursor: "pointer", transition: "all 0.15s",
                            }}
                        >
                            {t === "all" ? "All time" : t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Report grid */}
            <div
                style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    padding: "24px 20px 80px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: 18,
                }}
            >
                {visibleReports.map((r, i) => (
                    <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
                    >
                        <Link
                            href={`/report/${r.id}`}
                            style={{
                                textDecoration: "none",
                                display: "block",
                                background: "var(--bg-card)",
                                border: "1px solid var(--line)",
                                borderRadius: "var(--radius)",
                                overflow: "hidden",
                                transition: "all 0.25s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = "rgba(0,232,123,0.2)";
                                e.currentTarget.style.transform = "translateY(-3px)";
                                e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.3)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "var(--line)";
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        >
                            {/* Image thumbnail */}
                            {r.imageUrl && (
                                <div style={{ position: "relative", width: "100%", height: 130 }}>
                                    <img
                                        src={r.imageUrl}
                                        alt={r.title}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            height: 40,
                                            background: "linear-gradient(transparent, var(--bg-card))",
                                        }}
                                    />
                                </div>
                            )}
                            {!r.imageUrl && (
                                <div
                                    style={{
                                        height: 2,
                                        background: `linear-gradient(90deg, ${CATEGORY_META[r.category]?.color || "var(--danger)"}, var(--purple))`,
                                    }}
                                />
                            )}

                            <div style={{ padding: "14px 20px 18px" }}>
                                {/* Badges */}
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                                    <span
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            padding: "2px 9px",
                                            borderRadius: 999,
                                            background: r.isPetition ? "var(--accent-dim)" : "var(--danger-dim)",
                                            color: r.isPetition ? "var(--accent)" : "var(--danger)",
                                        }}
                                    >
                                        {r.isPetition ? "PETITION" : "REPORT"}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 500,
                                            padding: "2px 9px",
                                            borderRadius: 999,
                                            background: `${CATEGORY_META[r.category]?.color || "#06b6d4"}15`,
                                            color: CATEGORY_META[r.category]?.color || "#06b6d4",
                                        }}
                                    >
                                        {CATEGORY_META[r.category]?.emoji} {CATEGORY_META[r.category]?.label || r.category}
                                    </span>
                                </div>

                                {/* Title */}
                                <p
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: "var(--text-1)",
                                        lineHeight: 1.5,
                                        marginBottom: 10,
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                    }}
                                >
                                    {r.title}
                                </p>

                                {/* Meta */}
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                        fontSize: 12,
                                    }}
                                >
                                    <span style={{ color: r.isPetition ? "var(--accent)" : "var(--danger)", fontWeight: 600 }}>
                                        ▲ {r.upvotes}
                                    </span>
                                    <span style={{ color: "var(--text-3)" }}>{r.district}</span>
                                    <span style={{ color: "var(--text-3)", marginLeft: "auto" }}>{timeAgo(r.createdAt)}</span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}

                {filteredReports.length === 0 && (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px" }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                        <p style={{ fontSize: 16, color: "var(--text-2)", fontWeight: 500 }}>No reports found</p>
                        <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>
                            Try adjusting your filters or search query
                        </p>
                    </div>
                )}

                {hasMore && (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", paddingTop: 12 }}>
                        <button
                            onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}
                            style={{
                                padding: "12px 36px", borderRadius: 10, fontSize: 14, fontWeight: 600,
                                background: "rgba(255,255,255,0.04)", border: "1px solid var(--line)",
                                color: "var(--text-1)", cursor: "pointer", transition: "all 0.15s",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                        >
                            Load More ({filteredReports.length - visibleCount} remaining)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
