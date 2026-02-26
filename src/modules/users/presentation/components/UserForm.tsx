"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, UserSchema } from "../../domain/entities";
import {
    Loader2,
    UserCircle,
    AtSign,
    KeyRound,
    Shield,
    Phone,
    MapPin,
    Clock,
    Save,
    Eye,
    EyeOff,
} from "lucide-react";
import { useState } from "react";

const userFormSchema = UserSchema.extend({
    senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional().or(z.literal("")),
    roleId: z.string().uuid().optional().nullable(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
    initialData?: User | null;
    onSubmit: (data: UserFormValues) => Promise<void>;
    isLoading?: boolean;
}

export function UserForm({ initialData, onSubmit, isLoading }: UserFormProps) {
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: initialData ? {
            ...initialData,
            senha: "",
            fotoUrl: initialData.fotoUrl || "",
        } : {
            nome: "",
            usuario: "",
            senha: "",
            roleId: null,
            fotoUrl: "",
            horarioInicio: "08:00",
            horarioFim: "18:00",
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* ── Seção: Identificação ── */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
                            <UserCircle className="h-4 w-4 text-indigo-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                            Identificação
                        </h3>
                    </div>

                    <FormField
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Nome Completo
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Ex: João Silva"
                                            className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-colors"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="usuario"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Usuário (Login)
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="joao.silva"
                                                className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-colors font-mono"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* ── Nota Informativa: Gestão de Perfis ── */}
                        <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex gap-4 items-start">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                <Shield className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-indigo-900">Configuração de Acessos</h4>
                                <p className="text-[11px] text-indigo-700/80 leading-relaxed">
                                    Este usuário será criado sem permissões. Atribua o perfil de acesso no módulo de <a href="/dashboard/roles" className="font-bold underline hover:text-indigo-900 transition-colors">Perfis de Acesso</a>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Seção: Segurança ── */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
                            <KeyRound className="h-4 w-4 text-violet-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                            Segurança
                        </h3>
                    </div>

                    <FormField
                        control={form.control}
                        name="senha"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    {initialData ? "Nova Senha (deixe em branco para manter)" : "Senha"}
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="••••••"
                                            type={showPassword ? "text" : "password"}
                                            className="pl-10 pr-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-colors"
                                            {...field}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-slate-400 hover:text-slate-600"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* ── Seção: Contato & Expediente ── */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
                            <Clock className="h-4 w-4 text-emerald-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                            Contato & Expediente
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="contato"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Telefone
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="(00) 00000-0000"
                                                className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-colors"
                                                {...field}
                                                value={field.value || ""}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="endereco"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Endereço
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="Rua, Número, Bairro"
                                                className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-colors"
                                                {...field}
                                                value={field.value || ""}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="horarioInicio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Início Expediente
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                type="time"
                                                className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-colors"
                                                {...field}
                                                value={field.value || ""}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="horarioFim"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Fim Expediente
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                type="time"
                                                className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-colors"
                                                {...field}
                                                value={field.value || ""}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* ── Botão Salvar ── */}
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 rounded-xl bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground font-semibold shadow-lg shadow-sidebar/20 transition-all duration-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] gap-2"
                >
                    {isLoading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" />Salvando...</>
                    ) : (
                        <><Save className="h-4 w-4" />{initialData ? "Atualizar Usuário" : "Criar Usuário"}</>
                    )}
                </Button>
            </form>
        </Form>
    );
}
