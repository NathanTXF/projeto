"use client";

import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
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
import { Loader2, Building2, Upload } from "lucide-react";
import { CompanySchema } from "../../domain/entities";

type FormValues = z.infer<typeof CompanySchema>;

interface CompanyFormProps {
    initialData?: FormValues;
    onSubmit: (values: FormValues) => Promise<void>;
    isLoading?: boolean;
}

export function CompanyForm({ initialData, onSubmit, isLoading }: CompanyFormProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(CompanySchema),
        defaultValues: initialData || {
            nome: "",
            cnpj: "",
            contato: "",
            endereco: "",
            logoUrl: "",
        },
    });

    const logoUrl = useWatch({ control: form.control, name: "logoUrl" });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-border">
                <div className="flex flex-col items-center gap-4 py-8 border-2 border-dashed border-border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="h-24 w-24 rounded-xl bg-card border border-border flex items-center justify-center overflow-hidden shadow-sm">
                        {logoUrl ? (
                            <Image src={logoUrl} alt="Logo Preview" width={96} height={96} className="h-full w-full object-contain p-2" />
                        ) : (
                            <Building2 className="h-10 w-10 text-muted-foreground/30" />
                        )}
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <Button type="button" variant="outline" size="sm" className="gap-2 text-xs rounded-lg shadow-sm">
                            <Upload className="h-3 w-3" />
                            Alterar Logo (URL)
                        </Button>
                        <p className="text-[10px] text-muted-foreground font-medium">Dimensões ideais: 200x200px (PNG/JPG)</p>
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-foreground font-medium text-sm tracking-tight">URL da Logomarca</FormLabel>
                            <FormControl>
                                <Input placeholder="https://exemplo.com/logo.png" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-foreground font-medium text-sm tracking-tight">Nome da Empresa</FormLabel>
                            <FormControl>
                                <Input placeholder="Dinheiro Fácil Ltda" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="cnpj"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-foreground font-medium text-sm tracking-tight">CNPJ</FormLabel>
                                <FormControl>
                                    <Input placeholder="00.000.000/0000-00" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="contato"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-foreground font-medium text-sm tracking-tight">Contato / Telefone</FormLabel>
                                <FormControl>
                                    <Input placeholder="(00) 00000-0000" {...field} />
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
                            <FormLabel className="text-foreground font-medium text-sm tracking-tight">Endereço Completo</FormLabel>
                            <FormControl>
                                <Input placeholder="Rua Exemplo, 123 - Centro" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground rounded-lg shadow-sm transition-all font-semibold py-6 px-10 gap-2">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Alterações
                    </Button>
                </div>
            </form>
        </Form >
    );
}
