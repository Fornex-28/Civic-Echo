import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Leaderboard",
    description: "See the top reporters, most active districts, and community tier rankings on Civic Echo.",
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
