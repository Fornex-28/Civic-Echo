"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ReportCategory, CATEGORY_META } from "@/lib/types";

const NEPAL_DISTRICTS = [
    "Achham", "Arghakhanchi", "Baglung", "Baitadi", "Bajhang", "Bajura", "Banke",
    "Bara", "Bardiya", "Bhaktapur", "Bhojpur", "Chitwan", "Dadeldhura", "Dailekh",
    "Dang", "Darchula", "Dhading", "Dhankuta", "Dhanusa", "Dolakha", "Dolpa",
    "Doti", "Gorkha", "Gulmi", "Humla", "Ilam", "Jajarkot", "Jhapa", "Jumla",
    "Kailali", "Kalikot", "Kanchanpur", "Kapilvastu", "Kaski", "Kathmandu",
    "Kavrepalanchok", "Khotang", "Lalitpur", "Lamjung", "Mahottari", "Makwanpur",
    "Manang", "Morang", "Mugu", "Mustang", "Myagdi", "Nawalparasi", "Nuwakot",
    "Okhaldhunga", "Palpa", "Panchthar", "Parbat", "Parsa", "Pyuthan", "Ramechhap",
    "Rasuwa", "Rautahat", "Rolpa", "Rukum", "Rupandehi", "Salyan", "Sankhuwasabha",
    "Saptari", "Sarlahi", "Sindhuli", "Sindhupalchok", "Siraha", "Solukhumbu",
    "Sunsari", "Surkhet", "Syangja", "Tanahu", "Taplejung", "Terhathum", "Udayapur",
];

const CATEGORIES: ReportCategory[] = [
    "roads", "utilities", "corruption", "hazards", "scam",
];

interface NewReportFormProps {
    lat: number;
    lng: number;
    onSubmit: (data: {
        district: string;
        wardNumber: number;
        description: string;
        title: string;
        category: ReportCategory;
        imageUrl: string;
    }) => void;
    onCancel: () => void;
}

export default function NewReportForm({ lat, lng, onSubmit, onCancel }: NewReportFormProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [category, setCategory] = useState<ReportCategory | "">("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [district, setDistrict] = useState("");
    const [wardNumber, setWardNumber] = useState(1);
    const [imageUrl, setImageUrl] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) return; // 5MB limit

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setImageUrl(result);
            setImagePreview(result);
        };
        reader.readAsDataURL(file);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!category || !title.trim() || !district || !description.trim()) return;
        onSubmit({
            district,
            wardNumber,
            description: description.trim(),
            title: title.trim(),
            category: category as ReportCategory,
            imageUrl,
        });
    };

    const canContinue = !!category && title.trim().length > 5;
    const canSubmit = canContinue && !!district && description.trim().length > 10;

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid var(--line)",
        background: "var(--bg-secondary)",
        color: "var(--text-1)",
        fontSize: 13,
        outline: "none",
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                style={{ overflowY: "auto", padding: "20px 0" }}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    style={{
                        background: "rgba(16, 16, 32, 0.97)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid var(--line)",
                        borderRadius: 16,
                        padding: 0,
                        maxWidth: 520,
                        width: "calc(100% - 32px)",
                        overflow: "hidden",
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: "18px 24px",
                        borderBottom: "1px solid var(--line)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}>
                        <div>
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>
                                📢 Submit a Report
                            </h2>
                            <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                                Step {step} of 2 — {step === 1 ? "What & Where" : "Details & Photo"}
                            </p>
                        </div>
                        <button
                            onClick={onCancel}
                            style={{
                                background: "none", border: "none", color: "var(--text-3)",
                                cursor: "pointer", fontSize: 16, padding: 4,
                            }}
                        >✕</button>
                    </div>

                    {/* Location badge */}
                    <div style={{
                        padding: "8px 24px",
                        background: "rgba(0,200,255,0.04)",
                        borderBottom: "1px solid var(--line)",
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--text-3)",
                    }}>
                        📍 {lat.toFixed(5)}, {lng.toFixed(5)}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ padding: "20px 24px" }}>
                            {step === 1 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    {/* Category picker */}
                                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 10 }}>
                                        Category
                                    </label>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
                                        {CATEGORIES.map((cat) => {
                                            const meta = CATEGORY_META[cat];
                                            const active = category === cat;
                                            return (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => setCategory(cat)}
                                                    style={{
                                                        padding: "12px 8px",
                                                        borderRadius: 10,
                                                        border: `1.5px solid ${active ? meta.color : "var(--line)"}`,
                                                        background: active ? `${meta.color}10` : "transparent",
                                                        cursor: "pointer",
                                                        textAlign: "center",
                                                        transition: "all 0.15s",
                                                    }}
                                                >
                                                    <div style={{ fontSize: 22, marginBottom: 4 }}>{meta.emoji}</div>
                                                    <div style={{ fontSize: 11, fontWeight: 500, color: active ? meta.color : "var(--text-2)" }}>
                                                        {meta.label}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Title */}
                                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Brief headline of the issue..."
                                        maxLength={100}
                                        style={inputStyle}
                                    />
                                    <p style={{ fontSize: 10, color: "var(--text-3)", marginTop: 4, textAlign: "right" }}>
                                        {title.length}/100
                                    </p>

                                    {/* Continue button */}
                                    <button
                                        type="button"
                                        disabled={!canContinue}
                                        onClick={() => setStep(2)}
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            borderRadius: 10,
                                            border: "none",
                                            background: canContinue ? "var(--accent)" : "var(--bg-secondary)",
                                            color: canContinue ? "#07070d" : "var(--text-3)",
                                            fontWeight: 600,
                                            fontSize: 14,
                                            cursor: canContinue ? "pointer" : "not-allowed",
                                            marginTop: 8,
                                        }}
                                    >
                                        Continue →
                                    </button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    {/* District + Ward row */}
                                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 14 }}>
                                        <div>
                                            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
                                                District
                                            </label>
                                            <select
                                                value={district}
                                                onChange={(e) => setDistrict(e.target.value)}
                                                style={{ ...inputStyle, cursor: "pointer" }}
                                                required
                                            >
                                                <option value="">Select...</option>
                                                {NEPAL_DISTRICTS.map((d) => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
                                                Ward
                                            </label>
                                            <input
                                                type="number" min={1} max={33}
                                                value={wardNumber}
                                                onChange={(e) => setWardNumber(Number(e.target.value))}
                                                style={inputStyle}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
                                        Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe the issue in detail..."
                                        rows={3}
                                        maxLength={512}
                                        style={{ ...inputStyle, resize: "vertical" }}
                                        required
                                    />
                                    <p style={{ fontSize: 10, color: "var(--text-3)", marginTop: 2, textAlign: "right", marginBottom: 14 }}>
                                        {description.length}/512
                                    </p>

                                    {/* Photo upload */}
                                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
                                        Photo Evidence (optional)
                                    </label>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handleImageUpload}
                                        style={{ display: "none" }}
                                    />
                                    {!imagePreview ? (
                                        <button
                                            type="button"
                                            onClick={() => fileRef.current?.click()}
                                            style={{
                                                width: "100%",
                                                padding: "28px 16px",
                                                borderRadius: 10,
                                                border: "2px dashed var(--line)",
                                                background: "transparent",
                                                cursor: "pointer",
                                                textAlign: "center",
                                                color: "var(--text-3)",
                                                fontSize: 13,
                                                marginBottom: 16,
                                            }}
                                        >
                                            📷 Click to upload or take photo
                                        </button>
                                    ) : (
                                        <div style={{ position: "relative", marginBottom: 16 }}>
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                style={{
                                                    width: "100%",
                                                    height: 140,
                                                    objectFit: "cover",
                                                    borderRadius: 10,
                                                    border: "1px solid var(--line)",
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => { setImageUrl(""); setImagePreview(""); }}
                                                style={{
                                                    position: "absolute", top: 6, right: 6,
                                                    width: 24, height: 24, borderRadius: 999,
                                                    background: "rgba(0,0,0,0.7)", border: "none",
                                                    color: "#fff", cursor: "pointer", fontSize: 11,
                                                    display: "grid", placeItems: "center",
                                                }}
                                            >✕</button>
                                        </div>
                                    )}

                                    {/* Buttons */}
                                    <div style={{ display: "flex", gap: 10 }}>
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            style={{
                                                flex: 1, padding: "12px", borderRadius: 10,
                                                border: "1px solid var(--line)", background: "transparent",
                                                color: "var(--text-2)", fontWeight: 500, fontSize: 13,
                                                cursor: "pointer",
                                            }}
                                        >← Back</button>
                                        <button
                                            type="submit"
                                            disabled={!canSubmit}
                                            style={{
                                                flex: 2, padding: "12px", borderRadius: 10,
                                                border: "none",
                                                background: canSubmit
                                                    ? "linear-gradient(135deg, var(--danger), var(--purple))"
                                                    : "var(--bg-secondary)",
                                                color: canSubmit ? "#fff" : "var(--text-3)",
                                                fontWeight: 600, fontSize: 14,
                                                cursor: canSubmit ? "pointer" : "not-allowed",
                                                boxShadow: canSubmit ? "0 4px 16px rgba(255,59,92,0.2)" : "none",
                                            }}
                                        >Submit Report</button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
