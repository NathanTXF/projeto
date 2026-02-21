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
                router.push("/dashboard");
                router.refresh();
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
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-black">
            <Card className="w-full max-w-md border-zinc-200 shadow-xl dark:border-zinc-800">
                <CardHeader className="space-y-1 text-center font-sans">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-zinc-950 p-3 text-white dark:bg-zinc-50 dark:text-black">
                            <Lock className="h-6 w-6" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Dinheiro Fácil</CardTitle>
                    <CardDescription className="text-zinc-500 dark:text-zinc-400">
                        Acesse sua conta para gerenciar empréstimos e comissões
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="usuario">Usuário</Label>
                            <div className="relative">
                                <Input
                                    id="usuario"
                                    type="text"
                                    placeholder="Seu usuário"
                                    value={usuario}
                                    onChange={(e) => setUsuario(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="senha">Senha</Label>
                            <div className="relative">
                                <Input
                                    id="senha"
                                    type="password"
                                    placeholder="••••••••"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            className="w-full bg-zinc-950 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
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
