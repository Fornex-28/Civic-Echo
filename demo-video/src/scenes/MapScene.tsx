import React from "react";
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";
import { COLORS, FONTS, CATEGORIES } from "../theme";

/* ── Sample report dots on Nepal ── */
const DOTS = [
    { x: 460, y: 320, echoes: 205, cat: 0, label: "Kalanki pothole" },
    { x: 480, y: 340, echoes: 178, cat: 2, label: "Ward office corruption" },
    { x: 250, y: 280, echoes: 147, cat: 1, label: "Seti River pollution" },
    { x: 900, y: 400, echoes: 132, cat: 4, label: "Fake employment agency" },
    { x: 540, y: 360, echoes: 91, cat: 3, label: "Collapsed wall" },
    { x: 580, y: 420, echoes: 87, cat: 1, label: "Waste burning" },
    { x: 500, y: 380, echoes: 64, cat: 0, label: "Satdobato potholes" },
    { x: 380, y: 460, echoes: 42, cat: 0, label: "Broken bridge" },
    { x: 560, y: 330, echoes: 34, cat: 2, label: "Land registration bribe" },
    { x: 700, y: 350, echoes: 23, cat: 4, label: "Counterfeit medicine" },
    { x: 120, y: 260, echoes: 15, cat: 3, label: "Flood embankment" },
    { x: 320, y: 310, echoes: 8, cat: 0, label: "Broken traffic light" },
    { x: 650, y: 380, echoes: 3, cat: 1, label: "Open sewer" },
    { x: 800, y: 300, echoes: 1, cat: 3, label: "Landslide risk" },
];

function getDotColor(echoes: number): string {
    if (echoes >= 10) return COLORS.accent;
    if (echoes >= 5) return COLORS.yellow;
    if (echoes >= 3) return COLORS.orange;
    return COLORS.danger;
}

function getDotSize(echoes: number): number {
    if (echoes >= 100) return 18;
    if (echoes >= 50) return 14;
    if (echoes >= 10) return 11;
    return 8;
}

export const MapScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    /* ── Title fade ── */
    const titleOp = interpolate(frame, [0, fps * 1.5], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    /* ── Nepal outline appears ── */
    const mapOp = interpolate(frame, [fps * 2, fps * 4], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    /* ── Dots stagger in ── */
    const dotsStart = fps * 5;

    /* ── Legend ── */
    const legendOp = interpolate(frame, [fps * 15, fps * 17], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    /* ── Pulsing animation ── */
    const pulse = Math.sin(frame * 0.12) * 0.3 + 0.7;

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
            {/* Section label */}
            <div
                style={{
                    position: "absolute",
                    top: 50,
                    left: 80,
                    fontSize: 14,
                    fontWeight: 600,
                    color: COLORS.accent,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    opacity: titleOp,
                }}
            >
                Interactive 3D Map
            </div>

            {/* Title */}
            <div
                style={{
                    position: "absolute",
                    top: 80,
                    left: 80,
                    fontSize: 52,
                    fontWeight: 800,
                    color: COLORS.text1,
                    opacity: titleOp,
                    lineHeight: 1.2,
                }}
            >
                Every dot tells
                <br />
                <span
                    style={{
                        background: `linear-gradient(135deg, ${COLORS.accent} 30%, ${COLORS.cyan} 100%)`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    a story.
                </span>
            </div>

            {/* Map area — dark rectangle representing Nepal */}
            <div
                style={{
                    position: "absolute",
                    top: 100,
                    left: 500,
                    width: 1300,
                    height: 700,
                    borderRadius: 20,
                    background: `linear-gradient(145deg, ${COLORS.bgSecondary} 0%, ${COLORS.bgPrimary} 100%)`,
                    border: `1px solid ${COLORS.line2}`,
                    overflow: "hidden",
                    opacity: mapOp,
                }}
            >
                {/* Nepal shape — simplified SVG outline */}
                <svg
                    viewBox="0 0 1300 700"
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                >
                    {/* Simplified Nepal border */}
                    <path
                        d="M100,350 Q150,200 300,180 Q450,150 500,200 Q550,160 650,180 Q750,150 850,200 Q950,180 1050,220 Q1150,200 1200,280 Q1180,350 1100,380 Q1000,420 900,400 Q800,430 700,400 Q600,440 500,420 Q400,460 300,420 Q200,440 150,400 Z"
                        fill="none"
                        stroke={COLORS.accent}
                        strokeWidth={2}
                        strokeOpacity={0.4}
                        style={{
                            filter: `drop-shadow(0 0 8px ${COLORS.accentGlow})`,
                        }}
                    />
                    {/* Fill with low opacity */}
                    <path
                        d="M100,350 Q150,200 300,180 Q450,150 500,200 Q550,160 650,180 Q750,150 850,200 Q950,180 1050,220 Q1150,200 1200,280 Q1180,350 1100,380 Q1000,420 900,400 Q800,430 700,400 Q600,440 500,420 Q400,460 300,420 Q200,440 150,400 Z"
                        fill={COLORS.accent}
                        fillOpacity={0.03}
                    />
                </svg>

                {/* Report dots */}
                {DOTS.map((dot, i) => {
                    const start = dotsStart + i * fps * 0.5;
                    const dotOp = interpolate(frame, [start, start + fps * 0.3], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                    });
                    const dotScale = interpolate(
                        frame,
                        [start, start + fps * 0.2, start + fps * 0.3],
                        [0, 1.3, 1],
                        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                    );
                    const color = getDotColor(dot.echoes);
                    const size = getDotSize(dot.echoes);

                    return (
                        <div
                            key={i}
                            style={{
                                position: "absolute",
                                left: dot.x - size / 2,
                                top: dot.y - size / 2,
                                width: size,
                                height: size,
                                borderRadius: "50%",
                                background: color,
                                opacity: dotOp * pulse,
                                transform: `scale(${dotScale})`,
                                boxShadow: `0 0 ${size}px ${color}80, 0 0 ${size * 2}px ${color}40`,
                            }}
                        />
                    );
                })}

                {/* Hover card example — appears mid-scene */}
                {frame > fps * 20 && (
                    <div
                        style={{
                            position: "absolute",
                            left: 420,
                            top: 180,
                            width: 340,
                            padding: "20px 24px",
                            borderRadius: 14,
                            background: "rgba(12,12,24,0.96)",
                            border: `1px solid ${COLORS.line2}`,
                            backdropFilter: "blur(20px)",
                            opacity: interpolate(
                                frame,
                                [fps * 20, fps * 21.5],
                                [0, 1],
                                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                            ),
                            transform: `translateY(${interpolate(
                                frame,
                                [fps * 20, fps * 21.5],
                                [10, 0],
                                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                            )}px)`,
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <span style={{ fontSize: 18 }}>🛣️</span>
                            <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text1 }}>
                                Massive pothole near Kalanki
                            </span>
                        </div>
                        <div style={{ fontSize: 12, color: COLORS.text3, marginBottom: 12, lineHeight: 1.5 }}>
                            Multiple accidents reported. Road has not been repaired despite complaints.
                        </div>
                        <div style={{ display: "flex", gap: 16 }}>
                            <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.accent, fontFamily: FONTS.mono }}>
                                205
                            </div>
                            <div style={{ fontSize: 12, color: COLORS.text3, alignSelf: "center" }}>echoes</div>
                            <div
                                style={{
                                    marginLeft: "auto",
                                    padding: "4px 12px",
                                    borderRadius: 8,
                                    background: COLORS.accentDim,
                                    color: COLORS.accent,
                                    fontSize: 11,
                                    fontWeight: 600,
                                }}
                            >
                                PETITION
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Color legend */}
            <div
                style={{
                    position: "absolute",
                    bottom: 60,
                    left: 80,
                    display: "flex",
                    gap: 28,
                    opacity: legendOp,
                }}
            >
                {[
                    { color: COLORS.danger, label: "1 echo (New)" },
                    { color: COLORS.orange, label: "3+ echoes" },
                    { color: COLORS.yellow, label: "5+ echoes" },
                    { color: COLORS.accent, label: "10+ echoes" },
                    { color: COLORS.blue, label: "Settled" },
                ].map((item) => (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                            style={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                background: item.color,
                                boxShadow: `0 0 8px ${item.color}60`,
                            }}
                        />
                        <span style={{ fontSize: 13, color: COLORS.text2 }}>{item.label}</span>
                    </div>
                ))}
            </div>
        </AbsoluteFill>
    );
};
