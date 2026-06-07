import React from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link } from '@inertiajs/react';
import { FiCalendar, FiMapPin, FiCheckCircle, FiClock, FiUserCheck, FiBook, FiAward, FiAlertCircle } from 'react-icons/fi';

export default function EstudianteDashboard({ auth, materias = [], grupoAsignado }) {
    // Calculamos algunas estadísticas para las tarjetas superiores
    const totalMaterias = materias.length;
    // Simulación de promedios para UI (esto vendría del backend en un caso real)
    const promedioGeneral = 85; 

    return (
        <SidebarLayout title="PORTAL ESTUDIANTE" subtitle="TU HORARIO Y CLASES DEL SEMESTRE">
            <Head title="Estudiante - Dashboard" />

            {/* Banner de Bienvenida Premium */}
            {/* Puedes cambiar el color del banner donde dice Bienvenido modificando bg-[#24337A] */}
            <div className="bg-[#24337A] rounded-2xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mt-20 -mr-20"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-black mb-2 tracking-tight">¡Bienvenido, {auth.user.perfil?.nombres ? `${auth.user.perfil.nombres} ${auth.user.perfil.apellido_paterno || ''}`.trim() : auth.user.codigo_inicio}!</h2>
                    <p className="text-indigo-200 font-medium max-w-2xl text-lg">
                        Bienvenido a tu panel de estudiante. Aquí podrás revisar tus materias asignadas, conocer a tus docentes y ver tus horarios.
                    </p>
                </div>
            </div>

            {/* Tarjetas de Estadísticas Estilo Docente */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                    <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl text-green-600 mr-4 group-hover:scale-110 transition-transform">
                        <FiCheckCircle size={28} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Estado</div>
                        <div className="text-2xl font-black text-gray-800 tracking-tight">Habilitado</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-xl text-blue-600 mr-4 group-hover:scale-110 transition-transform">
                        <FiBook size={28} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Mis Materias</div>
                        <div className="text-3xl font-black text-gray-800">{totalMaterias}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                    <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-4 rounded-xl text-orange-600 mr-4 group-hover:scale-110 transition-transform">
                        <FiUserCheck size={28} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Mi Grupo</div>
                        <div className="text-2xl font-black text-gray-800">{grupoAsignado || 'S/G'}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                    <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-xl text-purple-600 mr-4 group-hover:scale-110 transition-transform">
                        <FiAward size={28} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Rendimiento</div>
                        <div className="text-3xl font-black text-gray-800 tracking-tight">{promedioGeneral}%</div>
                    </div>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Izquierda: Info Personal rápida */}
                <div className="lg:col-span-4">
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
                        <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-wide border-b border-gray-100 pb-3 mb-4 flex items-center">
                            <span className="w-2 h-6 bg-[#07074E] rounded-full mr-3"></span>
                            Mi Cohorte
                        </h3>
                        
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Grupo de Estudio</span>
                                <span className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded font-bold shadow-sm">OFICIAL</span>
                            </div>
                            <div className="text-4xl font-black text-blue-900 tracking-tight mb-2">{grupoAsignado || 'Sin Asignar'}</div>
                            <p className="text-sm text-blue-700 font-medium">Asiste a tus clases en los horarios indicados junto con tu cohorte asignada.</p>
                        </div>
                        
                        <Link 
                            href={route('profile.edit')} 
                            className="w-full flex items-center justify-center py-3 px-4 bg-[#0F172A] text-white rounded-xl font-bold tracking-wide hover:bg-black hover:shadow-lg transition-all duration-300"
                        >
                            <FiUserCheck className="mr-2" />
                            Ver Mi Perfil
                        </Link>
                    </div>
                </div>

                {/* Derecha: Horario y Materias */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-wide border-b border-gray-100 pb-3 mb-6 flex items-center">
                            <span className="w-2 h-6 bg-[#07074E] rounded-full mr-3"></span>
                            Mis Materias y Horarios
                        </h3>
                        
                        <div className="space-y-4">
                            {materias && materias.length > 0 ? (
                                materias.map((mat, index) => (
                                    <div key={index} className="group flex flex-col sm:flex-row items-start sm:items-center p-5 border border-gray-100 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-md transition-all duration-300 relative overflow-hidden">
                                        {/* Accent bar */}
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-indigo-500 transition-colors"></div>

                                        <div className="bg-gradient-to-br from-indigo-100 to-blue-200 text-indigo-700 p-4 rounded-xl mr-5 mb-4 sm:mb-0 shadow-inner group-hover:scale-110 transition-transform">
                                            <FiCalendar size={28} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-gray-800 text-xl tracking-tight mb-1">{mat.materia}</h4>
                                            <div className="text-sm text-gray-500 font-medium flex items-center">
                                                <FiUserCheck className="mr-1.5 text-indigo-400" /> 
                                                Docente: <span className="ml-1 text-gray-700">{mat.docente || 'Por Asignar'}</span>
                                            </div>
                                        </div>
                                        <div className="sm:text-right mt-4 sm:mt-0 w-full sm:w-auto bg-gray-50 sm:bg-transparent p-4 sm:p-0 rounded-xl border sm:border-none border-gray-100">
                                            <div className="text-sm font-bold text-[#0F172A] flex items-center sm:justify-end mb-1">
                                                <FiClock className="mr-1.5 text-blue-500" /> 
                                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded mr-2">{mat.dia}</span> 
                                                {mat.hora_inicio} - {mat.hora_fin}
                                            </div>
                                            <div className="text-xs font-semibold text-gray-500 flex items-center sm:justify-end mb-3">
                                                <FiMapPin className="mr-1.5 text-red-500" /> Aula: <span className="ml-1 text-gray-800">{mat.aula}</span>
                                            </div>
                                            <div className="flex justify-start sm:justify-end">
                                                <button className="text-xs bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-indigo-700 hover:shadow-md transition-all duration-200 flex items-center">
                                                    <FiCheckCircle className="mr-1.5" /> Asistencia
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                        <FiAlertCircle className="text-gray-400" size={32} />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-700 mb-1">Aún no hay materias</h4>
                                    <p className="text-gray-500 font-medium max-w-sm mx-auto">
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
