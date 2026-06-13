import React from 'react';
import { FiAward, FiAlertTriangle, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export default function RankingPanel({ data, modo }) {
    const d1 = data?.[0];
    const d2 = modo === 'versus' ? data?.[1] : null;

    if (!d1) return null;

    const mejores = d1.notas?.top_mejores || [];
    const peores = d1.notas?.top_peores || [];

    const getGradeColor = (promedio) => {
        const p = parseFloat(promedio);
        if (p >= 80) return 'text-emerald-600 bg-emerald-50';
        if (p >= 60) return 'text-blue-600 bg-blue-50';
        if (p >= 51) return 'text-amber-600 bg-amber-50';
        return 'text-red-600 bg-red-50';
    };

    const getMedalEmoji = (index) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return `#${index + 1}`;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 10 Mejores */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 flex items-center">
                    <FiAward className="text-white mr-3" size={22} />
                    <div>
                        <h3 className="text-white font-black text-sm uppercase tracking-wider">Top 10 Mejores Promedios</h3>
                        <p className="text-emerald-100 text-xs font-medium mt-0.5">Gestión {d1.label}</p>
                    </div>
                </div>
                <div className="divide-y divide-gray-50">
                    {mejores.length > 0 ? mejores.map((alumno, idx) => (
                        <div key={idx} className="flex items-center justify-between px-5 py-3 hover:bg-emerald-50/30 transition-colors">
                            <div className="flex items-center">
                                <span className="text-lg mr-3 w-8 text-center font-black">{getMedalEmoji(idx)}</span>
                                <div>
                                    <div className="font-bold text-gray-800 text-sm">
                                        {alumno.nombres} {alumno.apellido_paterno} {alumno.apellido_materno}
                                    </div>
                                    <div className="text-xs text-gray-400 font-medium">CI: {alumno.ci}</div>
                                </div>
                            </div>
                            <span className={`px-3 py-1.5 rounded-xl text-sm font-black ${getGradeColor(alumno.promedio_general)}`}>
                                {alumno.promedio_general}
                            </span>
                        </div>
                    )) : (
                        <div className="px-5 py-8 text-center text-gray-400 font-medium text-sm">
                            Sin datos de notas para esta gestión
                        </div>
                    )}
                </div>
            </div>

            {/* Top 10 Peores */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-rose-600 p-4 flex items-center">
                    <FiAlertTriangle className="text-white mr-3" size={22} />
                    <div>
                        <h3 className="text-white font-black text-sm uppercase tracking-wider">Top 10 Peores Promedios</h3>
                        <p className="text-red-100 text-xs font-medium mt-0.5">Gestión {d1.label}</p>
                    </div>
                </div>
                <div className="divide-y divide-gray-50">
                    {peores.length > 0 ? peores.map((alumno, idx) => (
                        <div key={idx} className="flex items-center justify-between px-5 py-3 hover:bg-red-50/30 transition-colors">
                            <div className="flex items-center">
                                <span className="text-sm mr-3 w-8 text-center font-black text-gray-400">#{idx + 1}</span>
                                <div>
                                    <div className="font-bold text-gray-800 text-sm">
                                        {alumno.nombres} {alumno.apellido_paterno} {alumno.apellido_materno}
                                    </div>
                                    <div className="text-xs text-gray-400 font-medium">CI: {alumno.ci}</div>
                                </div>
                            </div>
                            <span className={`px-3 py-1.5 rounded-xl text-sm font-black ${getGradeColor(alumno.promedio_general)}`}>
                                {alumno.promedio_general}
                            </span>
                        </div>
                    )) : (
                        <div className="px-5 py-8 text-center text-gray-400 font-medium text-sm">
                            Sin datos de notas para esta gestión
                        </div>
                    )}
                </div>
            </div>

            {/* Versus: Comparativa lado a lado */}
            {d2 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden lg:col-span-2">
                    <div className="bg-gradient-to-r from-[#07074E] to-[#0A0F5C] p-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">⚔️</span>
                            <h3 className="text-white font-black text-sm uppercase tracking-wider">Versus: Mejores Promedios</h3>
                        </div>
                        <div className="flex items-center gap-6 text-xs font-bold">
                            <span className="text-blue-300">🔵 {d1.label}</span>
                            <span className="text-rose-300">🔴 {d2.label}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-gray-100">
                        {/* Gestión 1 */}
                        <div className="divide-y divide-gray-50">
                            {(d1.notas?.top_mejores || []).slice(0, 5).map((a, idx) => (
                                <div key={idx} className="flex items-center justify-between px-4 py-3">
                                    <div className="flex items-center">
                                        <span className="text-sm mr-2 w-6 text-center font-black">{getMedalEmoji(idx)}</span>
                                        <span className="font-bold text-gray-700 text-xs">{a.nombres} {a.apellido_paterno}</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded-lg text-xs font-black ${getGradeColor(a.promedio_general)}`}>
                                        {a.promedio_general}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {/* Gestión 2 */}
                        <div className="divide-y divide-gray-50">
                            {(d2.notas?.top_mejores || []).slice(0, 5).map((a, idx) => (
                                <div key={idx} className="flex items-center justify-between px-4 py-3">
                                    <div className="flex items-center">
                                        <span className="text-sm mr-2 w-6 text-center font-black">{getMedalEmoji(idx)}</span>
                                        <span className="font-bold text-gray-700 text-xs">{a.nombres} {a.apellido_paterno}</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded-lg text-xs font-black ${getGradeColor(a.promedio_general)}`}>
                                        {a.promedio_general}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
