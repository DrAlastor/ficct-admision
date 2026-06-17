import React, { useState } from 'react';
import { ListFilter } from 'lucide-react';

const PREDEFINED_QUERIES = [
    { id: 'alumnos_aprobados', label: 'Lista de Alumnos Aprobados', icon: '✅' },
    { id: 'alumnos_reprobados', label: 'Lista de Alumnos Reprobados', icon: '❌' },
    { id: 'pagos_stripe_paypal', label: 'Pagos Stripe/Paypal', icon: '💳' },
    { id: 'aceptados_promedio_carrera', label: 'Lista de Aceptados con su promedio y carrera', icon: '🎓' },
    { id: 'grupos_mayor_aprobados', label: 'Grupos con mayor aprobados', icon: '📈' },
    { id: 'grupos_mayor_reprobados', label: 'Grupo con mayor reprobados', icon: '📉' },
    { id: 'carreras_aceptados_rechazados', label: 'Carreras con mayor aceptados y rechazados', icon: '📊' },
    { id: 'docentes_aprobados_reprobados', label: 'Docente con mayor aprobados y reprobados', icon: '👨‍🏫' },
    { id: 'grupos_mejores_peores_notas', label: 'Grupos con mejores y peores notas', icon: '📝' },
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

            <div className="flex flex-col gap-4">
                <div className="w-full">
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

                <div className="flex flex-col gap-2 w-full max-h-[500px] overflow-y-auto pr-2">
                    {PREDEFINED_QUERIES.map(q => (
                        <button
                            key={q.id}
                            onClick={() => onSelectQuery(q.id, selectedGestion)}
                            disabled={!selectedGestion || loading}
                            className="px-4 py-3 w-full text-left bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold shadow-sm hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg">{q.icon}</span>
                                <span>{q.label}</span>
                            </div>
                            <span className="text-gray-400 text-xs font-normal">Ejecutar →</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
