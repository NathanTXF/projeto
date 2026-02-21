"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Users,
    LayoutDashboard,
    HandCoins,
    FileText,
    Settings,
    LogOut,
    ChevronRight,
    History as LucideHistory,
    UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Clientes", href: "/dashboard/clients" },
    { icon: HandCoins, label: "Empréstimos", href: "/dashboard/loans" },
    { icon: FileText, label: "Comissões", href: "/dashboard/commissions" },
    { icon: FileText, label: "Financeiro", href: "/dashboard/financial" },
    { icon: LucideHistory, label: "Auditoria", href: "/dashboard/audit" }, // Added Auditoria link
    { icon: UserCircle, label: "Meu Perfil", href: "/dashboard/profile" }, // Added Meu Perfil link
    { icon: Settings, label: "Configurações", href: "/dashboard/settings" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r bg-card flex flex-col h-screen sticky top-0">
            <div className="p-6 border-b">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Dinheiro Fácil
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                            {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                </Button>
            </div>
        </aside>
    );
}

export function Shell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex bg-background min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
