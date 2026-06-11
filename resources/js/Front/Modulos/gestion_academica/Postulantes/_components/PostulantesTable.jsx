import React from 'react';
import { FiEdit2, FiAlertCircle } from 'react-icons/fi';

export default function PostulantesTable({ postulantes, openModal }) {
    if (postulantes.length === 0) {
        return (
            <div className="bg-white rounded-3xl shadow-sm p-12 text-center border border-gray-100 flex flex-col items-center justify-center">
                <div className="bg-gray-50 rounded-full p-4 mb-4">
                    <FiAlertCircle size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No se encontraron postulantes</h3>
                <p className="text-gray-500">Intenta buscar con otros términos o filtros.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-100">
                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Postulante / CI</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Carreras (1ra y 2da opción)</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Colegio / Ciudad</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado Postulación</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {postulantes.map((postulante) => (
                            <tr key={postulante.perfil_id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="py-4 px-6">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#07074E] to-[#1a1a7a] flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white mr-4">
                                            {postulante.nombres.charAt(0)}{postulante.apellido_paterno?.charAt(0) || ''}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 group-hover:text-[#ef172f] transition-colors">
                                                {postulante.nombres} {postulante.apellido_paterno} {postulante.apellido_materno}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                CI: {postulante.ci} | Cód: {postulante.codigo || '-'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex flex-col gap-1">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            1. {postulante.carrera_opcion_1 || 'No registrada'}
                                        </span>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            2. {postulante.carrera_opcion_2 || 'No registrada'}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="text-sm text-gray-900 font-medium">{postulante.colegio_procedencia || '-'}</div>
                                    <div className="text-xs text-gray-500">{postulante.ciudad || '-'}</div>
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        postulante.estado === 'Habilitado' || postulante.estado === 'Inscrito' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {postulante.estado}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <button 
                                        onClick={() => openModal(postulante)}
                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-[#07074E] hover:bg-blue-50 transition-colors tooltip-trigger"
                                        title="Editar Perfil"
                                    >
                                        <FiEdit2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
