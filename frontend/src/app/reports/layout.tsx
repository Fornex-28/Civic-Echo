import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "All Reports",
    description: "Browse, filter, and search all civic reports across Nepal. Sort by echoes, status, or category.",
};

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
