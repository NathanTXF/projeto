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
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

const userFormSchema = UserSchema.extend({
    senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional().or(z.literal("")),
    roleId: z.string().uuid().optional().nullable(),
    ativo: z.boolean().default(true),
    diasAcesso: z.string().optional().nullable(),
    horarioInicioFds: z.string().optional().nullable(),
    horarioFimFds: z.string().optional().nullable(),
});

const DAYS_OF_WEEK = [
    { label: "Dom", value: "0" },
    { label: "Seg", value: "1" },
    { label: "Ter", value: "2" },
    { label: "Qua", value: "3" },
    { label: "Qui", value: "4" },
    { label: "Sex", value: "5" },
    { label: "Sáb", value: "6" },
];

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
    initialData?: User | null;
    onSubmit: (data: UserFormValues) => Promise<void>;
    isLoading?: boolean;
    isAdmin?: boolean;
}

export function UserForm({ initialData, onSubmit, isLoading, isAdmin = false }: UserFormProps) {
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: initialData ? {
            id: initialData.id || "",
            nome: initialData.nome || "",
            usuario: initialData.usuario || "",
            senha: "",
            fotoUrl: initialData.fotoUrl || "",
            ativo: initialData.ativo ?? true,
            diasAcesso: initialData.diasAcesso || "1,2,3,4,5",
            horarioInicioFds: initialData.horarioInicioFds || "",
            horarioFimFds: initialData.horarioFimFds || "",
            contato: initialData.contato || "",
            endereco: initialData.endereco || "",
            horarioInicio: initialData.horarioInicio || "08:00",
            horarioFim: initialData.horarioFim || "18:00",
            roleId: initialData.roleId || "",
            nivelAcesso: initialData.nivelAcesso || null,
        } : {
            nome: "",
            usuario: "",
            senha: "",
            roleId: "",
            fotoUrl: "",
            horarioInicio: "08:00",
            horarioFim: "18:00",
            horarioInicioFds: "",
            horarioFimFds: "",
            ativo: true,
            diasAcesso: "1,2,3,4,5",
            contato: "",
            endereco: "",
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
                {isAdmin && (
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
                )}

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

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <FormField
                            control={form.control}
                            name="diasAcesso"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex justify-between items-center mb-2">
                                        <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Dias Permitidos
                                        </FormLabel>
                                        <Badge variant="outline" className="text-[10px] font-bold border-indigo-100 text-indigo-600 bg-indigo-50/30">Acesso Semanal</Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {DAYS_OF_WEEK.map((day) => {
                                            const selectedDays = field.value?.split(",") || [];
                                            const isChecked = selectedDays.includes(day.value);

                                            return (
                                                <Button
                                                    key={day.value}
                                                    type="button"
                                                    variant={isChecked ? "default" : "outline"}
                                                    size="sm"
                                                    className={cn(
                                                        "h-8 px-3 rounded-lg text-[10px] font-bold transition-all",
                                                        isChecked
                                                            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                                                            : "bg-white text-slate-500 hover:bg-slate-50 border-slate-200"
                                                    )}
                                                    onClick={() => {
                                                        const newDays = isChecked
                                                            ? selectedDays.filter(d => d !== day.value)
                                                            : [...selectedDays, day.value];
                                                        field.onChange(newDays.sort().join(","));
                                                    }}
                                                >
                                                    {day.label}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* ── Horário Especial de Fim de Semana (Condicional) ── */}
                        {(form.watch("diasAcesso")?.split(",") || []).some(d => ["0", "6"].includes(d)) && (
                            <div className="p-4 rounded-xl bg-amber-50/30 border border-amber-100/50 space-y-3 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                                    <h4 className="text-[11px] font-bold text-amber-700 uppercase tracking-tight">Horário Especial (Fim de Semana)</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                        control={form.control}
                                        name="horarioInicioFds"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        type="time"
                                                        placeholder="Início"
                                                        className="h-8 rounded-lg border-amber-200/50 bg-white/50 text-[11px] focus-visible:ring-amber-500"
                                                        {...field}
                                                        value={field.value || ""}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="horarioFimFds"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        type="time"
                                                        placeholder="Fim"
                                                        className="h-8 rounded-lg border-amber-200/50 bg-white/50 text-[11px] focus-visible:ring-amber-500"
                                                        {...field}
                                                        value={field.value || ""}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <p className="text-[9px] text-amber-600/70 font-medium italic">Se deixado em branco, será usado o horário padrão de expediente.</p>
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="ativo"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50/30 hover:bg-slate-50/50 transition-colors">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <FormLabel className="text-sm font-bold text-slate-700">Status da Conta</FormLabel>
                                            <Badge className={cn(
                                                "text-[9px] uppercase font-black px-1.5 py-0",
                                                field.value ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                            )}>
                                                {field.value ? "Ativo" : "Inativo"}
                                            </Badge>
                                        </div>
                                        <div className="text-[11px] text-slate-500 font-medium">
                                            {field.value ? "Usuário pode acessar o sistema normalmente." : "Acesso bloqueado por este interruptor."}
                                        </div>
                                    </div>
                                    <FormControl>
                                        <div
                                            className={cn(
                                                "w-11 h-6 rounded-full transition-colors cursor-pointer relative",
                                                field.value ? "bg-indigo-600" : "bg-slate-300"
                                            )}
                                            onClick={() => field.onChange(!field.value)}
                                        >
                                            <div className={cn(
                                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                                                field.value ? "left-6" : "left-1"
                                            )} />
                                        </div>
                                    </FormControl>
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
