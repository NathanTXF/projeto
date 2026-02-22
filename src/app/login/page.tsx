"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, User } from "lucide-react";

export default function LoginPage() {
    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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
        <div className="flex min-h-screen items-center justify-center bg-slate-50/50 p-4">
            <Card className="w-full max-w-md border-none shadow-xl rounded-2xl bg-white/70 backdrop-blur-sm">
                <CardHeader className="space-y-1 text-center font-sans bg-white border-b border-slate-100 pb-6 rounded-t-2xl">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-indigo-100 p-3 text-indigo-700">
                            <Lock className="h-6 w-6" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-slate-800">Dinheiro Fácil</CardTitle>
                    <CardDescription className="text-slate-500">
                        Acesse sua conta para gerenciar empréstimos e comissões
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin} className="pt-6">
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="usuario" className="text-slate-700 font-semibold">Usuário</Label>
                            <div className="relative">
                                <Input
                                    id="usuario"
                                    type="text"
                                    placeholder="Seu usuário"
                                    value={usuario}
                                    onChange={(e) => setUsuario(e.target.value)}
                                    className="pl-10 rounded-xl border-slate-200 focus-visible:ring-indigo-500"
                                    required
                                />
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="senha" className="text-slate-700 font-semibold">Senha</Label>
                            <div className="relative">
                                <Input
                                    id="senha"
                                    type="password"
                                    placeholder="••••••••"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    className="pl-10 rounded-xl border-slate-200 focus-visible:ring-indigo-500"
                                    required
                                />
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="pb-6">
                        <Button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all font-medium py-6"
                            disabled={loading}
                        >
                            {loading ? "Entrando..." : "Entrar no Sistema"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
