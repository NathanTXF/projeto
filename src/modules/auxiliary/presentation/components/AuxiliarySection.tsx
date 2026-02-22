"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
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
        if (!confirm("Tem certeza que deseja excluir?")) return;
        try {
            const response = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
            if (response.ok) {
                toast.success("Excluído com sucesso");
                fetchItems();
            } else {
                throw new Error("Erro ao excluir");
            }
        } catch (error) {
            toast.error("Erro ao excluir");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <Button onClick={() => {
                    setSelectedItem(null);
                    setNome("");
                    setIsDialogOpen(true);
                }} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                    Nenhum registro encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell>{item.nome}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setNome(item.nome);
                                                    setIsDialogOpen(true);
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive"
                                                onClick={() => handleDelete(item.id)}
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedItem ? "Editar" : "Novo"} {title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 p-6 bg-white">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nome</label>
                            <Input
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Digite o nome..."
                            />
                        </div>
                    </div>
                    <DialogFooter className="p-6 bg-white pt-0">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={submitting || !nome.trim()}>
                            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
