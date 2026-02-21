"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar as CalendarIcon, Clock, MoreVertical, Trash2, Search, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { AppointmentForm } from "@/modules/agenda/presentation/components/AppointmentForm";
import { Appointment } from "@/modules/agenda/domain/entities";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AgendaPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (date) {
            fetchAppointments(date);
        }
    }, [date]);

    const fetchAppointments = async (targetDate: Date) => {
        try {
            setLoading(true);
            const dateStr = targetDate.toISOString().split('T')[0];
            const response = await fetch(`/api/agenda?date=${dateStr}`);
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setAppointments(data);
        } catch (error: any) {
            toast.error("Erro ao carregar agenda: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (values: any) => {
        try {
            setIsSubmitting(true);
            const response = await fetch('/api/agenda', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                toast.success("Compromisso agendado!");
                setIsDialogOpen(false);
                if (date) fetchAppointments(date);
            } else {
                const errorData = await response.json();
                toast.error("Erro: " + errorData.error);
            }
        } catch (error: any) {
            toast.error("Erro na requisição: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string | undefined) => {
        if (!id) return;
        // Simplesmente para o MVP, vamos deletar direto depois de confirmação
        if (!confirm("Remover este compromisso?")) return;

        try {
            const response = await fetch(`/api/agenda/${id}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success("Compromisso removido.");
                if (date) fetchAppointments(date);
            }
        } catch (error: any) {
            toast.error("Erro ao remover.");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white/50 p-6 rounded-2xl border border-slate-200 backdrop-blur-sm shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                        <CalendarIcon className="h-8 w-8 text-indigo-600" />
                        Agenda de Compromissos
                    </h1>
                    <p className="text-slate-500 mt-1">Organize suas reuniões, visitas e cobranças.</p>
                </div>
                <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="gap-2 rounded-xl shadow-md bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus className="h-4 w-4" />
                    Novo Compromisso
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-4 border-none shadow-lg rounded-2xl bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-lg font-bold">Calendário</CardTitle>
                        <CardDescription>Selecione uma data para visualizar.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border-none"
                            locale={ptBR}
                        />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-8 border-none shadow-lg rounded-2xl bg-white overflow-hidden">
                    <CardHeader className="bg-white border-b border-slate-100">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-lg font-bold">
                                    {date ? format(date, "EEEE, d 'de' MMMM", { locale: ptBR }) : "Selecione uma data"}
                                </CardTitle>
                                <CardDescription>{appointments.length} compromissos encontrados.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                                <span>Carregando agenda...</span>
                            </div>
                        ) : appointments.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400 italic">
                                <CalendarIcon className="h-12 w-12 opacity-20" />
                                <span>Nenhum compromisso para este dia.</span>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {appointments.map((apt) => (
                                    <div key={apt.id} className="p-5 hover:bg-slate-50/50 transition-colors flex justify-between items-start group">
                                        <div className="flex gap-4">
                                            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-indigo-50 text-indigo-700 min-w-[60px] h-fit">
                                                <Clock className="h-4 w-4 mb-1" />
                                                <span className="font-bold text-sm">{apt.hora}</span>
                                            </div>
                                            <div>
                                                <Badge className="mb-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none font-semibold">
                                                    {apt.tipo}
                                                </Badge>
                                                <h4 className="font-bold text-slate-800 text-lg mb-1">{apt.tipo}</h4>
                                                <p className="text-slate-500 text-sm">{apt.observacao || "Sem observações."}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-destructive transition-all"
                                            onClick={() => handleDelete(apt.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>Novo Compromisso</DialogTitle>
                        <DialogDescription>
                            Agende um novo compromisso para {date ? format(date, "dd/MM/yyyy") : "a data selecionada"}.
                        </DialogDescription>
                    </DialogHeader>
                    <AppointmentForm
                        initialDate={date}
                        onSubmit={handleCreate}
                        isLoading={isSubmitting}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
