import React from 'react';
import { FiUsers, FiLayers, FiCheckCircle } from 'react-icons/fi';

export default function EstadisticasPanel({ inscritos, cupo_maximo, proyeccion_grupos }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                    <FiUsers size={28} />
                </div>
                <div>
                    <p className="text-gray-500 font-bold text-sm uppercase tracking-wider">Total Inscritos</p>
                    <h3 className="text-3xl font-black text-[#0F172A]">{inscritos}</h3>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
                <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
                    <FiCheckCircle size={28} />
                </div>
                <div>
                    <p className="text-gray-500 font-bold text-sm uppercase tracking-wider">Cupo por Grupo</p>
                    <h3 className="text-3xl font-black text-[#0F172A]">{cupo_maximo}</h3>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4 relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-green-500"></div>
                <div className="p-4 bg-green-50 text-green-600 rounded-xl">
                    <FiLayers size={28} />
                </div>
                <div>
                    <p className="text-gray-500 font-bold text-sm uppercase tracking-wider">Grupos a Generar</p>
                    <h3 className="text-3xl font-black text-green-600">{proyeccion_grupos} <span className="text-sm font-medium text-gray-400">por materia</span></h3>
                </div>
            </div>
        </div>
    );
}
