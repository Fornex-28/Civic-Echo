/* ── Civic Echo Design Tokens ──
 * Matches the website's globals.css exactly.
 */

export const COLORS = {
    bgPrimary: "#07070d",
    bgSecondary: "#0e0e18",
    bgElevated: "#141422",
    bgCard: "#18182b",
    bgCardHover: "#1f1f38",
    accent: "#00e87b",
    accentDim: "rgba(0, 232, 123, 0.12)",
    accentGlow: "rgba(0, 232, 123, 0.25)",
    danger: "#ff3b5c",
    dangerDim: "rgba(255, 59, 92, 0.12)",
    cyan: "#00c8ff",
    purple: "#9333ea",
    orange: "#f97316",
    yellow: "#eab308",
    blue: "#3b82f6",
    text1: "#f0f0f3",
    text2: "#9d9db5",
    text3: "#5c5c76",
    line: "rgba(255, 255, 255, 0.06)",
    line2: "rgba(255, 255, 255, 0.1)",
} as const;

export const FONTS = {
    sans: "'Inter', 'Segoe UI', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
} as const;

/* 30 fps, 4:30 = 270 seconds = 8100 frames */
export const FPS = 30;
export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;
export const DURATION_SECONDS = 270;

/* Scene timings in seconds [start, end] */
export const SCENE_TIMING = {
    hook: [0, 15],
    landing: [15, 40],
    map: [40, 80],
    report: [80, 120],
    deploy: [120, 160],
    echoing: [160, 180],
    comments: [180, 190],
    reports: [190, 205],
    dashboard: [205, 220],
    leaderboard: [220, 230],
    admin: [230, 240],
    techStack: [240, 255],
    closing: [255, 270],
} as const;

/* Category metadata matching the frontend */
export const CATEGORIES = [
    { key: "roads", label: "Roads", emoji: "🛣️", color: "#f59e0b" },
    { key: "utilities", label: "Utilities", emoji: "🔧", color: "#3b82f6" },
    { key: "corruption", label: "Corruption", emoji: "💰", color: "#ef4444" },
    { key: "hazards", label: "Hazards", emoji: "⚠️", color: "#8b5cf6" },
    { key: "scam", label: "Scam", emoji: "🚨", color: "#f97316" },
    { key: "other", label: "Other", emoji: "📋", color: "#6b7280" },
] as const;
