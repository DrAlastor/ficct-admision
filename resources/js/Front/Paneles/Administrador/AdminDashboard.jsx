import React from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head } from '@inertiajs/react';
import { FiSearch, FiUsers, FiShield, FiActivity, FiUserPlus } from 'react-icons/fi';

export default function AdminDashboard({ auth, usuarios = [] }) {
    // Helper para obtener el nombre completo o un texto por defecto
    const getFullName = (u) => {
        if (u.nombres) {
            return `${u.nombres} ${u.apellido_paterno} ${u.apellido_materno || ''}`.trim();
        }
        return 'Usuario del Sistema';
    };

    // Helper para badge de rol
    const getRoleBadge = (rolNombre) => {
        const lower = rolNombre.toLowerCase();
        if (lower.includes('admin')) {
            return <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-[10px] tracking-widest uppercase border border-red-200">ADMINISTRADOR</span>;
        }
        if (lower.includes('docente')) {
            return <span className="bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-full text-[10px] tracking-widest uppercase border border-indigo-200">DOCENTE</span>;
        }
        return <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-[10px] tracking-widest uppercase border border-green-200">POSTULANTE</span>;
    };

    // Estadísticas
    const totalUsuarios = usuarios.length;
    const totalAdmins = usuarios.filter(u => u.rol_nombre.toLowerCase().includes('admin')).length;
    const totalDocentes = usuarios.filter(u => u.rol_nombre.toLowerCase().includes('docente')).length;
    const totalPostulantes = usuarios.filter(u => !u.rol_nombre.toLowerCase().includes('admin') && !u.rol_nombre.toLowerCase().includes('docente')).length;

    return (
        <SidebarLayout title="PANEL DE ADMINISTRACIÓN" subtitle="CONTROL Y GESTIÓN DE USUARIOS">
            <Head title="Administrador - Dashboard" />

            {/* Banner de Bienvenida Premium */}
            <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-black rounded-2xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 opacity-10 rounded-full blur-3xl -mt-20 -mr-20"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-black mb-2 tracking-tight">¡Bienvenido, {auth.user.codigo_inicio}!</h2>
                    <p className="text-gray-300 font-medium max-w-2xl text-lg">
                        Estás en el centro de control. Desde aquí puedes monitorear y gestionar todos los usuarios, docentes y postulantes registrados en el sistema.
                    </p>
                </div>
            </div>

            {/* Tarjetas de Estadísticas Estilo Premium */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-xl text-gray-700 mr-4 group-hover:scale-110 transition-transform shadow-inner">
                        <FiUsers size={28} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Usuarios</div>
                        <div className="text-3xl font-black text-gray-800 tracking-tight">{totalUsuarios}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                    <div className="bg-gradient-to-br from-red-100 to-red-200 p-4 rounded-xl text-red-600 mr-4 group-hover:scale-110 transition-transform shadow-inner">
                        <FiShield size={28} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Administradores</div>
                        <div className="text-3xl font-black text-gray-800">{totalAdmins}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                    <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-4 rounded-xl text-indigo-600 mr-4 group-hover:scale-110 transition-transform shadow-inner">
                        <FiActivity size={28} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Docentes Activos</div>
                        <div className="text-2xl font-black text-gray-800">{totalDocentes}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                    <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl text-green-600 mr-4 group-hover:scale-110 transition-transform shadow-inner">
                        <FiUserPlus size={28} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Postulantes</div>
                        <div className="text-3xl font-black text-gray-800 tracking-tight">{totalPostulantes}</div>
                    </div>
                </div>
            </div>

            {/* Tabla Principal */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-wide flex items-center">
                        <span className="w-2 h-6 bg-red-500 rounded-full mr-3"></span>
                        Gestión de Usuarios
                    </h3>
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiSearch className="text-gray-400" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Buscar por CI, nombre, cargo o correo..." 
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-shadow shadow-sm"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-100">
                                <th className="pb-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">INFORMACIÓN PERSONAL</th>
                                <th className="pb-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">DOCUMENTO CI</th>
                                <th className="pb-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">POSICIÓN / CARGO</th>
                                <th className="pb-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">ACCESO A SISTEMA</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {usuarios.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-bold text-sm shadow-md group-hover:bg-red-600 transition-colors">
                                                {u.nombres ? u.nombres.substring(0, 1).toUpperCase() : u.codigo_inicio.substring(0, 1).toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="font-bold text-gray-900 text-sm">{getFullName(u)}</div>
                                                <div className="text-xs text-gray-500 flex items-center mt-1 font-medium">
                                                    <span className="mr-1.5">📞</span> {u.telefono || 'Sin registro'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-sm font-bold text-gray-700">
                                        {u.ci || 'N/A'}
                                    </td>
                                    <td className="py-4 text-center">
                                        {getRoleBadge(u.rol_nombre)}
                                    </td>
                                    <td className="py-4">
                                        <div className="text-xs font-bold text-red-600 flex items-center mb-1">
                                            <span className="mr-1">✉</span> {u.codigo_inicio}
                                        </div>
                                        <div className="flex items-center">
                                            <span className={`w-2 h-2 rounded-full mr-1.5 ${u.estado === 'Activo' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                {u.estado || 'Desconocido'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </SidebarLayout>
    );
}
