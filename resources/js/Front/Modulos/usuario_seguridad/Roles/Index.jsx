import React from 'react';
import { Head } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';
import RolesModal from './_components/RolesModal';
import RolesTable from './_components/RolesTable';
import useRoles from './_hooks/useRoles';

export default function Index({ auth, roles, modulos, filters }) {
    const {
        searchQuery,
        handleSearch,
        isModalOpen,
        setIsModalOpen,
        selectedRol,
        openModal,
        deleteConfirmRol,
        setDeleteConfirmRol,
        handleDelete,
        confirmDelete
    } = useRoles(filters);

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
            <RolesTable 
                roles={roles} 
                openModal={openModal} 
                handleDelete={handleDelete} 
            />

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
