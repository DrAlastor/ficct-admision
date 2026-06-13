import React from 'react';
import { Head } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { FiSearch, FiRefreshCw, FiActivity, FiFileText, FiUser, FiCalendar } from 'react-icons/fi';
import BitacoraTable from './_components/BitacoraTable';
import useBitacora from './_hooks/useBitacora';

export default function Index({ auth, bitacora, usuarios, filters }) {
    const {
        searchQuery,
        setSearchQuery,
        selectedUser,
        setSelectedUser,
        fechaDesde,
        setFechaDesde,
        fechaHasta,
        setFechaHasta,
        handleFilter,
        handleClear
    } = useBitacora(filters);

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

                    {/* Selector de Usuario */}
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
                                <option value="">Seleccionar usuario...</option>
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
            <BitacoraTable bitacora={bitacora} />

        </SidebarLayout>
    );
}
