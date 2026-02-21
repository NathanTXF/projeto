"use client";

import { useState } from "react";
import {
    Settings,
    Bell,
    Shield,
    Monitor,
    Save,
    RefreshCcw,
    Moon,
    Sun,
    Globe,
    Database,
    Lock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function SettingsPage() {
    const [saving, setSaving] = useState(false);

    // Notificações
    const [notifEmail, setNotifEmail] = useState(true);
    const [notifSistema, setNotifSistema] = useState(true);
    const [notifComissoes, setNotifComissoes] = useState(true);

    // Aparência
    const [tema, setTema] = useState<"claro" | "escuro" | "sistema">("sistema");

    // Segurança
    const [sessionTimeout, setSessionTimeout] = useState("8");

    const handleSave = async () => {
        setSaving(true);
        await new Promise((r) => setTimeout(r, 800));
        setSaving(false);
        toast.success("Configurações salvas com sucesso!");
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                    <Settings className="h-8 w-8 text-indigo-600" />
                    Configurações
                </h1>
                <p className="text-slate-500 mt-1">Personalize o comportamento do sistema.</p>
            </div>

            {/* Aparência */}
            <Card className="border-none shadow-lg rounded-2xl bg-white">
                <CardHeader className="border-b border-slate-50">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Monitor className="h-5 w-5 text-indigo-500" />
                        Aparência
                    </CardTitle>
                    <CardDescription>Escolha o tema visual da interface.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {(["claro", "escuro", "sistema"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTema(t)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${tema === t
                                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                                    }`}
                            >
                                {t === "claro" && <Sun className="h-4 w-4" />}
                                {t === "escuro" && <Moon className="h-4 w-4" />}
                                {t === "sistema" && <Globe className="h-4 w-4" />}
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Notificações */}
            <Card className="border-none shadow-lg rounded-2xl bg-white">
                <CardHeader className="border-b border-slate-50">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Bell className="h-5 w-5 text-indigo-500" />
                        Notificações
                    </CardTitle>
                    <CardDescription>Controle quais alertas você deseja receber.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    {[
                        { label: "Notificações por e-mail", desc: "Receba atualizações importantes por e-mail.", state: notifEmail, setter: setNotifEmail },
                        { label: "Notificações do sistema", desc: "Alertas em tempo real dentro da plataforma.", state: notifSistema, setter: setNotifSistema },
                        { label: "Avisos de comissões", desc: "Alertas sobre novas comissões registradas.", state: notifComissoes, setter: setNotifComissoes },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                            <div>
                                <p className="font-medium text-slate-800 text-sm">{item.label}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                            </div>
                            <button
                                onClick={() => item.setter(!item.state)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.state ? "bg-indigo-600" : "bg-slate-300"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${item.state ? "translate-x-6" : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Segurança */}
            <Card className="border-none shadow-lg rounded-2xl bg-white">
                <CardHeader className="border-b border-slate-50">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Shield className="h-5 w-5 text-indigo-500" />
                        Segurança da Sessão
                    </CardTitle>
                    <CardDescription>Configure o tempo de expiração automática da sessão.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-xs">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                type="number"
                                min={1}
                                max={24}
                                value={sessionTimeout}
                                onChange={(e) => setSessionTimeout(e.target.value)}
                                className="pl-10 rounded-xl border-slate-200"
                            />
                        </div>
                        <Label className="text-slate-600 font-medium">horas de inatividade</Label>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 ml-1">
                        A sessão expira automaticamente após {sessionTimeout}h sem atividade.
                    </p>
                </CardContent>
            </Card>

            {/* Sistema */}
            <Card className="border-none shadow-lg rounded-2xl bg-white">
                <CardHeader className="border-b border-slate-50">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Database className="h-5 w-5 text-indigo-500" />
                        Sobre o Sistema
                    </CardTitle>
                    <CardDescription>Informações técnicas da instalação atual.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { label: "Versão", value: "1.0.0" },
                            { label: "Ambiente", value: "Produção" },
                            { label: "Framework", value: "Next.js 16" },
                            { label: "Banco de Dados", value: "PostgreSQL 15" },
                        ].map((item) => (
                            <div key={item.label} className="p-4 rounded-xl bg-slate-50">
                                <dt className="text-xs text-slate-500 font-medium uppercase tracking-wide">{item.label}</dt>
                                <dd className="mt-1 text-sm font-semibold text-slate-800">{item.value}</dd>
                            </div>
                        ))}
                    </dl>
                </CardContent>
            </Card>

            {/* Botão salvar */}
            <div className="flex justify-end pb-8">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md px-8 py-2 gap-2 transition-all active:scale-95"
                >
                    {saving ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Salvar Configurações
                </Button>
            </div>
        </div>
    );
}
