import React from 'react';
import { router } from '@inertiajs/react';
import { FiBook, FiUsers, FiUserCheck, FiKey, FiCheckCircle, FiXCircle, FiSquare, FiPlay, FiUnlock, FiCalendar } from 'react-icons/fi';
import HistorialSection from './HistorialSection';

function GrupoCardAdmin({ grupo, sesionAbierta }) {
    const handleAbrir = () => {
        router.post(route('asistencia.abrir'), { grupo_codigo: grupo.codigo }, { preserveScroll: true });
    };
    const handleCerrar = () => {
        router.post(route('asistencia.cerrar', sesionAbierta.id), {}, { preserveScroll: true });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <div className="p-5 border-b border-gray-50 bg-gradient-to-br from-gray-50 to-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center mr-4 text-indigo-600 group-hover:scale-110 transition-transform shadow-sm">
                            <FiBook size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-gray-800 text-lg tracking-tight">{grupo.materia_nombre}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">
                                    {grupo.grupo_nombre}
                                </span>
                                <span className="text-xs text-gray-400 font-medium flex items-center">
                                    <FiUsers className="mr-1" size={12} /> {grupo.inscritos_actuales} inscritos
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-3 text-xs text-gray-500 font-medium flex items-center">
                    <FiUserCheck className="mr-1.5 text-indigo-400" /> Docente: <span className="ml-1 text-gray-700 font-bold">{grupo.docente}</span>
                </div>
            </div>

            <div className="p-5">
                {sesionAbierta ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse mr-2"></span>
                                <span className="text-sm font-black text-green-700">Sesión Abierta</span>
                            </div>
                            <span className="text-xs text-gray-400 font-mono">{sesionAbierta.hora_apertura?.substring(11, 16)}</span>
                        </div>

                        {sesionAbierta.contrasena && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-700 flex items-center"><FiKey className="mr-1.5" /> Contraseña:</span>
                                <span className="font-mono font-black text-amber-900 text-lg tracking-[0.3em]">{sesionAbierta.contrasena}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <span className="text-xs font-bold text-gray-600">Presentes:</span>
                            <span className="font-black text-indigo-700">{sesionAbierta.presentes} / {sesionAbierta.total}</span>
                        </div>

                        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <span className="text-xs font-bold text-gray-600">Docente:</span>
                            {sesionAbierta.docente_presente ? (
                                <span className="text-xs font-bold text-green-600 flex items-center bg-green-50 px-2 py-1 rounded-md"><FiCheckCircle className="mr-1" /> Presente</span>
                            ) : (
                                <span className="text-xs font-bold text-red-500 flex items-center bg-red-50 px-2 py-1 rounded-md"><FiXCircle className="mr-1" /> Sin marcar</span>
                            )}
                        </div>

                        <button
                            onClick={handleCerrar}
                            className="w-full flex items-center justify-center py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold text-sm transition-all border border-red-200 hover:border-red-300 shadow-sm"
                        >
                            <FiSquare className="mr-2" /> Cerrar Sesión
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleAbrir}
                        className="w-full flex items-center justify-center py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg"
                    >
                        <FiPlay className="mr-2" /> Abrir Sesión de Asistencia
                    </button>
                )}
            </div>
        </div>
    );
}

export default function AdminView({ 
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
    const sesionPorGrupo = {};
    if (sesionesAbiertas) {
        sesionesAbiertas.forEach(s => { sesionPorGrupo[s.grupo_codigo] = s; });
    }

    return (
        <div className="space-y-8">
            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center group hover:shadow-md transition-all">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                        <FiBook size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Grupos</div>
                        <div className="text-2xl font-black text-gray-800">{grupos.length}</div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center group hover:shadow-md transition-all">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                        <FiUnlock size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Sesiones Abiertas</div>
                        <div className="text-2xl font-black text-green-700">{sesionesAbiertas.length}</div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center group hover:shadow-md transition-all">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 text-purple-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                        <FiCalendar size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Sesiones Registradas</div>
                        <div className="text-2xl font-black text-gray-800">{historial.length}</div>
                    </div>
                </div>
            </div>

            {/* Grilla de grupos */}
            <div>
                <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide mb-4 flex items-center">
                    <span className="w-2 h-6 bg-[#07074E] rounded-full mr-3"></span>
                    Grupos y Sesiones
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {grupos.map(grupo => (
                        <GrupoCardAdmin key={grupo.codigo} grupo={grupo} sesionAbierta={sesionPorGrupo[grupo.codigo]} />
                    ))}
                </div>
            </div>

            {/* Historial */}
            <HistorialSection
                historial={historialFiltrado}
                showHistorial={showHistorial}
                setShowHistorial={setShowHistorial}
                filtroMateria={filtroMateria}
                setFiltroMateria={setFiltroMateria}
                materiasUnicas={materiasUnicas}
                showDocente={true}
            />
        </div>
    );
}
