import React from 'react';
import { FiRefreshCw } from 'react-icons/fi';

export default function AccionHorarios({ processing, handleGenerar, totalGrupos, gruposGenerados }) {
    const isCompleted = gruposGenerados > 0 && totalGrupos === gruposGenerados;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
                <div>
                    <h3 className="text-xl font-bold text-[#0F172A]">Asignación Automática</h3>
                    <p className="text-sm text-gray-500 font-medium">
                        El sistema barajará los bloques de tiempo y aulas disponibles para armar la malla de cada grupo sin choques.
                    </p>
                </div>
                <form onSubmit={handleGenerar}>
                    <button
                        type="submit"
                        disabled={processing}
                        className={`font-bold py-3 px-8 rounded-xl flex items-center shadow-lg transition-all hover:translate-y-[-2px] disabled:opacity-50 disabled:hover:translate-y-0 text-white ${isCompleted ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20' : 'bg-[#ef172f] hover:bg-[#ef172f]/90 shadow-[#ef172f]/20'}`}
                    >
                        <FiRefreshCw className={`mr-2 ${processing ? 'animate-spin' : ''}`} size={20} />
                        {processing ? 'Generando...' : (isCompleted ? 'Regenerar Horarios' : 'Generar Horarios Aleatorios')}
                    </button>
                </form>
            </div>
        </div>
    );
}
