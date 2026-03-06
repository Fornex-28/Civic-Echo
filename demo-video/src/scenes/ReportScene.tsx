import React from "react";
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";
import { COLORS, FONTS, CATEGORIES } from "../theme";

const FORM_FIELDS = [
    { label: "District", value: "Kathmandu", delay: 0 },
    { label: "Ward Number", value: "16", delay: 0.6 },
    { label: "Category", value: "🛣️ Roads", delay: 1.2 },
    { label: "Title", value: "Massive pothole near Kalanki junction", delay: 1.8 },
];

const ZK_STEPS = [
    "Initializing ZK circuit...",
    "Generating witness from identity...",
    "Computing proof (Groth16)...",
    "Verifying proof on-chain...",
    "Citizenship status: VERIFIED ✓",
];

export const ReportScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    /* ── Section label ── */
    const labelOp = interpolate(frame, [0, fps], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    /* ── Form card ── */
    const formOp = interpolate(frame, [fps * 1, fps * 2.5], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    const formX = interpolate(frame, [fps * 1, fps * 2.5], [-50, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    /* ── ZK modal ── */
    const zkStart = fps * 18;
    const zkOp = interpolate(frame, [zkStart, zkStart + fps], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    /* ── Success ── */
    const successStart = fps * 35;
    const successOp = interpolate(frame, [successStart, successStart + fps], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    /* ── Fade out ── */
    const fadeOut = interpolate(frame, [fps * 38, fps * 40], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: COLORS.bgPrimary,
                fontFamily: FONTS.sans,
                opacity: fadeOut,
            }}
        >
            {/* Left side — Form */}
            <div
                style={{
                    position: "absolute",
                    left: 100,
                    top: 80,
                    width: 700,
                    opacity: formOp,
                    transform: `translateX(${formX}px)`,
                }}
            >
                {/* Section label */}
                <div
                    style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: COLORS.accent,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        marginBottom: 12,
                        opacity: labelOp,
                    }}
                >
                    File a Report
                </div>

                <div
                    style={{
                        fontSize: 48,
                        fontWeight: 800,
                        color: COLORS.text1,
                        marginBottom: 50,
                        lineHeight: 1.15,
                    }}
                >
                    Click. Describe.
                    <br />
                    <span
                        style={{
                            background: `linear-gradient(135deg, ${COLORS.accent} 30%, ${COLORS.cyan} 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Submit anonymously.
                    </span>
                </div>

                {/* Form card */}
                <div
                    style={{
                        padding: "32px 36px",
                        borderRadius: 18,
                        background: "rgba(20,20,34,0.7)",
                        border: `1px solid ${COLORS.line2}`,
                        backdropFilter: "blur(20px)",
                    }}
                >
                    {FORM_FIELDS.map((field, i) => {
                        const start = fps * 4 + field.delay * fps;
                        const op = interpolate(frame, [start, start + fps * 0.5], [0, 1], {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                        });
                        // Typewriter for value
                        const typeStart = start + fps * 0.5;
                        const chars = Math.floor(
                            interpolate(frame, [typeStart, typeStart + fps * 1.2], [0, field.value.length], {
                                extrapolateLeft: "clamp",
                                extrapolateRight: "clamp",
                            })
                        );
                        const showCursor = frame > typeStart && frame < typeStart + fps * 1.5;

                        return (
                            <div key={i} style={{ marginBottom: 20, opacity: op }}>
                                <div
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: COLORS.text3,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.08em",
                                        marginBottom: 8,
                                    }}
                                >
                                    {field.label}
                                </div>
                                <div
                                    style={{
                                        padding: "14px 18px",
                                        borderRadius: 10,
                                        background: "rgba(255,255,255,0.04)",
                                        border: `1px solid ${COLORS.line2}`,
                                        fontSize: 18,
                                        color: COLORS.text1,
                                        fontFamily: field.label === "Category" ? FONTS.sans : FONTS.mono,
                                        minHeight: 48,
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    {field.value.slice(0, chars)}
                                    {showCursor && (
                                        <span style={{ color: COLORS.accent, fontWeight: 700 }}>▊</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Image upload area */}
                    {frame > fps * 12 && (
                        <div
                            style={{
                                padding: "24px",
                                borderRadius: 12,
                                border: `2px dashed ${COLORS.line2}`,
                                textAlign: "center",
                                opacity: interpolate(
                                    frame,
                                    [fps * 12, fps * 13],
                                    [0, 1],
                                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                                ),
                            }}
                        >
                            <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
                            <div style={{ fontSize: 14, color: COLORS.text3 }}>
                                Photo uploaded — <span style={{ color: COLORS.accent }}>pothole_kalanki.jpg</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right side — ZK Verification */}
            <div
                style={{
                    position: "absolute",
                    right: 100,
                    top: 150,
                    width: 560,
                    opacity: zkOp,
                }}
            >
                <div
                    style={{
                        padding: "36px 40px",
                        borderRadius: 18,
                        background: "rgba(12,12,24,0.95)",
                        border: `1px solid ${COLORS.accent}40`,
                        boxShadow: `0 0 60px ${COLORS.accentGlow}`,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            marginBottom: 28,
                        }}
                    >
                        <div
                            style={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                background: COLORS.accent,
                                boxShadow: `0 0 12px ${COLORS.accent}`,
                            }}
                        />
                        <div
                            style={{
                                fontSize: 18,
                                fontWeight: 700,
                                color: COLORS.text1,
                            }}
                        >
                            Zero-Knowledge Verification
                        </div>
                    </div>

                    {/* Terminal-style ZK steps */}
                    <div
                        style={{
                            fontFamily: FONTS.mono,
                            fontSize: 14,
                            lineHeight: 2.2,
                        }}
                    >
                        {ZK_STEPS.map((step, i) => {
                            const stepStart = zkStart + fps * 1.5 + i * fps * 2.5;
                            const op = interpolate(frame, [stepStart, stepStart + fps * 0.3], [0, 1], {
                                extrapolateLeft: "clamp",
                                extrapolateRight: "clamp",
                            });
                            const isLast = i === ZK_STEPS.length - 1;
                            return (
                                <div key={i} style={{ opacity: op, display: "flex", gap: 10 }}>
                                    <span style={{ color: COLORS.accent }}>$</span>
                                    <span style={{ color: isLast ? COLORS.accent : COLORS.text2 }}>
                                        {step}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Success toast */}
                {frame > successStart && (
                    <div
                        style={{
                            marginTop: 24,
                            padding: "18px 24px",
                            borderRadius: 12,
                            background: COLORS.accentDim,
                            border: `1px solid ${COLORS.accent}40`,
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            opacity: successOp,
                            transform: `translateY(${interpolate(
                                frame,
                                [successStart, successStart + fps * 0.5],
                                [15, 0],
                                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                            )}px)`,
                        }}
                    >
                        <span style={{ fontSize: 24 }}>✅</span>
                        <div>
                            <div style={{ color: COLORS.accent, fontWeight: 700, fontSize: 16 }}>
                                Report submitted on-chain!
                            </div>
                            <div style={{ color: COLORS.text3, fontSize: 12, fontFamily: FONTS.mono }}>
                                Tx: 4xK9...mF2q
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AbsoluteFill>
    );
};
