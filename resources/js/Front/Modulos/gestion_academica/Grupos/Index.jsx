import React from 'react';
import { Head } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { FiCalendar } from 'react-icons/fi';
import useGrupos from './_hooks/useGrupos';
import EstadisticasPanel from './_components/EstadisticasPanel';
import AccionPanel from './_components/AccionPanel';
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
        uniqueGroups
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
                <div className="bg-[#07074E] text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-md">
                    <FiCalendar className="mr-2" />
                    Gestión: {gestion.semestre}-{new Date().getFullYear()}
                </div>
            </div>

            <EstadisticasPanel 
                inscritos={inscritos} 
                cupo_maximo={cupo_maximo} 
                proyeccion_grupos={proyeccion_grupos} 
            />

            <AccionPanel 
                processing={processing} 
                proyeccion_grupos={proyeccion_grupos} 
                handleGenerar={handleGenerar} 
            />

            {/* Listado de Grupos Generados (Historial o Actuales) */}
            {uniqueGroups.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-xl font-bold text-[#0F172A]">Grupos Activos (Gestión {gestion.semestre}-{new Date().getFullYear()})</h3>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-wrap gap-4">
                            {uniqueGroups.map((nombre, idx) => (
                                <div key={idx} className="bg-gray-50 border border-gray-200 px-6 py-4 rounded-xl flex items-center justify-center min-w-[120px] shadow-sm">
                                    <span className="text-2xl font-black text-[#07074E] tracking-widest">{nombre}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
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
