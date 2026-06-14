import React, { useState } from 'react';
import { ListFilter } from 'lucide-react';

const PREDEFINED_QUERIES = [
    { id: 'alumnos_aprobados', label: 'Alumnos Aprobados', icon: '✅' },
    { id: 'alumnos_reprobados', label: 'Alumnos Reprobados', icon: '❌' },
    { id: 'docentes_inasistencias', label: 'Inasistencias Docentes', icon: '👨‍🏫' },
    { id: 'postulantes_rechazados_cupo', label: 'Rechazados sin Cupo', icon: '⚠️' },
    { id: 'ingresos_stripe_paypal', label: 'Pagos Stripe/PayPal', icon: '💳' },
];

export default function QuickQueries({ gestiones, selectedGestion, setSelectedGestion, onSelectQuery, loading }) {

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2.5 rounded-xl">
                    <ListFilter className="text-blue-600" size={20} />
                </div>
                <div>
                    <h2 className="text-sm font-black text-gray-800 uppercase tracking-wider">
                        Consultas Rápidas
                    </h2>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                        Selecciona una gestión y una consulta predefinida
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="w-full md:w-64">
                    <select
                        value={selectedGestion}
                        onChange={(e) => setSelectedGestion(e.target.value)}
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 bg-gray-50 focus:ring-0 focus:border-blue-400 focus:bg-white transition"
                    >
                        <option value="">Seleccionar Gestión...</option>
                        {gestiones.map(g => (
                            <option key={g.id} value={g.id}>{g.label}</option>
                        ))}
                    </select>
                </div>

                <div className="flex-1 flex flex-wrap gap-2">
                    {PREDEFINED_QUERIES.map(q => (
                        <button
                            key={q.id}
                            onClick={() => onSelectQuery(q.id, selectedGestion)}
                            disabled={!selectedGestion || loading}
                            className="px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold shadow-sm hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <span>{q.icon}</span>
                            {q.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
