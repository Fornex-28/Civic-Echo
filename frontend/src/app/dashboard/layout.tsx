import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "View your personal report history, echo activity, achievement badges, and community stats on Civic Echo.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
