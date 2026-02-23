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
];

export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
    const pathname = usePathname();
    const [company, setCompany] = useState<{ nome: string, logoUrl?: string } | null>(null);
    const [userLevel, setUserLevel] = useState<number | null>(null);

    useEffect(() => {
        fetch('/api/company').then(res => res.json()).then(data => { if (data.nome) setCompany(data); }).catch(() => { });
        fetch('/api/profile').then(res => res.json()).then(data => { if (data.nivelAcesso) setUserLevel(data.nivelAcesso); }).catch(() => { });
    }, []);

    const filteredItems = menuItems.filter(item => userLevel !== null && item.roles.includes(userLevel));

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Component */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r flex flex-col h-screen bg-white/50 backdrop-blur-xl transition-transform duration-300 md:sticky md:top-0 md:translate-x-0 block",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 border-b flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg overflow-hidden shrink-0">
                        {company?.logoUrl ? (
                            <img src={company.logoUrl} alt="Logo" className="h-full w-full object-contain p-1" />
                        ) : (
                            <Database className="h-5 w-5" />
                        )}
                    </div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent truncate flex-1 leading-tight">
                        {company?.nome || "Dinheiro Fácil"}
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                    {filteredItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
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
            </aside>
        </>
    );
}

import { Menu } from "lucide-react";

export function Shell({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // User Session Mock/Fetch
    const [userLevel, setUserLevel] = useState<number | null>(null);
    const [userName, setUserName] = useState<string>("Usuário");
    const [userLogin, setUserLogin] = useState<string>("Carregando...");

    useEffect(() => {
        fetch('/api/profile').then(res => res.json()).then(data => {
            if (data.nivelAcesso) setUserLevel(data.nivelAcesso);
            if (data.nome) setUserName(data.nome);
            if (data.usuario) setUserLogin(data.usuario);
        }).catch(() => { });
    }, []);

    // Get strictly initials for the Avatar
    const getInitials = (name: string) => {
        const parts = name.split(' ');
        if (parts.length > 1) {
            return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    };

    return (
        <div className="flex bg-slate-50/50 min-h-screen">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Global TopBar Header */}
                <header className="flex items-center justify-between px-4 sm:px-6 h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30 shadow-sm transition-all">

                    {/* Left Side: Mobile Hamburger & Current Page Context */}
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="md:hidden -ml-2 text-slate-600 hover:bg-slate-100">
                            <Menu className="h-6 w-6" />
                        </Button>
                        <div className="hidden md:flex flex-col">
                            {/* Title area left blank intentionally as requested */}
                        </div>
                    </div>

                    {/* Right Side: User Dropdown Profile Workspace */}
                    <div className="relative ml-auto flex items-center">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className={cn(
                                "flex items-center gap-3 p-1.5 pr-4 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 border hover:shadow-md",
                                isProfileOpen ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-white border-transparent hover:border-slate-200 hover:bg-slate-50"
                            )}
                        >
                            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                                {getInitials(userName)}
                            </div>
                            <div className="hidden sm:flex flex-col items-start gap-0.5 max-w-[120px]">
                                <span className="text-sm font-bold text-slate-700 leading-none truncate w-full">
                                    {userName.split(' ')[0]}
                                </span>
                                <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider leading-none">
                                    {userLevel === 1 ? 'Admin' : 'Usuário'}
                                </span>
                            </div>
                        </button>

                        {/* Dropdown Menu Overlay */}
                        {isProfileOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 shadow-indigo-200/20">
                                    {/* Information Headers */}
                                    <div className="px-5 py-3 border-b border-slate-50 mb-1">
                                        <p className="text-sm font-bold text-slate-800 truncate">{userName}</p>
                                        <p className="text-xs font-medium text-slate-500 truncate flex items-center gap-1 mt-0.5">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                            {userLogin}
                                        </p>
                                    </div>

                                    {/* Action Links */}
                                    <div className="py-1 px-2 space-y-1">
                                        <Link href="/dashboard/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors w-full cursor-pointer">
                                            <UserCircle className="mr-3 h-4 w-4 text-indigo-500" />
                                            Meu Perfil
                                        </Link>
                                        {userLevel === 1 && (
                                            <Link href="/dashboard/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors w-full cursor-pointer">
                                                <Settings className="mr-3 h-4 w-4 text-indigo-500" />
                                                Configurações
                                            </Link>
                                        )}
                                    </div>

                                    {/* Danger Zone (Logout) */}
                                    <div className="border-t border-slate-100/60 mt-1 pt-2 px-2">
                                        <button onClick={() => {
                                            setIsProfileOpen(false);
                                            window.location.href = '/login';
                                        }} className="w-full flex items-center px-3 py-2 text-sm font-bold text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer">
                                            <LogOut className="mr-3 h-4 w-4 text-red-500" />
                                            Sair da Conta
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
