"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loan } from "../../domain/entities";
import { Edit, Trash2, Calendar, User, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

// Interface para o empréstimo com relações incluídas para exibição
interface LoanWithRelations extends Loan {
    cliente?: { nome: string };
    banco?: { nome: string };
    vendedor?: { nome: string };
    orgao?: { nome: string };
    tipo?: { nome: string };
}

interface LoanListProps {
    loans: LoanWithRelations[];
    userLevel?: number;
    onEdit: (loan: Loan) => void;
    onDelete: (id: string) => void;
}

const statusColors: Record<string, string> = {
    ATIVO: "bg-blue-100 text-blue-700 border-blue-200",
    FINALIZADO: "bg-emerald-100 text-emerald-700 border-emerald-200",
    CANCELADO: "bg-slate-100 text-slate-700 border-slate-200",
    ATRASADO: "bg-rose-100 text-rose-700 border-rose-200",
};

export function LoanList({ loans, userLevel, onEdit, onDelete }: LoanListProps) {
    return (
        <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-slate-50/50">
                    <TableRow>
                        <TableHead className="w-[80px] font-bold">Cód</TableHead>
                        <TableHead className="font-bold">Cliente</TableHead>
                        <TableHead className="font-bold">Vendedor / Órgão</TableHead>
                        <TableHead className="font-bold">Banco / Tipo</TableHead>
                        <TableHead className="font-bold">Valores</TableHead>
                        <TableHead className="font-bold">Status</TableHead>
                        <TableHead className="text-right font-bold">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loans.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center h-32 text-muted-foreground italic">
                                Nenhum empréstimo registrado.
                            </TableCell>
                        </TableRow>
                    ) : (
                        loans.map((loan) => (
                            <TableRow key={loan.id} className="hover:bg-slate-50/30 transition-colors">
                                <TableCell className="font-bold text-slate-400 font-outfit">
                                    #{loan.cod?.toString().padStart(4, '0')}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-slate-900">{loan.cliente?.nome || 'N/A'}</span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Intl.DateTimeFormat('pt-BR').format(new Date(loan.dataInicio))}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                                            <User className="h-3 w-3 text-indigo-500" />
                                            {loan.vendedor?.nome || 'N/A'}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <Building2 className="h-3 w-3 text-slate-400" />
                                            {loan.orgao?.nome || 'N/A'}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{loan.banco?.nome || 'N/A'}</span>
                                        <span className="text-[10px] font-medium text-slate-400">{loan.tipo?.nome || 'N/A'}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-emerald-600 font-outfit">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(loan.valorLiquido))}
                                        </span>
                                        <span className="text-[10px] font-medium text-slate-400">
                                            {loan.prazo}x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(loan.valorParcela))}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`${statusColors[loan.status || 'ATIVO']} font-bold text-[10px] border-none px-2 py-0.5`}>
                                        {loan.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {userLevel !== 3 && (
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => onEdit(loan)} className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-rose-50" onClick={() => loan.id && onDelete(loan.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
