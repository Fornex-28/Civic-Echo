import React from "react";
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";
import { COLORS, FONTS } from "../theme";

const PROBLEMS = [
    "Potholes that swallow motorcycles...",
    "Garbage piling up for weeks...",
    "Bribes demanded at government offices...",
    "Broken bridges left unrepaired...",
    "Open sewers near schools...",
];

export const HookScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    /* ── Background pulse ── */
    const bgPulse = interpolate(frame, [0, fps * 15], [0, 1], {
        extrapolateRight: "clamp",
    });

    /* ── "Every day in Nepal..." fade-in ── */
    const titleOpacity = interpolate(frame, [fps * 0.5, fps * 2], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    const titleY = interpolate(frame, [fps * 0.5, fps * 2], [30, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    /* ── Problem lines stagger ── */
    const problemStart = fps * 3;
    const problemGap = fps * 1.8;

    /* ── Final question ── */
    const questionStart = fps * 11;
    const questionOpacity = interpolate(
        frame,
        [questionStart, questionStart + fps],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    const questionScale = interpolate(
        frame,
        [questionStart, questionStart + fps],
        [0.95, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    /* ── Fade out at end ── */
    const fadeOut = interpolate(frame, [fps * 13.5, fps * 15], [1, 0], {
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
            {/* Subtle radial glow */}
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: 800,
                    height: 800,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${COLORS.accentGlow} 0%, transparent 70%)`,
                    transform: "translate(-50%, -50%)",
                    opacity: bgPulse * 0.15,
                }}
            />

            {/* Center content */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    padding: "0 200px",
                    textAlign: "center",
                }}
            >
                {/* Opening line */}
                <div
                    style={{
                        fontSize: 42,
                        fontWeight: 300,
                        color: COLORS.text2,
                        lineHeight: 1.5,
                        marginBottom: 60,
                        opacity: titleOpacity,
                        transform: `translateY(${titleY}px)`,
                    }}
                >
                    Every day in Nepal, civic issues go{" "}
                    <span style={{ color: COLORS.danger, fontWeight: 600 }}>
                        unreported
                    </span>
                    .
                </div>

                {/* Problem lines */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {PROBLEMS.map((problem, i) => {
                        const start = problemStart + i * problemGap;
                        const opacity = interpolate(frame, [start, start + fps * 0.6], [0, 1], {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                        });
                        const x = interpolate(frame, [start, start + fps * 0.6], [-40, 0], {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                        });
                        return (
                            <div
                                key={i}
                                style={{
                                    fontSize: 28,
                                    color: COLORS.text3,
                                    fontWeight: 400,
                                    opacity,
                                    transform: `translateX(${x}px)`,
                                    letterSpacing: "0.02em",
                                }}
                            >
                                {problem}
                            </div>
                        );
                    })}
                </div>

                {/* Final question */}
                <div
                    style={{
                        marginTop: 80,
                        fontSize: 38,
                        fontWeight: 600,
                        color: COLORS.text1,
                        opacity: questionOpacity,
                        transform: `scale(${questionScale})`,
                        lineHeight: 1.5,
                    }}
                >
                    What if you could report what you see...
                    <br />
                    <span
                        style={{
                            background: `linear-gradient(135deg, ${COLORS.accent} 30%, ${COLORS.cyan} 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontWeight: 800,
                        }}
                    >
                        completely anonymously?
                    </span>
                </div>
            </div>
        </AbsoluteFill>
    );
};
