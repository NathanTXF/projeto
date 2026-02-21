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
import { Loader2 } from "lucide-react";
import { AppointmentSchema } from "../../domain/entities";

const formSchema = z.object({
    data: z.string().min(1, "Data é obrigatória"),
    hora: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, "Formato inválido (HH:mm)"),
    tipo: z.string().min(1, "Tipo é obrigatório"),
    observacao: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AppointmentFormProps {
    initialDate?: Date;
    onSubmit: (values: FormValues) => Promise<void>;
    isLoading?: boolean;
}

export function AppointmentForm({ initialDate, onSubmit, isLoading }: AppointmentFormProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            data: initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            hora: "09:00",
            tipo: "",
            observacao: "",
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="data"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Data</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
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
                                <FormLabel>Hora</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo de Compromisso</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Reunião, Cobrança, Visita..." {...field} />
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
                            <FormLabel>Observação (Opcional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Detalhes adicionais do compromisso..."
                                    className="min-h-[100px]"
                                    {...field}
                                    value={field.value || ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Agendar Compromisso
                    </Button>
                </div>
            </form>
        </Form>
    );
}
