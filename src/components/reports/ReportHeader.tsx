"use client";

import { useEffect, useState } from 'react';
import { Company } from '@/modules/company/domain/entities';
import { Building2, Globe, Mail, Phone, MapPin } from 'lucide-react';
import Image from 'next/image';

interface ReportHeaderProps {
    reportTitle: string;
    period?: string;
}

export function ReportHeader({ reportTitle, period }: ReportHeaderProps) {
    const [company, setCompany] = useState<Company | null>(null);

    useEffect(() => {
        fetch('/api/company')
            .then(res => res.json())
            .then(data => setCompany(data))
            .catch(console.error);
    }, []);

    const today = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="w-full border-b border-slate-300 pb-4 mb-4">
            <div className="flex justify-between items-end mb-4">
                {/* Company Info */}
                <div>
                    <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">
                        {company?.nome || "Empresa de Crédito"}
                    </h1>
                    <div className="text-[9px] text-slate-500 font-bold flex gap-4 uppercase tracking-wider">
                        <span>CNPJ: <span className="text-slate-700">{company?.cnpj}</span></span>
                        <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" /> <span className="text-slate-700">{company?.contato}</span></span>
                        <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> <span className="text-slate-700 truncate max-w-[200px]">{company?.endereco}</span></span>
                    </div>
                </div>

                {/* Report Metadata */}
                <div className="text-right text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                    <p>Gerado em: <span className="text-slate-700">{today}</span></p>
                    {period && <p className="mt-0.5">Período: <span className="text-indigo-600">{period}</span></p>}
                </div>
            </div>

            {/* Title Section - Focused and Compact */}
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                <div className="h-8 w-1 bg-indigo-600 rounded-full" />
                <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-none">
                        {reportTitle}
                    </h2>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
                        Relatório Analítico de Gestão • Confidencial
                    </p>
                </div>
            </div>
        </div>
    );
}
