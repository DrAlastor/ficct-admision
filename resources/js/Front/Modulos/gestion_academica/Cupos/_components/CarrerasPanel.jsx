import React from 'react';
import { FiSettings } from 'react-icons/fi';

export default function CarrerasPanel({ carreras, errors, handleCarreraChange }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 p-6 flex items-center space-x-3 bg-gray-50/50">
                <div className="p-2.5 bg-[#07074E]/10 rounded-xl text-[#07074E]">
                    <FiSettings size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-[#0F172A]">Cupos Globales por Carrera</h3>
                    <p className="text-sm text-gray-500 font-medium">Establece el número máximo de postulantes que serán admitidos por carrera.</p>
                </div>
            </div>
            
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {carreras.map((carrera, index) => (
                        <div key={carrera.codigo} className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:border-[#07074E]/30 transition-colors">
                            <div className="flex flex-col h-full justify-between">
                                <div className="mb-4">
                                    <span className="inline-block px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-bold mb-2">
                                        {carrera.sigla}
                                    </span>
                                    <h4 className="text-[#0F172A] font-bold leading-tight">{carrera.nombre}</h4>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        Cupo Máximo
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={carrera.cupo_maximo}
                                        onChange={(e) => handleCarreraChange(index, e.target.value)}
                                        className={`w-full rounded-xl border ${errors[`carreras.${index}.cupo_maximo`] ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'} px-4 py-2.5 text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#07074E]/20 focus:border-[#07074E] transition-all`}
                                        required
                                    />
                                    {errors[`carreras.${index}.cupo_maximo`] && (
                                        <p className="text-red-500 text-xs mt-1 font-medium">{errors[`carreras.${index}.cupo_maximo`]}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
