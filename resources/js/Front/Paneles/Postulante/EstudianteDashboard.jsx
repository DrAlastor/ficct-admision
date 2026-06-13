import React from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { FiCalendar, FiMapPin, FiCheckCircle, FiClock, FiUserCheck, FiBook, FiAward, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';

import { useState } from 'react';
import InscribirGrupoModal from './InscribirGrupoModal';

export default function EstudianteDashboard({ materias = [], grupoAsignado, inscripcionesAbiertas = false, yaInscrito = false, gruposDisponibles = [] }) {
    const { auth } = usePage().props;
    // Agrupar materias para evitar repeticiones por días
    const materiasUnicasMap = new Map();
    materias.forEach(mat => {
        if (!materiasUnicasMap.has(mat.materia)) {
            materiasUnicasMap.set(mat.materia, { ...mat, dia: 'Lun - Vie' });
        }
    });
    const materiasUnicas = Array.from(materiasUnicasMap.values());

    const totalMaterias = materiasUnicas.length;
    const [showEnrollModal, setShowEnrollModal] = useState(false);

    // Simulación de promedios para UI (esto vendría del backend en un caso real)
    const promedioGeneral = 85; 

    return (
        <SidebarLayout title="PORTAL ESTUDIANTE" subtitle="TU HORARIO Y CLASES DEL SEMESTRE">
            <Head title="Estudiante - Dashboard" />

            {/* Banner de Bienvenida Premium */}
            <div className="relative overflow-hidden rounded-3xl mb-8 shadow-2xl bg-[#07074E] text-white p-8 md:p-12">
                {/* Background abstract shapes */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-indigo-500/10 rounded-full blur-3xl -mt-20 -mr-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-red-500/20 to-pink-500/5 rounded-full blur-3xl -mb-10 -ml-10 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-md">
                            ¡Bienvenido, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-100">{auth.user.perfil?.nombres ? `${auth.user.perfil.nombres}` : auth.user.codigo_inicio}</span>!
                        </h2>
                        <p className="text-blue-100/90 font-medium max-w-2xl text-lg md:text-xl drop-shadow">
                            Bienvenido a tu panel estudiantil. Aquí podrás revisar tus materias asignadas, conocer a tus docentes y ver tus horarios de clase.
                        </p>
                    </div>
                    <div className="mt-8 md:mt-0 flex flex-col items-end space-y-3">
                        <span className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center shadow-lg transition-transform hover:scale-105">
                            <span className="w-3 h-3 rounded-full bg-emerald-400 mr-3 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
                            Activo
                        </span>
                    </div>
                </div>
            </div>

            {/* CTA Inscripción */}
            {!yaInscrito && inscripcionesAbiertas && (
                <div className="mb-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden group">
                    <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/3 -translate-y-1/4 group-hover:scale-110 transition-transform duration-700">
                        <FiCheckCircle size={250} />
                    </div>
                    <div className="relative z-10 mb-6 md:mb-0">
                        <h3 className="text-3xl font-black mb-2 drop-shadow-md">¡Inscripciones Abiertas!</h3>
                        <p className="text-green-50 font-medium text-lg max-w-2xl">
                            Es hora de elegir tu grupo para el semestre. Tienes la oportunidad de seleccionar el grupo y turno de tu preferencia antes de que se agoten los cupos.
                        </p>
                    </div>
                    <button 
                        onClick={() => setShowEnrollModal(true)}
                        className="relative z-10 bg-white text-green-700 hover:bg-green-50 px-8 py-4 rounded-2xl font-black text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all transform hover:-translate-y-1"
                    >
                        Inscribir Grupo Ahora
                    </button>
                </div>
            )}

            {/* Tarjetas de Estadísticas Estilo Premium */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform duration-500 text-green-900 pointer-events-none">
                        <FiCheckCircle size={100} />
                    </div>
                    <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-2xl text-green-600 mr-5 group-hover:scale-110 transition-transform shadow-inner relative z-10">
                        <FiCheckCircle size={28} />
                    </div>
                    <div className="relative z-10">
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Estado General</div>
                        <div className="text-2xl font-black text-gray-800 tracking-tight leading-none">Habilitado</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform duration-500 text-blue-900 pointer-events-none">
                        <FiBook size={100} />
                    </div>
                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-2xl text-blue-600 mr-5 group-hover:scale-110 transition-transform shadow-inner relative z-10">
                        <FiBook size={28} />
                    </div>
                    <div className="relative z-10">
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Mis Materias</div>
                        <div className="text-3xl font-black text-gray-800 leading-none">{totalMaterias}</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform duration-500 text-orange-900 pointer-events-none">
                        <FiUserCheck size={100} />
                    </div>
                    <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-4 rounded-2xl text-orange-600 mr-5 group-hover:scale-110 transition-transform shadow-inner relative z-10">
                        <FiUserCheck size={28} />
                    </div>
                    <div className="relative z-10">
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Mi Grupo</div>
                        <div className="text-3xl font-black text-gray-800 leading-none">{grupoAsignado || 'S/G'}</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform duration-500 text-purple-900 pointer-events-none">
                        <FiTrendingUp size={100} />
                    </div>
                    <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-2xl text-purple-600 mr-5 group-hover:scale-110 transition-transform shadow-inner relative z-10">
                        <FiAward size={28} />
                    </div>
                    <div className="relative z-10">
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Rendimiento</div>
                        <div className="text-3xl font-black text-gray-800 tracking-tight leading-none">{promedioGeneral}%</div>
                    </div>
                </div>
            </div>

            <InscribirGrupoModal 
                show={showEnrollModal} 
                onClose={() => setShowEnrollModal(false)} 
                grupos={gruposDisponibles} 
            />

            {/* Contenido Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Izquierda: Info Personal rápida */}
                <div className="lg:col-span-4">
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 sticky top-6">
                        <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-wide border-b border-gray-100 pb-3 mb-6 flex items-center">
                            <span className="w-2 h-6 bg-[#07074E] rounded-full mr-3"></span>
                            Mi Cohorte
                        </h3>
                        
                        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-800 p-6 rounded-2xl shadow-lg mb-8 overflow-hidden text-white">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mt-10 -mr-10"></div>
                            
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Grupo de Estudio</span>
                                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-md font-black shadow-sm border border-white/10 tracking-widest">
                                    OFICIAL
                                </span>
                            </div>
                            
                            <div className="text-5xl font-black tracking-tighter mb-4 relative z-10 drop-shadow-md">
                                {grupoAsignado || 'S/A'}
                            </div>
                            
                            <p className="text-sm text-blue-100 font-medium relative z-10 leading-relaxed opacity-90">
                                Asiste a tus clases en los horarios indicados junto con tu cohorte asignada para el semestre.
                            </p>
                        </div>
                        
                        <Link 
                            href={route('profile.show')} 
                            className="w-full flex items-center justify-center py-4 px-4 bg-gray-50 border border-gray-200 text-gray-700 rounded-2xl font-black tracking-wide hover:bg-white hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all duration-300 group"
                        >
                            <div className="bg-white p-2 rounded-xl shadow-sm mr-3 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <FiUserCheck size={18} />
                            </div>
                            Revisar Mi Perfil
                        </Link>
                    </div>
                </div>

                {/* Derecha: Horario y Materias */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-wide border-b border-gray-100 pb-3 mb-6 flex items-center">
                            <span className="w-2 h-6 bg-[#07074E] rounded-full mr-3"></span>
                            Mis Materias y Horarios
                        </h3>
                        
                        <div className="space-y-5">
                            {materiasUnicas && materiasUnicas.length > 0 ? (
                                materiasUnicas.map((mat, index) => (
                                    <div key={index} className="group flex flex-col sm:flex-row items-start sm:items-center p-5 border border-gray-100 rounded-2xl hover:border-indigo-200 hover:bg-gray-50/50 hover:shadow-lg transition-all duration-300 relative overflow-hidden bg-white">
                                        {/* Accent bar */}
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-transparent group-hover:bg-indigo-500 group-hover:shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-300"></div>

                                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/50 text-indigo-600 p-4 rounded-2xl mr-5 mb-4 sm:mb-0 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                            <FiCalendar size={28} />
                                        </div>
                                        
                                        <div className="flex-1 w-full">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                                                <h4 className="font-black text-gray-900 text-xl tracking-tight leading-tight">{mat.materia}</h4>
                                                <span className="inline-flex mt-2 sm:mt-0 items-center justify-center bg-blue-50 text-blue-700 text-xs font-black px-3 py-1 rounded-lg border border-blue-100">
                                                    {mat.dia}
                                                </span>
                                            </div>
                                            
                                            <div className="text-sm text-gray-500 font-medium flex items-center mt-2">
                                                <FiUserCheck className="mr-1.5 text-indigo-400" /> 
                                                Docente: <span className="ml-1 text-gray-700 font-bold">{mat.docente || 'Por Asignar'}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 sm:mt-0 w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6 sm:ml-4">
                                            <div className="text-[15px] font-black text-[#0F172A] flex items-center mb-1 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                <FiClock className="mr-2 text-indigo-500" /> 
                                                {mat.hora_inicio} - {mat.hora_fin}
                                            </div>
                                            <div className="text-xs font-black text-gray-600 flex items-center bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm sm:mt-2">
                                                <FiMapPin className="mr-1.5 text-red-500" /> Aula <span className="ml-1 text-gray-900">{mat.aula}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                                        <FiAlertCircle className="text-gray-400" size={40} />
                                    </div>
                                    <h4 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">Aún no hay materias</h4>
                                    <p className="text-gray-500 font-medium max-w-md mx-auto text-lg leading-relaxed">
                                        No tienes materias asignadas todavía. Tu horario aparecerá aquí cuando se confirmen tus grupos.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
