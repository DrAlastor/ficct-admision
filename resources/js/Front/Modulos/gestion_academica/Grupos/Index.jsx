import React from 'react';
import { Head } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { FiCalendar, FiPlay, FiUsers } from 'react-icons/fi';
import useGrupos from './_hooks/useGrupos';
import EstadisticasPanel from './_components/EstadisticasPanel';
import AccionPanel from './_components/AccionPanel';
import GruposTable from './_components/GruposTable';
import AlertModal from '@/Components/AlertModal';
import ConfirmModal from '@/Components/ConfirmModal';

export default function Index({ error, gestion, inscritos, cupo_maximo, proyeccion_grupos, grupos_actuales }) {
    if (error) {
        return (
            <SidebarLayout title="GESTIÓN ACADÉMICA" subtitle="Generación de Grupos">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl font-bold">{error}</div>
            </SidebarLayout>
        );
    }

    const {
        processing,
        confirmAction,
        alertConfig,
        handleGenerar,
        executeGenerar,
        closeAlert,
        cancelConfirm,
        handleToggleInscripciones,
        handleAsignarAlumnos,
        handleEdit,
        handleDelete,
        handleDownload,
        gruposList
    } = useGrupos(grupos_actuales);

    return (
        <SidebarLayout title="GESTIÓN ACADÉMICA" subtitle="Generación de Grupos">
            <Head title="Gestionar Grupos" />

            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">Cálculo y Generación</h2>
                    <p className="text-gray-500 font-medium mt-1">
                        Cálculo matemático para la apertura de grupos basado en los postulantes habilitados.
                    </p>
                </div>
                <div className="flex space-x-3">
                    <button 
                        onClick={handleToggleInscripciones}
                        disabled={processing}
                        className={`px-4 py-2 rounded-xl font-bold flex items-center shadow-md transition-all ${
                            gestion.inscripciones_abiertas 
                                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                    >
                        <FiPlay className="mr-2" />
                        {gestion.inscripciones_abiertas ? 'Cerrar Inscripciones' : 'Habilitar Inscripciones'}
                    </button>
                    <div className="bg-[#07074E] text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-md">
                        <FiCalendar className="mr-2" />
                        Gestión: {gestion.semestre}-{new Date().getFullYear()}
                    </div>
                </div>
            </div>

            <EstadisticasPanel 
                inscritos={inscritos} 
                cupo_maximo={cupo_maximo} 
                proyeccion_grupos={proyeccion_grupos} 
            />

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1">
                    <AccionPanel 
                        processing={processing} 
                        proyeccion_grupos={proyeccion_grupos} 
                        handleGenerar={handleGenerar} 
                    />
                </div>
                {gruposList.length > 0 && (
                    <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-center items-center text-center">
                        <h3 className="text-lg font-bold text-[#0F172A] mb-2">Asignación Rápida</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Asigna a todos los postulantes habilitados a los grupos generados de manera aleatoria, respetando el orden alfabético.
                        </p>
                        <button
                            onClick={() => {
                                if(confirm('¿Asignar postulantes sin grupo a los espacios disponibles?')) {
                                    handleAsignarAlumnos();
                                }
                            }}
                            disabled={processing}
                            className="bg-[#07074E] hover:bg-[#07074E]/90 text-white font-bold py-2 px-6 rounded-xl flex items-center shadow-lg transition-all"
                        >
                            <FiUsers className="mr-2" />
                            Asignar Alumnos Automáticamente
                        </button>
                    </div>
                )}
            </div>

            {gruposList.length > 0 && (
                <GruposTable 
                    grupos={gruposList}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    handleDownload={handleDownload}
                />
            )}

            <ConfirmModal
                show={confirmAction}
                title="Generar Grupos Académicos"
                message="¿Estás seguro de generar la estructura académica para la gestión actual? Se recalcularán todos los grupos si ya existen para esta gestión."
                onConfirm={executeGenerar}
                onCancel={cancelConfirm}
                isProcessing={processing}
                confirmText="Generar"
            />

            <AlertModal
                show={alertConfig !== null}
                type={alertConfig?.type}
                message={alertConfig?.message}
                onClose={closeAlert}
            />
        </SidebarLayout>
    );
}
