"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar as CalendarIcon, Clock, MoreVertical, Trash2, Search, MapPin, CheckCircle2, Circle, Filter } from "lucide-react";
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
import { AppointmentForm } from "@/modules/agenda/presentation/components/AppointmentForm";
import { Appointment } from "@/modules/agenda/domain/entities";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

export default function AgendaPage() {
    const [month, setMonth] = useState<Date>(new Date());
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [monthlyAppointments, setMonthlyAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>("TODOS");

    // Fetch monthly appointments when the month view changes
    useEffect(() => {
        fetchMonthlyAppointments(month);
    }, [month]);

    const fetchMonthlyAppointments = async (targetMonth: Date) => {
        try {
            setLoading(true);
            const m = targetMonth.getMonth() + 1; // getMonth() returns 0-11
            const y = targetMonth.getFullYear();
            const response = await fetch(`/api/agenda?month=${m}&year=${y}`);
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setMonthlyAppointments(data);
        } catch (error: any) {
            toast.error("Erro ao carregar agenda mensal: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Derive daily appointments from the monthly pool
    const appointments = monthlyAppointments.filter(apt => {
        if (!date) return false;
        const aptDate = new Date(apt.data);
        // Compensate timezone if needed, or simply string compare
        return aptDate.toISOString().split('T')[0] === date.toISOString().split('T')[0];
    });

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
                fetchMonthlyAppointments(month); // Refresh the month
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

    const toggleStatus = async (id: string, currentStatus: string) => {
        // OPTIMISTIC UPDATE
        const originalAppointments = [...monthlyAppointments];
        const nextStatus = currentStatus === "PENDENTE" ? "CONCLUIDO" : "PENDENTE";

        setMonthlyAppointments(prev => prev.map(apt =>
            apt.id === id ? { ...apt, status: nextStatus } : apt
        ));

        try {
            const response = await fetch(`/api/agenda/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus }),
            });

            if (!response.ok) throw new Error();

            toast.success(nextStatus === "CONCLUIDO" ? "Compromisso concluído!" : "Compromisso reaberto.");
        } catch (error) {
            setMonthlyAppointments(originalAppointments);
            toast.error("Erro ao sincronizar status.");
        }
    };

    const handleDelete = async (id: string | undefined) => {
        if (!id) return;
        if (!confirm("Remover este compromisso?")) return;

        try {
            const response = await fetch(`/api/agenda/${id}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success("Compromisso removido.");
                fetchMonthlyAppointments(month);
            }
        } catch (error: any) {
            toast.error("Erro ao remover.");
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        if (filterStatus === "TODOS") return true;
        return apt.status === filterStatus;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ── Enterprise Hero Banner ── */}
            <div className="relative overflow-hidden rounded-2xl bg-[#00355E] p-8 shadow-sm">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                    <CalendarIcon className="h-64 w-64 text-white" />
                </div>
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner border border-white/20">
                            <CalendarIcon className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-primary-foreground leading-tight">Agenda de Compromissos</h1>
                            <p className="mt-1 text-primary-foreground/80 font-medium text-sm">
                                {appointments.length > 0
                                    ? `Você tem ${appointments.length} compromissos para hoje. ${appointments.filter(a => a.status === 'CONCLUIDO').length} já feitos!`
                                    : "Sua agenda está livre para hoje. Aproveite para planejar o amanhã!"}
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        variant="secondary"
                        className="gap-2 rounded-xl font-bold shadow-sm px-6 py-3 transition-all hover:scale-105 active:scale-95 bg-white text-[#00355E] hover:bg-white/90"
                    >
                        <Plus className="h-5 w-5" />
                        Novo Compromisso
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-4 border border-slate-100 shadow-xl rounded-3xl bg-white/80 backdrop-blur-xl overflow-hidden h-fit sticky top-6">
                    <CardHeader className="bg-slate-50/30 border-b border-slate-100">
                        <CardTitle className="text-xl font-black text-slate-800">Calendário</CardTitle>
                        <CardDescription className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Visualização do Mês</CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 flex flex-col items-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => d && setDate(d)}
                            month={month}
                            onMonthChange={setMonth}
                            locale={ptBR}
                            className="bg-transparent"
                            modifiers={{
                                hasAppointment: (date) => monthlyAppointments.some(a => new Date(a.data).toDateString() === date.toDateString()),
                                visia: (date) => monthlyAppointments.some(a => new Date(a.data).toDateString() === date.toDateString() && a.tipo === 'Visita'),
                                cobranca: (date) => monthlyAppointments.some(a => new Date(a.data).toDateString() === date.toDateString() && a.tipo === 'Cobrança')
                            }}
                            modifiersClassNames={{
                                hasAppointment: "relative font-bold after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-primary/20",
                                visia: "after:bg-blue-500",
                                cobranca: "after:bg-amber-500"
                            }}
                        />


                    </CardContent>
                </Card>

                <Card className="lg:col-span-8 border border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
                    <CardHeader className="bg-white border-b border-slate-100 p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">
                                    {date ? format(date, "EEEE, d 'de' MMMM", { locale: ptBR }) : "Selecione uma data"}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                    <CardDescription className="font-bold text-slate-500">{appointments.length} compromissos encontrados.</CardDescription>
                                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                                        {Math.round((appointments.filter(a => a.status === 'CONCLUIDO').length / (appointments.length || 1)) * 100)}% concluído
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 bg-slate-50/50 p-2 pr-4 rounded-3xl border border-slate-100 shadow-inner">
                                <div className="relative h-12 w-12 flex items-center justify-center">
                                    <svg className="h-full w-full -rotate-90 transform">
                                        <circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="transparent"
                                            className="text-slate-200"
                                        />
                                        <circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="transparent"
                                            strokeDasharray={125.6}
                                            strokeDashoffset={125.6 - (125.6 * (appointments.filter(a => a.status === 'CONCLUIDO').length / (appointments.length || 1)))}
                                            strokeLinecap="round"
                                            className="text-primary transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <span className="absolute text-[10px] font-black text-slate-700">
                                        {Math.round((appointments.filter(a => a.status === 'CONCLUIDO').length / (appointments.length || 1)) * 100)}%
                                    </span>
                                </div>

                                <div className="flex items-center gap-1">
                                    {[
                                        { id: "TODOS", label: "Tudo" },
                                        { id: "PENDENTE", label: "Pendente" },
                                        { id: "CONCLUIDO", label: "Feito" }
                                    ].map((f) => (
                                        <Button
                                            key={f.id}
                                            variant={filterStatus === f.id ? "default" : "ghost"}
                                            size="sm"
                                            onClick={() => setFilterStatus(f.id)}
                                            className={cn(
                                                "rounded-2xl h-8 px-4 font-bold text-[10px] uppercase tracking-wider transition-all",
                                                filterStatus === f.id ? "bg-white text-primary shadow-sm hover:bg-white border border-slate-100" : "text-slate-500 hover:bg-slate-200/50"
                                            )}
                                        >
                                            {f.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                                <span className="font-bold text-sm">Carregando sua agenda...</span>
                            </div>
                        ) : filteredAppointments.length === 0 ? (
                            <div className="h-96 flex flex-col items-center justify-center gap-6 text-slate-400">
                                <div className="h-24 w-24 bg-gradient-to-br from-slate-50 to-white rounded-3xl flex items-center justify-center shadow-inner border border-slate-50 animate-pulse">
                                    <CalendarIcon className="h-12 w-12 opacity-10" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-black text-slate-800 text-lg">Folga Merecida!</h3>
                                    <p className="text-sm font-medium text-slate-500 mt-1 max-w-[200px] mx-auto">Tudo limpo para este dia. Que tal adiantar as tarefas de amanhã?</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-6 rounded-xl font-black text-[10px] uppercase tracking-widest border-2"
                                        onClick={() => setIsDialogOpen(true)}
                                    >
                                        Criar Agenda
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {filteredAppointments.map((apt) => (
                                    <div key={apt.id} className={cn(
                                        "p-6 hover:bg-slate-50/50 transition-all flex justify-between items-center group relative",
                                        apt.status === "CONCLUIDO" && "opacity-60"
                                    )}>
                                        <div className="flex gap-6 items-center">
                                            <button
                                                onClick={() => toggleStatus(apt.id!, apt.status!)}
                                                className={cn(
                                                    "h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-sm border",
                                                    apt.status === "CONCLUIDO"
                                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                                        : "bg-white border-slate-200 text-slate-300 hover:border-primary hover:text-primary"
                                                )}
                                            >
                                                {apt.status === "CONCLUIDO" ? (
                                                    <CheckCircle2 className="h-6 w-6" />
                                                ) : (
                                                    <Circle className="h-6 w-6" />
                                                )}
                                            </button>

                                            <div>
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{apt.hora}</span>
                                                    <Badge className={cn(
                                                        "rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest border-none transition-all",
                                                        apt.tipo === 'Visita' ? "bg-blue-100 text-blue-700 group-hover:bg-blue-200" :
                                                            apt.tipo === 'Cobrança' ? "bg-amber-100 text-amber-700 group-hover:bg-amber-200" :
                                                                "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                                                    )}>
                                                        {apt.tipo}
                                                    </Badge>
                                                    {apt.visibilidade === 'GLOBAL' && (
                                                        <Badge className="bg-sidebar/10 text-sidebar-foreground rounded-full px-2 py-0.5 text-[8px] font-black border-none animate-pulse">GLOBAL</Badge>
                                                    )}
                                                </div>
                                                <h4 className={cn(
                                                    "font-bold text-slate-700 text-base leading-tight transition-all",
                                                    apt.status === "CONCLUIDO" && "line-through text-slate-400"
                                                )}>
                                                    {apt.observacao || "Compromisso sem descrição"}
                                                </h4>
                                                {apt.localizacao && (
                                                    <div className="flex items-center gap-1.5 mt-2 text-slate-400">
                                                        <MapPin className="h-3 w-3" />
                                                        <span className="text-[11px] font-medium">{apt.localizacao}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 rounded-xl text-slate-400 hover:text-destructive hover:bg-destructive/5"
                                                onClick={() => handleDelete(apt.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-3xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl max-h-[90vh] flex flex-col">
                    {/* Solid Primary Header */}
                    <div className="relative bg-primary px-6 py-5 shrink-0">
                        <div className="relative flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 shadow-inner">
                                <CalendarIcon className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-primary-foreground leading-none">
                                    Novo Compromisso
                                </DialogTitle>
                                <DialogDescription className="text-primary-foreground/80 text-sm mt-1">
                                    Agende um novo compromisso para {date ? format(date, "dd/MM/yyyy") : "a data selecionada"}.
                                </DialogDescription>
                            </div>
                        </div>
                    </div>
                    {/* Form Body */}
                    <div className="px-6 py-4 overflow-y-auto flex-1">
                        <AppointmentForm
                            initialDate={date}
                            onSubmit={handleCreate}
                            isLoading={isSubmitting}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
