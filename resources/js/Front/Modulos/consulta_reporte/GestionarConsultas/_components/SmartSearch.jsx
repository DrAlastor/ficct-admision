import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

export default function SmartSearch({ onSearch, loading }) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 p-2.5 rounded-xl">
                    <Sparkles className="text-purple-600" size={20} />
                </div>
                <div>
                    <h2 className="text-sm font-black text-gray-800 uppercase tracking-wider">
                        Consulta Inteligente con IA
                    </h2>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                        Escribe lo que necesitas saber en lenguaje natural.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="text-gray-400" size={20} />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder='Ej: "Lista de todos los alumnos aprobados en Ing. de Sistemas de la gestión 1-2024 ordenados por nota"'
                    className="block w-full pl-11 pr-32 py-4 border-2 border-gray-100 bg-gray-50 rounded-xl text-sm font-medium focus:ring-0 focus:border-purple-400 focus:bg-white transition-all outline-none text-gray-700"
                    disabled={loading}
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                    <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Generando...
                            </>
                        ) : (
                            'Consultar'
                        )}
                    </button>
                </div>
            </form>
            
            <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-1">Ejemplos:</span>
                {['Docentes con más de 10 horas en 1-2024', 'Peores 5 notas de cálculo I'].map((ex, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setQuery(ex)}
                        className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-600 text-xs font-semibold rounded-full transition-colors"
                    >
                        {ex}
                    </button>
                ))}
            </div>
        </div>
    );
}
