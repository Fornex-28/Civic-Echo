"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useZkWhisper } from "@/hooks/useZkWhisper";
import { CATEGORY_META } from "@/lib/types";
import CommentSection from "@/components/CommentSection";
import Navbar from "@/components/Navbar";

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/* ── Status timeline steps ── */
const TIMELINE_STEPS = ["submitted", "echoed", "petition", "settled"] as const;
function getTimelineIndex(report: { upvotes: number; isPetition: boolean; status: string }): number {
    if (report.status === "settled") return 3;
    if (report.isPetition) return 2;
    if (report.upvotes > 0) return 1;
    return 0;
}

export default function ReportDetailPage() {
    const params = useParams();
    const reportId = params.id as string;
    const { reports, echoReport } = useZkWhisper();
    const [copied, setCopied] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);

    const report = useMemo(
        () => reports.find((r) => r.id === reportId),
        [reportId, reports]
    );

    const relatedReports = useMemo(() => {
        if (!report) return [];
        return reports
            .filter((r) => r.id !== report.id && (r.district === report.district || r.category === report.category))
            .sort((a, b) => b.upvotes - a.upvotes)
            .slice(0, 3);
    }, [report, reports]);

    if (!report) {
        return (
            <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
                <Navbar />
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
    const timelineIdx = getTimelineIndex(report);
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";

    const handleCopyLink = () => {
        navigator.clipboard.writeText(pageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const cardStyle: React.CSSProperties = {
        background: "var(--bg-elevated, #141422)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: 20,
    };

    return (
        <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
            <Navbar />

            {/* Hero image */}
            {report.imageUrl && (
                <div style={{ position: "relative", width: "100%", height: 320, overflow: "hidden" }}>
                    <img
                        src={report.imageUrl}
                        alt={report.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div style={{
                        position: "absolute", bottom: 0, left: 0, right: 0, height: 120,
                        background: "linear-gradient(transparent, var(--bg-primary))",
                    }} />
                </div>
            )}

            <div style={{ maxWidth: 1100, margin: "0 auto", padding: report.imageUrl ? "0 20px 80px" : "40px 20px 80px" }}>

                {/* Breadcrumb */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-3)", marginBottom: 28 }}>
                    <Link href="/" style={{ color: "var(--text-3)", textDecoration: "none" }}>Home</Link>
                    <span>›</span>
                    <Link href="/reports" style={{ color: "var(--text-3)", textDecoration: "none" }}>Reports</Link>
                    <span>›</span>
                    <span style={{ color: "var(--text-2)" }}>{report.district}</span>
                </div>

                {/* ═══ Two-column layout ═══ */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, alignItems: "start" }}>

                    {/* ── Left column: main content ── */}
                    <div>
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
                                    background: `${catMeta.color}20`, color: catMeta.color,
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
                            <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-1)", lineHeight: 1.35, marginBottom: 8 }}>
                                {report.title}
                            </h1>

                            {/* Location */}
                            <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 24 }}>
                                📍 {report.district}, Ward {report.wardNumber}
                            </p>

                            {/* Description */}
                            {report.description && (
                                <div style={{ ...cardStyle, marginBottom: 24 }}>
                                    <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                        Description
                                    </h3>
                                    <p style={{ fontSize: 14, color: "var(--text-1)", lineHeight: 1.7 }}>
                                        {report.description}
                                    </p>
                                </div>
                            )}
                        </motion.div>

                        {/* ── Status Timeline ── */}
                        <div style={{ ...cardStyle, marginBottom: 24 }}>
                            <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-3)", marginBottom: 18, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                Status Timeline
                            </h3>
                            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                                {TIMELINE_STEPS.map((step, i) => {
                                    const active = i <= timelineIdx;
                                    const isCurrent = i === timelineIdx;
                                    const labels = ["Submitted", "Echoed", "Petition", "Settled"];
                                    const icons = ["📝", "🔊", "📋", "✅"];
                                    return (
                                        <React.Fragment key={step}>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: "0 0 auto" }}>
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: "50%",
                                                    display: "grid", placeItems: "center", fontSize: 16,
                                                    background: active ? "var(--accent-dim)" : "rgba(255,255,255,0.04)",
                                                    border: isCurrent ? "2px solid var(--accent)" : "2px solid transparent",
                                                    transition: "all 0.3s",
                                                }}>
                                                    {icons[i]}
                                                </div>
                                                <span style={{
                                                    fontSize: 10, fontWeight: active ? 600 : 400,
                                                    color: active ? "var(--accent)" : "var(--text-3)",
                                                    textTransform: "capitalize",
                                                }}>
                                                    {labels[i]}
                                                </span>
                                            </div>
                                            {i < TIMELINE_STEPS.length - 1 && (
                                                <div style={{
                                                    flex: 1, height: 2, marginBottom: 20,
                                                    background: i < timelineIdx
                                                        ? "var(--accent)"
                                                        : "rgba(255,255,255,0.08)",
                                                    transition: "background 0.3s",
                                                }} />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Echo Progress Bar ── */}
                        {!report.isPetition && (
                            <div style={{ ...cardStyle, marginBottom: 24 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
                                    <span style={{ color: "var(--text-2)", fontWeight: 500 }}>
                                        {report.upvotes} / {threshold} echoes to become a petition
                                    </span>
                                    <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                                        {progress}%
                                    </span>
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
                                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 8 }}>
                                    {threshold - report.upvotes > 0
                                        ? `${threshold - report.upvotes} more echoes needed to escalate to petition`
                                        : "Petition threshold reached!"}
                                </p>
                            </div>
                        )}

                        {/* ── Evidence & Reporter ── */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                            <div style={cardStyle}>
                                <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                    Evidence (IPFS)
                                </h3>
                                <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--cyan)", wordBreak: "break-all" }}>
                                    {report.ipfsCid}
                                </p>
                            </div>
                            <div style={cardStyle}>
                                <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                    Anonymous Reporter
                                </h3>
                                <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-2)", wordBreak: "break-all" }}>
                                    {report.reporter}
                                </p>
                            </div>
                        </div>

                        {/* ── Action buttons ── */}
                        <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
                            <button
                                onClick={() => echoReport(report.id)}
                                style={{
                                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    padding: "14px 0", borderRadius: 12, fontSize: 14, fontWeight: 600,
                                    background: `linear-gradient(135deg, ${catMeta.color}, var(--purple))`,
                                    color: "#fff", border: "none", cursor: "pointer",
                                    boxShadow: `0 4px 16px ${catMeta.color}30`,
                                    transition: "transform 0.15s, box-shadow 0.15s",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                            >
                                🔊 Echo This Report
                            </button>
                            <div style={{ position: "relative" }}>
                                <button
                                    onClick={() => setShareOpen(!shareOpen)}
                                    style={{
                                        padding: "14px 20px", borderRadius: 12, fontSize: 14, fontWeight: 500,
                                        background: "rgba(255,255,255,0.04)", border: "1px solid var(--line)",
                                        color: "var(--text-2)", cursor: "pointer", transition: "all 0.15s",
                                    }}
                                >
                                    📤 Share
                                </button>
                                {/* Share dropdown */}
                                {shareOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 50,
                                            background: "var(--bg-card)", border: "1px solid var(--line)",
                                            borderRadius: 12, padding: 8, minWidth: 200,
                                            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                                        }}
                                    >
                                        <button
                                            onClick={handleCopyLink}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 8, width: "100%",
                                                padding: "10px 14px", borderRadius: 8, border: "none",
                                                background: "transparent", color: "var(--text-1)", fontSize: 13,
                                                cursor: "pointer", textAlign: "left",
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                        >
                                            {copied ? "✅ Copied!" : "📋 Copy Link"}
                                        </button>
                                        <a
                                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this civic report: ${report.title}`)}&url=${encodeURIComponent(pageUrl)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: "flex", alignItems: "center", gap: 8,
                                                padding: "10px 14px", borderRadius: 8, textDecoration: "none",
                                                color: "var(--text-1)", fontSize: 13,
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                        >
                                            🐦 Share on X
                                        </a>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* ── Comments ── */}
                        <CommentSection reportId={reportId} />
                    </div>

                    {/* ── Right sidebar ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 80 }}>

                        {/* Stats cards */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div style={{ ...cardStyle, textAlign: "center", padding: "20px 16px" }}>
                                <div style={{ fontSize: 28, fontWeight: 700, color: catMeta.color, fontFamily: "var(--font-mono)" }}>
                                    {report.upvotes}
                                </div>
                                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>Echoes</div>
                            </div>
                            <div style={{ ...cardStyle, textAlign: "center", padding: "20px 16px" }}>
                                <div style={{ fontSize: 28, fontWeight: 700, color: "var(--cyan)", fontFamily: "var(--font-mono)" }}>
                                    {progress}%
                                </div>
                                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>Threshold</div>
                            </div>
                        </div>

                        {/* Mini map placeholder */}
                        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
                            <div style={{
                                height: 180, borderRadius: "14px 14px 0 0", overflow: "hidden",
                                background: "var(--bg-secondary)",
                            }}>
                                <iframe
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${report.locationLng - 0.02}%2C${report.locationLat - 0.015}%2C${report.locationLng + 0.02}%2C${report.locationLat + 0.015}&layer=mapnik&marker=${report.locationLat}%2C${report.locationLng}`}
                                    style={{ width: "100%", height: "100%", border: "none", filter: "invert(0.92) hue-rotate(180deg) saturate(0.6) brightness(0.8)" }}
                                    loading="lazy"
                                />
                            </div>
                            <div style={{ padding: "12px 16px" }}>
                                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)", marginBottom: 2 }}>
                                    {report.district}, Ward {report.wardNumber}
                                </p>
                                <p style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                                    {report.locationLat.toFixed(4)}, {report.locationLng.toFixed(4)}
                                </p>
                            </div>
                        </div>

                        {/* Details */}
                        <div style={cardStyle}>
                            <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-3)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                Details
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {[
                                    { label: "Created", value: formatDate(report.createdAt) },
                                    { label: "Category", value: `${catMeta.emoji} ${catMeta.label}` },
                                    { label: "District", value: report.district },
                                    { label: "Ward No.", value: String(report.wardNumber) },
                                    { label: "Status", value: report.status },
                                ].map((item) => (
                                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                                        <span style={{ color: "var(--text-3)" }}>{item.label}</span>
                                        <span style={{ color: "var(--text-1)", fontWeight: 500, textTransform: "capitalize" }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Related Reports */}
                        {relatedReports.length > 0 && (
                            <div style={cardStyle}>
                                <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-3)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                    Related Reports
                                </h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {relatedReports.map((r) => {
                                        const rCat = CATEGORY_META[r.category] ?? CATEGORY_META.other;
                                        return (
                                            <Link
                                                key={r.id}
                                                href={`/report/${r.id}`}
                                                style={{
                                                    display: "flex", alignItems: "center", gap: 10,
                                                    padding: "10px 12px", borderRadius: 10,
                                                    background: "rgba(255,255,255,0.02)",
                                                    border: "1px solid rgba(255,255,255,0.04)",
                                                    textDecoration: "none",
                                                    transition: "all 0.15s",
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                                            >
                                                <span style={{ fontSize: 18, flexShrink: 0 }}>{rCat.emoji}</span>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                        {r.title}
                                                    </p>
                                                    <p style={{ fontSize: 11, color: "var(--text-3)" }}>
                                                        {r.district} · ▲ {r.upvotes}
                                                    </p>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
