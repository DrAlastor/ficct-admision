import React, { useState } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head } from '@inertiajs/react';
import { FiBook, FiUsers, FiClock, FiFileText, FiChevronRight } from 'react-icons/fi';
import ListaAlumnos from './ListaAlumnos';

export default function DocenteDashboard({ auth, perfil, materias = [] }) {
    const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);

    // Calcular estadísticas
    const totalMaterias = materias.length;
    const totalAlumnos = materias.reduce((acc, curr) => acc + curr.inscritos, 0);
    // Asumimos 3 horas (2 clases de 1.5h) por grupo a la semana como ejemplo
    const horasSemana = totalMaterias * 3; 

    return (
        <SidebarLayout title="PORTAL DOCENTE" subtitle="GESTIÓN ACADÉMICA Y CONTROL DE ALUMNOS">
            <Head title="Docente - Dashboard" />

            {/* Banner de Bienvenida */}
            {/* Puedes cambiar el color del banner donde dice Bienvenido modificando bg-[#24337A] */}
            <div className="bg-[#24337A] rounded-2xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mt-20 -mr-20"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-black mb-2 tracking-tight">¡Bienvenido, {auth.user.perfil?.nombres ? `${auth.user.perfil.nombres} ${auth.user.perfil.apellido_paterno || ''}`.trim() : auth.user.codigo_inicio}!</h2>
                    <p className="text-indigo-200 font-medium max-w-2xl text-lg">
                        Administra tus grupos, registra calificaciones y gestiona el material académico para el semestre actual.
                    </p>
                </div>
            </div>

            {/* Tarjetas de Acceso Rápido */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-xl text-blue-600 mr-4 group-hover:scale-110 transition-transform">
                        <FiBook size={28} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Mis Grupos</div>
                        <div className="text-3xl font-black text-gray-800">{totalMaterias}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                    <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl text-green-600 mr-4 group-hover:scale-110 transition-transform">
                        <FiUsers size={28} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Alumnos</div>
                        <div className="text-3xl font-black text-gray-800">{totalAlumnos}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                    <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-4 rounded-xl text-orange-600 mr-4 group-hover:scale-110 transition-transform">
                        <FiClock size={28} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Horas/Semana</div>
                        <div className="text-3xl font-black text-gray-800">{horasSemana}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                    <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-xl text-purple-600 mr-4 group-hover:scale-110 transition-transform">
                        <FiFileText size={28} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Exámenes</div>
                        <div className="text-3xl font-black text-gray-800 tracking-tight">Activos</div>
                    </div>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Columna Izquierda: Lista de Grupos */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
                        <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-wide border-b border-gray-100 pb-3 mb-4 flex items-center">
                            <span className="w-2 h-6 bg-[#07074E] rounded-full mr-3"></span>
                            Mis Materias
                        </h3>
                        
                        {materias.length === 0 ? (
                            <p className="text-gray-500 italic text-sm">No tienes materias asignadas este semestre.</p>
                        ) : (
                            <div className="space-y-3">
                                {materias.map((materia) => (
                                    <div 
                                        key={materia.grupo_codigo}
                                        onClick={() => setGrupoSeleccionado(materia)}
                                        className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 group relative overflow-hidden ${
                                            grupoSeleccionado?.grupo_codigo === materia.grupo_codigo 
                                            ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                                            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {/* Color indicator */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${grupoSeleccionado?.grupo_codigo === materia.grupo_codigo ? 'bg-indigo-500' : 'bg-transparent group-hover:bg-indigo-300'}`}></div>

                                        <div className="flex justify-between items-start mb-2 pl-2">
                                            <span className="font-bold text-gray-800 leading-tight pr-2">{materia.materia}</span>
                                            <span className="bg-[#0F172A] text-white text-[10px] font-bold px-2 py-1 rounded tracking-widest shrink-0 shadow-sm">
                                                {materia.grupo_nombre}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center pl-2 mb-2">
                                            <FiClock className="mr-1.5 text-indigo-400" /> {materia.horario}
                                        </div>
                                        <div className="flex justify-between items-center pl-2 mt-3 pt-3 border-t border-gray-100">
                                            <span className="text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded-md border shadow-sm">Aula: {materia.aula}</span>
                                            <div className="flex items-center text-xs font-medium text-gray-500">
                                                <FiUsers className="mr-1" /> {materia.inscritos} / {materia.cupo}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Columna Derecha: Vista del Grupo Seleccionado (ListaAlumnos) */}
                <div className="lg:col-span-8">
                    {grupoSeleccionado ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <ListaAlumnos grupo={grupoSeleccionado} />
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center h-full flex flex-col justify-center items-center">
                            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <FiUsers className="text-indigo-300" size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">Listado no seleccionado</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Selecciona una materia del panel izquierdo para ver el listado de alumnos y registrar las notas del semestre.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </SidebarLayout>
    );
}
