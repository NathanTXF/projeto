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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { User, UserSchema } from "../../domain/entities";
import { Loader2 } from "lucide-react";

const userFormSchema = UserSchema.extend({
    senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional().or(z.literal("")),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
    initialData?: User | null;
    onSubmit: (data: UserFormValues) => Promise<void>;
    isLoading?: boolean;
}

export function UserForm({ initialData, onSubmit, isLoading }: UserFormProps) {
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
            nivelAcesso: 2,
            fotoUrl: "",
            horarioInicio: "08:00",
            horarioFim: "18:00",
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6 bg-white/50 backdrop-blur-sm rounded-2xl">
                <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-slate-700 font-semibold">Nome Completo</FormLabel>
                            <FormControl>
                                <Input className="rounded-xl border-slate-200 focus-visible:ring-indigo-500" placeholder="Ex: João Silva" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="usuario"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-700 font-semibold">Usuário (Login)</FormLabel>
                                <FormControl>
                                    <Input className="rounded-xl border-slate-200 focus-visible:ring-indigo-500" placeholder="joao.silva" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="nivelAcesso"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-700 font-semibold">Nível de Acesso</FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(parseInt(val))}
                                    defaultValue={field.value.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger className="rounded-xl border-slate-200 focus-visible:ring-indigo-500">
                                            <SelectValue placeholder="Selecione o nível" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="1">Gestor (Nível 1 - Acesso Total)</SelectItem>
                                        <SelectItem value="2">Vendedor+ (Nível 2 - Criar/Editar)</SelectItem>
                                        <SelectItem value="3">Vendedor (Nível 3 - Apenas Visualizar)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="senha"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-slate-700 font-semibold">{initialData ? "Nova Senha (deixe em branco para manter)" : "Senha"}</FormLabel>
                            <FormControl>
                                <Input className="rounded-xl border-slate-200 focus-visible:ring-indigo-500" type="password" placeholder="******" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="contato"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-700 font-semibold">Contato / Telefone</FormLabel>
                                <FormControl>
                                    <Input className="rounded-xl border-slate-200 focus-visible:ring-indigo-500" placeholder="(00) 00000-0000" {...field} value={field.value || ""} />
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
                                <FormLabel className="text-slate-700 font-semibold">Endereço</FormLabel>
                                <FormControl>
                                    <Input className="rounded-xl border-slate-200 focus-visible:ring-indigo-500" placeholder="Rua, Número, Bairro" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="horarioInicio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-700 font-semibold">Início do Expediente</FormLabel>
                                <FormControl>
                                    <Input className="rounded-xl border-slate-200 focus-visible:ring-indigo-500" type="time" {...field} value={field.value || ""} />
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
                                <FormLabel className="text-slate-700 font-semibold">Fim do Expediente</FormLabel>
                                <FormControl>
                                    <Input className="rounded-xl border-slate-200 focus-visible:ring-indigo-500" type="time" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all text-white font-medium">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Atualizar Usuário" : "Criar Usuário"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
