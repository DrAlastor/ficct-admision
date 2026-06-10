import React, { useMemo } from 'react';
import { Head } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { FiInfo } from 'react-icons/fi';
import HorarioView from './_components/HorarioView';

/**
 * Componente principal para mostrar el horario semanal del usuario.
 * Procesa los datos de las clases, genera una paleta de colores por materia
 * y agrupa los bloques de tiempo antes de pasarlos a HorarioView.
 *
 * @param {Object} props Datos enviados desde HorarioController.php
 * @returns {JSX.Element}
 */
export default function Index({ auth, status, message, horarioData, config }) {
    
    // Configuración de colores globales (para bordes y encabezados ligeros)
    const primaryColor = config?.primaryColor || '#07074E';
    
    // Paleta de colores suaves para las distintas materias (basado en la imagen)
    const subjectColors = [
        'bg-[#CCFF66]', // Verde claro limón
        'bg-[#FFFF99]', // Amarillo suave
        'bg-[#66FFCC]', // Turquesa claro
        'bg-[#FF99FF]', // Rosa claro
        'bg-[#FFCC99]', // Naranja claro
        'bg-[#99CCFF]', // Azul claro
        'bg-[#E6E6FA]'  // Lavanda
    ];

    // Asignar colores fijos a cada materia única
    const colorMap = useMemo(() => {
        const map = {};
        if (horarioData && horarioData.clases) {
            let colorIndex = 0;
            horarioData.clases.forEach(clase => {
                if (!map[clase.sigla]) {
                    map[clase.sigla] = subjectColors[colorIndex % subjectColors.length];
                    colorIndex++;
                }
            });
        }
        return map;
    }, [horarioData]);

    // Extraer y ordenar bloques de tiempo únicos
    const timeBlocks = useMemo(() => {
        if (!horarioData || !horarioData.clases) return [];
        const blocks = [];
        const map = new Set();
        
        horarioData.clases.forEach(clase => {
            const timeKey = `${clase.hora_inicio} - ${clase.hora_fin}`;
            if (!map.has(timeKey)) {
                map.add(timeKey);
                blocks.push({
                    inicio: clase.hora_inicio,
                    fin: clase.hora_fin,
                    key: timeKey
                });
            }
        });

        // Ordenar por hora de inicio
        return blocks.sort((a, b) => a.inicio.localeCompare(b.inicio));
    }, [horarioData]);

    const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

    return (
        <SidebarLayout title="Mis Horarios" subtitle="Visualiza tu agenda semanal de clases">
            <Head title="Consultar Horario" />

            <div className="max-w-7xl mx-auto pb-10">
                {status === 'processing' || status === 'error' ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex flex-col items-center justify-center text-center mt-6">
                        <div className="h-24 w-24 bg-blue-50 text-[#07074E] rounded-full flex items-center justify-center mb-6">
                            <FiInfo size={48} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 mb-3 tracking-wide">{message || 'En procesamiento'}</h2>
                        <p className="text-gray-500 max-w-md text-sm leading-relaxed">
                            Aún no cuentas con una agenda asignada.
                        </p>
                    </div>
                ) : (
                    <HorarioView 
                        horarioData={horarioData}
                        primaryColor={primaryColor}
                        colorMap={colorMap}
                        timeBlocks={timeBlocks}
                        days={days}
                    />
                )}
            </div>
        </SidebarLayout>
    );
}
