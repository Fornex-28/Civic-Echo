import React from "react";
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";
import { COLORS, FONTS } from "../theme";

export const LandingScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    /* ── Badge ── */
    const badgeOp = interpolate(frame, [fps * 0.5, fps * 1.5], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    /* ── Title ── */
    const titleOp = interpolate(frame, [fps * 1.5, fps * 3], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    const titleY = interpolate(frame, [fps * 1.5, fps * 3], [40, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    /* ── Subtitle ── */
    const subOp = interpolate(frame, [fps * 3, fps * 5], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    /* ── Stats ── */
    const statsOp = interpolate(frame, [fps * 6, fps * 8], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    const statsY = interpolate(frame, [fps * 6, fps * 8], [30, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    /* ── Features ── */
    const FEATURES = [
        { icon: "🔐", label: "Anonymous" },
        { icon: "⛓️", label: "On-Chain" },
        { icon: "🗺️", label: "Map-Based" },
        { icon: "📣", label: "Community Driven" },
    ];
    const featStart = fps * 10;

    /* ── Fade out ── */
    const fadeOut = interpolate(frame, [fps * 23, fps * 25], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    /* ── Blinking dot ── */
    const blink = Math.sin(frame * 0.15) > 0 ? 1 : 0.3;

    return (
        <AbsoluteFill
            style={{
                background: `radial-gradient(ellipse at 30% 50%, ${COLORS.bgSecondary} 0%, ${COLORS.bgPrimary} 70%)`,
                fontFamily: FONTS.sans,
                opacity: fadeOut,
            }}
        >
            {/* Large ambient glow */}
            <div
                style={{
                    position: "absolute",
                    top: "30%",
                    right: "-10%",
                    width: 900,
                    height: 900,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, rgba(0,232,123,0.08) 0%, transparent 70%)`,
                    filter: "blur(60px)",
                }}
            />

            {/* Content */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "0 140px",
                    height: "100%",
                }}
            >
                {/* Live badge */}
                <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 20px",
                        borderRadius: 999,
                        border: `1px solid rgba(0,232,123,0.2)`,
                        background: "rgba(0,232,123,0.06)",
                        fontSize: 16,
                        fontWeight: 500,
                        color: COLORS.accent,
                        marginBottom: 36,
                        backdropFilter: "blur(8px)",
                        opacity: badgeOp,
                        width: "fit-content",
                    }}
                >
                    <span
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: COLORS.accent,
                            opacity: blink,
                        }}
                    />
                    Live on Solana Devnet
                </div>

                {/* Title */}
                <div
                    style={{
                        fontSize: 80,
                        fontWeight: 800,
                        lineHeight: 1.05,
                        letterSpacing: "-0.03em",
                        color: COLORS.text1,
                        marginBottom: 28,
                        opacity: titleOp,
                        transform: `translateY(${titleY}px)`,
                    }}
                >
                    Civic{" "}
                    <span
                        style={{
                            background: `linear-gradient(135deg, ${COLORS.accent} 30%, ${COLORS.cyan} 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Echo
                    </span>
                </div>

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: 24,
                        lineHeight: 1.7,
                        color: COLORS.text2,
                        maxWidth: 700,
                        marginBottom: 60,
                        opacity: subOp,
                    }}
                >
                    Nepal's first decentralized whistleblowing platform.
                    <br />
                    Expose corruption, flag infrastructure failures —{" "}
                    <span style={{ color: COLORS.accent }}>completely anonymously</span>,
                    on Solana.
                </div>

                {/* Feature pills */}
                <div style={{ display: "flex", gap: 16, marginBottom: 60 }}>
                    {FEATURES.map((f, i) => {
                        const s = featStart + i * fps * 0.8;
                        const op = interpolate(frame, [s, s + fps * 0.5], [0, 1], {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                        });
                        const y = interpolate(frame, [s, s + fps * 0.5], [20, 0], {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                        });
                        return (
                            <div
                                key={i}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: "12px 24px",
                                    borderRadius: 12,
                                    background: "rgba(255,255,255,0.04)",
                                    border: `1px solid ${COLORS.line2}`,
                                    fontSize: 18,
                                    color: COLORS.text1,
                                    fontWeight: 500,
                                    opacity: op,
                                    transform: `translateY(${y}px)`,
                                }}
                            >
                                <span style={{ fontSize: 22 }}>{f.icon}</span>
                                {f.label}
                            </div>
                        );
                    })}
                </div>

                {/* Stats bar */}
                <div
                    style={{
                        display: "flex",
                        gap: 60,
                        padding: "24px 36px",
                        borderRadius: 16,
                        background: "rgba(10,10,20,0.5)",
                        border: `1px solid ${COLORS.line}`,
                        backdropFilter: "blur(12px)",
                        opacity: statsOp,
                        transform: `translateY(${statsY}px)`,
                        width: "fit-content",
                    }}
                >
                    {[
                        { n: "247", l: "Total Reports", c: COLORS.cyan },
                        { n: "12", l: "Petitions", c: COLORS.accent },
                        { n: "3,814", l: "Echoes", c: COLORS.purple },
                    ].map((s) => (
                        <div key={s.l}>
                            <div
                                style={{
                                    fontSize: 36,
                                    fontWeight: 700,
                                    color: s.c,
                                    fontFamily: FONTS.mono,
                                }}
                            >
                                {s.n}
                            </div>
                            <div style={{ fontSize: 14, color: COLORS.text3, marginTop: 4 }}>
                                {s.l}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AbsoluteFill>
    );
};
