import React from 'react';
import { FiUsers, FiCheckCircle, FiAward, FiBookOpen, FiLayers, FiDollarSign, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const KPI_CONFIG = [
    {
        key: 'totalPostulantes',
        label: 'Total Postulantes',
        icon: FiUsers,
        color: 'from-blue-500 to-indigo-600',
        bgLight: 'bg-blue-50',
        textColor: 'text-blue-600',
    },
    {
        key: 'tasaAprobacion',
        label: 'Tasa Aprobación',
        icon: FiCheckCircle,
        color: 'from-emerald-500 to-teal-600',
        bgLight: 'bg-emerald-50',
        textColor: 'text-emerald-600',
        suffix: '%',
    },
    {
        key: 'mejorPromedio',
        label: 'Mejor Promedio',
        icon: FiAward,
        color: 'from-amber-500 to-orange-600',
        bgLight: 'bg-amber-50',
        textColor: 'text-amber-600',
    },
    {
        key: 'totalDocentes',
        label: 'Total Docentes',
        icon: FiBookOpen,
        color: 'from-purple-500 to-violet-600',
        bgLight: 'bg-purple-50',
        textColor: 'text-purple-600',
    },
    {
        key: 'gruposActivos',
        label: 'Grupos Activos',
        icon: FiLayers,
        color: 'from-cyan-500 to-sky-600',
        bgLight: 'bg-cyan-50',
        textColor: 'text-cyan-600',
    },
    {
        key: 'totalIngresos',
        label: 'Ingresos (Bs)',
        icon: FiDollarSign,
        color: 'from-rose-500 to-pink-600',
        bgLight: 'bg-rose-50',
        textColor: 'text-rose-600',
        prefix: 'Bs ',
    },
];

function calcularKPIs(dataGestion) {
    if (!dataGestion) return {};

    const { postulantes, notas, grupos, docentes, pagos } = dataGestion;

    const totalEval = (notas?.aprobados || 0) + (notas?.reprobados || 0);
    const tasaAprobacion = totalEval > 0 ? ((notas.aprobados / totalEval) * 100).toFixed(1) : '0.0';

    const promedios = notas?.top_mejores?.map(a => parseFloat(a.promedio_general)) || [];
    const mejorPromedio = promedios.length > 0 ? Math.max(...promedios).toFixed(2) : '0.00';

    const gruposUnicos = new Set((grupos || []).map(g => g.grupo));

    return {
        totalPostulantes: postulantes?.total || 0,
        tasaAprobacion,
        mejorPromedio,
        totalDocentes: docentes?.listado?.length || 0,
        gruposActivos: gruposUnicos.size,
        totalIngresos: (pagos?.total_ingresos || 0).toLocaleString('es-BO'),
    };
}

function calcularTendencia(valor1, valor2) {
    const v1 = parseFloat(String(valor1).replace(/[^0-9.-]/g, ''));
    const v2 = parseFloat(String(valor2).replace(/[^0-9.-]/g, ''));
    if (isNaN(v1) || isNaN(v2) || v2 === 0) return null;
    const diff = ((v1 - v2) / v2) * 100;
    return diff;
}

export default function KpiCards({ data, modo }) {
    const kpis1 = calcularKPIs(data?.[0]);
    const kpis2 = modo === 'versus' && data?.[1] ? calcularKPIs(data[1]) : null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {KPI_CONFIG.map((kpi) => {
                const Icon = kpi.icon;
                const value = kpis1[kpi.key] ?? '—';
                const value2 = kpis2 ? (kpis2[kpi.key] ?? '—') : null;
                const tendencia = kpis2 ? calcularTendencia(value, value2) : null;

                return (
                    <div
                        key={kpi.key}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all hover:-translate-y-0.5 group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`${kpi.bgLight} p-2 rounded-xl group-hover:scale-110 transition-transform`}>
                                <Icon className={kpi.textColor} size={18} />
                            </div>
                            {tendencia !== null && (
                                <div className={`flex items-center text-xs font-bold ${tendencia >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {tendencia >= 0 ? <FiTrendingUp size={14} className="mr-0.5" /> : <FiTrendingDown size={14} className="mr-0.5" />}
                                    {Math.abs(tendencia).toFixed(1)}%
                                </div>
                            )}
                        </div>
                        <div className="text-2xl font-black text-gray-800 tracking-tight">
                            {kpi.prefix || ''}{value}{kpi.suffix || ''}
                        </div>
                        {modo === 'versus' && value2 !== null && (
                            <div className="text-sm font-bold text-gray-400 mt-0.5">
                                vs {kpi.prefix || ''}{value2}{kpi.suffix || ''}
                            </div>
                        )}
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {kpi.label}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
