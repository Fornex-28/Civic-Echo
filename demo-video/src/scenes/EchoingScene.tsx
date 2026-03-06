import React from "react";
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";
import { COLORS, FONTS } from "../theme";

export const EchoingScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const labelOp = interpolate(frame, [0, fps], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    /* ── Echo counter ── */
    const counterStart = fps * 3;
    const echoCount = Math.floor(
        interpolate(frame, [counterStart, counterStart + fps * 8], [89, 100], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
        })
    );
    const isPetition = echoCount >= 100;

    /* ── Petition flash ── */
    const petitionStart = counterStart + fps * 8;
    const petitionOp = interpolate(frame, [petitionStart, petitionStart + fps], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    const flashOp = isPetition
        ? interpolate(
            frame,
            [petitionStart, petitionStart + fps * 0.3, petitionStart + fps],
            [0, 0.4, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        )
        : 0;

    const fadeOut = interpolate(frame, [fps * 18, fps * 20], [1, 0], {
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
            {/* Flash overlay */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: COLORS.accent,
                    opacity: flashOp,
                }}
            />

            <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", gap: 100 }}>
                {/* Left — concept */}
                <div style={{ maxWidth: 500, opacity: labelOp }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.accent, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
                        Community Power
                    </div>
                    <div style={{ fontSize: 52, fontWeight: 800, color: COLORS.text1, lineHeight: 1.15, marginBottom: 24 }}>
                        Echo it.{" "}
                        <span style={{
                            background: `linear-gradient(135deg, ${COLORS.accent} 30%, ${COLORS.cyan} 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}>
                            Amplify it.
                        </span>
                    </div>
                    <div style={{ fontSize: 20, color: COLORS.text2, lineHeight: 1.7 }}>
                        Every echo is an on-chain upvote. When a report reaches{" "}
                        <span style={{ color: COLORS.accent, fontWeight: 700 }}>100 echoes</span>,
                        it automatically becomes a <span style={{ color: COLORS.accent, fontWeight: 700 }}>petition</span> — a signal that demands action.
                    </div>
                </div>

                {/* Right — echo counter */}
                <div style={{ textAlign: "center" }}>
                    {/* Circular progress */}
                    <div style={{ position: "relative", width: 280, height: 280 }}>
                        <svg viewBox="0 0 280 280" style={{ width: 280, height: 280 }}>
                            {/* Track */}
                            <circle cx={140} cy={140} r={120} fill="none" stroke={COLORS.line2} strokeWidth={6} />
                            {/* Progress */}
                            <circle
                                cx={140}
                                cy={140}
                                r={120}
                                fill="none"
                                stroke={isPetition ? COLORS.accent : COLORS.cyan}
                                strokeWidth={6}
                                strokeDasharray={2 * Math.PI * 120}
                                strokeDashoffset={2 * Math.PI * 120 * (1 - echoCount / 100)}
                                strokeLinecap="round"
                                transform="rotate(-90 140 140)"
                                style={{
                                    filter: isPetition ? `drop-shadow(0 0 12px ${COLORS.accent})` : undefined,
                                    transition: "stroke 0.3s",
                                }}
                            />
                        </svg>
                        {/* Count text */}
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <div style={{
                                fontSize: 72, fontWeight: 800, fontFamily: FONTS.mono,
                                color: isPetition ? COLORS.accent : COLORS.text1,
                            }}>
                                {echoCount}
                            </div>
                            <div style={{ fontSize: 16, color: COLORS.text3 }}>/ 100 echoes</div>
                        </div>
                    </div>

                    {/* Petition badge */}
                    {isPetition && (
                        <div
                            style={{
                                marginTop: 32,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "14px 32px",
                                borderRadius: 14,
                                background: COLORS.accentDim,
                                border: `1px solid ${COLORS.accent}40`,
                                opacity: petitionOp,
                                transform: `scale(${interpolate(
                                    frame,
                                    [petitionStart, petitionStart + fps * 0.3, petitionStart + fps * 0.5],
                                    [0.8, 1.1, 1],
                                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                                )})`,
                            }}
                        >
                            <span style={{ fontSize: 24 }}>🟢</span>
                            <span style={{ fontSize: 22, fontWeight: 700, color: COLORS.accent }}>
                                PETITION STATUS UNLOCKED
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </AbsoluteFill>
    );
};
