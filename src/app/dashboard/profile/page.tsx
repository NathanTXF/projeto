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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

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
    roleName?: string; // New field from RBAC
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
    const [tempPhotoUrl, setTempPhotoUrl] = useState("");

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
                endereco: profile.endereco,
                horarioInicio: profile.horarioInicio,
                horarioFim: profile.horarioFim
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

            setProfile(p => ({ ...p, ...data }));
            toast.success("Perfil atualizado com sucesso!");
            setNewPassword("");
        } catch (error: any) {
            toast.error("Erro ao atualizar perfil: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePhoto = async () => {
        if (!profile) return;
        try {
            setSaving(true);
            const response = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fotoUrl: tempPhotoUrl })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setProfile(p => p ? ({ ...p, fotoUrl: tempPhotoUrl }) : null);
            toast.success("Foto de perfil atualizada!");
            setIsPhotoDialogOpen(false);
        } catch (error: any) {
            toast.error("Erro ao atualizar foto: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground font-medium animate-pulse">Carregando perfil...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ── Enterprise Hero Banner ── */}
            <div className="relative overflow-hidden rounded-2xl bg-primary p-8 shadow-sm">
                <div className="relative flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-inner">
                        <UserCircle className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-primary-foreground leading-tight">Meu Perfil</h1>
                        <p className="mt-1 text-primary-foreground/80 font-medium text-sm">Gerencie suas informações pessoais e segurança corporativa.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="md:col-span-1 border border-slate-100 shadow-sm overflow-hidden rounded-2xl bg-white">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-card shadow-sm overflow-hidden">
                                {profile?.fotoUrl ? (
                                    <img src={profile.fotoUrl} alt="Foto" className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircle className="h-16 w-16 text-muted-foreground/30" />
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    setTempPhotoUrl(profile?.fotoUrl || "");
                                    setIsPhotoDialogOpen(true);
                                }}
                                className="absolute bottom-1 right-1 bg-primary text-primary-foreground p-2 rounded-full shadow-md hover:bg-primary/90 transition-all active:scale-95"
                            >
                                <Camera className="h-4 w-4" />
                            </button>
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-slate-800">{profile?.nome}</h2>
                        <p className="text-sm text-slate-500 font-medium">@{profile?.usuario}</p>

                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                            {profile?.roleName ? (
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold text-[10px] uppercase tracking-wider px-3">
                                    <Shield className="h-3 w-3 mr-1" />
                                    {profile.roleName}
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold text-[10px] uppercase tracking-wider px-3">
                                    {profile?.nivelAcesso === 1 ? 'ADMINISTRADOR' : profile?.nivelAcesso === 2 ? 'VENDEDOR+' : 'VENDEDOR (VISUALIZAÇÃO)'}
                                </Badge>
                            )}
                        </div>

                        <div className="mt-8 w-full space-y-4 pt-6 border-t border-border/50 text-left">
                            <div className="flex items-center gap-3 text-sm text-foreground font-medium group">
                                <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Expediente Atual</span>
                                    <span className="text-foreground"><strong>{profile?.horarioInicio || '08:00'}</strong> às <strong>{profile?.horarioFim || '18:00'}</strong></span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-sm text-slate-600 font-medium group">
                                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Contato</span>
                                    <span className="text-slate-700">{profile?.contato || 'Não informado'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-sm text-slate-600 font-medium group">
                                <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Localização</span>
                                    <span className="text-slate-700 truncate">{profile?.endereco || 'Não informado'}</span>
                                </div>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="horarioInicio" className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                        <Clock className="h-3 w-3" /> Início do Expediente
                                    </Label>
                                    <Input
                                        id="horarioInicio"
                                        type="time"
                                        value={profile?.horarioInicio || "08:00"}
                                        onChange={(e) => setProfile(p => p ? ({ ...p, horarioInicio: e.target.value }) : null)}
                                        className="rounded-xl border-slate-200 focus:ring-blue-500 bg-slate-50/50 h-12 font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="horarioFim" className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                        <Clock className="h-3 w-3" /> Fim do Expediente
                                    </Label>
                                    <Input
                                        id="horarioFim"
                                        type="time"
                                        value={profile?.horarioFim || "18:00"}
                                        onChange={(e) => setProfile(p => p ? ({ ...p, horarioFim: e.target.value }) : null)}
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
                                    className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm px-8 py-6 gap-2 transition-all active:scale-95"
                                >
                                    {saving ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                    Salvar Alterações
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Modal de Upload de Foto */}
            <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
                <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                    <DialogHeader className="bg-primary p-6 text-primary-foreground">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <Camera className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold">Alterar Foto de Perfil</DialogTitle>
                                <DialogDescription className="text-primary-foreground/80 text-xs">
                                    Insira a URL da sua nova imagem de perfil.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-6 space-y-6">
                        <div className="flex flex-col items-center gap-4 py-6 border-2 border-dashed border-border rounded-2xl bg-muted/30">
                            <div className="h-24 w-24 rounded-full bg-card border border-border flex items-center justify-center overflow-hidden shadow-sm">
                                {tempPhotoUrl ? (
                                    <img src={tempPhotoUrl} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <UserCircle className="h-12 w-12 text-muted-foreground/30" />
                                )}
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Pré-visualização</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="photoUrl" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">URL da Imagem</Label>
                            <Input
                                id="photoUrl"
                                placeholder="https://exemplo.com/sua-foto.jpg"
                                value={tempPhotoUrl}
                                onChange={(e) => setTempPhotoUrl(e.target.value)}
                                className="rounded-xl border-border focus:ring-primary h-12"
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-0 flex gap-3 sm:justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setIsPhotoDialogOpen(false)}
                            className="rounded-xl font-bold px-6 border-border"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleUpdatePhoto}
                            disabled={saving}
                            className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 shadow-sm"
                        >
                            {saving && <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmar Alteração
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
