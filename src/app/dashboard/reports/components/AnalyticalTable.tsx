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
import { Download, Printer, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

interface Column {
    header: string;
    accessorKey: string;
    format?: (value: any) => React.ReactNode;
}

interface AnalyticalTableProps {
    columns: Column[];
    data: any[];
    title: string;
}

export function AnalyticalTable({ columns, data, title }: AnalyticalTableProps) {
    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        const headers = columns.map(c => c.header).join(',');
        const rows = data.map(item =>
            columns.map(c => {
                const val = item[c.accessorKey];
                return typeof val === 'string' ? `"${val}"` : val;
            }).join(',')
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center print:hidden">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                    Resultados Analíticos ({data.length})
                </h3>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2 rounded-lg border-slate-200 text-slate-600 font-bold"
                        onClick={handleExportCSV}
                    >
                        <Download className="w-3.5 h-3.5" />
                        CSV
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2 rounded-lg border-slate-200 text-slate-600 font-bold"
                        onClick={handlePrint}
                    >
                        <Printer className="w-3.5 h-3.5" />
                        Imprimir
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm shadow-slate-200/50 print:border-none print:shadow-none">
                <Table>
                    <TableHeader className="bg-slate-50/50 print:bg-slate-50">
                        <TableRow className="hover:bg-transparent">
                            {columns.map((col, idx) => (
                                <TableHead key={idx} className="text-[10px] font-black text-slate-500 uppercase tracking-wider py-4">
                                    {col.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row, rowIdx) => (
                            <TableRow key={rowIdx} className="hover:bg-slate-50/50 transition-colors">
                                {columns.map((col, colIdx) => (
                                    <TableCell key={colIdx} className="py-3 text-sm font-medium text-slate-700">
                                        {col.format ? col.format(row[col.accessorKey]) : row[col.accessorKey]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                        {data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-slate-400 font-medium italic">
                                    Nenhum dado encontrado para o filtro selecionado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-between items-center py-2 px-2 print:hidden">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
                    * Todos os valores estão em Reais (BRL)
                </p>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" disabled><ChevronLeft className="w-4 h-4" /></Button>
                    <div className="h-6 w-6 rounded flex items-center justify-center bg-indigo-50 text-[10px] font-black text-indigo-700">1</div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" disabled><ChevronRight className="w-4 h-4" /></Button>
                </div>
            </div>
        </div>
    );
}
