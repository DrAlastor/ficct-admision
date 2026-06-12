import React from 'react';
import { Head } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { FiSearch, FiFilter } from 'react-icons/fi';
import PostulanteModal from './_components/PostulanteModal';
import PostulantesTable from './_components/PostulantesTable';
import usePostulantes from './_hooks/usePostulantes';

export default function Index({ auth, postulantes, gestionActual, carreras }) {
    const {
        searchQuery,
        handleSearch,
        selectedCarrera,
        handleCarreraChange,
        activeTab,
        setActiveTab,
        filteredPostulantes,
        isModalOpen,
        setIsModalOpen,
        selectedPostulante,
        openModal
    } = usePostulantes(postulantes);

    return (
        <SidebarLayout title="GESTIÓN ACADÉMICA" subtitle="Postulantes">
            <Head title="Gestionar Postulantes" />

            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">Postulantes</h2>
                    <p className="text-gray-500 font-medium">
                        Administra la información de los postulantes de la gestión actual {gestionActual ? `(${gestionActual.semestre}-${new Date().getFullYear()})` : ''}.
                    </p>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8 flex flex-col md:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:border-[#07074E] focus-within:ring-1 focus-within:ring-[#07074E] transition-all">
                    <FiSearch className="text-gray-400 mr-3 flex-shrink-0" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o CI..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full bg-transparent border-none focus:ring-0 text-gray-700 p-0 text-sm"
                    />
                </div>

                {/* Filter Carrera */}
                <div className="flex-1 md:max-w-[400px] flex items-center bg-gray-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:border-[#07074E] focus-within:ring-1 focus-within:ring-[#07074E] transition-all">
                    <FiFilter className="text-gray-400 mr-3 flex-shrink-0" size={20} />
                    <select
                        value={selectedCarrera}
                        onChange={handleCarreraChange}
                        className="w-full bg-transparent border-none focus:ring-0 text-gray-700 p-0 text-sm cursor-pointer"
                    >
                        <option value="">Todas las carreras (1ra o 2da opción)</option>
                        {carreras.map(c => (
                            <option key={c.codigo} value={c.nombre}>{c.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-6 inline-flex">
                <button
                    onClick={() => setActiveTab('Pendientes')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        activeTab === 'Pendientes' 
                        ? 'bg-[#07074E] text-white shadow-md' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    Pendientes
                </button>
                <button
                    onClick={() => setActiveTab('Habilitados')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        activeTab === 'Habilitados' 
                        ? 'bg-green-600 text-white shadow-md' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    Habilitados / Aceptados
                </button>
            </div>

            {/* Table */}
            <PostulantesTable 
                postulantes={filteredPostulantes} 
                openModal={openModal} 
            />

            {/* Modal de Edición */}
            <PostulanteModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                postulante={selectedPostulante}
            />

        </SidebarLayout>
    );
}
