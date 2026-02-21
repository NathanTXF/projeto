"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CustomerFormProps {
    initialData?: Customer;
}

export function CustomerForm({ initialData }: CustomerFormProps) {
    const router = useRouter();
    const form = useForm<Customer>({
        resolver: zodResolver(CustomerSchema),
        defaultValues: initialData || {
            nome: "",
            cpfCnpj: "",
            email: "",
            celular: "",
            endereco: "",
            cidade: "",
            bairro: "",
            estado: "",
            sexo: "masculino",
            matricula: "",
            observacao: "",
        },
    });

    const onSubmit = async (data: Customer) => {
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
                throw new Error("Falha ao salvar cliente");
            }

            toast.success(
                initialData ? "Cliente atualizado" : "Cliente cadastrado com sucesso"
            );
            router.push("/dashboard/clients");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome Completo</FormLabel>
                                <FormControl>
                                    <Input placeholder="João da Silva" {...field} />
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
                                <FormLabel>CPF/CNPJ</FormLabel>
                                <FormControl>
                                    <Input placeholder="000.000.000-00" {...field} />
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
                                <FormLabel>E-mail</FormLabel>
                                <FormControl>
                                    <Input placeholder="joao@exemplo.com" {...field} />
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
                                <FormLabel>Celular</FormLabel>
                                <FormControl>
                                    <Input placeholder="(00) 00000-0000" {...field} />
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
                                <FormLabel>Sexo</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
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
                                <FormLabel>Matrícula</FormLabel>
                                <FormControl>
                                    <Input placeholder="123456" {...field} />
                                </FormControl>
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
                                <FormLabel>Cidade</FormLabel>
                                <FormControl>
                                    <Input {...field} />
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
                                <FormLabel>Bairro</FormLabel>
                                <FormControl>
                                    <Input {...field} />
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
                                <FormLabel>UF</FormLabel>
                                <FormControl>
                                    <Input placeholder="SP" maxLength={2} {...field} />
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
                            <FormLabel>Endereço Completo</FormLabel>
                            <FormControl>
                                <Input placeholder="Rua exemplo, 123" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full">
                    {initialData ? "Salvar Alterações" : "Cadastrar Cliente"}
                </Button>
            </form>
        </Form>
    );
}
