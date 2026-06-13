import React from 'react';
import { Download, FileText, FileSpreadsheet, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function ResultTable({ data, sql, loading }) {
    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center">
                <svg className="animate-spin h-10 w-10 text-indigo-500 mb-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <h3 className="text-lg font-bold text-gray-700">Ejecutando consulta...</h3>
            </div>
        );
    }

    if (!data) return null;

    if (data.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center text-center">
                <AlertCircle size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-700">Sin resultados</h3>
                <p className="text-gray-500 text-sm mt-1">La consulta se ejecutó correctamente pero no devolvió ningún registro.</p>
                {sql && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs font-mono text-gray-500 max-w-2xl overflow-auto text-left">
                        {sql}
                    </div>
                )}
            </div>
        );
    }

    const columns = Object.keys(data[0]);

    const exportToPDF = () => {
        const doc = new jsPDF('landscape');
        
        doc.setFontSize(18);
        doc.setTextColor(7, 7, 78); // #07074E
        doc.text('Reporte de Consulta (FICCT CUP)', 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 14, 30);

        doc.autoTable({
            startY: 40,
            head: [columns.map(c => c.replace(/_/g, ' ').toUpperCase())],
            body: data.map(row => columns.map(col => row[col])),
            theme: 'grid',
            headStyles: { fillColor: [7, 7, 78], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            styles: { fontSize: 8, cellPadding: 3 },
        });

        doc.save('reporte_consulta.pdf');
    };

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Resultados");
        XLSX.writeFile(wb, "reporte_consulta.xlsx");
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                        <Download className="text-emerald-600" size={18} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-sm">Resultados de la Consulta</h3>
                        <p className="text-xs text-gray-500 font-medium">{data.length} registros encontrados</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={exportToExcel}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:text-green-600 hover:border-green-300 hover:bg-green-50 transition flex items-center gap-2 shadow-sm"
                    >
                        <FileSpreadsheet size={16} /> Excel
                    </button>
                    <button
                        onClick={exportToPDF}
                        className="px-4 py-2 bg-[#07074E] text-white rounded-lg text-xs font-bold hover:bg-[#0a0f5c] transition flex items-center gap-2 shadow-sm"
                    >
                        <FileText size={16} /> PDF
                    </button>
                </div>
            </div>

            {sql && (
                <div className="px-5 py-3 bg-gray-900 text-gray-300 text-xs font-mono border-b border-gray-800 overflow-x-auto">
                    <span className="text-purple-400 font-bold mr-2">SQL&gt;</span>
                    {sql}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white border-b-2 border-gray-100">
                            {columns.map((col, idx) => (
                                <th key={idx} className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    {col.replace(/_/g, ' ')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50/50 transition">
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} className="p-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                                        {row[col] !== null ? String(row[col]) : <span className="text-gray-300">-</span>}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
