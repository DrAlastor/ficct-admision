import React from 'react';
import { FiUsers } from 'react-icons/fi';

export default function DocenteView({ grupos, notas }) {
    const getEstadoClass = (estado) => {
        if (estado === 'Aprobado') return 'bg-green-100 text-green-700 border-green-200';
        if (estado === 'Reprobado') return 'bg-red-100 text-red-700 border-red-200';
        return 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
        <div className="space-y-8">
            {grupos.map(grupo => (
                <div key={grupo.grupo_codigo} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 bg-indigo-50/30 flex justify-between items-center">
                        <div className="flex items-center">
                            <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mr-3">
                                <FiUsers size={20} />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-800 uppercase">{grupo.materia_nombre}</h3>
                                <span className="text-xs font-bold text-indigo-600">{grupo.grupo_nombre}</span>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left font-black text-gray-500 text-xs uppercase">Estudiante</th>
                                    <th className="px-6 py-3 text-center font-black text-gray-500 text-xs uppercase">Parcial 1 (30%)</th>
                                    <th className="px-6 py-3 text-center font-black text-gray-500 text-xs uppercase">Parcial 2 (30%)</th>
                                    <th className="px-6 py-3 text-center font-black text-gray-500 text-xs uppercase">Final (40%)</th>
                                    <th className="px-6 py-3 text-center font-black text-gray-800 text-xs uppercase">Nota Final</th>
                                    <th className="px-6 py-3 text-center font-black text-gray-500 text-xs uppercase">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {notas[grupo.grupo_codigo]?.map((est, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 font-bold text-gray-700 text-xs">{est.apellido_paterno} {est.apellido_materno} {est.nombres}</td>
                                        <td className="px-6 py-3 text-center font-mono text-gray-600">{est.nota_p1 || '0.00'}</td>
                                        <td className="px-6 py-3 text-center font-mono text-gray-600">{est.nota_p2 || '0.00'}</td>
                                        <td className="px-6 py-3 text-center font-mono text-gray-600">{est.nota_p3 || '0.00'}</td>
                                        <td className="px-6 py-3 text-center font-mono font-black text-indigo-700">{est.promedio_final || '0.00'}</td>
                                        <td className="px-6 py-3 text-center">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getEstadoClass(est.estado_materia || 'Reprobado')}`}>
                                                {est.estado_materia || 'Reprobado'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {!notas[grupo.grupo_codigo]?.length && (
                                    <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-400">No hay estudiantes inscritos</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}
