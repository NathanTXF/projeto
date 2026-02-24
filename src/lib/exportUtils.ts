import jsPDF from 'jspdf';
import 'jspdf-autotable';
// Importação correta pro TypeScript (as any) para evitar erro de modulo caso a tipagem não bata perfeitamente
import autoTable from 'jspdf-autotable';

export interface ExportColumn<T> {
    header: string;
    accessor: (row: T) => string | number;
}

export function exportToCsv<T>(filename: string, columns: ExportColumn<T>[], data: T[]) {
    if (!data || data.length === 0) return;

    const csvRows = [];

    // 1. Headers
    const headers = columns.map(col => `"${col.header.replace(/"/g, '""')}"`).join(',');
    csvRows.push(headers);

    // 2. Data Rows
    for (const row of data) {
        const values = columns.map(col => {
            const val = col.accessor(row);
            const strVal = String(val ?? '').replace(/"/g, '""');
            return `"${strVal}"`;
        });
        csvRows.push(values.join(','));
    }

    // 3. Blob and Download
    const csvString = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel UTF-8
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export async function exportToPdf<T>(title: string, filename: string, columns: ExportColumn<T>[], data: T[]) {
    if (!data || data.length === 0) return;

    const doc = new jsPDF() as any;
    let startY = 22;

    try {
        // Busca os dados oficiais empresariais para injetar no cabeçalho
        const response = await fetch('/api/company');
        if (response.ok) {
            const company = await response.json();

            if (company.logoUrl) {
                try {
                    // Adicionando a logomarca no canto superior esquerdo
                    doc.addImage(company.logoUrl, 14, 10, 25, 25, undefined, 'FAST');

                    doc.setFontSize(12);
                    doc.setFont(undefined, 'bold');
                    doc.setTextColor(20, 30, 50); // Slate-900
                    doc.text(company.nome || "Empresa Corporativa", 45, 16);

                    doc.setFontSize(9);
                    doc.setFont(undefined, 'normal');
                    doc.setTextColor(100, 110, 120); // Slate-500

                    const infoLines = [];
                    if (company.cnpj) infoLines.push(`CNPJ: ${company.cnpj}`);
                    if (company.contato) infoLines.push(`Contato: ${company.contato}`);

                    const addressLine = [company.endereco, company.cidade].filter(Boolean).join(' - ');
                    if (addressLine) infoLines.push(addressLine);

                    let currY = 21;
                    infoLines.forEach(line => {
                        doc.text(line, 45, currY);
                        currY += 4.5;
                    });

                    startY = 44;
                } catch (imgError) {
                    console.error("Falha ao desenhar imagem base64 no jsPdf:", imgError);
                    doc.setFontSize(14);
                    doc.text(company.nome || "Empresa Corporativa", 14, 16);
                    startY = 24;
                }
            } else if (company.nome) {
                doc.setFontSize(14);
                doc.setFont(undefined, 'bold');
                doc.text(company.nome, 14, 16);

                doc.setFontSize(9);
                doc.setFont(undefined, 'normal');
                if (company.cnpj) doc.text(`CNPJ: ${company.cnpj}`, 14, 21);

                startY = 28;
            }
        }
    } catch (error) {
        console.error("Falha silenciosa ao buscar dados da empresa para o PDF (CORS/Offline):", error);
    }

    // Título do Relatório
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 41, 59); // Tailwind text-slate-800
    doc.text(title, 14, startY);

    // Data de Emissão Oficial
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // Tailwind text-slate-500
    doc.setFont(undefined, 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, startY + 6);

    const tableColumn = columns.map(col => col.header);
    const tableRows = data.map(row => columns.map(col => String(col.accessor(row) ?? '')));

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: startY + 12,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3, textColor: [51, 65, 85] }, // text-slate-700
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' }, // indigo-600
        alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
        margin: { top: 15, right: 14, bottom: 15, left: 14 }
    });

    doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
}
