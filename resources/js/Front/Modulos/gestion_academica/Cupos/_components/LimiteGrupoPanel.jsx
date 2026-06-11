import React from 'react';
import { FiUsers } from 'react-icons/fi';

export default function LimiteGrupoPanel({ limite_grupo, errors, handleLimiteChange }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 p-6 flex items-center space-x-3 bg-gray-50/50">
                <div className="p-2.5 bg-[#ef172f]/10 rounded-xl text-[#ef172f]">
                    <FiUsers size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-[#0F172A]">Límite por Aula / Grupo</h3>
                    <p className="text-sm text-gray-500 font-medium">Este número se aplicará a todas las aulas y grupos activos.</p>
                </div>
            </div>
            
            <div className="p-6">
                <div className="max-w-md">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Cupo Estricto (Máximo de alumnos)</label>
                    <input
                        type="number"
                        min="0"
                        value={limite_grupo}
                        onChange={(e) => handleLimiteChange(e.target.value)}
                        className={`w-full text-lg rounded-xl border ${errors?.limite_grupo ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} px-5 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#07074E]/20 focus:border-[#07074E] transition-all font-bold`}
                        placeholder="Ej: 70"
                        required
                    />
                    {errors?.limite_grupo && <p className="text-red-500 text-xs mt-2 font-medium">{errors.limite_grupo}</p>}
                </div>
            </div>
        </div>
    );
}
