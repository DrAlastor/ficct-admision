import React from 'react';
import { Head } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { FiPlus, FiSearch, FiUserX, FiUpload } from 'react-icons/fi';
import UsuarioModal from './_components/UsuarioModal';
import ImportUsuariosModal from './_components/ImportUsuariosModal';
import UsuariosTable from './_components/UsuariosTable';
import useUsuarios from './_hooks/useUsuarios';

export default function Index({ auth, usuarios, roles, filters, nextId }) {
    const {
        searchQuery,
        handleSearch,
        isModalOpen,
        setIsModalOpen,
        selectedUsuario,
        openModal,
        deleteConfirmUser,
        setDeleteConfirmUser,
        handleDelete,
        confirmDelete,
        isImportModalOpen,
        setIsImportModalOpen,
        selectedIds,
        toggleSelectAll,
        toggleSelectOne,
        deleteMassiveConfirm,
        setDeleteMassiveConfirm,
        confirmMassDelete
    } = useUsuarios(filters);

    return (
        <SidebarLayout title="GESTIÓN DE USUARIOS" subtitle="Usuarios">
            <Head title="Gestión de Usuarios" />

            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">Usuarios</h2>
                    <p className="text-gray-500 font-medium">Administra la información de los usuarios del sistema.</p>
                </div>
                
                <div className="flex items-center space-x-3">
                    {selectedIds.length > 0 && (
                        <button 
                            onClick={() => setDeleteMassiveConfirm(true)}
                            className="flex items-center justify-center bg-red-50 text-red-600 border border-red-200 px-6 py-3 rounded-full font-bold uppercase text-sm hover:bg-red-100 transition-all shadow-sm"
                        >
                            <FiUserX className="mr-2" size={18} />
                            Limpiar Seleccionados ({selectedIds.length})
                        </button>
                    )}
                    <button 
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center justify-center bg-white border border-[#07074E] text-[#07074E] px-6 py-3 rounded-full font-bold uppercase text-sm hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
                    >
                        <FiUpload className="mr-2" size={18} />
                        Importar Lote
                    </button>
                    <button 
                        onClick={() => openModal()}
                        className="flex items-center justify-center bg-[#07074E] text-white px-6 py-3 rounded-full font-bold uppercase text-sm hover:bg-[#06063b] transition-all shadow-md hover:shadow-lg"
                    >
                        <FiPlus className="mr-2" size={18} />
                        Crear Usuario
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-full border border-gray-100 shadow-sm p-2 mb-8 flex items-center">
                <div className="pl-4 text-gray-400">
                    <FiSearch size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Buscar por nombre, CI, cargo o correo..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full bg-transparent border-none focus:ring-0 text-gray-700 py-2 px-4"
                />
            </div>

            {/* Table */}
            <UsuariosTable 
                usuarios={usuarios} 
                openModal={openModal} 
                handleDelete={handleDelete}
                selectedIds={selectedIds}
                toggleSelectAll={toggleSelectAll}
                toggleSelectOne={toggleSelectOne}
            />

            {/* Modal de Registro/Edición */}
            <UsuarioModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                usuario={selectedUsuario}
                roles={roles}
                nextId={nextId}
            />

            {/* Modal de Importación Masiva */}
            <ImportUsuariosModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                roles={roles}
            />

            {/* Modal de Confirmación de Eliminación */}
            {deleteConfirmUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 relative">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                                <FiUserX className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Eliminar Usuario</h3>
                            <p className="text-gray-500 mb-8">
                                ¿Estás seguro de que deseas eliminar a <span className="font-bold text-gray-900">{deleteConfirmUser.perfil?.nombres}</span>? 
                            </p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={() => setDeleteConfirmUser(null)}
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

            {/* Modal de Confirmación de Eliminación Masiva */}
            {deleteMassiveConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 relative">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                                <FiUserX className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Eliminar Múltiples Usuarios</h3>
                            <p className="text-gray-500 mb-8">
                                ¿Estás seguro de que deseas eliminar a <span className="font-bold text-gray-900">{selectedIds.length}</span> usuarios seleccionados? No podrás recuperar su acceso.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={() => setDeleteMassiveConfirm(false)}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmMassDelete}
                                    className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
                                >
                                    Sí, Eliminar Todos
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </SidebarLayout>
    );
}
