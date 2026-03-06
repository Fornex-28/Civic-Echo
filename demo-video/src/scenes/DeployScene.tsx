import React from "react";
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";
import { COLORS, FONTS } from "../theme";

const TERMINAL_LINES = [
    { text: "$ solana config set --url devnet", color: COLORS.text2, delay: 0 },
    { text: "Config File: ~/.config/solana/cli/config.yml", color: COLORS.text3, delay: 0.8 },
    { text: "RPC URL: https://api.devnet.solana.com ✓", color: COLORS.accent, delay: 1.2 },
    { text: "", color: "", delay: 2 },
    { text: "$ solana airdrop 2", color: COLORS.text2, delay: 2.5 },
    { text: "Requesting airdrop of 2 SOL...", color: COLORS.text3, delay: 3.2 },
    { text: "2 SOL ✓", color: COLORS.accent, delay: 4 },
    { text: "", color: "", delay: 4.5 },
    { text: "$ anchor build", color: COLORS.text2, delay: 5 },
    { text: "Compiling zk_whisper v0.1.0...", color: COLORS.text3, delay: 5.8 },
    { text: "warning: unused import `SystemProgram`", color: COLORS.yellow, delay: 7 },
    { text: "Finished release [optimized] ✓", color: COLORS.accent, delay: 9 },
    { text: "", color: "", delay: 10 },
    { text: "$ anchor deploy --provider.cluster devnet", color: COLORS.text2, delay: 10.5 },
    { text: "Deploying program zk_whisper...", color: COLORS.text3, delay: 11.5 },
    { text: "Program deployed to:", color: COLORS.text2, delay: 14 },
    { text: "  CvE7xR2k4Ln8pQzF5dJhNm9Y3bW6aK1tG8vX0sUoP4i", color: COLORS.cyan, delay: 14.5 },
    { text: "", color: "", delay: 15.5 },
    { text: "Deploy success ✓", color: COLORS.accent, delay: 16 },
];

export const DeployScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    /* ── Label ── */
    const labelOp = interpolate(frame, [0, fps], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    /* ── Terminal ── */
    const termOp = interpolate(frame, [fps * 1, fps * 2], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    /* ── Explorer card ── */
    const explorerStart = fps * 25;
    const explorerOp = interpolate(frame, [explorerStart, explorerStart + fps * 1.5], [0, 1], {
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
            {/* Label */}
            <div
                style={{
                    position: "absolute",
                    top: 50,
                    left: 80,
                    opacity: labelOp,
                }}
            >
                <div
                    style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: COLORS.accent,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        marginBottom: 12,
                    }}
                >
                    Live Deployment
                </div>
                <div
                    style={{
                        fontSize: 48,
                        fontWeight: 800,
                        color: COLORS.text1,
                        lineHeight: 1.15,
                    }}
                >
                    Deploying to{" "}
                    <span style={{ color: COLORS.purple }}>Solana Devnet</span>
                </div>
            </div>

            {/* Terminal window */}
            <div
                style={{
                    position: "absolute",
                    left: 80,
                    top: 200,
                    width: 900,
                    borderRadius: 16,
                    background: "rgba(8,8,16,0.95)",
                    border: `1px solid ${COLORS.line2}`,
                    overflow: "hidden",
                    opacity: termOp,
                    boxShadow: `0 20px 60px rgba(0,0,0,0.5)`,
                }}
            >
                {/* Terminal header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "14px 20px",
                        background: "rgba(255,255,255,0.03)",
                        borderBottom: `1px solid ${COLORS.line}`,
                    }}
                >
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
                    <span
                        style={{
                            marginLeft: 12,
                            fontSize: 12,
                            color: COLORS.text3,
                            fontFamily: FONTS.mono,
                        }}
                    >
                        zk_whisper — anchor deploy
                    </span>
                </div>

                {/* Terminal body */}
                <div
                    style={{
                        padding: "20px 24px",
                        fontFamily: FONTS.mono,
                        fontSize: 14,
                        lineHeight: 1.8,
                        maxHeight: 550,
                        overflow: "hidden",
                    }}
                >
                    {TERMINAL_LINES.map((line, i) => {
                        const start = fps * 2.5 + line.delay * fps;
                        const op = interpolate(frame, [start, start + fps * 0.2], [0, 1], {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                        });
                        if (!line.text)
                            return <div key={i} style={{ height: 8, opacity: op }} />;
                        return (
                            <div key={i} style={{ opacity: op, color: line.color }}>
                                {line.text}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Solana Explorer card */}
            <div
                style={{
                    position: "absolute",
                    right: 80,
                    top: 200,
                    width: 780,
                    borderRadius: 16,
                    background: "rgba(20,20,34,0.85)",
                    border: `1px solid ${COLORS.line2}`,
                    overflow: "hidden",
                    opacity: explorerOp,
                    transform: `translateY(${interpolate(
                        frame,
                        [explorerStart, explorerStart + fps * 1.5],
                        [20, 0],
                        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                    )}px)`,
                }}
            >
                {/* Explorer header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "16px 24px",
                        background: "rgba(255,255,255,0.03)",
                        borderBottom: `1px solid ${COLORS.line}`,
                    }}
                >
                    <div
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: `linear-gradient(135deg, #9945FF, #14F195)`,
                        }}
                    />
                    <span style={{ fontSize: 16, fontWeight: 600, color: COLORS.text1 }}>
                        Solana Explorer
                    </span>
                    <span
                        style={{
                            marginLeft: "auto",
                            padding: "4px 12px",
                            borderRadius: 6,
                            background: COLORS.accentDim,
                            color: COLORS.accent,
                            fontSize: 11,
                            fontWeight: 600,
                        }}
                    >
                        Devnet
                    </span>
                </div>

                {/* Program info */}
                <div style={{ padding: "24px" }}>
                    <div style={{ fontSize: 12, color: COLORS.text3, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Program ID
                    </div>
                    <div style={{ fontSize: 16, fontFamily: FONTS.mono, color: COLORS.cyan, marginBottom: 24 }}>
                        CvE7xR2k4Ln8pQzF5dJhNm9Y3bW6aK1tG8vX0sUoP4i
                    </div>

                    {/* Recent transactions */}
                    <div style={{ fontSize: 12, color: COLORS.text3, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Recent Transactions
                    </div>
                    {[
                        { sig: "4xK9mF2q...8L3n", inst: "InitializeReport", time: "2s ago", status: "✓" },
                        { sig: "7bR3yH5w...1P6k", inst: "EchoReport", time: "5s ago", status: "✓" },
                        { sig: "2nT8cJ4v...9M7r", inst: "InitializeReport", time: "12s ago", status: "✓" },
                    ].map((tx, i) => {
                        const txStart = explorerStart + fps * 3 + i * fps * 1.5;
                        const txOp = interpolate(frame, [txStart, txStart + fps * 0.5], [0, 1], {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                        });
                        return (
                            <div
                                key={i}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 16,
                                    padding: "12px 16px",
                                    borderRadius: 10,
                                    background: "rgba(255,255,255,0.03)",
                                    border: `1px solid ${COLORS.line}`,
                                    marginBottom: 8,
                                    opacity: txOp,
                                }}
                            >
                                <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.cyan }}>
                                    {tx.sig}
                                </span>
                                <span
                                    style={{
                                        padding: "3px 10px",
                                        borderRadius: 6,
                                        background: "rgba(147,51,234,0.12)",
                                        color: COLORS.purple,
                                        fontSize: 11,
                                        fontWeight: 600,
                                    }}
                                >
                                    {tx.inst}
                                </span>
                                <span style={{ marginLeft: "auto", fontSize: 12, color: COLORS.text3 }}>
                                    {tx.time}
                                </span>
                                <span style={{ color: COLORS.accent, fontSize: 14 }}>{tx.status}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AbsoluteFill>
    );
};
