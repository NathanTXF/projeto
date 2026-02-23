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
    Calendar,
    ChevronDown,
    Menu,
    Bell,
    ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuGroups = [
    {
        label: "Home",
        items: [
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", permission: 'view_dashboard' }
        ]
    },
    {
        label: "Gestão Corporativa",
        items: [
            { icon: Users, label: "Clientes", href: "/dashboard/clients", permission: 'view_clients' },
            { icon: HandCoins, label: "Empréstimos", href: "/dashboard/loans", permission: 'view_loans' },
            { icon: FileText, label: "Comissões", href: "/dashboard/commissions", permission: 'view_commissions' },
        ]
    },
    {
        label: "Administração",
        roleBased: true, // Marker to indicate careful permission checks
        items: [
            { icon: Database, label: "Cadastros Auxiliares", href: "/dashboard/auxiliary", permission: 'manage_auxiliary' },
            { icon: FileText, label: "Financeiro", href: "/dashboard/financial", permission: 'view_financial' },
            { icon: Calendar, label: "Agenda", href: "/dashboard/agenda", permission: 'view_agenda' },
            { icon: Users, label: "Acessos (Usuários)", href: "/dashboard/users", permission: 'manage_users' },
            { icon: ShieldAlert, label: "Perfis de Acesso", href: "/dashboard/roles", permission: 'manage_roles' },
            { icon: LucideHistory, label: "Auditoria", href: "/dashboard/audit", permission: 'view_audit' },
        ]
    }
];

export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
    const pathname = usePathname();
    const [company, setCompany] = useState<{ nome: string, logoUrl?: string } | null>(null);
    const [userLevel, setUserLevel] = useState<number | null>(null);
    const [userPermissions, setUserPermissions] = useState<string[]>([]);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        "Home": true,
        "Gestão Corporativa": true,
        "Administração": true
    });

    useEffect(() => {
        fetch('/api/company').then(res => res.json()).then(data => { if (data.nome) setCompany(data); }).catch(() => { });
        fetch('/api/profile').then(res => res.json()).then(data => {
            if (data.nivelAcesso) setUserLevel(data.nivelAcesso);
            if (data.permissions) setUserPermissions(data.permissions);
        }).catch(() => { });
    }, []);

    const toggleGroup = (groupLabel: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupLabel]: !prev[groupLabel]
        }));
    };

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
                "fixed inset-y-0 left-0 z-50 w-[260px] bg-slate-50 border-r border-slate-200/60 flex flex-col h-screen transition-transform duration-300 md:sticky md:top-0 md:translate-x-0 block shadow-sm",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-16 px-6 border-b border-slate-200/60 flex items-center gap-3 bg-white">
                    <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm overflow-hidden shrink-0">
                        {company?.logoUrl ? (
                            <img src={company.logoUrl} alt="Logo" className="h-full w-full object-contain p-1" />
                        ) : (
                            <Database className="h-5 w-5" />
                        )}
                    </div>
                    <h1 className="text-lg font-extrabold text-slate-800 truncate flex-1 tracking-tight">
                        {company?.nome || "Dinheiro Fácil"}
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-6 overflow-y-auto overflow-x-hidden stylized-scrollbar">
                    {menuGroups.map((group) => {
                        // Filter items inside group based on user level or permissions
                        // Se o array de permissões estiver vazio (não logou de novo ainda) fallback pro admin
                        const accessibleItems = group.items.filter(item => {
                            if (userPermissions && userPermissions.length > 0) {
                                return userPermissions.includes(item.permission);
                            } else {
                                // Fallback para usuários antigos s/ relogar
                                return userLevel === 1; // Simplificado: Mostra se for master admin
                            }
                        });

                        // Força todos menus liberados para backward compatibility até relogar
                        const displayItems = (accessibleItems.length > 0) ? accessibleItems : userLevel === 1 ? group.items : [];

                        // Permite acesso irrestrito visual para Dash/Clients/Loans se nível 2/3 (Fallback)
                        if (userPermissions.length === 0 && userLevel !== null && userLevel > 1) {
                            if (group.label === "Home" || group.label === "Gestão Corporativa") {
                                // Add all except commissions
                                displayItems.push(...group.items.filter(i => i.label !== 'Comissões' && !displayItems.some(di => di.label === i.label)));
                            }
                            if (group.label === "Administração") {
                                // Add only agenda
                                displayItems.push(...group.items.filter(i => i.label === 'Agenda' && !displayItems.some(di => di.label === i.label)));
                            }
                        }

                        if (displayItems.length === 0) return null;

                        const isExpanded = expandedGroups[group.label] !== false;

                        return (
                            <div key={group.label} className="flex flex-col gap-1">
                                <button
                                    onClick={() => toggleGroup(group.label)}
                                    className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors mb-1"
                                >
                                    {group.label}
                                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200 opacity-60", !isExpanded && "-rotate-90")} />
                                </button>

                                <div className={cn("flex flex-col gap-1 overflow-hidden transition-all", isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0")}>
                                    {displayItems.map((item) => {
                                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsOpen(false)}
                                                className={cn(
                                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-semibold",
                                                    isActive
                                                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                                        : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                                                )}
                                            >
                                                <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-white" : "text-slate-400")} />
                                                {item.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}



export function Shell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
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
                <header className="flex items-center justify-between px-4 sm:px-6 h-16 bg-white border-b border-slate-200/60 sticky top-0 z-30 shadow-sm transition-all text-slate-700">

                    {/* Left Side: Mobile Hamburger & Current Page Context */}
                    <div className="flex items-center gap-2 sm:gap-4 w-full max-w-[60%] overflow-hidden">
                        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="md:hidden -ml-2 text-slate-600 hover:bg-slate-100">
                            <Menu className="h-6 w-6" />
                        </Button>
                        <div className="hidden md:flex items-center font-semibold text-sm truncate gap-2">
                            <Link href="/dashboard" className="text-slate-400 hover:text-blue-600 transition-colors">Dashboard</Link>
                            {pathname !== '/dashboard' && (
                                <>
                                    <span className="text-slate-300">/</span>
                                    <span className="text-slate-800 capitalize truncate">
                                        {pathname.split('/').filter(Boolean).pop()?.replace('-', ' ')}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Notifications & User Profile */}
                    <div className="relative ml-auto flex items-center gap-1 sm:gap-3 shrink-0">

                        {/* Notification Bell */}
                        <button className="h-9 w-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-offset-1">
                            <Bell className="h-5 w-5" />
                        </button>

                        <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1"></div>

                        {/* User Dropdown */}
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className={cn(
                                "flex items-center gap-2.5 p-1 pr-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 border hover:bg-slate-50",
                                isProfileOpen ? "bg-slate-50 border-slate-200" : "border-transparent"
                            )}
                        >
                            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-inner shrink-0 leading-none">
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
