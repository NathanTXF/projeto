"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Loader2, Database, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface AuxiliaryItem {
    id: number;
    nome: string;
}

interface AuxiliarySectionProps {
    title: string;
    description: string;
    apiUrl: string;
}

export function AuxiliarySection({ title, description, apiUrl }: AuxiliarySectionProps) {
    const [items, setItems] = useState<AuxiliaryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<AuxiliaryItem | null>(null);
    const [nome, setNome] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await fetch(apiUrl);
            if (response.ok) {
                const data = await response.json();
                setItems(data);
            }
        } catch (error) {
            toast.error(`Erro ao carregar ${title.toLowerCase()}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [apiUrl]);

    const handleSave = async () => {
        if (!nome.trim()) return;
        setSubmitting(true);
        try {
            const response = await fetch(
                selectedItem ? `${apiUrl}/${selectedItem.id}` : apiUrl,
                {
                    method: selectedItem ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nome }),
                }
            );

            if (response.ok) {
                toast.success(`${title} salvo com sucesso!`);
                setIsDialogOpen(false);
                fetchItems();
            } else {
                throw new Error("Erro ao salvar");
            }
        } catch (error) {
            toast.error(`Erro ao salvar ${title.toLowerCase()}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.")) return;
        try {
            const response = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
            if (response.ok) {
                toast.success("Excluído com sucesso");
                fetchItems();
            } else {
                throw new Error("Erro ao excluir. O registro pode estar em uso.");
            }
        } catch (error) {
            toast.error("Erro ao excluir. Verifique se o registro está sendo utilizado em outro lugar.");
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                        <Database className="h-5 w-5 text-emerald-600" />
                        {title}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">{description}</p>
                </div>
                <Button
                    onClick={() => {
                        setSelectedItem(null);
                        setNome("");
                        setIsDialogOpen(true);
                    }}
                    className="rounded-xl shadow-md transition-all hover:shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500 border-none text-white font-semibold gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus className="h-4 w-4" />
                    Novo {title.endsWith('s') ? title.slice(0, -1) : title}
                </Button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/80 border-b border-slate-100">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[80px] font-semibold text-slate-700 h-11">Cód.</TableHead>
                            <TableHead className="font-semibold text-slate-700 h-11">Descrição</TableHead>
                            <TableHead className="text-right font-semibold text-slate-700 h-11">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-40">
                                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                                        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                                        <span className="font-medium">Carregando {title.toLowerCase()}...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-40 border-b-0">
                                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                                        <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                                            <AlertCircle className="h-6 w-6 text-slate-300" />
                                        </div>
                                        <span className="font-medium">Nenhum registro encontrado.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors border-slate-100 group">
                                    <TableCell className="font-medium text-slate-500">
                                        #{item.id.toString().padStart(3, '0')}
                                    </TableCell>
                                    <TableCell className="font-semibold text-slate-700">
                                        {item.nome}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setNome(item.nome);
                                                    setIsDialogOpen(true);
                                                }}
                                                title="Editar"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(item.id)}
                                                title="Excluir"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                    <div className="bg-gradient-to-br from-white to-slate-50/50 p-6">
                        <DialogHeader className="mb-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shadow-inner">
                                    {selectedItem ? (
                                        <Edit className="h-6 w-6 text-emerald-600" />
                                    ) : (
                                        <Plus className="h-6 w-6 text-emerald-600" />
                                    )}
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-bold text-slate-800">
                                        {selectedItem ? "Editar" : "Novo"} {title.endsWith('s') ? title.slice(0, -1) : title}
                                    </DialogTitle>
                                    <DialogDescription className="text-slate-500 font-medium mt-1">
                                        {selectedItem ? "Altere a descrição do registro." : "Adicione um novo registro ao sistema."}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Descrição</label>
                                <Input
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder={`Ex: ${title === 'Órgãos' ? 'INSS' : title === 'Bancos' ? 'Banco do Brasil' : 'Digite o nome...'}`}
                                    className="rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-colors h-11"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-6 gap-2 sm:gap-0 mt-4 border-t border-slate-100/60">
                            <Button
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-semibold h-11"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={submitting || !nome.trim()}
                                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-200/50 transition-all hover:scale-[1.02] border-none font-semibold h-11 px-6 active:scale-[0.98]"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    "Salvar Registro"
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
