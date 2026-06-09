import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { FiSearch, FiRefreshCw, FiActivity, FiFileText, FiUser, FiCalendar } from 'react-icons/fi';

export default function Index({ auth, bitacora, usuarios, filters }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedUser, setSelectedUser] = useState(filters.usuario_id || '');
    const [fechaDesde, setFechaDesde] = useState(filters.fecha_desde || '');
    const [fechaHasta, setFechaHasta] = useState(filters.fecha_hasta || '');

    const handleFilter = () => {
        router.get(route('bitacora.index'), {
            search: searchQuery,
            usuario_id: selectedUser,
            fecha_desde: fechaDesde,
            fecha_hasta: fechaHasta
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleClear = () => {
        setSearchQuery('');
        setSelectedUser('');
        setFechaDesde('');
        setFechaHasta('');
        router.get(route('bitacora.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric', month: 'numeric', year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    return (
        <SidebarLayout title="SEGURIDAD DEL SISTEMA" subtitle="Bitacora de Operaciones">
            <Head title="Bitácora de Operaciones" />

            <div className="mb-8 flex items-center">
                <div className="w-14 h-14 rounded-2xl bg-[#07074E] text-white flex items-center justify-center mr-4 shadow-lg shrink-0">
                    <FiActivity size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">Bitacora de Operaciones</h2>
                    <p className="text-gray-500 font-medium">Consulta las acciones registradas dentro del sistema y la actividad de los usuarios.</p>
                </div>
            </div>

            {/* Filter Card */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    {/* Buscador de Acción */}
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Accion / Evento</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <FiFileText />
                            </div>
                            <input
                                type="text"
                                placeholder="Ej: Inicio de sesion..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[#07074E] focus:border-transparent transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Selector de Empleado */}
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Empleado</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <FiUser />
                            </div>
                            <select
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[#07074E] focus:border-transparent transition-all outline-none appearance-none"
                            >
                                <option value="">Seleccionar empleado...</option>
                                {usuarios.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.perfil?.nombres} {user.perfil?.apellido_paterno}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Fecha Desde */}
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Desde</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <FiCalendar />
                            </div>
                            <input
                                type="date"
                                value={fechaDesde}
                                onChange={(e) => setFechaDesde(e.target.value)}
                                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[#07074E] focus:border-transparent transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Fecha Hasta */}
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Hasta</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <FiCalendar />
                            </div>
                            <input
                                type="date"
                                value={fechaHasta}
                                onChange={(e) => setFechaHasta(e.target.value)}
                                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[#07074E] focus:border-transparent transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-4 border-t border-gray-100 pt-6 mt-2">
                    <button
                        onClick={handleClear}
                        className="flex items-center px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <FiRefreshCw className="mr-2" /> Limpiar
                    </button>
                    <button
                        onClick={handleFilter}
                        className="flex items-center px-6 py-2.5 bg-[#07074E] text-white rounded-xl text-sm font-bold hover:bg-[#06063b] transition-colors shadow-md hover:shadow-lg"
                    >
                        <FiSearch className="mr-2" /> Buscar / Filtrar
                    </button>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar p-2">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="py-6 px-8 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">ID</th>
                                <th className="py-6 px-8 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Accion / Detalle</th>
                                <th className="py-6 px-8 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Fecha y Hora</th>
                                <th className="py-6 px-8 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">IP</th>
                                <th className="py-6 px-8 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Usuario (ID)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50/50">
                            {bitacora.data.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center text-gray-500 font-medium">
                                        No se encontraron registros que coincidan con los filtros.
                                    </td>
                                </tr>
                            ) : (
                                bitacora.data.map((registro) => (
                                    <tr key={registro.id} className="hover:bg-gray-50/30 transition-colors">
                                        
                                        {/* ID */}
                                        <td className="py-5 px-8 whitespace-nowrap">
                                            <span className="text-gray-500 font-black tracking-wider text-sm">
                                                #{registro.id}
                                            </span>
                                        </td>

                                        {/* ACCIÓN / DETALLE */}
                                        <td className="py-5 px-8">
                                            <div className="font-bold text-[#0F172A] text-sm">
                                                {registro.accion}
                                                {registro.detalle && (
                                                    <span className="font-normal text-gray-600"> - {registro.detalle}</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* FECHA Y HORA */}
                                        <td className="py-5 px-8 whitespace-nowrap">
                                            <div className="font-bold text-gray-700 text-sm">
                                                {formatDate(registro.fecha_hora)}
                                            </div>
                                            <div className="text-xs text-gray-400 font-medium mt-0.5">
                                                {formatTime(registro.fecha_hora)}
                                            </div>
                                        </td>

                                        {/* IP */}
                                        <td className="py-5 px-8 whitespace-nowrap">
                                            <span className="text-gray-500 font-medium text-xs tracking-wider">
                                                {registro.ip || '::1'}
                                            </span>
                                        </td>

                                        {/* USUARIO */}
                                        <td className="py-5 px-8 whitespace-nowrap">
                                            {registro.usuario ? (
                                                <>
                                                    <div className="font-bold text-[#07074E] text-sm">
                                                        {registro.usuario.perfil?.nombres} {registro.usuario.perfil?.apellido_paterno}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 font-black tracking-widest mt-0.5">
                                                        ID: {registro.usuario.id}
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-gray-400 italic text-sm">Sistema / Desconocido</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {bitacora.links && bitacora.links.length > 3 && (
                    <div className="py-5 px-8 border-t border-gray-100 flex justify-center bg-gray-50/50">
                        <div className="flex space-x-2">
                            {bitacora.links.map((link, i) => (
                                <button
                                    key={i}
                                    onClick={() => link.url && router.get(link.url)}
                                    disabled={!link.url}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                                        link.active 
                                            ? 'bg-[#07074E] text-white shadow-md' 
                                            : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed border-none' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

        </SidebarLayout>
    );
}
