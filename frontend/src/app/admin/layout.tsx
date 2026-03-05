import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Panel",
    description: "Admin panel for managing civic reports — settle, edit, and delete reports on Civic Echo.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
