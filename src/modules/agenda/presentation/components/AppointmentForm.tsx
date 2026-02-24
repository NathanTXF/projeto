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
import { Textarea } from "@/components/ui/textarea";
import {
    Loader2,
    Calendar,
    Clock,
    Tag,
    MessageSquare,
    Save,
    CalendarPlus,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

const formSchema = z.object({
    data: z.string().min(1, "Data é obrigatória"),
    hora: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, "Formato inválido (HH:mm)"),
    tipo: z.string().min(1, "Tipo é obrigatório"),
    observacao: z.string().optional(),
    visibilidade: z.enum(["PRIVADO", "GLOBAL"]),
    destinatarioId: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface AppointmentFormProps {
    initialDate?: Date;
    onSubmit: (values: FormValues) => Promise<void>;
    isLoading?: boolean;
}

export function AppointmentForm({ initialDate, onSubmit, isLoading }: AppointmentFormProps) {
    const [users, setUsers] = useState<{ id: string, nome: string }[]>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            data: initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            hora: "09:00",
            tipo: "",
            observacao: "",
            visibilidade: "PRIVADO",
            destinatarioId: null,
        },
    });

    useEffect(() => {
        fetch('/api/users/list')
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(err => console.error("Erro ao carregar usuários:", err));
    }, []);

    const visibilidade = form.watch("visibilidade");

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* ── Seção: Data & Horário ── */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
                            <Calendar className="h-4 w-4 text-indigo-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                            Data & Horário
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="data"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Data
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                type="date"
                                                className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-colors"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="hora"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Hora
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                type="time"
                                                className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-colors"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* ── Seção: Visibilidade ── */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                            <Save className="h-4 w-4 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                            Visibilidade
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="visibilidade"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Tipo de Visibilidade
                                    </FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50">
                                                <SelectValue placeholder="Selecione a visibilidade" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="PRIVADO">Privado (Somente Eu)</SelectItem>
                                            <SelectItem value="GLOBAL">Para Todos (Global)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {visibilidade === "GLOBAL" ? (
                            <FormItem>
                                <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider opacity-50">
                                    Destinatário
                                </FormLabel>
                                <Input disabled value="Todos do Sistema" className="h-10 rounded-xl border-slate-200 bg-slate-100/50 italic text-slate-400" />
                                <FormMessage />
                            </FormItem>
                        ) : (
                            <FormField
                                control={form.control}
                                name="destinatarioId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Encaminhar para (Opcional)
                                        </FormLabel>
                                        <Select
                                            onValueChange={(val) => field.onChange(val === "none" ? null : val)}
                                            defaultValue={field.value || "none"}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50">
                                                    <SelectValue placeholder="Selecione um usuário" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">Ninguém (Apenas Eu)</SelectItem>
                                                {users.map(u => (
                                                    <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                </div>

                {/* ── Seção: Detalhes ── */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
                            <Tag className="h-4 w-4 text-emerald-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                            Detalhes
                        </h3>
                    </div>

                    <FormField
                        control={form.control}
                        name="tipo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Tipo de Compromisso
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Ex: Reunião, Cobrança, Visita..."
                                            className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-colors"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="observacao"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Observação (Opcional)
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Textarea
                                            placeholder="Detalhes adicionais do compromisso..."
                                            className="pl-10 min-h-[80px] resize-none rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-colors"
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

                {/* ── Botão Salvar ── */}
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 rounded-xl bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground font-semibold shadow-lg shadow-sidebar/20 transition-all duration-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] gap-2"
                >
                    {isLoading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" />Agendando...</>
                    ) : (
                        <><CalendarPlus className="h-4 w-4" />Agendar Compromisso</>
                    )}
                </Button>
            </form>
        </Form>
    );
}
