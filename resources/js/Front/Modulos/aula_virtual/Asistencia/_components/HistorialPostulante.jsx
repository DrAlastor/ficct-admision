import React, { useState } from 'react';
import { FiChevronUp, FiChevronDown, FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function HistorialPostulante({ historial }) {
    const [show, setShow] = useState(false);

    if (!historial || historial.length === 0) return null;

    const totalPresentes = historial.filter(h => h.estado === 'Presente').length;
    const porcentaje = Math.round((totalPresentes / historial.length) * 100);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button
                onClick={() => setShow(!show)}
                className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide flex items-center">
                    <span className="w-2 h-6 bg-purple-500 rounded-full mr-3"></span>
                    Mi Historial de Asistencia
                    <span className="ml-3 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">{porcentaje}% asistencia</span>
                </h3>
                {show ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </button>

            {show && (
                <div className="border-t border-gray-100 p-5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-4 py-3 font-black text-gray-500 text-xs uppercase tracking-wider">Fecha</th>
                                    <th className="text-left px-4 py-3 font-black text-gray-500 text-xs uppercase tracking-wider">Materia</th>
                                    <th className="text-left px-4 py-3 font-black text-gray-500 text-xs uppercase tracking-wider">Grupo</th>
                                    <th className="text-center px-4 py-3 font-black text-gray-500 text-xs uppercase tracking-wider">Estado</th>
                                    <th className="text-center px-4 py-3 font-black text-gray-500 text-xs uppercase tracking-wider">Hora Registro</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {historial.map((h, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-bold text-gray-800">{h.fecha}</td>
                                        <td className="px-4 py-3 font-bold text-gray-700">{h.materia_nombre}</td>
                                        <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-xs font-bold border border-blue-100">{h.grupo_nombre}</span></td>
                                        <td className="px-4 py-3 text-center">
                                            {h.estado === 'Presente' ? (
                                                <span className="inline-flex items-center text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200">
                                                    <FiCheckCircle className="mr-1" /> Presente
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                                                    <FiXCircle className="mr-1" /> Falta
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center text-xs font-mono text-gray-500">
                                            {h.hora_registro ? h.hora_registro.substring(11, 16) : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
