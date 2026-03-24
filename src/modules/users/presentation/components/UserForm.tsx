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
import {
    AccessScheduleMap,
    buildDefaultAccessSchedule,
    deriveLegacyWindows,
    isTimeRangeValid,
    parseAccessSchedule,
    serializeAccessSchedule,
    WeekDayKey,
} from "../../domain/accessSchedule";

const userFormSchema = UserSchema.extend({
    senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional().or(z.literal("")),
    roleId: z.string().uuid().optional().nullable(),
    ativo: z.boolean().default(true),
    diasAcesso: z.string().optional().nullable(),
    horarioInicioFds: z.string().optional().nullable(),
    horarioFimFds: z.string().optional().nullable(),
});

const DAYS_OF_WEEK: Array<{ short: string; full: string; value: WeekDayKey }> = [
    { short: "Dom", full: "Domingo", value: "0" },
    { short: "Seg", full: "Segunda-feira", value: "1" },
    { short: "Ter", full: "Terça-feira", value: "2" },
    { short: "Qua", full: "Quarta-feira", value: "3" },
    { short: "Qui", full: "Quinta-feira", value: "4" },
    { short: "Sex", full: "Sexta-feira", value: "5" },
    { short: "Sáb", full: "Sábado", value: "6" },
];

type UserFormValues = z.infer<typeof userFormSchema>;
type UserFormInput = z.input<typeof userFormSchema>;

interface UserFormProps {
    initialData?: User | null;
    onSubmit: (data: UserFormValues) => Promise<void>;
    isLoading?: boolean;
    isAdmin?: boolean;
}

export function UserForm({ initialData, onSubmit, isLoading, isAdmin = false }: UserFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [dailySchedule, setDailySchedule] = useState<AccessScheduleMap>(() => {
        if (!initialData) return buildDefaultAccessSchedule();
        return parseAccessSchedule({
            diasAcesso: initialData.diasAcesso,
            horarioInicio: initialData.horarioInicio,
            horarioFim: initialData.horarioFim,
            horarioInicioFds: initialData.horarioInicioFds,
            horarioFimFds: initialData.horarioFimFds,
        });
    });

    const form = useForm<UserFormInput, unknown, UserFormValues>({
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

    const handleDayToggle = (day: WeekDayKey) => {
        setDailySchedule((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                enabled: !prev[day].enabled,
            },
        }));
    };

    const handleDayTimeChange = (day: WeekDayKey, field: "start" | "end", value: string) => {
        setDailySchedule((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value,
            },
        }));
    };

    const handleFormSubmit = async (values: UserFormValues) => {
        const enabledDays = DAYS_OF_WEEK.filter((day) => dailySchedule[day.value].enabled);
        if (enabledDays.length === 0) {
            form.setError("diasAcesso", { message: "Selecione ao menos um dia com acesso." });
            return;
        }

        for (const day of enabledDays) {
            const window = dailySchedule[day.value];
            if (!isTimeRangeValid(window.start, window.end)) {
                form.setError("diasAcesso", {
                    message: `Horário inválido em ${day.full}: início deve ser menor que fim.`,
                });
                return;
            }
        }

        const legacy = deriveLegacyWindows(dailySchedule);

        await onSubmit({
            ...values,
            diasAcesso: serializeAccessSchedule(dailySchedule),
            horarioInicio: legacy.horarioInicio,
            horarioFim: legacy.horarioFim,
            horarioInicioFds: legacy.horarioInicioFds,
            horarioFimFds: legacy.horarioFimFds,
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
                {/* ── Seção: Identificação ── */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/70">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                            <UserCircle className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-medium text-foreground uppercase tracking-wide">
                            Identificação
                        </h3>
                    </div>

                    <FormField
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Nome Completo
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Ex: João Silva"
                                            className="pl-10 h-10"
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
                                    <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Usuário (Login)
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="joao.silva"
                                                className="pl-10 h-10 font-mono"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* ── Nota Informativa: Gestão de Perfis ── */}
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/15 flex gap-4 items-start">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Shield className="h-5 w-5 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium text-foreground">Configuração de Acessos</h4>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Este usuário será criado sem permissões. Atribua o perfil de acesso no módulo de <a href="/dashboard/roles" className="font-semibold underline hover:text-foreground transition-colors">Perfis de Acesso</a>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Seção: Segurança ── */}
                {isAdmin && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-border/70">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                                <KeyRound className="h-4 w-4 text-primary" />
                            </div>
                            <h3 className="text-sm font-medium text-foreground uppercase tracking-wide">
                                Segurança
                            </h3>
                        </div>

                        <FormField
                            control={form.control}
                            name="senha"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {initialData ? "Nova Senha (deixe em branco para manter)" : "Senha"}
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="••••••"
                                                type={showPassword ? "text" : "password"}
                                                className="pl-10 pr-10 h-10"
                                                {...field}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
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
                    <div className="flex items-center gap-2 pb-2 border-b border-border/70">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                            <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-medium text-foreground uppercase tracking-wide">
                            Contato & Expediente
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="contato"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Telefone
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="(00) 00000-0000"
                                                className="pl-10 h-10"
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
                                    <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Endereço
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Rua, Número, Bairro"
                                                className="pl-10 h-10"
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

                    <div className="space-y-4 pt-4 border-t border-border/70">
                        <FormField
                            control={form.control}
                            name="diasAcesso"
                            render={() => (
                                <FormItem>
                                    <div className="flex justify-between items-center mb-2">
                                        <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Agenda De Acesso Por Dia
                                        </FormLabel>
                                        <Badge variant="outline" className="text-[10px] font-medium border-primary/20 text-primary bg-primary/10">Política semanal</Badge>
                                    </div>

                                    <div className="rounded-lg border border-border/70 overflow-hidden">
                                        <div className="grid grid-cols-12 bg-muted/30 px-3 py-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                                            <div className="col-span-4">Dia</div>
                                            <div className="col-span-2 text-center">Acesso</div>
                                            <div className="col-span-3">Início</div>
                                            <div className="col-span-3">Fim</div>
                                        </div>

                                        <div className="divide-y divide-border/60">
                                            {DAYS_OF_WEEK.map((day) => {
                                                const config = dailySchedule[day.value];
                                                return (
                                                    <div key={day.value} className="grid grid-cols-12 items-center gap-2 px-3 py-2.5">
                                                        <div className="col-span-4 flex items-center gap-2">
                                                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-muted text-[10px] font-medium text-muted-foreground">
                                                                {day.short}
                                                            </span>
                                                            <span className="text-xs font-medium text-foreground">{day.full}</span>
                                                        </div>

                                                        <div className="col-span-2 flex justify-center">
                                                            <Button
                                                                type="button"
                                                                variant={config.enabled ? "default" : "outline"}
                                                                size="sm"
                                                                className={cn(
                                                                    "h-7 rounded-md px-2.5 text-[10px] font-medium",
                                                                    config.enabled
                                                                        ? "bg-primary text-primary-foreground"
                                                                        : "text-muted-foreground"
                                                                )}
                                                                onClick={() => handleDayToggle(day.value)}
                                                            >
                                                                {config.enabled ? "ON" : "OFF"}
                                                            </Button>
                                                        </div>

                                                        <div className="col-span-3">
                                                            <Input
                                                                type="time"
                                                                value={config.start}
                                                                onChange={(event) => handleDayTimeChange(day.value, "start", event.target.value)}
                                                                disabled={!config.enabled}
                                                                className="h-8 text-[11px]"
                                                            />
                                                        </div>

                                                        <div className="col-span-3">
                                                            <Input
                                                                type="time"
                                                                value={config.end}
                                                                onChange={(event) => handleDayTimeChange(day.value, "end", event.target.value)}
                                                                disabled={!config.enabled}
                                                                className="h-8 text-[11px]"
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                                        Defina o expediente individual por dia. O login respeitará o dia ativo e a faixa de horário configurada.
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="ativo"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/70 p-4 bg-muted/20 hover:bg-muted/35 transition-colors">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <FormLabel className="text-sm font-medium text-foreground">Status da Conta</FormLabel>
                                            <Badge className={cn(
                                                "text-[9px] uppercase font-medium px-1.5 py-0",
                                                field.value ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                            )}>
                                                {field.value ? "Ativo" : "Inativo"}
                                            </Badge>
                                        </div>
                                        <div className="text-[11px] text-muted-foreground font-medium">
                                            {field.value ? "Usuário pode acessar o sistema normalmente." : "Acesso bloqueado por este interruptor."}
                                        </div>
                                    </div>
                                    <FormControl>
                                        <div
                                            className={cn(
                                                "w-11 h-6 rounded-full transition-colors cursor-pointer relative",
                                                field.value ? "bg-primary" : "bg-muted"
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
                    className="w-full h-11 rounded-lg bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground font-semibold shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] gap-2"
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
