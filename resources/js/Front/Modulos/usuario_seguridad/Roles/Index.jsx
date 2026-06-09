import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import RolesModal from './RolesModal';

export default function Index({ auth, roles, modulos, filters }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRol, setSelectedRol] = useState(null);
    const [deleteConfirmRol, setDeleteConfirmRol] = useState(null);

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            router.get(route('roles.index'), { search: searchQuery }, {
                preserveState: true,
                replace: true,
            });
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const openModal = (rol = null) => {
        setSelectedRol(rol);
        setIsModalOpen(true);
    };

    const handleDelete = (rol) => {
        setDeleteConfirmRol(rol);
    };

    const confirmDelete = () => {
        if (deleteConfirmRol) {
            router.delete(route('roles.destroy', deleteConfirmRol.id), {
                preserveScroll: true,
                onSuccess: () => setDeleteConfirmRol(null)
            });
        }
    };

    return (
        <SidebarLayout title="SEGURIDAD DEL SISTEMA" subtitle="Gestión de Roles">
            <Head title="Gestión de Roles" />

            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="text-xs font-bold text-[#ef172f] uppercase tracking-widest mb-1 flex items-center">
                        <span className="w-2 h-2 bg-[#ef172f] rounded-full mr-2"></span>
                        Seguridad del Sistema
                    </div>
                    <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">Gestión de Roles</h2>
                    <p className="text-gray-500 font-medium mt-1">Administra los roles y sus permisos en el sistema.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Search Bar */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2 flex items-center w-full sm:w-64">
                        <div className="pl-3 text-gray-400">
                            <FiSearch size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar rol..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full bg-transparent border-none focus:ring-0 text-gray-700 py-1.5 px-3 text-sm font-medium"
                        />
                    </div>

                    <button 
                        onClick={() => openModal()}
                        className="w-full sm:w-auto flex items-center justify-center bg-[#07074E] text-white px-6 py-3 rounded-xl font-bold uppercase text-xs hover:bg-[#06063b] transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                        <FiPlus className="mr-2" size={16} />
                        Crear Rol
                    </button>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mt-8">
                <div className="overflow-x-auto custom-scrollbar p-2">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="py-6 px-8 text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">ID</th>
                                <th className="py-6 px-8 text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Nombre del Rol</th>
                                <th className="py-6 px-8 text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Descripción</th>
                                <th className="py-6 px-8 text-xs font-black text-gray-400 uppercase tracking-widest text-center whitespace-nowrap w-32">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50/50">
                            {roles.data.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-16 text-center text-gray-500 font-medium">
                                        No se encontraron roles.
                                    </td>
                                </tr>
                            ) : (
                                roles.data.map((rol) => (
                                    <tr key={rol.id} className="hover:bg-gray-50/30 transition-colors group">
                                        
                                        {/* ID */}
                                        <td className="py-5 px-8 whitespace-nowrap">
                                            <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider">
                                                #{rol.id}
                                            </span>
                                        </td>

                                        {/* NOMBRE DEL ROL */}
                                        <td className="py-5 px-8 whitespace-nowrap">
                                            <span className="font-black text-[#0F172A] text-lg tracking-tight">
                                                {rol.nombre}
                                            </span>
                                        </td>

                                        {/* DESCRIPCIÓN */}
                                        <td className="py-5 px-8">
                                            {rol.descripcion && rol.descripcion !== 'Sin descripción' ? (
                                                <span className="text-gray-500 font-medium text-sm">
                                                    {rol.descripcion}
                                                </span>
                                            ) : (
                                                <span className="text-gray-300 italic font-medium text-sm">
                                                    Sin descripción
                                                </span>
                                            )}
                                        </td>

                                        {/* ACCIONES */}
                                        <td className="py-5 px-8 whitespace-nowrap">
                                            <div className="flex justify-center items-center space-x-3">
                                                <button 
                                                    onClick={() => openModal(rol)}
                                                    className="w-10 h-10 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-gray-200 hover:text-gray-900 transition-colors focus:outline-none"
                                                    title="Editar Rol"
                                                >
                                                    <FiEdit2 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(rol)}
                                                    className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 hover:text-red-700 transition-colors focus:outline-none"
                                                    title="Eliminar Rol"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {roles.links && roles.links.length > 3 && (
                    <div className="py-5 px-8 border-t border-gray-100 flex justify-center bg-gray-50/50">
                        <div className="flex space-x-2">
                            {roles.links.map((link, i) => (
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

            {/* Modal de Roles */}
            <RolesModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                rol={selectedRol}
                modulos={modulos}
            />

            {/* Modal de Confirmación de Eliminación */}
            {deleteConfirmRol && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 relative">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                                <FiTrash2 className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Eliminar Rol</h3>
                            <p className="text-gray-500 mb-8">
                                ¿Estás seguro de que deseas eliminar el rol de <span className="font-bold text-gray-900">{deleteConfirmRol.nombre}</span>?
                                <br/>Esta acción no se puede deshacer si no hay usuarios asignados.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={() => setDeleteConfirmRol(null)}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
                                >
                                    Aceptar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </SidebarLayout>
    );
}
