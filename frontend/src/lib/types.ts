export type VerificationStatus = "unverified" | "verifying" | "verified";

export type ReportCategory =
    | "roads"
    | "utilities"
    | "corruption"
    | "hazards"
    | "scam"
    | "other";

export type ReportStatus = "active" | "petition" | "resolved" | "closed";

export interface CivicReport {
    id: string;
    locationLat: number;
    locationLng: number;
    district: string;
    wardNumber: number;
    ipfsCid: string;
    upvotes: number;
    isPetition: boolean;
    reporter: string;
    category: ReportCategory;
    createdAt: number;
    title: string;
    description: string;
    imageUrl: string; // base64 data URL or external URL
    status: ReportStatus;
}

export const CATEGORY_META: Record<ReportCategory, { label: string; emoji: string; color: string; subcategories: string[] }> = {
    roads: { label: "Roads", emoji: "🛣️", color: "#f59e0b", subcategories: ["Potholes", "Broken bridges", "Unpaved muddy sections", "Broken traffic lights"] },
    utilities: { label: "Utilities", emoji: "🔧", color: "#3b82f6", subcategories: ["Uncollected garbage", "Broken water pipes", "Downed electricity poles", "Open sewers"] },
    corruption: { label: "Corruption", emoji: "💰", color: "#ef4444", subcategories: ["Bribes at ward offices", "Ghost projects", "Absent government workers"] },
    hazards: { label: "Hazards", emoji: "⚠️", color: "#8b5cf6", subcategories: ["Landslides", "Flooding", "Open manholes", "Public safety dangers"] },
    scam: { label: "Scam", emoji: "🚨", color: "#f97316", subcategories: ["College scam", "Government scam", "Office scam", "Job scam"] },
    other: { label: "Other", emoji: "📋", color: "#6b7280", subcategories: ["General", "Miscellaneous"] },
};
