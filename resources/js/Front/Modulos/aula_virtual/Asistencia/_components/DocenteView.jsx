import React from 'react';
import { router } from '@inertiajs/react';
import { FiBook, FiCheckCircle, FiUserCheck, FiKey, FiUsers, FiUnlock, FiLock } from 'react-icons/fi';
import HistorialSection from './HistorialSection';

function SesionCardDocente({ sesion }) {
    const handleMarcar = () => {
        router.post(route('asistencia.marcar.docente', sesion.id), {}, { preserveScroll: true });
    };
    const handleGenerar = () => {
        router.post(route('asistencia.generar', sesion.id), {}, { preserveScroll: true });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="p-5 border-b border-gray-50 bg-gradient-to-br from-emerald-50 to-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center mr-4 text-emerald-600 shadow-sm">
                            <FiBook size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-gray-800 text-lg tracking-tight">{sesion.materia_nombre}</h4>
                            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100">
                                {sesion.grupo_nombre}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse mr-2"></span>
                        <span className="text-xs font-bold text-green-700">Abierta</span>
                    </div>
                </div>
            </div>

            <div className="p-5 space-y-4">
                {/* Mi asistencia */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <span className="text-sm font-bold text-gray-700">Mi Asistencia:</span>
                    {sesion.docente_presente ? (
                        <span className="flex items-center text-sm font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                            <FiCheckCircle className="mr-1.5" /> Presente
                        </span>
                    ) : (
                        <button
                            onClick={handleMarcar}
                            className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-bold text-sm transition-all shadow-sm"
                        >
                            <FiUserCheck className="mr-1.5" /> Marcar Presente
                        </button>
                    )}
                </div>

                {/* Contraseña */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center">
                            <FiKey className="mr-1.5" /> Contraseña para alumnos
                        </span>
                    </div>
                    {sesion.contrasena ? (
                        <div className="text-center">
                            <p className="font-mono font-black text-4xl text-amber-900 tracking-[0.4em] py-3 select-all">
                                {sesion.contrasena}
                            </p>
                            <p className="text-xs text-amber-600 font-medium mt-1">Dicta esta contraseña a tus alumnos</p>
                            <button
                                onClick={handleGenerar}
                                className="mt-3 text-xs px-4 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg font-bold transition-colors"
                            >
                                Regenerar Contraseña
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleGenerar}
                            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold text-sm flex items-center justify-center transition-all shadow-md"
                        >
                            <FiKey className="mr-2" /> Generar Contraseña Aleatoria
                        </button>
                    )}
                </div>

                {/* Contador de presentes */}
                <div className="flex items-center justify-between bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                    <span className="text-sm font-bold text-indigo-700 flex items-center"><FiUsers className="mr-2" /> Alumnos presentes:</span>
                    <span className="font-black text-2xl text-indigo-800">{sesion.presentes} <span className="text-sm text-indigo-400 font-bold">/ {sesion.total}</span></span>
                </div>
            </div>
        </div>
    );
}

export default function DocenteView({ 
    grupos, 
    sesionesAbiertas, 
    historial, 
    showHistorial, 
    setShowHistorial, 
    filtroMateria, 
    setFiltroMateria, 
    materiasUnicas, 
    historialFiltrado 
}) {
    return (
        <div className="space-y-8">
            {/* Sesiones abiertas */}
            {sesionesAbiertas && sesionesAbiertas.length > 0 && (
                <div>
                    <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide mb-4 flex items-center">
                        <span className="w-2 h-6 bg-emerald-500 rounded-full mr-3"></span>
                        Sesiones Abiertas
                        <span className="ml-3 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">{sesionesAbiertas.length} activas</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sesionesAbiertas.map(sesion => (
                            <SesionCardDocente key={sesion.id} sesion={sesion} />
                        ))}
                    </div>
                </div>
            )}

            {/* Mis grupos (sin sesión) */}
            {grupos && grupos.length > 0 && (
                <div>
                    <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide mb-4 flex items-center">
                        <span className="w-2 h-6 bg-[#07074E] rounded-full mr-3"></span>
                        Mis Materias / Grupos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {grupos.map(g => {
                            const tieneSesion = sesionesAbiertas?.some(s => s.grupo_codigo === g.codigo);
                            return (
                                <div key={g.codigo} className={`bg-white rounded-2xl shadow-sm border p-5 flex items-center ${tieneSesion ? 'border-green-200 bg-green-50/30' : 'border-gray-100'}`}>
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center mr-4 ${tieneSesion ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {tieneSesion ? <FiUnlock size={20} /> : <FiLock size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm">{g.materia_nombre}</h4>
                                        <span className="text-xs text-gray-400 font-bold">{g.grupo_nombre} · {g.inscritos_actuales} alumnos</span>
                                    </div>
                                    {tieneSesion && (
                                        <span className="ml-auto text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-md">Abierta</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Historial */}
            <HistorialSection
                historial={historialFiltrado}
                showHistorial={showHistorial}
                setShowHistorial={setShowHistorial}
                filtroMateria={filtroMateria}
                setFiltroMateria={setFiltroMateria}
                materiasUnicas={materiasUnicas}
                showDocente={false}
            />
        </div>
    );
}
