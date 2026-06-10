import React from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { FiUsers, FiShield, FiActivity, FiUserPlus, FiMonitor, FiUserCheck, FiClock, FiSettings } from 'react-icons/fi';

export default function AdminDashboard({ stats, bitacoraReciente = [] }) {
    const { auth } = usePage().props;
    
    // Formatear Fecha Exacta (Igual a la tabla de Bitácora)
    const formatExactDate = (dateString) => {
        // Asegurar que JS interprete la fecha como UTC para que la convierta correctamente a la hora local (Bolivia)
        const safeDate = dateString.includes('T') ? dateString : dateString.replace(' ', 'T') + 'Z';
        const date = new Date(safeDate);
        const fecha = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const hora = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return `${fecha} | ${hora}`;
    };

    return (
        <SidebarLayout title="PANEL DE ADMINISTRACIÓN" subtitle="CENTRO DE CONTROL">
            <Head title="Administrador - Dashboard" />

            {/* Banner de Bienvenida Premium */}
            <div className="bg-[#24337A] rounded-3xl p-8 md:p-10 mb-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl -mt-20 -mr-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-20 w-40 h-40 bg-blue-400 opacity-20 rounded-full blur-2xl -mb-10 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                        <h2 className="text-4xl font-black mb-3 tracking-tight">¡Bienvenido, {auth.user.perfil?.nombres ? `${auth.user.perfil.nombres}` : auth.user.codigo_inicio}!</h2>
                        <p className="text-gray-300 font-medium max-w-2xl text-lg">
                            Estás en el centro de control del sistema de admisión. Aquí tienes un resumen general del estado del sistema.
                        </p>
                    </div>
                    <div className="mt-6 md:mt-0">
                        <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest flex items-center border border-white/10 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                            Sistema Online
                        </span>
                    </div>
                </div>
            </div>

            {/* Tarjetas de Estadísticas Estilo Premium */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform duration-500 text-gray-900 pointer-events-none">
                        <FiMonitor size={100} />
                    </div>
                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-2xl text-blue-600 mr-5 group-hover:scale-110 transition-transform shadow-inner relative z-10">
                        <FiMonitor size={28} />
                    </div>
                    <div className="relative z-10">
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Usuarios Conectados</div>
                        <div className="flex items-end">
                            <span className="text-3xl font-black text-gray-800 tracking-tight leading-none">{stats?.online || 0}</span>
                            <span className="text-sm text-gray-400 font-bold ml-2 mb-1">/ {stats?.total || 0}</span>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform duration-500 text-indigo-900 pointer-events-none">
                        <FiUserPlus size={100} />
                    </div>
                    <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-4 rounded-2xl text-indigo-600 mr-5 group-hover:scale-110 transition-transform shadow-inner relative z-10">
                        <FiUserPlus size={28} />
                    </div>
                    <div className="relative z-10">
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Postulantes Reg.</div>
                        <div className="text-3xl font-black text-gray-800 leading-none">{stats?.postulantes || 0}</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform duration-500 text-emerald-900 pointer-events-none">
                        <FiUserCheck size={100} />
                    </div>
                    <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 p-4 rounded-2xl text-emerald-600 mr-5 group-hover:scale-110 transition-transform shadow-inner relative z-10">
                        <FiUserCheck size={28} />
                    </div>
                    <div className="relative z-10">
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Docentes Activos</div>
                        <div className="text-3xl font-black text-gray-800 leading-none">{stats?.docentes || 0}</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform duration-500 text-red-900 pointer-events-none">
                        <FiShield size={100} />
                    </div>
                    <div className="bg-gradient-to-br from-red-100 to-red-200 p-4 rounded-2xl text-red-600 mr-5 group-hover:scale-110 transition-transform shadow-inner relative z-10">
                        <FiShield size={28} />
                    </div>
                    <div className="relative z-10">
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Administradores</div>
                        <div className="text-3xl font-black text-gray-800 leading-none">{stats?.admins || 0}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Accesos Rápidos */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-wide flex items-center mb-4">
                        <span className="w-2 h-6 bg-[#24337A] rounded-full mr-3"></span>
                        Accesos Rápidos
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href={route('usuarios.index')} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group flex items-start">
                            <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl group-hover:scale-110 transition-transform mr-4 shrink-0">
                                <FiUsers size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors">Gestión de Usuarios</h4>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">Agrega, edita o elimina usuarios, docentes y postulantes del sistema.</p>
                            </div>
                        </Link>

                        <Link href={route('roles.index')} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group flex items-start">
                            <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl group-hover:scale-110 transition-transform mr-4 shrink-0">
                                <FiShield size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900 text-lg mb-1 group-hover:text-purple-600 transition-colors">Roles y Permisos</h4>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">Configura los niveles de acceso y los permisos de cada usuario.</p>
                            </div>
                        </Link>

                        <Link href={route('bitacora.index')} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group flex items-start">
                            <div className="bg-amber-50 text-amber-600 p-4 rounded-2xl group-hover:scale-110 transition-transform mr-4 shrink-0">
                                <FiActivity size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900 text-lg mb-1 group-hover:text-amber-600 transition-colors">Auditoría (Bitácora)</h4>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">Revisa el historial de acciones y movimientos dentro del sistema.</p>
                            </div>
                        </Link>

                        <Link href={route('profile.show')} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group flex items-start">
                            <div className="bg-gray-100 text-gray-600 p-4 rounded-2xl group-hover:scale-110 transition-transform mr-4 shrink-0">
                                <FiSettings size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900 text-lg mb-1 group-hover:text-gray-900 transition-colors">Mi Perfil</h4>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">Consulta tus datos personales e ingresa a gestionar tu contraseña.</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Timeline de Actividad Reciente */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-wide flex items-center">
                            <span className="w-2 h-6 bg-red-500 rounded-full mr-3"></span>
                            Actividad Reciente
                        </h3>
                        <Link href={route('bitacora.index')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-3 py-1.5 rounded-lg">
                            Ver todo
                        </Link>
                    </div>

                    <div className="flex-1 relative">
                        {bitacoraReciente.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-10">
                                <FiClock size={32} className="mb-3 opacity-50" />
                                <p className="font-medium text-sm">No hay actividad reciente.</p>
                            </div>
                        ) : (
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100"></div>
                        )}

                        <div className="space-y-6 relative z-10">
                            {bitacoraReciente.map((evento, idx) => (
                                <div key={idx} className="flex items-start">
                                    <div className="w-8 h-8 rounded-full bg-white border-[3px] border-indigo-100 flex items-center justify-center shrink-0 z-10 mt-1 shadow-sm">
                                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <p className="text-sm font-bold text-gray-900 mb-0.5">
                                            {evento.accion}
                                        </p>
                                        {evento.nombres && (
                                            <p className="text-xs text-gray-500 font-medium">
                                                Por <span className="font-bold">{evento.nombres} {evento.apellido_paterno}</span>
                                            </p>
                                        )}
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2 flex items-center">
                                            <FiClock className="mr-1" /> {formatExactDate(evento.fecha_hora)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </SidebarLayout>
    );
}
