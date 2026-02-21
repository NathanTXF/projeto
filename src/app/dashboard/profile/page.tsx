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
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                    <UserCircle className="h-8 w-8 text-indigo-600" />
                    Meu Perfil
                </h1>
                <p className="text-slate-500 mt-1">Gerencie suas informações pessoais e segurança.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="md:col-span-1 border-none shadow-lg overflow-hidden rounded-2xl bg-white">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
                                {profile?.fotoUrl ? (
                                    <img src={profile.fotoUrl} alt="Foto" className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircle className="h-16 w-16 text-slate-300" />
                                )}
                            </div>
                            <button className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors">
                                <Camera className="h-4 w-4" />
                            </button>
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-slate-800">{profile?.nome}</h2>
                        <p className="text-sm text-slate-500 font-medium">@{profile?.usuario}</p>

                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                            <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-100 uppercase text-[10px] font-bold">
                                {profile?.nivelAcesso === 1 ? 'ADMINISTRADOR' : profile?.nivelAcesso === 2 ? 'VENDEDOR+' : 'VENDEDOR (VISUALIZAÇÃO)'}
                            </Badge>
                        </div>

                        <div className="mt-8 w-full space-y-3 pt-6 border-t border-slate-100 text-left">
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <span>Turno: <strong>{profile?.horarioInicio || '08:00'} - {profile?.horarioFim || '18:00'}</strong></span>
                            </div>
                            {profile?.contato && (
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Phone className="h-4 w-4 text-slate-400" />
                                    <span>{profile.contato}</span>
                                </div>
                            )}
                            {profile?.endereco && (
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <MapPin className="h-4 w-4 text-slate-400" />
                                    <span className="truncate">{profile.endereco}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Shield className="h-4 w-4 text-slate-400" />
                                <span>Segurança Ativa</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 border-none shadow-lg rounded-2xl bg-white">
                    <CardHeader className="border-b border-slate-50">
                        <CardTitle className="text-lg">Informações da Conta</CardTitle>
                        <CardDescription>Mantenha seus dados sempre atualizados.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nome" className="text-slate-700">Nome Completo</Label>
                                    <Input
                                        id="nome"
                                        value={profile?.nome || ""}
                                        onChange={(e) => setProfile(p => p ? ({ ...p, nome: e.target.value }) : null)}
                                        className="rounded-xl border-slate-200 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="usuario" className="text-slate-700">Nome de Usuário</Label>
                                    <Input
                                        id="usuario"
                                        value={profile?.usuario || ""}
                                        onChange={(e) => setProfile(p => p ? ({ ...p, usuario: e.target.value }) : null)}
                                        className="rounded-xl border-slate-200 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contato" className="text-slate-700">Contato / Telefone</Label>
                                    <Input
                                        id="contato"
                                        placeholder="(00) 00000-0000"
                                        value={profile?.contato || ""}
                                        onChange={(e) => setProfile(p => p ? ({ ...p, contato: e.target.value }) : null)}
                                        className="rounded-xl border-slate-200 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endereco" className="text-slate-700">Endereço</Label>
                                    <Input
                                        id="endereco"
                                        placeholder="Rua, Número, Bairro"
                                        value={profile?.endereco || ""}
                                        onChange={(e) => setProfile(p => p ? ({ ...p, endereco: e.target.value }) : null)}
                                        className="rounded-xl border-slate-200 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-slate-50">
                                <Label htmlFor="senha" className="text-slate-700">Alterar Senha {profile?.nivelAcesso !== 1 && "(Apenas Administrador)"}</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="senha"
                                        type="password"
                                        disabled={profile?.nivelAcesso !== 1}
                                        placeholder={profile?.nivelAcesso === 1 ? "Deixe em branco para manter a atual" : "Bloqueado pelo sistema"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="rounded-xl border-slate-200 pl-10 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
                                    />
                                </div>
                                {profile?.nivelAcesso === 1 && <p className="text-[10px] text-slate-400 italic">Mínimo de 6 caracteres.</p>}
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md px-8 py-2 gap-2 transition-all active:scale-95"
                                >
                                    {saving ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
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
