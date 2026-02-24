"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, Save, Upload, Briefcase, Hash, Phone, MapPin, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CompanyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        nome: "",
        cnpj: "",
        contato: "",
        endereco: "",
        cidade: "",
        logoUrl: "",
    });

    useEffect(() => {
        fetchCompanyData();
    }, []);

    const fetchCompanyData = async () => {
        setLoading(true);
        try {
            // Verifica permissão e dados
            const profileRes = await fetch("/api/profile");
            const profile = await profileRes.json();
            if (profile.nivelAcesso !== 1) {
                toast.error("Acesso negado. Apenas administradores.");
                router.push("/dashboard");
                return;
            }

            const response = await fetch("/api/company");
            if (response.ok) {
                const data = await response.json();
                setForm({
                    nome: data.nome || "",
                    cnpj: data.cnpj || "",
                    contato: data.contato || "",
                    endereco: data.endereco || "",
                    cidade: data.cidade || "",
                    logoUrl: data.logoUrl || "",
                });
            }
        } catch (error) {
            toast.error("Erro ao carregar dados da empresa.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch("/api/company", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            if (response.ok) {
                toast.success("Dados da empresa salvos com sucesso!");
                // Força reload para a Logo da Sidebar puxar os novos dados
                setTimeout(() => window.location.reload(), 1000);
            } else {
                throw new Error("Falha ao salvar");
            }
        } catch (error) {
            toast.error("Erro ao atualizar dados.");
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("A imagem deve ter no máximo 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setForm(prev => ({ ...prev, logoUrl: base64String }));
        };
        reader.readAsDataURL(file);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[500px]">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-[#00355E] p-8 shadow-sm">
                <div className="relative flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-inner">
                        <Building2 className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-primary-foreground leading-tight">
                            {form.nome ? form.nome : "Configurações da Empresa"}
                        </h1>
                        <p className="mt-1 text-primary-foreground/80 font-medium text-sm">Configure a identidade visual e dados oficiais que sairão nos relatórios.</p>
                    </div>
                </div>
            </div>

            <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6">
                    <CardTitle className="text-xl text-slate-800">Identidade & Fiscal</CardTitle>
                    <CardDescription>Estes dados serão utilizados no cabeçalho das exportações PDF.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">

                    {/* Linha 1: LOGO */}
                    <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center pb-8 border-b border-slate-100">
                        <Avatar className="h-32 w-32 border-4 border-slate-50 shadow-md">
                            <AvatarImage src={form.logoUrl} alt="Logo Empresa" className="object-contain bg-white" />
                            <AvatarFallback className="bg-slate-100 text-slate-400 font-bold text-2xl">
                                {form.nome ? form.nome.substring(0, 2).toUpperCase() : "LOGO"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-3">
                            <h3 className="font-bold text-slate-700">Logomarca (Sidebar & Relatórios)</h3>
                            <p className="text-sm text-slate-500 max-w-sm">Faça o upload da logomarca oficial da sua empresa. Recomendamos o formato PNG transparente, tamanho máx. 2MB.</p>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleLogoUpload}
                            />
                            <Button
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="gap-2 font-bold"
                            >
                                <Upload className="h-4 w-4" />
                                Escolher Imagem
                            </Button>
                        </div>
                    </div>

                    {/* Linha 2 e 3: DADOS FISCAIS E ENDEREÇO */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-slate-600 font-bold flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-slate-400" /> Razão Social / Nome Fantasia
                            </Label>
                            <Input
                                value={form.nome}
                                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                                className="bg-slate-50 h-12 rounded-xl"
                                placeholder="Ex: Dinheiro Fácil Crédito Ltda"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-600 font-bold flex items-center gap-2">
                                <Hash className="h-4 w-4 text-slate-400" /> CNPJ
                            </Label>
                            <Input
                                value={form.cnpj}
                                onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                                className="bg-slate-50 h-12 rounded-xl"
                                placeholder="00.000.000/0001-00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-600 font-bold flex items-center gap-2">
                                <Phone className="h-4 w-4 text-slate-400" /> Contato Comercial
                            </Label>
                            <Input
                                value={form.contato}
                                onChange={(e) => setForm({ ...form, contato: e.target.value })}
                                className="bg-slate-50 h-12 rounded-xl"
                                placeholder="(11) 99999-9999"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-600 font-bold flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-slate-400" /> Endereço Completo
                            </Label>
                            <Input
                                value={form.endereco}
                                onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                                className="bg-slate-50 h-12 rounded-xl"
                                placeholder="Rua das Finanças, 100 - Centro"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-600 font-bold flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-slate-400" /> Cidade
                            </Label>
                            <Input
                                value={form.cidade}
                                onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                                className="bg-slate-50 h-12 rounded-xl"
                                placeholder="Sua Cidade - UF"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground h-12 px-8 rounded-xl font-bold gap-2 text-base shadow-lg shadow-sidebar/20 transition-all hover:-translate-y-0.5"
                        >
                            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            Salvar Configurações
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
