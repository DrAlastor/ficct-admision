import React from 'react';
import { Head } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { FiSave } from 'react-icons/fi';
import useCupos from './_hooks/useCupos';
import LimiteGrupoPanel from './_components/LimiteGrupoPanel';
import CarrerasPanel from './_components/CarrerasPanel';
import AlertModal from '@/Components/AlertModal';

export default function Index({ carreras, limite_grupo_actual }) {
    const {
        data,
        processing,
        errors,
        alertConfig,
        handleCarreraChange,
        handleLimiteChange,
        handleSubmit,
        closeAlert
    } = useCupos(carreras, limite_grupo_actual);

    return (
        <SidebarLayout title="GESTIÓN ACADÉMICA" subtitle="Configuración de Cupos">
            <Head title="Gestionar Cupos" />

            <div className="mb-8">
                <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">Gestión de Cupos</h2>
                <p className="text-gray-500 font-medium mt-1">
                    Define la capacidad máxima de alumnos por carrera y el límite estricto de alumnos por grupo/aula.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                
                <LimiteGrupoPanel 
                    limite_grupo={data.limite_grupo} 
                    errors={errors} 
                    handleLimiteChange={handleLimiteChange} 
                />

                <CarrerasPanel 
                    carreras={data.carreras} 
                    errors={errors} 
                    handleCarreraChange={handleCarreraChange} 
                />

                {/* Submit Action */}
                <div className="flex justify-end pt-4 pb-12">
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-[#07074E] hover:bg-[#07074E]/90 text-white font-bold py-3 px-8 rounded-xl flex items-center shadow-lg shadow-[#07074E]/20 transition-all hover:translate-y-[-2px] disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        {processing ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        ) : (
                            <FiSave className="mr-2" size={20} />
                        )}
                        Guardar Parámetros
                    </button>
                </div>
            </form>

            <AlertModal
                show={alertConfig !== null}
                type={alertConfig?.type}
                message={alertConfig?.message}
                onClose={closeAlert}
            />
        </SidebarLayout>
    );
}
