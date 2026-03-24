"use client";

import { useEffect, useMemo, useState } from "react";
import { AuxiliarySection } from "@/modules/auxiliary/presentation/components/AuxiliarySection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ManagementPageHeader } from "@/components/layout/ManagementPageHeader";
import { Database } from "lucide-react";

const SECTION_STORAGE_KEY = "auxiliary-active-section";

const sections = [
    {
        title: "Órgãos",
        description: "Convênios atendidos pela empresa",
        apiUrl: "/api/auxiliary/organs",
    },
    {
        title: "Bancos",
        description: "Instituições financeiras parceiras",
        apiUrl: "/api/auxiliary/banks",
    },
    {
        title: "Tipos de Empréstimo",
        description: "Categorias de produtos de crédito",
        apiUrl: "/api/auxiliary/loan-types",
    },
    {
        title: "Grupos",
        description: "Agrupamentos de tabelas",
        apiUrl: "/api/auxiliary/loan-groups",
    },
    {
        title: "Tabelas de Comissão",
        description: "Tabelas de taxas e prazos",
        apiUrl: "/api/auxiliary/loan-tables",
    },
];

export default function AuxiliaryPage() {
    const [activeApiUrl, setActiveApiUrl] = useState(() => {
        if (typeof window === "undefined") return sections[0].apiUrl;
        const stored = window.localStorage.getItem(SECTION_STORAGE_KEY);
        if (stored && sections.some((section) => section.apiUrl === stored)) {
            return stored;
        }
        return sections[0].apiUrl;
    });

    useEffect(() => {
        window.localStorage.setItem(SECTION_STORAGE_KEY, activeApiUrl);
    }, [activeApiUrl]);

    useEffect(() => {
        const isTypingTarget = (target: EventTarget | null) => {
            if (!(target instanceof HTMLElement)) return false;
            const tagName = target.tagName.toLowerCase();
            return target.isContentEditable || tagName === "input" || tagName === "textarea" || tagName === "select";
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (isTypingTarget(event.target)) return;

            const currentIndex = sections.findIndex((section) => section.apiUrl === activeApiUrl);
            if (currentIndex < 0) return;

            if ((event.ctrlKey || event.metaKey) && event.key === "ArrowRight") {
                event.preventDefault();
                const next = (currentIndex + 1) % sections.length;
                setActiveApiUrl(sections[next].apiUrl);
                return;
            }

            if ((event.ctrlKey || event.metaKey) && event.key === "ArrowLeft") {
                event.preventDefault();
                const previous = (currentIndex - 1 + sections.length) % sections.length;
                setActiveApiUrl(sections[previous].apiUrl);
                return;
            }

            if (event.altKey) {
                const mappedIndex = Number(event.key) - 1;
                if (mappedIndex >= 0 && mappedIndex < sections.length) {
                    event.preventDefault();
                    setActiveApiUrl(sections[mappedIndex].apiUrl);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [activeApiUrl]);

    const activeSection = useMemo(
        () => sections.find((section) => section.apiUrl === activeApiUrl) ?? sections[0],
        [activeApiUrl]
    );

    return (
        <div className="space-y-7 animate-in fade-in duration-500 pb-12">
            <ManagementPageHeader
                icon={Database}
                title="Cadastros Auxiliares"
                description="Gerencie as entidades auxiliares utilizadas em todo o sistema."
            />

            <div className="mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                    <Database className="h-5 w-5 text-primary" />
                    Ferramentas de Gestão
                </h2>
                <p className="text-sm text-muted-foreground font-medium">Configure as tabelas de suporte do ERP Dinheiro Fácil.</p>
            </div>

            <Card className="border border-border/70 shadow-sm">
                <CardContent className="p-4 md:p-5">
                    <div className="flex flex-wrap gap-2">
                        {sections.map((section) => {
                            const isActive = section.apiUrl === activeApiUrl;

                            return (
                                <Button
                                    key={section.apiUrl}
                                    size="sm"
                                    variant={isActive ? "default" : "outline"}
                                    className="h-9"
                                    onClick={() => setActiveApiUrl(section.apiUrl)}
                                >
                                    {section.title}
                                </Button>
                            );
                        })}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                        Atalhos: Ctrl + seta esquerda/direita para navegar entre cadastros, ou Alt + 1..5 para acesso direto.
                    </p>
                </CardContent>
            </Card>

            <div>
                <Card className="h-full border border-border/70 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="h-full p-0 flex flex-col justify-between">
                        <AuxiliarySection
                            key={activeSection.apiUrl}
                            title={activeSection.title}
                            description={activeSection.description}
                            apiUrl={activeSection.apiUrl}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
