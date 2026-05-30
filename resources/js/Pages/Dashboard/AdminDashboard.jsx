import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head } from '@inertiajs/react';
import { FiSearch } from 'react-icons/fi';

export default function AdminDashboard({ auth, usuarios }) {
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
            return <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-[10px] tracking-widest uppercase">ADMINISTRADOR</span>;
        }
        if (lower.includes('docente')) {
            return <span className="bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-full text-[10px] tracking-widest uppercase">JEFE TALLER / DOCENTE</span>;
        }
        return <span className="bg-gray-100 text-gray-700 font-bold px-3 py-1 rounded-full text-[10px] tracking-widest uppercase">POSTULANTE</span>;
    };

    return (
        <SidebarLayout title="ESTADO DEL SISTEMA : OPERATIVO" subtitle="RESUMEN DE USUARIOS Y ROLES">
            <Head title="Administrador - Dashboard" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-black text-[#0F172A] uppercase tracking-wide">
                        <span className="text-red-500 mr-2">•</span> PANEL ADMINISTRATIVO
                        <br/>
                        <span className="text-2xl ml-4">Resumen de Usuarios</span>
                    </h2>
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiSearch className="text-gray-400" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Buscar por CI, nombre, cargo o correo..." 
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-shadow shadow-inner"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="pb-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">INFORMACIÓN PERSONAL</th>
                                <th className="pb-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">DOCUMENTO CI</th>
                                <th className="pb-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">POSICIÓN / CARGO</th>
                                <th className="pb-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">ACCESO A SISTEMA</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {usuarios.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-sm shadow-md group-hover:bg-red-600 transition-colors">
                                                {u.nombres ? u.nombres.substring(0, 1).toUpperCase() : u.codigo_inicio.substring(0, 1).toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="font-bold text-gray-900 text-sm">{getFullName(u)}</div>
                                                <div className="text-xs text-gray-500 flex items-center mt-1">
                                                    <span className="mr-1">📞</span> {u.telefono || 'Sin registro'}
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
                                        <div className="text-xs font-bold text-red-600 flex items-center">
                                            ✉ {u.codigo_inicio}
                                        </div>
                                        <div className="mt-1">
                                            <span className="bg-[#0F172A] text-white text-[9px] font-bold px-2 py-0.5 rounded tracking-widest uppercase">
                                                {u.rol_nombre}
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
