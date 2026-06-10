import React from 'react';
import { FiChevronUp, FiChevronDown, FiFilter, FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function HistorialSection({ historial, showHistorial, setShowHistorial, filtroMateria, setFiltroMateria, materiasUnicas, showDocente }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button
                onClick={() => setShowHistorial(!showHistorial)}
                className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide flex items-center">
                    <span className="w-2 h-6 bg-purple-500 rounded-full mr-3"></span>
                    Control de Asistencia (Historial)
                    <span className="ml-3 bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">{historial.length} registros</span>
                </h3>
                {showHistorial ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </button>

            {showHistorial && (
                <div className="border-t border-gray-100 p-5">
                    {/* Filtro */}
                    {materiasUnicas.length > 0 && (
                        <div className="mb-4 flex items-center gap-3">
                            <FiFilter className="text-gray-400" />
                            <select
                                value={filtroMateria}
                                onChange={e => setFiltroMateria(e.target.value)}
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                            >
                                <option value="">Todas las materias</option>
                                {materiasUnicas.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    )}

                    {historial.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="text-left px-4 py-3 font-black text-gray-500 text-xs uppercase tracking-wider">Fecha</th>
                                        <th className="text-left px-4 py-3 font-black text-gray-500 text-xs uppercase tracking-wider">Materia</th>
                                        <th className="text-left px-4 py-3 font-black text-gray-500 text-xs uppercase tracking-wider">Grupo</th>
                                        {showDocente && <th className="text-left px-4 py-3 font-black text-gray-500 text-xs uppercase tracking-wider">Docente</th>}
                                        <th className="text-center px-4 py-3 font-black text-gray-500 text-xs uppercase tracking-wider">Doc. Presente</th>
                                        <th className="text-center px-4 py-3 font-black text-gray-500 text-xs uppercase tracking-wider">Presentes</th>
                                        <th className="text-center px-4 py-3 font-black text-gray-500 text-xs uppercase tracking-wider">Apertura</th>
                                        <th className="text-center px-4 py-3 font-black text-gray-500 text-xs uppercase tracking-wider">Cierre</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {historial.map((h, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-bold text-gray-800">{h.fecha}</td>
                                            <td className="px-4 py-3 font-bold text-gray-700">{h.materia_nombre}</td>
                                            <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-xs font-bold border border-blue-100">{h.grupo_nombre}</span></td>
                                            {showDocente && <td className="px-4 py-3 text-gray-600 font-medium">{h.docente}</td>}
                                            <td className="px-4 py-3 text-center">
                                                {h.docente_presente ? (
                                                    <span className="text-green-600"><FiCheckCircle size={16} /></span>
                                                ) : (
                                                    <span className="text-red-400"><FiXCircle size={16} /></span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center font-black text-gray-800">
                                                {h.presentes}/{h.total}
                                                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                                                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${h.total > 0 ? (h.presentes / h.total * 100) : 0}%` }}></div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center text-xs font-mono text-gray-500">{h.hora_apertura?.substring(11, 16)}</td>
                                            <td className="px-4 py-3 text-center text-xs font-mono text-gray-500">{h.hora_cierre?.substring(11, 16) || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-gray-400 py-8 font-medium">No hay registros de asistencia todavía.</p>
                    )}
                </div>
            )}
        </div>
    );
}
