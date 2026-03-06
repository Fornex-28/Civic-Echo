import React from "react";
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";
import { COLORS, FONTS } from "../theme";

export const ClosingScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    /* ── Ambient pulse ── */
    const pulse = Math.sin(frame * 0.06) * 0.5 + 0.5;

    /* ── Main tagline ── */
    const tagOp = interpolate(frame, [fps * 1, fps * 3], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    const tagY = interpolate(frame, [fps * 1, fps * 3], [40, 0], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    /* ── "Because..." ── */
    const becauseOp = interpolate(frame, [fps * 5, fps * 7], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    /* ── Final line ── */
    const finalOp = interpolate(frame, [fps * 9, fps * 11], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    const finalScale = interpolate(frame, [fps * 9, fps * 11], [0.9, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    /* ── Built for Nepal badge ── */
    const badgeOp = interpolate(frame, [fps * 12, fps * 13], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: COLORS.bgPrimary,
                fontFamily: FONTS.sans,
            }}
        >
            {/* Large glow behind */}
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: 1000,
                    height: 1000,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${COLORS.accent}15 0%, transparent 60%)`,
                    transform: "translate(-50%, -50%)",
                    opacity: pulse,
                    filter: "blur(40px)",
                }}
            />

            {/* Center content */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    textAlign: "center",
                }}
            >
                {/* Logo / Title */}
                <div
                    style={{
                        fontSize: 90,
                        fontWeight: 800,
                        lineHeight: 1.05,
                        letterSpacing: "-0.04em",
                        opacity: tagOp,
                        transform: `translateY(${tagY}px)`,
                    }}
                >
                    <span style={{ color: COLORS.text1 }}>Civic </span>
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

                {/* Quote */}
                <div
                    style={{
                        fontSize: 28,
                        color: COLORS.text2,
                        marginTop: 40,
                        fontWeight: 300,
                        opacity: becauseOp,
                        lineHeight: 1.6,
                        maxWidth: 700,
                    }}
                >
                    In a country where speaking up can be dangerous,
                    <br />
                    every citizen deserves a{" "}
                    <span style={{ color: COLORS.accent, fontWeight: 600 }}>safe</span>,{" "}
                    <span style={{ color: COLORS.cyan, fontWeight: 600 }}>anonymous</span>, and{" "}
                    <span style={{ color: COLORS.purple, fontWeight: 600 }}>permanent</span> voice.
                </div>

                {/* Final line */}
                <div
                    style={{
                        marginTop: 60,
                        fontSize: 42,
                        fontWeight: 700,
                        opacity: finalOp,
                        transform: `scale(${finalScale})`,
                    }}
                >
                    <span style={{ color: COLORS.text3 }}>Because in a democracy... </span>
                    <span
                        style={{
                            background: `linear-gradient(135deg, ${COLORS.accent} 30%, ${COLORS.cyan} 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontWeight: 800,
                        }}
                    >
                        every echo matters.
                    </span>
                </div>

                {/* Tagline */}
                <div
                    style={{
                        marginTop: 48,
                        fontSize: 22,
                        fontWeight: 500,
                        color: COLORS.text3,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        opacity: badgeOp,
                    }}
                >
                    Report what you see.
                </div>

                {/* Built for Nepal badge */}
                <div
                    style={{
                        marginTop: 40,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 24px",
                        borderRadius: 999,
                        border: `1px solid ${COLORS.line2}`,
                        background: "rgba(255,255,255,0.03)",
                        opacity: badgeOp,
                    }}
                >
                    <span style={{ fontSize: 18 }}>🇳🇵</span>
                    <span style={{ fontSize: 14, color: COLORS.text2, fontWeight: 500 }}>
                        Built for Nepal • Powered by Solana
                    </span>
                </div>
            </div>
        </AbsoluteFill>
    );
};
