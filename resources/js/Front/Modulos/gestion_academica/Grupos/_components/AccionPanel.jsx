import React from 'react';

export default function AccionPanel({ processing, proyeccion_grupos, handleGenerar }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
                <div>
                    <h3 className="text-xl font-bold text-[#0F172A]">Acción Requerida</h3>
                    <p className="text-sm text-gray-500 font-medium">
                        Se distribuirán de manera equitativa entre los turnos (Mañana, Tarde, Noche).
                    </p>
                </div>
                <form onSubmit={handleGenerar}>
                    <button
                        type="submit"
                        disabled={processing || proyeccion_grupos <= 0}
                        className="bg-[#ef172f] hover:bg-[#ef172f]/90 text-white font-bold py-3 px-8 rounded-xl flex items-center shadow-lg shadow-[#ef172f]/20 transition-all hover:translate-y-[-2px] disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        {processing ? 'Generando...' : 'Generar Grupos Académicos'}
                    </button>
                </form>
            </div>
        </div>
    );
}
