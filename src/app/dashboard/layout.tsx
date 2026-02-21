import { Shell } from "@/components/layout/DashboardLayout";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <Shell>{children}</Shell>;
}
