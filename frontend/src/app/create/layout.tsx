import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Report",
    description: "Submit an anonymous civic report. Choose a category, select your district, and add evidence to escalate community issues.",
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
