import React from "react";
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";
import { COLORS, FONTS } from "../theme";

const FEATURES = [
    {
        icon: "💬",
        title: "Comments & Discussion",
        desc: "Wallet-connected discussion threads on every report. Share evidence and coordinate — anonymously.",
        gradient: `linear-gradient(135deg, ${COLORS.cyan}20, transparent)`,
    },
    {
        icon: "🔍",
        title: "Search & Filter",
        desc: "Browse all reports, search by keyword, filter by category. Find what matters to your community.",
        gradient: `linear-gradient(135deg, ${COLORS.purple}20, transparent)`,
    },
    {
        icon: "📊",
        title: "Personal Dashboard",
        desc: "Track reports filed, echoes received, and unlock achievement badges: First Voice, Petition Starter, and more.",
        gradient: `linear-gradient(135deg, ${COLORS.accent}20, transparent)`,
    },
    {
        icon: "🏆",
        title: "Leaderboard & Tiers",
        desc: "Top reporters and most active districts. Climb from Bronze to Diamond tier. Civic accountability as a movement.",
        gradient: `linear-gradient(135deg, ${COLORS.yellow}20, transparent)`,
    },
    {
        icon: "🛡️",
        title: "Admin Panel",
        desc: "Wallet-gated admin tools to settle, edit, or remove reports. Keeping the platform clean and responsive.",
        gradient: `linear-gradient(135deg, ${COLORS.danger}20, transparent)`,
    },
];

export const FeaturesScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const labelOp = interpolate(frame, [0, fps], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    const fadeOut = interpolate(frame, [fps * 48, fps * 50], [1, 0], {
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
            {/* Ambient glow */}
            <div
                style={{
                    position: "absolute",
                    top: "40%",
                    left: "50%",
                    width: 1200,
                    height: 600,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${COLORS.accentGlow} 0%, transparent 70%)`,
                    transform: "translate(-50%, -50%)",
                    opacity: 0.1,
                    filter: "blur(80px)",
                }}
            />

            <div style={{ padding: "60px 100px" }}>
                {/* Header */}
                <div style={{ opacity: labelOp, marginBottom: 50 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.accent, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
                        Platform Features
                    </div>
                    <div style={{ fontSize: 48, fontWeight: 800, color: COLORS.text1, lineHeight: 1.15 }}>
                        Everything you need to
                        <br />
                        <span style={{
                            background: `linear-gradient(135deg, ${COLORS.accent} 30%, ${COLORS.cyan} 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}>
                            drive change.
                        </span>
                    </div>
                </div>

                {/* Feature cards — 2 rows */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
                    {FEATURES.map((feat, i) => {
                        const start = fps * 3 + i * fps * 2.5;
                        const op = interpolate(frame, [start, start + fps], [0, 1], {
                            extrapolateLeft: "clamp", extrapolateRight: "clamp",
                        });
                        const y = interpolate(frame, [start, start + fps], [30, 0], {
                            extrapolateLeft: "clamp", extrapolateRight: "clamp",
                        });

                        return (
                            <div
                                key={i}
                                style={{
                                    width: i < 3 ? "calc(33.33% - 16px)" : "calc(50% - 12px)",
                                    padding: "32px 28px",
                                    borderRadius: 16,
                                    background: feat.gradient,
                                    border: `1px solid ${COLORS.line2}`,
                                    backdropFilter: "blur(8px)",
                                    opacity: op,
                                    transform: `translateY(${y}px)`,
                                }}
                            >
                                <div style={{ fontSize: 36, marginBottom: 16 }}>{feat.icon}</div>
                                <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text1, marginBottom: 10 }}>
                                    {feat.title}
                                </div>
                                <div style={{ fontSize: 14, color: COLORS.text2, lineHeight: 1.7 }}>
                                    {feat.desc}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AbsoluteFill>
    );
};
