"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoanSchema, Loan, LoanStatus } from "../../domain/entities";
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
import { useEffect, useState } from "react";
import { Customer } from "@/modules/clients/domain/entities";
import { AuxiliaryEntity } from "@/modules/auxiliary/domain/entities";

interface LoanFormProps {
    initialData?: Loan;
}

export function LoanForm({ initialData }: LoanFormProps) {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [banks, setBanks] = useState<AuxiliaryEntity[]>([]);
    const [organs, setOrgans] = useState<AuxiliaryEntity[]>([]);
    const [types, setTypes] = useState<AuxiliaryEntity[]>([]);
    const [groups, setGroups] = useState<AuxiliaryEntity[]>([]);
    const [tables, setTables] = useState<AuxiliaryEntity[]>([]);

    const form = useForm<z.infer<typeof LoanSchema>>({
        resolver: zodResolver(LoanSchema),
        defaultValues: initialData || {
            dataInicio: new Date(),
            status: "ATIVO" as LoanStatus,
            prazo: 84,
            valorParcela: 0,
            valorBruto: 0,
            valorLiquido: 0,
            clienteId: "",
            vendedorId: "",
            orgaoId: 1, // Defaulting to 1 as it's an Int
            bancoId: 1,
            tipoId: 1,
            grupoId: 1,
            tabelaId: 1,
            observacao: "",
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [c, b, o, ty, g, ta] = await Promise.all([
                    fetch("/api/clients").then((r) => r.json()),
                    fetch("/api/auxiliary/banks").then((r) => r.json()),
                    fetch("/api/auxiliary/organs").then((r) => r.json()),
                    fetch("/api/auxiliary/loan-types").then((r) => r.json()),
                    fetch("/api/auxiliary/loan-groups").then((r) => r.json()),
                    fetch("/api/auxiliary/loan-tables").then((r) => r.json()),
                ]);
                setCustomers(c);
                setBanks(b);
                setOrgans(o);
                setTypes(ty);
                setGroups(g);
                setTables(ta);
            } catch (error) {
                toast.error("Erro ao carregar dados auxiliares");
            }
        };
        fetchData();
    }, []);

    const onSubmit = async (data: Loan) => {
        try {
            const response = await fetch(
                initialData ? `/api/loans/${initialData.id}` : "/api/loans",
                {
                    method: initialData ? "PATCH" : "POST",
                    body: JSON.stringify(data),
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (!response.ok) throw new Error("Falha ao salvar empréstimo");

            toast.success(initialData ? "Empréstimo atualizado" : "Venda registrada com sucesso!");
            router.push("/dashboard/loans");
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
                        name="clienteId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cliente</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o cliente" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {customers.map((c) => (
                                            <SelectItem key={c.id} value={c.id!}>
                                                {c.nome} ({c.cpfCnpj})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="bancoId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Banco</FormLabel>
                                <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o banco" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {banks.map((b) => (
                                            <SelectItem key={b.id} value={b.id.toString()}>{b.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="valorBruto"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Valor Bruto (R$)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="valorLiquido"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Valor Líquido (R$)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="valorParcela"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Valor Parcela (R$)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="prazo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Prazo (Parcelas)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="ATIVO">Ativo</SelectItem>
                                        <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                                        <SelectItem value="CANCELADO">Cancelado</SelectItem>
                                        <SelectItem value="ATRASADO">Atrasado</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full">
                    {initialData ? "Atualizar Registro" : "Registrar Empréstimo"}
                </Button>
            </form>
        </Form>
    );
}
