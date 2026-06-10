import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { FiInfo } from 'react-icons/fi';

import AdminConfig from './_components/AdminConfig';
import BoletaView from './_components/BoletaView';

/**
 * Componente principal para mostrar la Boleta de Inscripción.
 * Permite al administrador configurar los colores y logos de la boleta (AdminConfig)
 * y muestra a los postulantes la vista final de su boleta generada (BoletaView).
 *
 * @param {Object} props Datos enviados desde BoletaController.php
 * @returns {JSX.Element}
 */
export default function Index({ auth, status, message, boleta, can_edit, config }) {
    const defaultPrimary = config?.primaryColor || '#07074E';
    const defaultSecondary = config?.secondaryColor || '#1a237e';
    const defaultAccent = config?.accentColor || '#ef172f';

    const [isEditing, setIsEditing] = useState(status === 'admin_preview');
    
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        primaryColor: defaultPrimary,
        secondaryColor: defaultSecondary,
        accentColor: defaultAccent,
    });

    const submitConfig = (e) => {
        e.preventDefault();
        post(route('boleta.config.save'), {
            preserveScroll: true,
            onSuccess: () => {
                if (status !== 'admin_preview') {
                    setIsEditing(false);
                }
            },
        });
    };

    // We convert hex to rgba for the light accent background
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '239, 23, 47';
    };

    return (
        <SidebarLayout title="Mi Boleta" subtitle="Consulta de grupo y horarios asignados">
            <Head title="Consultar Boleta" />

            <div className="max-w-7xl mx-auto pb-10">
                {can_edit && (
                    <AdminConfig 
                        isEditing={isEditing} 
                        setIsEditing={setIsEditing}
                        data={data}
                        setData={setData}
                        submitConfig={submitConfig}
                        processing={processing}
                        recentlySuccessful={recentlySuccessful}
                    />
                )}

                {status === 'processing' || status === 'error' ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex flex-col items-center justify-center text-center mt-6 transform transition-all hover:-translate-y-1 hover:shadow-md duration-300">
                        <div className="h-24 w-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `rgba(${hexToRgb(data.primaryColor)}, 0.1)`, color: data.primaryColor }}>
                            <FiInfo size={48} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 mb-3 tracking-wide">{message || 'Boleta en procesamiento'}</h2>
                        <p className="text-gray-500 max-w-md text-sm leading-relaxed">
                            Por favor, vuelve a revisar más adelante una vez que se hayan distribuido los grupos.
                        </p>
                    </div>
                ) : (
                    <BoletaView 
                        boleta={boleta} 
                        data={data} 
                        status={status} 
                    />
                )}
            </div>
        </SidebarLayout>
    );
}
