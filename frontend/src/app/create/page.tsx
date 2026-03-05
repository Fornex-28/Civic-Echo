"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import NavSearch from "@/components/NavSearch";
import { useZkWhisper } from "@/hooks/useZkWhisper";
import { useToast } from "@/components/ToastProvider";
import type { ReportCategory } from "@/lib/types";

/* ─── Categories ─── */
const CATEGORIES: { key: ReportCategory; label: string; emoji: string; color: string; subs: string }[] = [
    { key: "roads", label: "Roads", emoji: "🛣️", color: "#f59e0b", subs: "Potholes, broken bridges, unpaved roads, traffic lights" },
    { key: "utilities", label: "Utilities", emoji: "🔧", color: "#3b82f6", subs: "Garbage, water pipes, electricity poles, sewers" },
    { key: "corruption", label: "Corruption", emoji: "💰", color: "#ef4444", subs: "Bribes, ghost projects, absent workers" },
    { key: "hazards", label: "Hazards", emoji: "⚠️", color: "#8b5cf6", subs: "Landslides, flooding, open manholes" },
    { key: "scam", label: "Scam", emoji: "🚨", color: "#f97316", subs: "College, government, office, job scams" },
];

/* ─── Nepal districts for location dropdown ─── */
const NEPAL_DISTRICTS = [
    "Kathmandu", "Lalitpur", "Bhaktapur", "Kavrepalanchok", "Chitwan",
    "Pokhara", "Butwal", "Birgunj", "Dharan", "Biratnagar",
    "Janakpur", "Hetauda", "Nepalgunj", "Dhangadhi", "Bharatpur",
];

/* ─── Approximate coords for districts ─── */
const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
    "Kathmandu": { lat: 27.7172, lng: 85.3240 },
    "Lalitpur": { lat: 27.6588, lng: 85.3247 },
    "Bhaktapur": { lat: 27.6710, lng: 85.4298 },
    "Kavrepalanchok": { lat: 27.5500, lng: 85.5500 },
    "Chitwan": { lat: 27.5291, lng: 84.3542 },
    "Pokhara": { lat: 28.2096, lng: 83.9856 },
    "Butwal": { lat: 27.7006, lng: 83.4483 },
    "Birgunj": { lat: 27.0104, lng: 84.8779 },
    "Dharan": { lat: 26.8065, lng: 87.2846 },
    "Biratnagar": { lat: 26.4525, lng: 87.2718 },
    "Janakpur": { lat: 26.7288, lng: 85.9263 },
    "Hetauda": { lat: 27.4287, lng: 85.0322 },
    "Nepalgunj": { lat: 28.0500, lng: 81.6167 },
    "Dhangadhi": { lat: 28.6960, lng: 80.5900 },
    "Bharatpur": { lat: 27.6833, lng: 84.4333 },
};

export default function CreateReportPage() {
    const router = useRouter();
    const { connected } = useWallet();
    const { createReport } = useZkWhisper();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<ReportCategory | "">("");
    const [district, setDistrict] = useState("");
    const [wardNumber, setWardNumber] = useState(1);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!title.trim()) { toast("error", "Please enter a title"); return; }
        if (!description.trim()) { toast("error", "Please enter a description"); return; }
        if (!category) { toast("error", "Please select a category"); return; }
        if (!district) { toast("error", "Please select a district"); return; }

        setSubmitting(true);
        const coords = DISTRICT_COORDS[district] || { lat: 27.7, lng: 85.3 };

        try {
            const reportId = await createReport({
                lat: coords.lat,
                lng: coords.lng,
                district,
                wardNumber,
                description,
                title,
                category,
                imageUrl: imagePreview || "",
            });

            if (reportId) {
                toast("success", "Report submitted successfully!");
                router.push("/reports");
            }
        } catch (err: any) {
            toast("error", err?.message || "Failed to submit report");
        } finally {
            setSubmitting(false);
        }
    }, [title, description, category, district, wardNumber, imagePreview, createReport, toast, router]);

    /* ─── Shared input style ─── */
    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "12px 16px",
        borderRadius: 10,
        border: "1px solid var(--line)",
        background: "var(--bg-secondary)",
        color: "var(--text-1)",
        fontSize: 14,
        outline: "none",
        transition: "border-color 0.2s",
    };

    const labelStyle: React.CSSProperties = {
        display: "block",
        fontSize: 13,
        fontWeight: 600,
        color: "var(--text-2)",
        marginBottom: 8,
    };

    return (
        <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
            {/* ─── Navbar ─── */}
            <nav
                style={{
                    position: "sticky", top: 0, zIndex: 100,
                    backdropFilter: "blur(24px) saturate(1.2)",
                    WebkitBackdropFilter: "blur(24px) saturate(1.2)",
                    background: "rgba(7,7,13,0.78)",
                    borderBottom: "1px solid var(--line)",
                }}
            >
                <div style={{
                    maxWidth: 1200, margin: "0 auto", padding: "0 20px",
                    height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                        <img src="/logo.png" alt="Civic Echo" style={{ width: 32, height: 32, borderRadius: 8 }} />
                        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>Civic Echo</span>
                    </Link>

                    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                        {[
                            { href: "/map", label: "Map" },
                            { href: "/reports", label: "Reports" },
                            { href: "/create", label: "+ Create", active: true },
                            { href: "/leaderboard", label: "Leaderboard" },
                            { href: "/dashboard", label: "Dashboard" },
                        ].map((l) => (
                            <Link
                                key={l.label}
                                href={l.href}
                                style={{
                                    fontSize: 13,
                                    fontWeight: l.active ? 700 : 500,
                                    color: l.active ? "#07070d" : "var(--text-2)",
                                    background: l.active ? "var(--accent)" : "transparent",
                                    textDecoration: "none",
                                    padding: l.active ? "6px 16px" : "6px 14px",
                                    borderRadius: l.active ? 20 : 8,
                                    boxShadow: l.active ? "0 2px 12px var(--accent-glow)" : "none",
                                }}
                            >{l.label}</Link>
                        ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <NavSearch />
                        <WalletMultiButton />
                    </div>
                </div>
            </nav>

            {/* ─── Main Content ─── */}
            <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 20px 80px" }}>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-1)", marginBottom: 6 }}>
                        📢 Create a Report
                    </h1>
                    <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 36 }}>
                        File an anonymous civic report. {connected
                            ? "Your report will be submitted on-chain to Solana devnet."
                            : "Connect your wallet to submit on-chain, or save locally."}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        background: "var(--bg-elevated, #141422)",
                        border: "1px solid var(--line)",
                        borderRadius: 14,
                        padding: 28,
                        display: "flex",
                        flexDirection: "column",
                        gap: 24,
                    }}
                >
                    {/* Title */}
                    <div>
                        <label style={labelStyle}>Title</label>
                        <input
                            type="text"
                            placeholder="Brief title of the issue..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={inputStyle}
                            maxLength={80}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label style={labelStyle}>Description</label>
                        <textarea
                            placeholder="Describe the issue in detail — what, where, when..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label style={labelStyle}>Category</label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.key}
                                    type="button"
                                    onClick={() => setCategory(cat.key)}
                                    style={{
                                        padding: "14px 14px",
                                        borderRadius: 12,
                                        border: category === cat.key
                                            ? `2px solid ${cat.color}`
                                            : "1px solid var(--line)",
                                        background: category === cat.key
                                            ? `${cat.color}15`
                                            : "var(--bg-secondary)",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-start",
                                        gap: 4,
                                        textAlign: "left",
                                    }}
                                >
                                    <div style={{
                                        display: "flex", alignItems: "center", gap: 8,
                                        color: category === cat.key ? cat.color : "var(--text-1)",
                                        fontSize: 14, fontWeight: 600,
                                    }}>
                                        <span>{cat.emoji}</span>
                                        {cat.label}
                                    </div>
                                    <div style={{
                                        fontSize: 11,
                                        color: category === cat.key ? cat.color : "var(--text-3)",
                                        opacity: category === cat.key ? 0.8 : 0.6,
                                        lineHeight: 1.3,
                                    }}>
                                        {cat.subs}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Location */}
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
                        <div>
                            <label style={labelStyle}>District</label>
                            <select
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                                style={{ ...inputStyle, cursor: "pointer" }}
                            >
                                <option value="">Select district...</option>
                                {NEPAL_DISTRICTS.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Ward No.</label>
                            <input
                                type="number"
                                min={1}
                                max={35}
                                value={wardNumber}
                                onChange={(e) => setWardNumber(parseInt(e.target.value) || 1)}
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label style={labelStyle}>Evidence Photo (optional)</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: "none" }}
                        />
                        {!imagePreview ? (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    width: "100%",
                                    padding: "32px 20px",
                                    borderRadius: 10,
                                    border: "2px dashed var(--line)",
                                    background: "transparent",
                                    color: "var(--text-3)",
                                    cursor: "pointer",
                                    fontSize: 14,
                                    transition: "all 0.2s",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <span style={{ fontSize: 28 }}>📷</span>
                                Click to upload an image
                                <span style={{ fontSize: 11, color: "var(--text-3)" }}>JPG, PNG, WebP up to 5MB</span>
                            </button>
                        ) : (
                            <div style={{ position: "relative", borderRadius: 10, overflow: "hidden" }}>
                                <img
                                    src={imagePreview}
                                    alt="Upload preview"
                                    style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 10 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => { setImagePreview(null); setImageFile(null); }}
                                    style={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                        width: 28,
                                        height: 28,
                                        borderRadius: "50%",
                                        border: "none",
                                        background: "rgba(0,0,0,0.7)",
                                        color: "#fff",
                                        fontSize: 14,
                                        cursor: "pointer",
                                        display: "grid",
                                        placeItems: "center",
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>

                    {/* On-chain indicator */}
                    <div style={{
                        padding: "10px 14px",
                        borderRadius: 8,
                        background: connected ? "rgba(0,232,123,0.06)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${connected ? "rgba(0,232,123,0.2)" : "var(--line)"}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 12,
                        color: connected ? "var(--accent)" : "var(--text-3)",
                    }}>
                        <span style={{
                            width: 6, height: 6, borderRadius: "50%",
                            background: connected ? "var(--accent)" : "var(--text-3)",
                        }} />
                        {connected
                            ? "On-chain mode — report will be saved to Solana devnet"
                            : "Offline mode — connect wallet to publish on-chain"}
                    </div>

                    {/* Submit */}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        style={{
                            width: "100%",
                            padding: "14px 20px",
                            borderRadius: 12,
                            border: "none",
                            background: submitting
                                ? "var(--text-3)"
                                : "linear-gradient(135deg, var(--accent), #00c896)",
                            color: "#07070d",
                            fontSize: 15,
                            fontWeight: 700,
                            cursor: submitting ? "not-allowed" : "pointer",
                            boxShadow: submitting ? "none" : "0 4px 20px var(--accent-glow)",
                            transition: "all 0.2s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                        }}
                    >
                        {submitting ? (
                            <>Submitting...</>
                        ) : (
                            <>🚀 Submit Report</>
                        )}
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
