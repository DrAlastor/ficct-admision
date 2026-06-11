import React, { useState } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, usePage } from '@inertiajs/react';
import { FiBook, FiUsers, FiClock, FiFileText, FiChevronRight } from 'react-icons/fi';
import ListaAlumnos from './ListaAlumnos';

export default function DocenteDashboard({ perfil, materias = [] }) {
    const { auth } = usePage().props;
    const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);

    // Agrupar materias para evitar repeticiones de días
    const materiasUnicasMap = new Map();
    materias.forEach(mat => {
        if (!materiasUnicasMap.has(mat.grupo_codigo)) {
            // Extraer la hora (asume formato "Lunes 11:30 - 13:00")
            const partes = mat.horario ? mat.horario.split(' ') : [];
            const horaStr = partes.length > 1 ? partes.slice(1).join(' ') : mat.horario;
            materiasUnicasMap.set(mat.grupo_codigo, { ...mat, horario: 'Lun - Vie ' + horaStr });
        }
    });
    const materiasUnicas = Array.from(materiasUnicasMap.values());

    // Calcular estadísticas
    const totalMaterias = materiasUnicas.length;
    const totalAlumnos = materiasUnicas.reduce((acc, curr) => acc + curr.inscritos, 0);
    // Cada grupo/materia implica 1.5 horas al día por 5 días (Lunes a Viernes) = 7.5 horas por grupo a la semana
    const horasSemana = totalMaterias * 7.5; 

    return (
        <SidebarLayout title="PORTAL DOCENTE" subtitle="GESTIÓN ACADÉMICA Y CONTROL DE ALUMNOS">
            <Head title="Docente - Dashboard" />

            {/* Banner de Bienvenida Premium */}
            <div className="relative overflow-hidden rounded-3xl mb-8 shadow-2xl bg-[#07074E] text-white p-8 md:p-12">
                {/* Background abstract shapes */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-indigo-500/10 rounded-full blur-3xl -mt-20 -mr-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-red-500/20 to-pink-500/5 rounded-full blur-3xl -mb-10 -ml-10 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-md">
                            ¡Bienvenido Docente, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-100">{auth.user.perfil?.nombres ? `${auth.user.perfil.nombres}` : auth.user.codigo_inicio}</span>!
                        </h2>
                        <p className="text-blue-100/90 font-medium max-w-2xl text-lg md:text-xl drop-shadow">
                            Estás en el panel principal docente. Aquí tienes un resumen general de tu actividad en el sistema.
                        </p>
                    </div>
                    <div className="mt-8 md:mt-0">
                        <span className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center shadow-lg transition-transform hover:scale-105">
                            <span className="w-3 h-3 rounded-full bg-emerald-400 mr-3 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
                            Sistema Online
                        </span>
                    </div>
                </div>
            </div>

            {/* Tarjetas de Acceso Rápido / Estadísticas Premium */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform duration-500 text-blue-900 pointer-events-none">
                        <FiBook size={100} />
                    </div>
                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-2xl text-blue-600 mr-5 group-hover:scale-110 transition-transform shadow-inner relative z-10">
                        <FiBook size={28} />
                    </div>
                    <div className="relative z-10">
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Mis Grupos</div>
                        <div className="text-3xl font-black text-gray-800 leading-none">{totalMaterias}</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform duration-500 text-emerald-900 pointer-events-none">
                        <FiUsers size={100} />
                    </div>
                    <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 p-4 rounded-2xl text-emerald-600 mr-5 group-hover:scale-110 transition-transform shadow-inner relative z-10">
                        <FiUsers size={28} />
                    </div>
                    <div className="relative z-10">
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Total Alumnos</div>
                        <div className="text-3xl font-black text-gray-800 leading-none">{totalAlumnos}</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform duration-500 text-amber-900 pointer-events-none">
                        <FiClock size={100} />
                    </div>
                    <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-4 rounded-2xl text-amber-600 mr-5 group-hover:scale-110 transition-transform shadow-inner relative z-10">
                        <FiClock size={28} />
                    </div>
                    <div className="relative z-10">
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Horas/Semana</div>
                        <div className="text-3xl font-black text-gray-800 leading-none">{horasSemana}</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform duration-500 text-purple-900 pointer-events-none">
                        <FiFileText size={100} />
                    </div>
                    <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-2xl text-purple-600 mr-5 group-hover:scale-110 transition-transform shadow-inner relative z-10">
                        <FiFileText size={28} />
                    </div>
                    <div className="relative z-10">
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Exámenes</div>
                        <div className="text-3xl font-black text-gray-800 tracking-tight leading-none">Activos</div>
                    </div>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Columna Izquierda: Lista de Grupos */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-6 h-full flex flex-col">
                        <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-wide border-b border-gray-100 pb-3 mb-4 flex items-center">
                            <span className="w-2 h-6 bg-[#07074E] rounded-full mr-3"></span>
                            Mis Materias
                        </h3>
                        
                        {materiasUnicas.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <FiBook className="text-gray-300" size={24} />
                                </div>
                                <p className="text-gray-500 font-medium text-sm max-w-[200px]">No tienes materias asignadas este semestre.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                                {materiasUnicas.map((materia) => (
                                    <div 
                                        key={materia.grupo_codigo}
                                        onClick={() => setGrupoSeleccionado(materia)}
                                        className={`border rounded-2xl p-4 cursor-pointer transition-all duration-300 group relative overflow-hidden ${
                                            grupoSeleccionado?.grupo_codigo === materia.grupo_codigo 
                                            ? 'border-indigo-400 bg-indigo-50/50 shadow-md transform scale-[1.02]' 
                                            : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50 hover:-translate-y-0.5'
                                        }`}
                                    >
                                        {/* Color indicator */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300 ${
                                            grupoSeleccionado?.grupo_codigo === materia.grupo_codigo 
                                            ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' 
                                            : 'bg-transparent group-hover:bg-indigo-300'
                                        }`}></div>

                                        <div className="flex justify-between items-start mb-3 pl-3">
                                            <span className="font-black text-gray-800 leading-tight pr-2 text-[15px]">{materia.materia}</span>
                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-md tracking-widest shrink-0 shadow-sm transition-colors ${
                                                grupoSeleccionado?.grupo_codigo === materia.grupo_codigo
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-[#0F172A] text-white'
                                            }`}>
                                                {materia.grupo_nombre}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center pl-3 mb-3 font-medium">
                                            <FiClock className="mr-1.5 text-indigo-400" /> {materia.horario}
                                        </div>
                                        <div className="flex justify-between items-center pl-3 mt-3 pt-3 border-t border-gray-100/80">
                                            <span className="text-[11px] font-bold text-gray-600 bg-white px-2.5 py-1 rounded-lg border border-gray-100 shadow-sm">Aula: {materia.aula}</span>
                                            <div className="flex items-center text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                                                <FiUsers className="mr-1.5 text-gray-400" /> {materia.inscritos} <span className="mx-1 font-normal text-gray-300">/</span> {materia.cupo}
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
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                            <ListaAlumnos grupo={grupoSeleccionado} />
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center h-full flex flex-col justify-center items-center min-h-[500px]">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-indigo-100 blur-3xl rounded-full opacity-50"></div>
                                <div className="w-32 h-32 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full flex items-center justify-center shadow-inner relative z-10 border border-white">
                                    <FiUsers className="text-indigo-400" size={56} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">Selecciona un Grupo</h3>
                            <p className="text-gray-500 max-w-md mx-auto text-lg leading-relaxed">
                                Haz clic en una materia del panel izquierdo para acceder a la lista de alumnos, revisar asistencias y registrar notas.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </SidebarLayout>
    );
}
