import React from 'react';
import { useForm, router } from '@inertiajs/react';
import { FiCheckCircle, FiBook, FiClock, FiUserCheck } from 'react-icons/fi';
import HistorialPostulante from './HistorialPostulante';

function SesionCardPostulante({ sesion }) {
    const { data, setData, post, processing } = useForm({ sesion_id: sesion.id, contrasena: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('asistencia.marcar.postulante'), { preserveScroll: true });
    };

    const yaPresente = sesion.mi_estado === 'Presente';

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className={`p-5 border-b border-gray-50 ${yaPresente ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center mr-4 shadow-sm ${yaPresente ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-600' : 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600'}`}>
                            {yaPresente ? <FiCheckCircle size={24} /> : <FiBook size={24} />}
                        </div>
                        <div>
                            <h4 className="font-black text-gray-800 text-lg tracking-tight">{sesion.materia_nombre}</h4>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${yaPresente ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                {sesion.grupo_nombre}
                            </span>
                        </div>
                    </div>
                    <div>
                        {yaPresente ? (
                            <span className="flex items-center text-sm font-black text-green-600 bg-green-100 px-3 py-1.5 rounded-xl border border-green-200">
                                <FiCheckCircle className="mr-1.5" /> Presente
                            </span>
                        ) : (
                            <span className="flex items-center text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                                <FiClock className="mr-1.5" /> Pendiente
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-5">
                {yaPresente ? (
                    <div className="text-center py-4">
                        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                            <FiCheckCircle className="text-green-500" size={32} />
                        </div>
                        <p className="font-black text-green-700 text-lg">¡Asistencia Registrada!</p>
                        {sesion.hora_marcado && (
                            <p className="text-xs text-gray-400 mt-1 font-mono">Registrado a las {sesion.hora_marcado.substring(11, 16)}</p>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">
                                Ingresa la contraseña dictada por el docente:
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={data.contrasena}
                                    onChange={e => setData('contrasena', e.target.value.toUpperCase())}
                                    placeholder="Ej: X7K2P9"
                                    maxLength={6}
                                    className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 font-mono font-bold text-xl text-center tracking-[0.3em] uppercase focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-300 placeholder:tracking-normal placeholder:text-sm"
                                    autoComplete="off"
                                />
                                <button
                                    type="submit"
                                    disabled={processing || data.contrasena.length < 4}
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center"
                                >
                                    <FiCheckCircle className="mr-1.5" /> Marcar
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function PostulanteView({ sesionesAbiertas, grupos, historial }) {
    return (
        <div className="space-y-8">
            {/* Sesiones abiertas para marcar */}
            {sesionesAbiertas && sesionesAbiertas.length > 0 ? (
                <div>
                    <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide mb-4 flex items-center">
                        <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
                        Sesiones de Asistencia Abiertas
                        <span className="ml-3 bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">{sesionesAbiertas.length} disponibles</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sesionesAbiertas.map(sesion => (
                            <SesionCardPostulante key={sesion.id} sesion={sesion} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex flex-col items-center justify-center text-center">
                    <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mb-5 border border-gray-100">
                        <FiClock className="text-gray-300" size={36} />
                    </div>
                    <h3 className="text-xl font-black text-gray-700 mb-2">Sin sesiones abiertas</h3>
                    <p className="text-sm text-gray-400 font-medium max-w-md">No hay sesiones de asistencia abiertas para tus materias en este momento. Vuelve a verificar cuando estés en clase.</p>
                </div>
            )}

            {/* Mis materias */}
            {grupos && grupos.length > 0 && (
                <div>
                    <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide mb-4 flex items-center">
                        <span className="w-2 h-6 bg-[#07074E] rounded-full mr-3"></span>
                        Mis Materias Inscritas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {grupos.map(g => (
                            <div key={g.codigo} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
                                <div className="flex items-center mb-3">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-600 flex items-center justify-center mr-3 shadow-sm">
                                        <FiBook size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm">{g.materia_nombre}</h4>
                                        <span className="text-xs text-gray-400 font-bold">{g.grupo_nombre}</span>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 font-medium flex items-center">
                                    <FiUserCheck className="mr-1.5 text-indigo-400" /> {g.docente}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Historial personal */}
            <HistorialPostulante historial={historial} />
        </div>
    );
}
