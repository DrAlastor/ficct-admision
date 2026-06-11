import React from 'react';
import { Head } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { FiCalendar, FiClock } from 'react-icons/fi';
import useHorarios from './_hooks/useHorarios';
import AccionHorarios from './_components/AccionHorarios';
import HorariosGenerados from './_components/HorariosGenerados';
import AlertModal from '@/Components/AlertModal';
import ConfirmModal from '@/Components/ConfirmModal';

export default function Index({ error, gestion, horarios_generados }) {
    if (error) {
        return (
            <SidebarLayout title="GESTIÓN ACADÉMICA" subtitle="Horarios">
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
        cancelConfirm
    } = useHorarios();

    const gruposCount = Object.keys(horarios_generados || {}).length;

    return (
        <SidebarLayout title="GESTIÓN ACADÉMICA" subtitle="Horarios">
            <Head title="Gestionar Horarios" />

            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">Malla Horaria Automatizada</h2>
                    <p className="text-gray-500 font-medium mt-1">
                        Generación inteligente de horarios y asignación de aulas sin colisión.
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white text-[#0F172A] px-5 py-2.5 rounded-xl font-bold flex items-center shadow-sm border border-gray-100">
                        <FiClock className="mr-2 text-indigo-500" />
                        {gruposCount} Grupos Generados
                    </div>
                    <div className="bg-[#07074E] text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-md">
                        <FiCalendar className="mr-2" />
                        Gestión: {gestion.semestre}-{new Date().getFullYear()}
                    </div>
                </div>
            </div>

            <AccionHorarios 
                processing={processing} 
                handleGenerar={handleGenerar} 
                totalGrupos={gruposCount} // Using generic count to allow "Regenerar" 
                gruposGenerados={gruposCount} 
            />

            <div className="mb-6">
                <h3 className="text-2xl font-black text-[#0F172A]">Mallas Generadas</h3>
                <p className="text-gray-500 font-medium">Lunes a Viernes - Bloques fijos por turno</p>
            </div>

            <HorariosGenerados horarios={horarios_generados} />

            <ConfirmModal
                show={confirmAction}
                title="Generar Horarios Aleatorios"
                message="Esta acción reescribirá cualquier horario previamente generado en la gestión actual para armar una nueva malla desde cero. ¿Estás seguro de continuar?"
                onConfirm={executeGenerar}
                onCancel={cancelConfirm}
                isProcessing={processing}
                confirmText="Generar y Asignar"
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
