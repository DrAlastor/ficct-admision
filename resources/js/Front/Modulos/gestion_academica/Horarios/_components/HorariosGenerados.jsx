import React, { useState } from 'react';
import { FiClock, FiMapPin, FiBookOpen, FiChevronDown } from 'react-icons/fi';

export default function HorariosGenerados({ horarios }) {
    const gruposNombres = Object.keys(horarios);
    const [openGroups, setOpenGroups] = useState({});

    if (gruposNombres.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <FiClock className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-400">Aún no hay horarios generados para esta gestión</h3>
                <p className="text-gray-400 mt-2">Haz clic en el botón superior para generar la malla automáticamente.</p>
            </div>
        );
    }

    const toggleGroup = (grupo) => {
        setOpenGroups(prev => ({ ...prev, [grupo]: !prev[grupo] }));
    };

    return (
        <div className="space-y-4">
            {gruposNombres.map((grupo) => (
                <div key={grupo} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Header Acordeon */}
                    <button 
                        onClick={() => toggleGroup(grupo)}
                        className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl tracking-widest">
                                {grupo}
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-[#0F172A] text-lg">Malla Horaria</h4>
                                <p className="text-sm text-gray-500 font-medium">4 materias asignadas (Lunes a Viernes)</p>
                            </div>
                        </div>
                        <div className={`p-2 rounded-full bg-gray-50 text-gray-400 transition-transform ${openGroups[grupo] ? 'rotate-180' : ''}`}>
                            <FiChevronDown size={20} />
                        </div>
                    </button>

                    {/* Contenido Acordeon */}
                    <div className={`transition-all duration-300 ease-in-out ${openGroups[grupo] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                        <div className="p-6 pt-0 border-t border-gray-50">
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {horarios[grupo].map((item, idx) => (
                                    <div key={idx} className="flex items-center p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-blue-100 transition-all group">
                                        
                                        <div className="flex flex-col justify-center items-center px-4 py-2 bg-white rounded-lg border border-gray-100 shadow-sm mr-4 text-center min-w-[100px]">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Bloque</span>
                                            <span className="text-[#0F172A] font-black text-sm">{item.hora_inicio}</span>
                                            <span className="text-gray-300 text-xs my-0.5">a</span>
                                            <span className="text-[#0F172A] font-black text-sm">{item.hora_fin}</span>
                                        </div>

                                        <div className="flex-1">
                                            <h5 className="font-bold text-gray-800 text-base mb-1 group-hover:text-blue-600 transition-colors flex items-center">
                                                <FiBookOpen className="mr-2 text-gray-400" />
                                                {item.materia} <span className="ml-2 text-xs font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded-md">{item.sigla}</span>
                                            </h5>
                                            <p className="text-sm font-medium text-gray-500 flex items-center mt-2">
                                                <FiMapPin className="mr-1.5 text-gray-400" /> Aula asignada: 
                                                {item.aula ? (
                                                    <strong className="ml-1 text-gray-700">{item.aula}</strong>
                                                ) : (
                                                    <span className="ml-1 text-amber-500 font-bold italic">Pendiente en CU21</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
