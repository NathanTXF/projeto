"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, User, ArrowRight, ShieldCheck, Building2 } from "lucide-react";

export default function LoginPage() {
    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);
    const [branding, setBranding] = useState<{ nome: string, logoUrl: string | null }>({
        nome: "Dinheiro Fácil",
        logoUrl: null
    });
    const router = useRouter();

    useEffect(() => {
        fetch('/api/auth/branding')
            .then(res => res.json())
            .then(data => {
                if (data.nome) setBranding(data);
            })
            .catch(() => { });
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ usuario, senha }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Bem-vindo de volta!");
                window.location.href = '/dashboard';
            } else {
                toast.error(data.message || "Erro ao realizar login");
            }
        } catch (error) {
            toast.error("Ocorreu um erro ao tentar realizar o login.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Side: Hero Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center p-12 overflow-hidden bg-[#002D4E]">
                {/* Background Pattern/Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#00477E] to-[#002D4E]" />
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />

                {/* Content */}
                <div className="relative z-10 animate-in fade-in slide-in-from-left-8 duration-700">
                    {/* Logo removed from here as per request */}

                    <div className="max-w-md space-y-6">
                        <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
                            Gestão inteligente para <span className="text-[#8CC63F]">resultados superiores.</span>
                        </h1>
                        <p className="text-xl text-white/70 font-medium">
                            A plataforma definitiva para controle de empréstimos, comissões de vendedores e gestão financeira sênior.
                        </p>
                    </div>
                </div>

            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50/50">
                <div className="w-full max-w-md space-y-10 animate-in fade-in zoom-in-95 duration-700">
                    {/* Compact Header for Mobile/Title */}
                    <div className="flex justify-center mb-8">
                        <img src="/logo_v2.png" alt="Dinheiro Fácil" className="h-16 w-auto object-contain" />
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-5">
                            <div className="space-y-2.5">
                                <Label htmlFor="usuario" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Usuário</Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#8CC63F] transition-colors">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <Input
                                        id="usuario"
                                        type="text"
                                        placeholder="Seu nome de usuário"
                                        value={usuario}
                                        onChange={(e) => setUsuario(e.target.value)}
                                        className="h-14 pl-12 rounded-2xl border-slate-200 bg-white shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-[#8CC63F]/20 focus-visible:border-[#8CC63F] font-semibold text-slate-700 placeholder:text-slate-300"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="senha" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Senha</Label>
                                    <button type="button" className="text-[10px] font-bold text-slate-400 hover:text-[#8CC63F] transition-colors uppercase tracking-wider">Esqueceu a senha?</button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#8CC63F] transition-colors">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <Input
                                        id="senha"
                                        type="password"
                                        placeholder="••••••••"
                                        value={senha}
                                        onChange={(e) => setSenha(e.target.value)}
                                        className="h-14 pl-12 rounded-2xl border-slate-200 bg-white shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-[#8CC63F]/20 focus-visible:border-[#8CC63F] font-semibold text-slate-700"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 bg-[#8CC63F] hover:bg-[#7ab336] text-white rounded-2xl shadow-lg shadow-[#8CC63F]/20 transition-all font-black text-lg group overflow-hidden relative"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span>CONECTANDO...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-3">
                                    <span>ACESSAR SISTEMA</span>
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </Button>

                        <div className="flex items-center justify-center gap-2 pt-4 py-2 border-t border-slate-100">
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conexão segura via SSL 256-bit</span>
                        </div>
                    </form>

                    <footer className="pt-8 text-center text-xs text-slate-400 font-medium">
                        &copy; {new Date().getFullYear()} {branding.nome}. Todos os direitos reservados.
                    </footer>
                </div>
            </div>
        </div>
    );
}
