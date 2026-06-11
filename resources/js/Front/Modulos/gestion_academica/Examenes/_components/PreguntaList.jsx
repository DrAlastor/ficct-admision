import React from 'react';
import { FiDatabase, FiTrash2 } from 'react-icons/fi';

export default function PreguntaList({ 
    materias, 
    materiaSeleccionada, 
    setMateriaSeleccionada, 
    preguntasFiltradas, 
    pedirEliminarPregunta 
}) {
    return (
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[700px]">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
                <h3 className="text-lg font-black text-gray-800 uppercase flex items-center">
                    <FiDatabase className="mr-2 text-indigo-500" /> Banco Actual
                </h3>
                <select 
                    value={materiaSeleccionada} 
                    onChange={e => setMateriaSeleccionada(e.target.value)} 
                    className="border-gray-300 rounded-lg text-sm font-bold text-indigo-900 bg-white shadow-sm"
                >
                    {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
            </div>
            
            <div className="p-6 flex-1 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4 px-2">
                    <span className="text-sm font-bold text-gray-500 uppercase">Preguntas registradas:</span>
                    <span className="bg-indigo-100 text-indigo-800 font-black px-3 py-1 rounded-full text-sm">
                        {preguntasFiltradas.length}
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {preguntasFiltradas.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <FiDatabase size={48} className="mb-3 opacity-20" />
                            <p className="text-sm">No hay preguntas para esta materia.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {preguntasFiltradas.map((p, idx) => (
                                <div key={p.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all group relative">
                                    <button 
                                        onClick={() => pedirEliminarPregunta(p.id)}
                                        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all bg-white rounded-full p-1.5 shadow-sm border border-red-100"
                                        title="Eliminar pregunta"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                    <div className="flex justify-between items-start mb-3 pr-8">
                                        <span className="font-black text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded text-xs">P{idx + 1}</span>
                                        <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">Respuesta: {p.respuesta_correcta}</span>
                                    </div>
                                    <p className="font-bold text-gray-800 text-sm mb-4 leading-relaxed">{p.enunciado}</p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className={`p-2 rounded border ${p.respuesta_correcta === 'A' ? 'bg-green-50 border-green-200 font-bold text-green-800' : 'bg-white border-gray-100 text-gray-600'}`}>
                                            <span className="text-gray-400 mr-1">A)</span> {p.opcion_a}
                                        </div>
                                        <div className={`p-2 rounded border ${p.respuesta_correcta === 'B' ? 'bg-green-50 border-green-200 font-bold text-green-800' : 'bg-white border-gray-100 text-gray-600'}`}>
                                            <span className="text-gray-400 mr-1">B)</span> {p.opcion_b}
                                        </div>
                                        <div className={`p-2 rounded border ${p.respuesta_correcta === 'C' ? 'bg-green-50 border-green-200 font-bold text-green-800' : 'bg-white border-gray-100 text-gray-600'}`}>
                                            <span className="text-gray-400 mr-1">C)</span> {p.opcion_c}
                                        </div>
                                        <div className={`p-2 rounded border ${p.respuesta_correcta === 'D' ? 'bg-green-50 border-green-200 font-bold text-green-800' : 'bg-white border-gray-100 text-gray-600'}`}>
                                            <span className="text-gray-400 mr-1">D)</span> {p.opcion_d}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
