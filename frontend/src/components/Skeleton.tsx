"use client";

export default function Skeleton({
    w,
    h,
    r = 8,
    style,
}: {
    w?: number | string;
    h?: number | string;
    r?: number;
    style?: React.CSSProperties;
}) {
    return (
        <div
            style={{
                width: w ?? "100%",
                height: h ?? 16,
                borderRadius: r,
                background: "linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card-hover, #1f1f38) 50%, var(--bg-card) 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s ease-in-out infinite",
                ...style,
            }}
        />
    );
}

export function SkeletonCard() {
    return (
        <div
            style={{
                background: "var(--bg-card, #18182b)",
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
            }}
        >
            <div style={{ display: "flex", gap: 8 }}>
                <Skeleton w={70} h={20} r={999} />
                <Skeleton w={60} h={20} r={999} />
            </div>
            <Skeleton h={18} />
            <Skeleton w="80%" h={18} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <Skeleton w={50} h={14} />
                <Skeleton w={70} h={14} />
            </div>
        </div>
    );
}
