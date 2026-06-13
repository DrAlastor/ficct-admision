import React from 'react';
import { Head, router } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { FiDollarSign, FiCalendar, FiFilter, FiDownload, FiCreditCard } from 'react-icons/fi';

export default function Index({ gestiones, pagos, totalRecaudado, filtroGestionId }) {
    const handleFilterChange = (e) => {
        const gestion_id = e.target.value;
        router.get(route('reporte_pagos.index'), { gestion_id }, { preserveState: true, preserveScroll: true });
    };

    const handlePrint = () => {
        window.print();
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

                    <div className="flex items-center space-x-4 w-full md:w-auto">
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 shadow-lg shadow-green-500/30 flex items-center w-full md:w-auto">
                            <div className="bg-white/20 p-2 rounded-lg mr-4">
                                <FiDollarSign className="text-white" size={24} />
                            </div>
                            <div>
                                <p className="text-green-50 text-xs font-bold uppercase tracking-wider mb-0.5">Total Recaudado</p>
                                <p className="text-white text-2xl font-black tracking-tight">{totalRecaudado} Bs.</p>
                            </div>
                        </div>

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
                            {pagos.length} Pagos
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
                                {pagos.length > 0 ? (
                                    pagos.map((pago, index) => (
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
