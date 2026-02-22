"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CustomerSchema, Customer } from "../../domain/entities";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

const customerFormSchema = CustomerSchema.extend({
    senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional().or(z.literal("")),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface CustomerFormProps {
    initialData?: Partial<Customer> | null;
    onSuccess?: () => void;
}

export function CustomerForm({ initialData, onSuccess }: CustomerFormProps) {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(customerFormSchema),
        defaultValues: {
            nome: initialData?.nome || "",
            cpfCnpj: initialData?.cpfCnpj || "",
            email: initialData?.email || "",
            celular: initialData?.celular || "",
            endereco: initialData?.endereco || "",
            cidade: initialData?.cidade || "",
            bairro: initialData?.bairro || "",
            estado: initialData?.estado || "",
            dataNascimento: initialData?.dataNascimento ? new Date(initialData.dataNascimento) : new Date(),
            sexo: (initialData?.sexo as "feminino" | "masculino") || "masculino",
            matricula: initialData?.matricula || "",
            senha: "",
            observacao: initialData?.observacao || "",
        },
    });

    const onSubmit = async (data: CustomerFormValues) => {
        try {
            const response = await fetch(
                initialData ? `/api/clients/${initialData.id}` : "/api/clients",
                {
                    method: initialData ? "PATCH" : "POST",
                    body: JSON.stringify(data),
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Falha ao salvar cliente");
            }

            toast.success(
                initialData ? "Cliente atualizado" : "Cliente cadastrado com sucesso"
            );

            if (onSuccess) {
                onSuccess();
            } else {
                router.push("/dashboard/clients");
                router.refresh();
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6 bg-white/50 backdrop-blur-sm rounded-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-700 font-semibold">Nome Completo</FormLabel>
                                <FormControl>
                                    <Input placeholder="João da Silva" className="rounded-xl border-slate-200 focus-visible:ring-indigo-500" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="cpfCnpj"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-700 font-semibold">CPF/CNPJ</FormLabel>
                                <FormControl>
                                    <Input placeholder="000.000.000-00" className="rounded-xl border-slate-200 focus-visible:ring-indigo-500" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-700 font-semibold">E-mail</FormLabel>
                                <FormControl>
                                    <Input placeholder="joao@exemplo.com" type="email" className="rounded-xl border-slate-200 focus-visible:ring-indigo-500" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="celular"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-700 font-semibold">Celular</FormLabel>
                                <FormControl>
                                    <Input placeholder="(00) 00000-0000" className="rounded-xl border-slate-200 focus-visible:ring-indigo-500" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="dataNascimento"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-700 font-semibold">Data de Nascimento</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        className="rounded-xl border-slate-200 focus-visible:ring-indigo-500"
                                        {...field}
                                        value={field.value instanceof Date
                                            ? field.value.toISOString().split('T')[0]
                                            : field.value || ""}
                                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value + 'T12:00:00') : undefined)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="sexo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-700 font-semibold">Sexo</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className="rounded-xl border-slate-200 focus-visible:ring-indigo-500">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="masculino">Masculino</SelectItem>
                                        <SelectItem value="feminino">Feminino</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="matricula"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-700 font-semibold">Matrícula</FormLabel>
                                <FormControl>
                                    <Input placeholder="123456" className="rounded-xl border-slate-200 focus-visible:ring-indigo-500" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="senha"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-700 font-semibold">Senha</FormLabel>
                                <div className="relative">
                                    <FormControl>
                                        <Input
                                            placeholder="******"
                                            className="rounded-xl border-slate-200 focus-visible:ring-indigo-500"
                                            type={showPassword ? "text" : "password"}
                                            {...field}
                                        />
                                    </FormControl>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="cidade"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-700 font-semibold">Cidade</FormLabel>
                                <FormControl>
                                    <Input className="rounded-xl border-slate-200 focus-visible:ring-indigo-500" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="bairro"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-700 font-semibold">Bairro</FormLabel>
                                <FormControl>
                                    <Input className="rounded-xl border-slate-200 focus-visible:ring-indigo-500" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="estado"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-700 font-semibold">UF</FormLabel>
                                <FormControl>
                                    <Input placeholder="SP" maxLength={2} className="rounded-xl border-slate-200 focus-visible:ring-indigo-500" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="endereco"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-slate-700 font-semibold">Endereço Completo</FormLabel>
                            <FormControl>
                                <Input placeholder="Rua exemplo, 123" className="rounded-xl border-slate-200 focus-visible:ring-indigo-500" {...field} />
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
                            <FormLabel className="text-slate-700 font-semibold">Observações</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Informações adicionais sobre o cliente..."
                                    className="resize-none rounded-xl border-slate-200 focus-visible:ring-indigo-500"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all font-medium py-6">
                    {initialData ? "Salvar Alterações" : "Cadastrar Cliente"}
                </Button>
            </form>
        </Form>
    );
}
