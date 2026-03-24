"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Loader2, Database, AlertCircle, Search, ArrowDownUp, ChevronLeft, ChevronRight } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { SystemIntegrityAlert } from "@/components/shared/SystemIntegrityAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/Badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    const pageSizeStorageKey = `auxiliary-page-size:${apiUrl}`;
    const pageStorageKey = `auxiliary-current-page:${apiUrl}`;
    const [items, setItems] = useState<AuxiliaryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<AuxiliaryItem | null>(null);
    const [nome, setNome] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [query, setQuery] = useState("");
    const [sortMode, setSortMode] = useState<"newest" | "alphabetic">("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [highlightedItemId, setHighlightedItemId] = useState<number | null>(null);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [pageSize, setPageSize] = useState(12);
    const [goToPageInput, setGoToPageInput] = useState("1");

    // Modern modal states
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isIntegrityAlertOpen, setIsIntegrityAlertOpen] = useState(false);
    const [itemIdToDelete, setItemIdToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [integrityErrorMessage, setIntegrityErrorMessage] = useState("");

    const fetchItems = useCallback(async (params?: { page?: number; q?: string; sort?: "newest" | "alphabetic"; pageSize?: number }) => {
        try {
            setLoading(true);
            const url = new URL(apiUrl, window.location.origin);
            url.searchParams.set("paginated", "1");
            url.searchParams.set("page", String(params?.page ?? currentPage));
            url.searchParams.set("pageSize", String(params?.pageSize ?? pageSize));
            url.searchParams.set("sort", params?.sort ?? sortMode);

            const q = (params?.q ?? debouncedQuery).trim();
            if (q) {
                url.searchParams.set("q", q);
            }

            const response = await fetch(url.toString());
            if (response.ok) {
                const data = await response.json();
                setItems(data.items ?? []);
                setTotalItems(data.total ?? 0);
                setTotalPages(data.totalPages ?? 1);
                setCurrentPage(data.page ?? 1);
            }
        } catch {
            toast.error(`Erro ao carregar ${title.toLowerCase()}`);
        } finally {
            setLoading(false);
        }
    }, [apiUrl, currentPage, pageSize, sortMode, debouncedQuery, title]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedQuery(query);
        }, 250);

        return () => window.clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        const savedPageSize = window.localStorage.getItem(pageSizeStorageKey);
        if (!savedPageSize) return;

        const parsedPageSize = Number(savedPageSize);
        if ([12, 25, 50, 100].includes(parsedPageSize)) {
            setPageSize(parsedPageSize);
        }
    }, [pageSizeStorageKey]);

    useEffect(() => {
        const savedPage = window.localStorage.getItem(pageStorageKey);
        if (!savedPage) return;

        const parsedPage = Number(savedPage);
        if (Number.isInteger(parsedPage) && parsedPage > 0) {
            setCurrentPage(parsedPage);
            setGoToPageInput(String(parsedPage));
        }
    }, [pageStorageKey]);

    useEffect(() => {
        window.localStorage.setItem(pageSizeStorageKey, String(pageSize));
    }, [pageSizeStorageKey, pageSize]);

    useEffect(() => {
        window.localStorage.setItem(pageStorageKey, String(currentPage));
    }, [pageStorageKey, currentPage]);

    useEffect(() => {
        setGoToPageInput(String(currentPage));
    }, [currentPage]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

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
                const savedItem = await response.json();
                toast.success(`${title} salvo com sucesso!`);
                setIsDialogOpen(false);
                if (!selectedItem) {
                    setSortMode("newest");
                    setQuery("");
                    setCurrentPage(1);
                    setHighlightedItemId(savedItem.id);
                    await fetchItems({ page: 1, q: "", sort: "newest" });
                } else {
                    await fetchItems();
                }
            } else {
                throw new Error("Erro ao salvar");
            }
        } catch {
            toast.error(`Erro ao salvar ${title.toLowerCase()}`);
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (!highlightedItemId) return;
        const timer = window.setTimeout(() => setHighlightedItemId(null), 4000);
        return () => window.clearTimeout(timer);
    }, [highlightedItemId]);

    const handleDelete = (id: number) => {
        setItemIdToDelete(id);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (itemIdToDelete === null) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`${apiUrl}/${itemIdToDelete}`, { method: "DELETE" });
            if (response.ok) {
                toast.success("Excluído com sucesso");
                setIsDeleteConfirmOpen(false);
                setItemIdToDelete(null);
                fetchItems();
            } else {
                let errorMessage = `Este ${title.toLowerCase().slice(0, -1)} não pode ser excluído pois está sendo utilizado no sistema.`;
                try {
                    const errorData = await response.json();
                    if (errorData.error) errorMessage = errorData.error;
                } catch { }

                if (response.status === 400) {
                    setIntegrityErrorMessage(errorMessage);
                    setIsIntegrityAlertOpen(true);
                    setIsDeleteConfirmOpen(false);
                } else {
                    toast.error(errorMessage);
                }
            }
        } catch {
            toast.error("Erro na requisição ao excluir.");
        } finally {
            setIsDeleting(false);
        }
    };

    const hasRows = items.length > 0;

    const handleGoToPage = () => {
        const parsedPage = Number(goToPageInput);
        if (!Number.isFinite(parsedPage)) {
            setGoToPageInput(String(currentPage));
            return;
        }

        const targetPage = Math.min(Math.max(1, Math.trunc(parsedPage)), totalPages);
        setCurrentPage(targetPage);
    };

    const maxPageButtons = 5;
    const initialStart = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    const endPage = Math.min(totalPages, initialStart + maxPageButtons - 1);
    const startPage = Math.max(1, endPage - maxPageButtons + 1);
    const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);

    return (
        <div className="flex flex-col h-full space-y-4 p-5">
            <div className="flex justify-between items-start gap-4">
                <div className="flex gap-4 items-center">
                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Database className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xs sm:text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">{title}</h3>
                        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mt-0.5 line-clamp-1">{description}</p>
                    </div>
                </div>
                <Button
                    onClick={() => {
                        setSelectedItem(null);
                        setNome("");
                        setIsDialogOpen(true);
                    }}
                    size="sm"
                    className="ui-lift ui-focus-ring ui-press rounded-lg shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1 px-2 sm:px-3 h-8 sm:h-9"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Novo</span>
                </Button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => {
                            setCurrentPage(1);
                            window.localStorage.setItem(pageStorageKey, "1");
                            setQuery(e.target.value);
                        }}
                        placeholder="Buscar por código ou descrição"
                        className="pl-9 h-9 ui-focus-ring"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={sortMode === "newest" ? "default" : "outline"}
                        size="sm"
                        className="h-9 gap-1.5"
                        onClick={() => {
                            setCurrentPage(1);
                            window.localStorage.setItem(pageStorageKey, "1");
                            setSortMode("newest");
                        }}
                    >
                        <ArrowDownUp className="h-3.5 w-3.5" />
                        Mais novos
                    </Button>
                    <Button
                        variant={sortMode === "alphabetic" ? "default" : "outline"}
                        size="sm"
                        className="h-9"
                        onClick={() => {
                            setCurrentPage(1);
                            window.localStorage.setItem(pageStorageKey, "1");
                            setSortMode("alphabetic");
                        }}
                    >
                        A-Z
                    </Button>
                    <Badge className="h-9 px-3 rounded-md bg-muted text-muted-foreground border border-border/70 text-[11px] font-medium whitespace-nowrap">
                        {items.length} de {totalItems}
                    </Badge>
                </div>
            </div>

            <div className="rounded-lg border border-border/70 bg-card shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/40 [&_th]:text-foreground border-b border-border/70">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[88px] h-11 text-[11px] font-medium uppercase tracking-[0.12em]">Cód.</TableHead>
                                <TableHead className="h-11 text-[11px] font-medium uppercase tracking-[0.12em]">Descrição</TableHead>
                                <TableHead className="h-11 text-right text-[11px] font-medium uppercase tracking-[0.12em]">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-40">
                                        <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            <span className="font-medium">Carregando {title.toLowerCase()}...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : !hasRows ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-40 border-b-0">
                                        <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                            <div className="h-12 w-12 rounded-full bg-muted/30 border border-border/70 flex items-center justify-center">
                                                <AlertCircle className="h-6 w-6 text-muted-foreground/60" />
                                            </div>
                                            <span className="font-medium">
                                                {debouncedQuery.trim() ? "Nenhum resultado para sua busca." : "Nenhum registro encontrado."}
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        className={`hover:bg-muted/30 transition-colors border-border/60 group ${highlightedItemId === item.id ? "bg-emerald-50/80 ring-1 ring-emerald-200" : ""}`}
                                    >
                                        <TableCell className="font-medium text-muted-foreground">
                                            <span className="inline-flex h-6 min-w-10 items-center justify-center rounded-md border border-border/70 bg-muted/30 px-2 text-[11px]">
                                                #{item.id.toString().padStart(3, '0')}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-medium text-foreground">
                                            {item.nome}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="ui-focus-ring ui-press h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
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
                                                    className="ui-focus-ring ui-press h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50"
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

                {!loading && totalItems > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 bg-muted/20 px-3 py-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground font-medium">Itens por página</span>
                            <Select
                                value={String(pageSize)}
                                onValueChange={(value) => {
                                    setCurrentPage(1);
                                    window.localStorage.setItem(pageStorageKey, "1");
                                    setPageSize(Number(value));
                                }}
                            >
                                <SelectTrigger className="h-8 w-[78px] text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="12">12</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                title="Página anterior"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            {visiblePages.map((page) => (
                                <Button
                                    key={`${title}-page-${page}`}
                                    variant={page === currentPage ? "default" : "outline"}
                                    size="sm"
                                    className="h-8 min-w-8 px-2 text-xs"
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </Button>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                title="Próxima página"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <span className="ml-1 text-[11px] text-muted-foreground font-medium whitespace-nowrap">
                                {currentPage} / {totalPages}
                            </span>
                            <div className="ml-2 flex items-center gap-1">
                                <Input
                                    type="number"
                                    min={1}
                                    max={totalPages}
                                    value={goToPageInput}
                                    onChange={(event) => setGoToPageInput(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                            handleGoToPage();
                                        }
                                    }}
                                    className="h-8 w-16 text-xs"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-2 text-xs"
                                    onClick={handleGoToPage}
                                >
                                    Ir
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl rounded-xl">
                    {/* Header */}
                    <div className="relative overflow-hidden bg-primary px-6 py-5">
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-xl" />
                            <div className="absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-white/5 blur-lg" />
                        </div>
                        <div className="relative flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
                                {selectedItem ? (
                                    <Edit className="h-5 w-5 text-white" />
                                ) : (
                                    <Plus className="h-5 w-5 text-white" />
                                )}
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-semibold text-primary-foreground">
                                    {selectedItem ? "Editar" : "Novo"} {title.endsWith('s') ? title.slice(0, -1) : title}
                                </DialogTitle>
                                <DialogDescription className="text-primary-foreground/80 text-sm mt-0.5">
                                    {selectedItem ? "Altere a descrição do registro." : "Adicione um novo registro ao sistema."}
                                </DialogDescription>
                            </div>
                        </div>
                    </div>

                    {/* Form Body */}
                    <div className="px-6 py-5">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Descrição</label>
                                <div className="relative">
                                    <Database className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                        placeholder={`Ex: ${title === 'Órgãos' ? 'INSS' : title === 'Bancos' ? 'Banco do Brasil' : 'Digite o nome...'}`}
                                        className="pl-10 h-10 ui-focus-ring"
                                        autoFocus
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-6 gap-2 sm:gap-0 mt-4 border-t border-slate-100/60">
                            <Button
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                className="rounded-lg font-semibold h-10"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={submitting || !nome.trim()}
                                className="ui-lift ui-focus-ring ui-press rounded-lg bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground shadow-sm border-none font-semibold h-10 px-6 gap-2"
                            >
                                {submitting ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" />Salvando...</>
                                ) : (
                                    "Salvar Registro"
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            <DeleteConfirmDialog
                open={isDeleteConfirmOpen}
                onOpenChange={setIsDeleteConfirmOpen}
                onConfirm={confirmDelete}
                isDeleting={isDeleting}
                itemName={title.endsWith('s') ? title.slice(0, -1) : title}
            />

            <SystemIntegrityAlert
                open={isIntegrityAlertOpen}
                onOpenChange={setIsIntegrityAlertOpen}
                message={integrityErrorMessage}
            />
        </div>
    );
}
