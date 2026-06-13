import React from 'react';
import { FiFilter, FiRepeat, FiHash, FiPercent } from 'react-icons/fi';

const MODOS = [
    { value: 'individual', label: 'Individual', icon: '📊' },
    { value: 'versus', label: 'Versus', icon: '⚔️' },
];

export default function FilterBar({
    gestiones,
    gestion1,
    setGestion1,
    gestion2,
    setGestion2,
    modo,
    setModo,
    usarPorcentaje,
    setUsarPorcentaje,
    onFiltrar,
    loading
}) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            <div className="flex flex-wrap items-center gap-4">
                {/* Icono */}
                <div className="bg-indigo-100 text-indigo-600 p-2.5 rounded-xl">
                    <FiFilter size={20} />
                </div>

                {/* Gestión 1 */}
                <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        Gestión {modo === 'versus' ? '①' : ''}
                    </label>
                    <select
                        value={gestion1}
                        onChange={(e) => setGestion1(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition min-w-[140px]"
                    >
                        <option value="">Seleccionar...</option>
                        {gestiones.map((g) => (
                            <option key={g.id} value={g.id}>{g.label}</option>
                        ))}
                    </select>
                </div>

                {/* Gestión 2 (solo en versus) */}
                {modo === 'versus' && (
                    <>
                        <div className="flex items-center text-gray-300">
                            <FiRepeat size={20} />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                Gestión ②
                            </label>
                            <select
                                value={gestion2}
                                onChange={(e) => setGestion2(e.target.value)}
                                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition min-w-[140px]"
                            >
                                <option value="">Seleccionar...</option>
                                {gestiones.filter(g => String(g.id) !== String(gestion1)).map((g) => (
                                    <option key={g.id} value={g.id}>{g.label}</option>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                {/* Modo */}
                <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Modo</label>
                    <div className="flex bg-gray-100 rounded-xl p-1">
                        {MODOS.map((m) => (
                            <button
                                key={m.value}
                                onClick={() => setModo(m.value)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                    modo === m.value
                                        ? 'bg-[#07074E] text-white shadow-md'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {m.icon} {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Toggle Enteros / Porcentajes */}
                <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Valores</label>
                    <div className="flex bg-gray-100 rounded-xl p-1">
                        <button
                            onClick={() => setUsarPorcentaje(false)}
                            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                !usarPorcentaje
                                    ? 'bg-emerald-500 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <FiHash size={14} /> Enteros
                        </button>
                        <button
                            onClick={() => setUsarPorcentaje(true)}
                            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                usarPorcentaje
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <FiPercent size={14} /> Porcentaje
                        </button>
                    </div>
                </div>

                {/* Botón consultar */}
                <div className="flex flex-col justify-end ml-auto">
                    <button
                        onClick={onFiltrar}
                        disabled={loading || !gestion1}
                        className="bg-gradient-to-r from-[#07074E] to-[#0A0F5C] text-white px-8 py-2.5 rounded-xl font-bold text-sm tracking-wide hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Consultando...
                            </span>
                        ) : (
                            '🔍 Consultar'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
