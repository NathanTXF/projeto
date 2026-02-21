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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: João Silva" {...field} />
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
                                <FormLabel>Usuário (Login)</FormLabel>
                                <FormControl>
                                    <Input placeholder="joao.silva" {...field} />
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
                                <FormLabel>Nível de Acesso</FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(parseInt(val))}
                                    defaultValue={field.value.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
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
                            <FormLabel>{initialData ? "Nova Senha (deixe em branco para manter)" : "Senha"}</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="******" {...field} />
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
                                <FormLabel>Contato / Telefone</FormLabel>
                                <FormControl>
                                    <Input placeholder="(00) 00000-0000" {...field} value={field.value || ""} />
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
                                <FormLabel>Endereço</FormLabel>
                                <FormControl>
                                    <Input placeholder="Rua, Número, Bairro" {...field} value={field.value || ""} />
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
                                <FormLabel>Início do Expediente</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} value={field.value || ""} />
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
                                <FormLabel>Fim do Expediente</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Atualizar Usuário" : "Criar Usuário"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
