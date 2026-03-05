"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useZkWhisper } from "@/hooks/useZkWhisper";
import { CATEGORY_META, type ReportCategory, type CivicReport } from "@/lib/types";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || "";

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

/* ─── Status badge color helper ─── */
function statusColor(status: string): { bg: string; text: string } {
    switch (status) {
        case "active": return { bg: "rgba(0,200,255,0.08)", text: "#00c8ff" };
        case "petition": return { bg: "rgba(0,232,123,0.1)", text: "#00e87b" };
        case "settled": return { bg: "rgba(59,130,246,0.12)", text: "#3b82f6" };
        case "resolved": return { bg: "rgba(34,197,94,0.1)", text: "#22c55e" };
        case "closed": return { bg: "rgba(255,255,255,0.05)", text: "#9d9db5" };
        default: return { bg: "rgba(255,255,255,0.05)", text: "#9d9db5" };
    }
}

export default function AdminPage() {
    const wallet = useWallet();
    const { reports, settleReport, deleteReport, updateReport } = useZkWhisper();
    const [searchQuery, setSearchQuery] = useState("");
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [editingReport, setEditingReport] = useState<CivicReport | null>(null);
    const [editForm, setEditForm] = useState<{ title: string; description: string; category: string; status: string }>({
        title: "", description: "", category: "", status: "",
    });
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const isAdmin = wallet.publicKey?.toBase58() === ADMIN_WALLET;

    /* ─── Unauthorized gate ─── */
    if (!mounted || !wallet.publicKey || !isAdmin) {
        return (
            <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
                <Navbar />
                <div style={{ textAlign: "center", padding: "120px 20px" }}>
                    <div style={{ fontSize: 56, marginBottom: 20 }}>🔒</div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-1)", marginBottom: 10 }}>
                        Admin Access Required
                    </h1>
                    <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 28, maxWidth: 400, margin: "0 auto 28px" }}>
                        {!wallet.publicKey
                            ? "Connect your admin wallet to access the dashboard."
                            : "This wallet is not authorized to access the admin panel."}
                    </p>
                    {mounted && !wallet.publicKey && <WalletMultiButton />}
                    <div style={{ marginTop: 24 }}>
                        <Link href="/" style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const filteredReports = useMemo(() => {
        if (!searchQuery.trim()) return reports;
        const q = searchQuery.toLowerCase();
        return reports.filter(
            (r) =>
                r.title.toLowerCase().includes(q) ||
                r.district.toLowerCase().includes(q) ||
                r.category.toLowerCase().includes(q) ||
                r.status.toLowerCase().includes(q)
        );
    }, [reports, searchQuery]);

    const handleSettle = async (id: string) => {
        await settleReport(id);
    };

    const handleDelete = async (id: string) => {
        await deleteReport(id);
        setConfirmDelete(null);
    };

    const openEdit = (report: CivicReport) => {
        setEditingReport(report);
        setEditForm({
            title: report.title,
            description: report.description,
            category: report.category,
            status: report.status,
        });
    };

    const handleSaveEdit = async () => {
        if (!editingReport) return;
        await updateReport(editingReport.id, editForm);
        setEditingReport(null);
    };

    const stats = useMemo(() => ({
        total: reports.length,
        active: reports.filter((r) => r.status === "active").length,
        settled: reports.filter((r) => r.status === "settled").length,
        petitions: reports.filter((r) => r.isPetition).length,
    }), [reports]);

    const btnBase: React.CSSProperties = {
        padding: "6px 14px",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
        transition: "all 0.15s",
    };

    return (
        <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
            <Navbar />

            {/* Header */}
            <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 20px 0" }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-1)", marginBottom: 6 }}>
                    🛡️ Admin Dashboard
                </h1>
                <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 24 }}>
                    Manage, settle, edit, and delete reports
                </p>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
                    {[
                        { label: "Total Reports", value: stats.total, color: "#00c8ff" },
                        { label: "Active", value: stats.active, color: "#f97316" },
                        { label: "Settled", value: stats.settled, color: "#3b82f6" },
                        { label: "Petitions", value: stats.petitions, color: "#00e87b" },
                    ].map((s) => (
                        <div
                            key={s.label}
                            style={{
                                background: "var(--bg-elevated)", border: "1px solid var(--line)",
                                borderRadius: 12, padding: "18px 20px",
                            }}
                        >
                            <div style={{ fontSize: 26, fontWeight: 700, color: s.color, fontFamily: "var(--font-mono)" }}>
                                {s.value}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Search */}
                <input
                    type="text"
                    placeholder="Search reports by title, district, category, status..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: "100%", maxWidth: 460, padding: "10px 18px", borderRadius: 10,
                        border: "1px solid var(--line)", background: "var(--bg-secondary)",
                        color: "var(--text-1)", fontSize: 13, outline: "none", marginBottom: 20,
                    }}
                />
            </div>

            {/* Table */}
            <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 20px 80px" }}>
                <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid var(--line)", background: "var(--bg-elevated)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--line)" }}>
                                {["Title", "District", "Category", "Echoes", "Status", "Date", "Actions"].map((h) => (
                                    <th
                                        key={h}
                                        style={{
                                            padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 600,
                                            color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.map((r) => {
                                const sc = statusColor(r.status);
                                const catMeta = CATEGORY_META[r.category] ?? CATEGORY_META.other;
                                return (
                                    <tr
                                        key={r.id}
                                        style={{
                                            borderBottom: "1px solid var(--line)",
                                            transition: "background 0.15s",
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                    >
                                        <td style={{ padding: "12px 16px", maxWidth: 240 }}>
                                            <Link href={`/report/${r.id}`} style={{ color: "var(--text-1)", textDecoration: "none", fontWeight: 500 }}>
                                                {r.title.length > 50 ? r.title.slice(0, 50) + "…" : r.title}
                                            </Link>
                                        </td>
                                        <td style={{ padding: "12px 16px", color: "var(--text-2)", whiteSpace: "nowrap" }}>
                                            {r.district}
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <span style={{
                                                fontSize: 11, padding: "2px 10px", borderRadius: 999,
                                                background: `${catMeta.color}15`, color: catMeta.color, fontWeight: 500,
                                            }}>
                                                {catMeta.emoji} {catMeta.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px 16px", fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--accent)" }}>
                                            ▲ {r.upvotes}
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <span style={{
                                                fontSize: 11, padding: "3px 10px", borderRadius: 999,
                                                background: sc.bg, color: sc.text, fontWeight: 500, textTransform: "capitalize",
                                            }}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px 16px", color: "var(--text-3)", whiteSpace: "nowrap" }}>
                                            {timeAgo(r.createdAt)}
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <div style={{ display: "flex", gap: 6, flexWrap: "nowrap" }}>
                                                {r.status !== "settled" && (
                                                    <button
                                                        onClick={() => handleSettle(r.id)}
                                                        style={{
                                                            ...btnBase,
                                                            background: "rgba(59,130,246,0.12)", color: "#3b82f6",
                                                        }}
                                                    >
                                                        ✓ Settle
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openEdit(r)}
                                                    style={{
                                                        ...btnBase,
                                                        background: "rgba(234,179,8,0.1)", color: "#eab308",
                                                    }}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                {confirmDelete === r.id ? (
                                                    <div style={{ display: "flex", gap: 4 }}>
                                                        <button
                                                            onClick={() => handleDelete(r.id)}
                                                            style={{ ...btnBase, background: "var(--danger)", color: "#fff" }}
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmDelete(null)}
                                                            style={{ ...btnBase, background: "rgba(255,255,255,0.06)", color: "var(--text-2)" }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setConfirmDelete(r.id)}
                                                        style={{ ...btnBase, background: "var(--danger-dim)", color: "var(--danger)" }}
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredReports.length === 0 && (
                        <div style={{ textAlign: "center", padding: "48px 20px" }}>
                            <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
                            <p style={{ fontSize: 14, color: "var(--text-2)" }}>No reports found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingReport && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: "fixed", inset: 0, zIndex: 200,
                            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            padding: 20,
                        }}
                        onClick={() => setEditingReport(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: "var(--bg-card)", border: "1px solid var(--line)",
                                borderRadius: 16, padding: 28, width: "100%", maxWidth: 520,
                            }}
                        >
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", marginBottom: 20 }}>
                                Edit Report
                            </h2>

                            {/* Title */}
                            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", marginBottom: 6, display: "block" }}>Title</label>
                            <input
                                value={editForm.title}
                                onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                                style={{
                                    width: "100%", padding: "10px 14px", borderRadius: 10,
                                    border: "1px solid var(--line)", background: "var(--bg-secondary)",
                                    color: "var(--text-1)", fontSize: 13, outline: "none", marginBottom: 16,
                                }}
                            />

                            {/* Description */}
                            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", marginBottom: 6, display: "block" }}>Description</label>
                            <textarea
                                value={editForm.description}
                                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                                rows={4}
                                style={{
                                    width: "100%", padding: "10px 14px", borderRadius: 10,
                                    border: "1px solid var(--line)", background: "var(--bg-secondary)",
                                    color: "var(--text-1)", fontSize: 13, outline: "none", resize: "vertical", marginBottom: 16,
                                }}
                            />

                            {/* Category */}
                            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", marginBottom: 6, display: "block" }}>Category</label>
                            <select
                                value={editForm.category}
                                onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                                style={{
                                    width: "100%", padding: "10px 14px", borderRadius: 10,
                                    border: "1px solid var(--line)", background: "var(--bg-secondary)",
                                    color: "var(--text-1)", fontSize: 13, outline: "none", marginBottom: 16,
                                }}
                            >
                                {Object.entries(CATEGORY_META).map(([key, meta]) => (
                                    <option key={key} value={key}>{meta.emoji} {meta.label}</option>
                                ))}
                            </select>

                            {/* Status */}
                            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", marginBottom: 6, display: "block" }}>Status</label>
                            <select
                                value={editForm.status}
                                onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                                style={{
                                    width: "100%", padding: "10px 14px", borderRadius: 10,
                                    border: "1px solid var(--line)", background: "var(--bg-secondary)",
                                    color: "var(--text-1)", fontSize: 13, outline: "none", marginBottom: 24,
                                }}
                            >
                                {["active", "petition", "resolved", "closed", "settled"].map((s) => (
                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                ))}
                            </select>

                            {/* Buttons */}
                            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                                <button
                                    onClick={() => setEditingReport(null)}
                                    style={{
                                        ...btnBase, padding: "10px 20px",
                                        background: "rgba(255,255,255,0.06)", color: "var(--text-2)",
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    style={{
                                        ...btnBase, padding: "10px 24px",
                                        background: "var(--accent)", color: "#07070d",
                                    }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
