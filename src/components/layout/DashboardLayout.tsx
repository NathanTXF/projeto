"use client";

import { useState, useEffect } from "react";
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
    UserCircle,
    Database,
    Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", roles: [1, 2, 3] },
    { icon: Users, label: "Clientes", href: "/dashboard/clients", roles: [1, 2, 3] },
    { icon: Database, label: "Cadastros", href: "/dashboard/auxiliary", roles: [1] },
    { icon: HandCoins, label: "Empréstimos", href: "/dashboard/loans", roles: [1, 2, 3] },
    { icon: FileText, label: "Comissões", href: "/dashboard/commissions", roles: [1] },
    { icon: FileText, label: "Financeiro", href: "/dashboard/financial", roles: [1] },
    { icon: Calendar, label: "Agenda", href: "/dashboard/agenda", roles: [1, 2, 3] },
    { icon: Users, label: "Usuários", href: "/dashboard/users", roles: [1] },
    { icon: LucideHistory, label: "Auditoria", href: "/dashboard/audit", roles: [1] },
    { icon: UserCircle, label: "Meu Perfil", href: "/dashboard/profile", roles: [1, 2, 3] },
    { icon: Settings, label: "Configurações", href: "/dashboard/settings", roles: [1] },
];

export function Sidebar() {
    const pathname = usePathname();
    const [company, setCompany] = useState<{ nome: string, logoUrl?: string } | null>(null);
    const [userLevel, setUserLevel] = useState<number | null>(null);

    useEffect(() => {
        // Buscar dados da empresa
        fetch('/api/company')
            .then(res => res.json())
            .then(data => {
                if (data.nome) setCompany(data);
            })
            .catch(() => { });

        // Buscar nível de acesso do usuário
        fetch('/api/profile')
            .then(res => res.json())
            .then(data => {
                if (data.nivelAcesso) setUserLevel(data.nivelAcesso);
            })
            .catch(() => { });
    }, []);

    const filteredItems = menuItems.filter(item =>
        userLevel !== null && item.roles.includes(userLevel)
    );

    return (
        <aside className="w-64 border-r bg-card flex flex-col h-screen sticky top-0 bg-white/50 backdrop-blur-xl">
            <div className="p-6 border-b flex items-center gap-3 group">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg overflow-hidden shrink-0">
                    {company?.logoUrl ? (
                        <img src={company.logoUrl} alt="Logo" className="h-full w-full object-contain p-1" />
                    ) : (
                        <Database className="h-5 w-5" />
                    )}
                </div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent truncate">
                    {company?.nome || "Dinheiro Fácil"}
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-1.5">
                {filteredItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold",
                                isActive
                                    ? "bg-indigo-600 text-white shadow-indigo-200 shadow-lg translate-x-1"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                            )}
                        >
                            <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-400")} />
                            {item.label}
                            {isActive && <ChevronRight className="ml-auto h-3 w-3" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t bg-slate-50/50">
                <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-destructive rounded-xl hover:bg-destructive/5 font-semibold">
                    <LogOut className="mr-2 h-4 w-4 opacity-70" />
                    Sair
                </Button>
            </div>
        </aside>
    );
}

export function Shell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex bg-slate-50/50 min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
