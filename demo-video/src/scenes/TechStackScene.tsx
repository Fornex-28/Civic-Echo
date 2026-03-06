import React from "react";
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";
import { COLORS, FONTS } from "../theme";

const STACK = [
    { label: "Next.js 16", sub: "React 19, SSR, App Router", color: COLORS.text1, icon: "⚡" },
    { label: "Solana", sub: "Anchor Framework, Devnet", color: "#9945FF", icon: "⛓️" },
    { label: "Mapbox GL", sub: "3D Globe, Satellite View", color: COLORS.cyan, icon: "🗺️" },
    { label: "Supabase", sub: "PostgreSQL, Real-time, RLS", color: COLORS.accent, icon: "🗄️" },
    { label: "Framer Motion", sub: "Animations, Transitions", color: COLORS.purple, icon: "✨" },
    { label: "Phantom Wallet", sub: "Solana Wallet Adapter", color: "#AB9FF2", icon: "👛" },
];

const ARCHITECTURE = [
    { from: "User / Phantom", to: "Next.js Frontend", label: "Wallet Connect" },
    { from: "Next.js Frontend", to: "Solana Devnet", label: "On-chain TX" },
    { from: "Next.js Frontend", to: "Supabase", label: "CRUD + Real-time" },
    { from: "Next.js Frontend", to: "Mapbox GL", label: "3D Rendering" },
];

export const TechStackScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const labelOp = interpolate(frame, [0, fps], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    const fadeOut = interpolate(frame, [fps * 13, fps * 15], [1, 0], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: COLORS.bgPrimary,
                fontFamily: FONTS.sans,
                opacity: fadeOut,
            }}
        >
            <div style={{ padding: "60px 100px" }}>
                {/* Header */}
                <div style={{ opacity: labelOp, marginBottom: 50 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.accent, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
                        Under the Hood
                    </div>
                    <div style={{ fontSize: 48, fontWeight: 800, color: COLORS.text1, lineHeight: 1.15 }}>
                        Built with{" "}
                        <span style={{
                            background: `linear-gradient(135deg, ${COLORS.accent} 30%, ${COLORS.cyan} 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}>
                            modern tech.
                        </span>
                    </div>
                </div>

                {/* Stack grid */}
                <div style={{ display: "flex", gap: 20, marginBottom: 50 }}>
                    {STACK.map((tech, i) => {
                        const start = fps * 2 + i * fps * 0.8;
                        const op = interpolate(frame, [start, start + fps * 0.5], [0, 1], {
                            extrapolateLeft: "clamp", extrapolateRight: "clamp",
                        });
                        const y = interpolate(frame, [start, start + fps * 0.5], [25, 0], {
                            extrapolateLeft: "clamp", extrapolateRight: "clamp",
                        });

                        return (
                            <div
                                key={i}
                                style={{
                                    flex: 1,
                                    padding: "28px 20px",
                                    borderRadius: 14,
                                    background: `rgba(${tech.color === COLORS.text1 ? "240,240,243" : "0,232,123"},0.04)`,
                                    border: `1px solid ${COLORS.line2}`,
                                    textAlign: "center",
                                    opacity: op,
                                    transform: `translateY(${y}px)`,
                                }}
                            >
                                <div style={{ fontSize: 32, marginBottom: 12 }}>{tech.icon}</div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: tech.color, marginBottom: 6 }}>
                                    {tech.label}
                                </div>
                                <div style={{ fontSize: 12, color: COLORS.text3, lineHeight: 1.5 }}>
                                    {tech.sub}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Architecture flow */}
                <div
                    style={{
                        padding: "32px 40px",
                        borderRadius: 16,
                        background: "rgba(20,20,34,0.5)",
                        border: `1px solid ${COLORS.line}`,
                        opacity: interpolate(frame, [fps * 7, fps * 8.5], [0, 1], {
                            extrapolateLeft: "clamp", extrapolateRight: "clamp",
                        }),
                    }}
                >
                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>
                        Architecture Flow
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
                        {ARCHITECTURE.map((flow, i) => {
                            const start = fps * 9 + i * fps * 0.8;
                            const op = interpolate(frame, [start, start + fps * 0.4], [0, 1], {
                                extrapolateLeft: "clamp", extrapolateRight: "clamp",
                            });
                            return (
                                <React.Fragment key={i}>
                                    {i === 0 && (
                                        <div
                                            style={{
                                                padding: "14px 24px",
                                                borderRadius: 10,
                                                background: COLORS.accentDim,
                                                border: `1px solid ${COLORS.accent}30`,
                                                fontSize: 14,
                                                fontWeight: 600,
                                                color: COLORS.text1,
                                                opacity: op,
                                            }}
                                        >
                                            {flow.from}
                                        </div>
                                    )}
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: op }}>
                                        <div style={{ fontSize: 10, color: COLORS.text3 }}>{flow.label}</div>
                                        <div style={{ fontSize: 20, color: COLORS.accent }}>→</div>
                                    </div>
                                    <div
                                        style={{
                                            padding: "14px 24px",
                                            borderRadius: 10,
                                            background: "rgba(255,255,255,0.04)",
                                            border: `1px solid ${COLORS.line2}`,
                                            fontSize: 14,
                                            fontWeight: 600,
                                            color: COLORS.text1,
                                            opacity: op,
                                        }}
                                    >
                                        {flow.to}
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};
