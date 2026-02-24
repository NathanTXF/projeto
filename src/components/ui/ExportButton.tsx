import { Download, FileText, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportButtonProps {
    onExportCsv: () => void;
    onExportPdf: () => void;
}

export function ExportButton({ onExportCsv, onExportPdf }: ExportButtonProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="h-10 gap-2 rounded-xl font-bold shadow-sm px-6 transition-all active:scale-95">
                    <Download className="h-4 w-4" />
                    Exportar
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 shadow-lg border-slate-100 rounded-xl p-1">
                <DropdownMenuItem
                    onClick={onExportCsv}
                    className="cursor-pointer gap-2 font-medium p-2"
                >
                    <div className="h-8 w-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                        <Table className="h-4 w-4" />
                    </div>
                    Exportar como CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={onExportPdf}
                    className="cursor-pointer gap-2 font-medium p-2"
                >
                    <div className="h-8 w-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                        <FileText className="h-4 w-4" />
                    </div>
                    Exportar como PDF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
