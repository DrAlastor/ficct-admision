import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { FiBook, FiEdit2, FiTrash2, FiPlus, FiAlertCircle } from 'react-icons/fi';
import FormCarrera from './_components/FormCarrera';
import AlertModal from '@/Components/AlertModal';

export default function Index({ auth }) {
    const { carreras, errors } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [carreraEditing, setCarreraEditing] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, carrera: null });

    const openCreateModal = () => {
        setCarreraEditing(null);
        setIsModalOpen(true);
    };

    const openEditModal = (carrera) => {
        setCarreraEditing(carrera);
        setIsModalOpen(true);
    };

    const handleDelete = () => {
        if (!deleteModal.carrera) return;
        router.delete(route('carreras.admin.destroy', deleteModal.carrera.codigo), {
            preserveScroll: true,
            onSuccess: () => setDeleteModal({ isOpen: false, carrera: null })
        });
    };

    return (
        <SidebarLayout title="GESTIÓN ACADÉMICA" subtitle="Catálogo de Carreras">
            <Head title="Gestionar Carreras" />
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    {errors.carrera && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center">
                            <FiAlertCircle className="mr-3 text-red-500 flex-shrink-0" size={24} />
                            <span className="font-bold">{errors.carrera}</span>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div className="flex items-center">
                            <div className="bg-indigo-100 text-indigo-600 p-3 rounded-2xl mr-4 shadow-sm">
                                <FiBook size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-gray-800 tracking-tight">Catálogo de Carreras</h1>
                                <p className="text-sm text-gray-500 font-medium mt-1">
                                    Administra las carreras ofrecidas y sus cupos máximos
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={openCreateModal}
                            className="bg-[#07074E] text-white px-6 py-3 rounded-xl font-bold flex items-center hover:bg-[#0A0F5C] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <FiPlus className="mr-2" size={18} />
                            Nueva Carrera
                        </button>
                    </div>

                    <div className="overflow-hidden bg-white border border-gray-200 rounded-2xl shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Código</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Sigla</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Nombre</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Cupo Máximo</th>
                                    <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-widest">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {carreras.map((carrera) => (
                                    <tr key={carrera.codigo} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-500">
                                            #{carrera.codigo}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="bg-gray-100 text-gray-700 font-mono px-3 py-1 rounded-lg text-xs font-bold border border-gray-200">
                                                {carrera.sigla}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-bold text-gray-800">{carrera.nombre}</div>
                                            <div className="text-xs text-gray-400 font-medium mt-0.5">{carrera.facultad}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg w-max border border-indigo-100">
                                                {carrera.cupo_maximo} plazas
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => openEditModal(carrera)}
                                                className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors mr-2"
                                                title="Editar"
                                            >
                                                <FiEdit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => setDeleteModal({ isOpen: true, carrera })}
                                                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {carreras.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">
                                            No hay carreras registradas en el sistema.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            <FormCarrera 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                carrera={carreraEditing}
            />

            <AlertModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, carrera: null })}
                onConfirm={handleDelete}
                title="Eliminar Carrera"
                message={`¿Estás seguro que deseas eliminar la carrera de ${deleteModal.carrera?.nombre}? Esta acción no se puede deshacer.`}
                type="danger"
                confirmText="Eliminar Carrera"
            />
        </SidebarLayout>
    );
}
