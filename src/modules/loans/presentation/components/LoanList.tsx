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
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

// Interface para o empréstimo com relações incluídas para exibição
interface LoanWithRelations extends Loan {
    cliente?: { nome: string };
    banco?: { nome: string };
}

interface LoanListProps {
    loans: LoanWithRelations[];
    onEdit: (loan: Loan) => void;
    onDelete: (id: string) => void;
}

const statusColors: Record<string, string> = {
    ATIVO: "bg-blue-100 text-blue-800",
    FINALIZADO: "bg-emerald-100 text-emerald-800",
    CANCELADO: "bg-gray-100 text-gray-800",
    ATRASADO: "bg-red-100 text-red-800",
};

export function LoanList({ loans, onEdit, onDelete }: LoanListProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Cód</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Banco</TableHead>
                        <TableHead>V. Líquido</TableHead>
                        <TableHead>Parcelas</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loans.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                Nenhum empréstimo registrado.
                            </TableCell>
                        </TableRow>
                    ) : (
                        loans.map((loan) => (
                            <TableRow key={loan.id}>
                                <TableCell className="font-medium">#{loan.cod}</TableCell>
                                <TableCell>{loan.cliente?.nome || 'N/A'}</TableCell>
                                <TableCell>{loan.banco?.nome || 'N/A'}</TableCell>
                                <TableCell>
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(loan.valorLiquido))}
                                </TableCell>
                                <TableCell>{loan.prazo}x</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={statusColors[loan.status || 'ATIVO']}>
                                        {loan.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => onEdit(loan)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => loan.id && onDelete(loan.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
