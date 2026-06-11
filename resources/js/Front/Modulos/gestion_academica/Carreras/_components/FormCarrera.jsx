import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { FiX, FiSave, FiHash, FiBook, FiUsers } from 'react-icons/fi';

export default function FormCarrera({ isOpen, onClose, carrera }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        sigla: '',
        nombre: '',
        cupo_maximo: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (carrera) {
                setData({
                    sigla: carrera.sigla,
                    nombre: carrera.nombre,
                    cupo_maximo: carrera.cupo_maximo
                });
            } else {
                reset();
            }
        }
    }, [isOpen, carrera]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const options = {
            onSuccess: () => {
                reset();
                onClose();
            }
        };

        if (carrera) {
            put(route('carreras.admin.update', carrera.codigo), options);
        } else {
            post(route('carreras.admin.store'), options);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-xl font-black text-gray-800">
                        {carrera ? 'Editar Carrera' : 'Nueva Carrera'}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-2 rounded-full transition-colors shadow-sm"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Sigla de la Carrera</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FiHash className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={data.sigla}
                                onChange={e => setData('sigla', e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-gray-800 transition-all"
                                placeholder="Ej: 187-6"
                                required
                            />
                        </div>
                        {errors.sigla && <p className="text-red-500 text-xs mt-1.5 font-bold ml-1">{errors.sigla}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Nombre Completo</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FiBook className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={data.nombre}
                                onChange={e => setData('nombre', e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-gray-800 transition-all"
                                placeholder="Ej: Ingeniería Informática"
                                required
                            />
                        </div>
                        {errors.nombre && <p className="text-red-500 text-xs mt-1.5 font-bold ml-1">{errors.nombre}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Cupo Máximo</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FiUsers className="text-gray-400" />
                            </div>
                            <input
                                type="number"
                                min="1"
                                value={data.cupo_maximo}
                                onChange={e => setData('cupo_maximo', e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-bold text-gray-800 transition-all text-lg"
                                placeholder="300"
                                required
                            />
                        </div>
                        {errors.cupo_maximo && <p className="text-red-500 text-xs mt-1.5 font-bold ml-1">{errors.cupo_maximo}</p>}
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 bg-[#07074E] text-white rounded-xl font-bold hover:bg-[#0A0F5C] transition-colors flex items-center shadow-md disabled:opacity-50"
                        >
                            <FiSave className="mr-2" />
                            {processing ? 'Guardando...' : (carrera ? 'Guardar Cambios' : 'Crear Carrera')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
