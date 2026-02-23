"use client";

import { useState, useEffect } from "react";
import {
    Lock,
    Clock,
    Shield,
    Save,
    Camera,
    UserCircle,
    RefreshCcw,
    Phone,
    MapPin
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface UserProfile {
    id: string;
    nome: string;
    usuario: string;
    nivelAcesso: number;
    horarioInicio?: string;
    horarioFim?: string;
    fotoUrl?: string;
    contato?: string;
    endereco?: string;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newPassword, setNewPassword] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/profile');
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setProfile(data);
        } catch (error: any) {
            toast.error("Erro ao carregar perfil: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        try {
            setSaving(true);
            const updateData: any = {
                nome: profile.nome,
                usuario: profile.usuario,
                contato: profile.contato,
                endereco: profile.endereco
            };

            if (newPassword) {
                if (newPassword.length < 6) {
                    toast.error("A nova senha deve ter pelo menos 6 caracteres.");
                    return;
                }
                updateData.senha = newPassword;
            }

            const response = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            toast.success("Perfil atualizado com sucesso!");
            setNewPassword("");
        } catch (error: any) {
            toast.error("Erro ao atualizar perfil: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Carregando perfil...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ── Enterprise Hero Banner ── */}
            <div className="relative overflow-hidden rounded-2xl bg-blue-600 p-8 shadow-sm">
                <div className="relative flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-inner">
                        <UserCircle className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">Meu Perfil</h1>
                        <p className="mt-1 text-blue-100 font-medium">Gerencie suas informações pessoais e segurança.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="md:col-span-1 border border-slate-100 shadow-sm overflow-hidden rounded-2xl bg-white">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full bg-slate-50 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                                {profile?.fotoUrl ? (
                                    <img src={profile.fotoUrl} alt="Foto" className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircle className="h-16 w-16 text-slate-300" />
                                )}
                            </div>
                            <button className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors">
                                <Camera className="h-4 w-4" />
                            </button>
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-slate-800">{profile?.nome}</h2>
                        <p className="text-sm text-slate-500 font-medium">@{profile?.usuario}</p>

                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 uppercase tracking-widest text-[10px] font-bold">
                                {profile?.nivelAcesso === 1 ? 'ADMINISTRADOR' : profile?.nivelAcesso === 2 ? 'VENDEDOR+' : 'VENDEDOR (VISUALIZAÇÃO)'}
                            </Badge>
                        </div>

                        <div className="mt-8 w-full space-y-3 pt-6 border-t border-slate-100 text-left">
                            <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <span>Turno: <strong>{profile?.horarioInicio || '08:00'} - {profile?.horarioFim || '18:00'}</strong></span>
                            </div>
                            {profile?.contato && (
                                <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                    <Phone className="h-4 w-4 text-slate-400" />
                                    <span>{profile.contato}</span>
                                </div>
                            )}
                            {profile?.endereco && (
                                <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                    <MapPin className="h-4 w-4 text-slate-400" />
                                    <span className="truncate">{profile.endereco}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                <Shield className="h-4 w-4 text-emerald-500" />
                                <span className="text-emerald-700 font-bold">Segurança Ativa</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 border border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-bold">Informações da Conta</CardTitle>
                        <CardDescription>Mantenha seus dados sempre atualizados.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="nome" className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nome Completo</Label>
                                    <Input
                                        id="nome"
                                        value={profile?.nome || ""}
                                        onChange={(e) => setProfile(p => p ? ({ ...p, nome: e.target.value }) : null)}
                                        className="rounded-xl border-slate-200 focus:ring-blue-500 bg-slate-50/50 h-12 font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="usuario" className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nome de Usuário</Label>
                                    <Input
                                        id="usuario"
                                        value={profile?.usuario || ""}
                                        onChange={(e) => setProfile(p => p ? ({ ...p, usuario: e.target.value }) : null)}
                                        className="rounded-xl border-slate-200 focus:ring-blue-500 bg-slate-50/50 h-12 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="contato" className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contato / Telefone</Label>
                                    <Input
                                        id="contato"
                                        placeholder="(00) 00000-0000"
                                        value={profile?.contato || ""}
                                        onChange={(e) => setProfile(p => p ? ({ ...p, contato: e.target.value }) : null)}
                                        className="rounded-xl border-slate-200 focus:ring-blue-500 bg-slate-50/50 h-12 font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endereco" className="text-xs font-bold text-slate-500 uppercase tracking-widest">Endereço</Label>
                                    <Input
                                        id="endereco"
                                        placeholder="Rua, Número, Bairro"
                                        value={profile?.endereco || ""}
                                        onChange={(e) => setProfile(p => p ? ({ ...p, endereco: e.target.value }) : null)}
                                        className="rounded-xl border-slate-200 focus:ring-blue-500 bg-slate-50/50 h-12 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-6 border-t border-slate-100">
                                <Label htmlFor="senha" className="text-xs font-bold text-slate-500 uppercase tracking-widest">Alterar Senha {profile?.nivelAcesso !== 1 && "(Apenas Administrador)"}</Label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="senha"
                                        type="password"
                                        disabled={profile?.nivelAcesso !== 1}
                                        placeholder={profile?.nivelAcesso === 1 ? "Deixe em branco para manter a atual" : "Bloqueado pelo sistema"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="rounded-xl border-slate-200 pl-11 focus:ring-blue-500 bg-slate-50/50 h-12 disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-50 font-medium"
                                    />
                                </div>
                                {profile?.nivelAcesso === 1 && <p className="text-xs text-slate-400 font-medium mt-1">Mínimo de 6 caracteres.</p>}
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm px-8 py-6 gap-2 transition-all active:scale-95"
                                >
                                    {saving ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                    Salvar Alterações
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
