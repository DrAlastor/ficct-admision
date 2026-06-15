import React from 'react';
import { Head, router } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { FiDollarSign, FiCalendar, FiFilter, FiDownload, FiCreditCard } from 'react-icons/fi';

export default function Index({ gestiones, pagos, totalRecaudado, filtroGestionId }) {
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredPagos = pagos.filter(pago => {
        const term = searchTerm.toLowerCase();
        return (
            pago.nro_recibo.toLowerCase().includes(term) ||
            pago.nombre_completo.toLowerCase().includes(term) ||
            pago.metodo_pago?.toLowerCase().includes(term)
        );
    });

    const filteredTotal = filteredPagos.reduce((sum, pago) => sum + parseFloat(pago.monto), 0).toFixed(2);
    const handleFilterChange = (e) => {
        const gestion_id = e.target.value;
        router.get(route('reporte_pagos.index'), { gestion_id }, { preserveState: true, preserveScroll: true });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportPdf = () => {
        let url = route('reporte_pagos.exportar_pdf');
        if (filtroGestionId) {
            url += `?gestion_id=${filtroGestionId}`;
        }
        window.open(url, '_blank');
    };

    return (
        <SidebarLayout title="REPORTE FINANCIERO" subtitle="Reporte de Pagos">
            <Head title="Reporte de Pagos" />

            <div className="grid grid-cols-1 gap-6 mb-6">
                {/* Header Actions */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                            <FiFilter size={24} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Filtrar por Gestión</h3>
                            <select
                                value={filtroGestionId || ''}
                                onChange={handleFilterChange}
                                className="border-gray-200 rounded-xl text-sm focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-700 shadow-sm w-48"
                            >
                                {gestiones.map(g => (
                                    <option key={g.id} value={g.id}>{g.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex-1 max-w-md w-full md:w-auto">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por Nombre, CI, Método o Recibo..."
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition duration-150 ease-in-out"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 w-full md:w-auto">
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 shadow-lg shadow-green-500/30 flex items-center w-full md:w-auto">
                            <div className="bg-white/20 p-2 rounded-lg mr-4">
                                <FiDollarSign className="text-white" size={24} />
                            </div>
                            <div>
                                <p className="text-green-50 text-xs font-bold uppercase tracking-wider mb-0.5">Total Recaudado (Filtrado)</p>
                                <p className="text-white text-2xl font-black tracking-tight">{filteredTotal} Bs.</p>
                            </div>
                        </div>

                        <button
                            onClick={handleExportPdf}
                            className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white p-4 rounded-2xl shadow-sm transition-colors duration-200 flex items-center justify-center font-bold text-sm tracking-wide border border-red-100 h-full hide-on-print"
                        >
                            <FiDownload className="mr-2" size={20} />
                            <span className="hidden md:inline">Descargar PDF</span>
                        </button>
                        <button
                            onClick={handlePrint}
                            className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white p-4 rounded-2xl shadow-sm transition-colors duration-200 flex items-center justify-center font-bold text-sm tracking-wide border border-indigo-100 h-full hide-on-print"
                        >
                            <FiDownload className="mr-2" size={20} />
                            <span className="hidden md:inline">Imprimir</span>
                        </button>
                    </div>
                </div>

                {/* Tabla de Pagos */}
                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-black text-gray-800 uppercase tracking-wide flex items-center">
                            <FiCreditCard className="mr-3 text-indigo-500" />
                            Detalle de Transacciones
                        </h2>
                        <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
                            {filteredPagos.length} Pagos
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/50 text-gray-500 font-bold text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 rounded-tl-xl">Nro. Recibo</th>
                                    <th className="px-6 py-4">Postulante</th>
                                    <th className="px-6 py-4">Método</th>
                                    <th className="px-6 py-4">Transacción ID</th>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4 text-right rounded-tr-xl">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredPagos.length > 0 ? (
                                    filteredPagos.map((pago, index) => (
                                        <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-6 py-4 font-bold text-gray-700 whitespace-nowrap">
                                                {pago.nro_recibo}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {pago.nombre_completo}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${pago.metodo_pago?.toLowerCase().includes('stripe') ? 'bg-indigo-100 text-indigo-800' :
                                                        pago.metodo_pago?.toLowerCase().includes('paypal') ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {pago.metodo_pago}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                                {pago.transaccion_id || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 flex items-center whitespace-nowrap">
                                                <FiCalendar className="mr-2 text-gray-400" />
                                                {pago.fecha}
                                            </td>
                                            <td className="px-6 py-4 font-black text-gray-900 text-right whitespace-nowrap">
                                                {pago.monto} Bs.
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <FiDollarSign size={48} className="mb-4 text-gray-200" />
                                                <p className="font-medium text-lg">No hay pagos registrados</p>
                                                <p className="text-sm mt-1">Intenta seleccionando otra gestión</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    .hide-on-print {
                        display: none !important;
                    }
                    body * {
                        visibility: hidden;
                    }
                    .overflow-x-auto {
                        overflow-x: visible !important;
                    }
                    .grid-cols-12 {
                        display: block;
                    }
                    .bg-white {
                        box-shadow: none !important;
                        border: 1px solid #ddd !important;
                    }
                    main {
                        overflow: visible !important;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    main > div {
                        visibility: visible;
                    }
                    main > div * {
                        visibility: visible;
                    }
                    /* Ocultar el SidebarLayout wrappers */
                    aside { display: none !important; }
                    header { display: none !important; }
                }
            `}</style>
        </SidebarLayout>
    );
}
