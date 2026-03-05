"use client";

import React from "react";

export default function NavSearch() {
    return (
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ position: "absolute", left: 10, pointerEvents: "none" }}
            >
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
                type="text"
                placeholder="Search reports..."
                onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                        window.location.href = `/reports?q=${encodeURIComponent((e.target as HTMLInputElement).value.trim())}`;
                    }
                }}
                style={{
                    width: 180,
                    padding: "7px 12px 7px 32px",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.8)",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 20,
                    outline: "none",
                    transition: "all 0.25s",
                    backdropFilter: "blur(8px)",
                }}
                onFocus={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.borderColor = "rgba(0,232,123,0.3)";
                    e.currentTarget.style.boxShadow = "0 0 12px rgba(0,232,123,0.1)";
                    e.currentTarget.style.width = "220px";
                }}
                onBlur={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.width = "180px";
                }}
            />
        </div>
    );
}
