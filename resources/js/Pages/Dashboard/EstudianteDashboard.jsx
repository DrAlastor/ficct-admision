import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head } from '@inertiajs/react';
import { FiCalendar, FiMapPin, FiCheckCircle } from 'react-icons/fi';

export default function EstudianteDashboard({ auth }) {
    return (
        <SidebarLayout title="PANEL DEL ESTUDIANTE" subtitle="SISTEMA CUP-FICCT">
            <Head title="Estudiante - Dashboard" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Izquierda: Info de Inscripción */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-md font-black text-[#0F172A] uppercase tracking-wide border-b pb-3 mb-4">
                            <span className="text-red-500 mr-2">•</span> ESTADO DE ADMISIÓN
                        </h3>
                        <div className="flex items-center text-green-600 font-bold mb-4">
                            <FiCheckCircle className="mr-2" size={20}/>
                            Inscrito Correctamente
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="text-xs text-gray-500 font-bold uppercase mb-1">Grupo Asignado</div>
                            <div className="text-2xl font-black text-[#0F172A]">GRUPO Z-1</div>
                        </div>
                    </div>
                </div>

                {/* Derecha: Horario y Materias */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-md font-black text-[#0F172A] uppercase tracking-wide border-b pb-3 mb-4">
                            <span className="text-red-500 mr-2">•</span> MIS MATERIAS Y HORARIOS
                        </h3>
                        
                        <div className="space-y-4">
                            {/* Card de Materia */}
                            <div className="flex items-start p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                                <div className="bg-red-100 text-red-600 p-3 rounded-lg mr-4">
                                    <FiCalendar size={24} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900">Matemáticas Básicas</h4>
                                    <div className="text-sm text-gray-600 mt-1">Docente: Por Asignar</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-[#0F172A]">07:00 - 09:15</div>
                                    <div className="text-xs text-gray-500 flex items-center justify-end mt-1">
                                        <FiMapPin className="mr-1" /> Aula 236-40
                                    </div>
                                </div>
                            </div>

                            {/* Card de Materia */}
                            <div className="flex items-start p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                                <div className="bg-blue-100 text-blue-600 p-3 rounded-lg mr-4">
                                    <FiCalendar size={24} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900">Introducción a la Informática</h4>
                                    <div className="text-sm text-gray-600 mt-1">Docente: Por Asignar</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-[#0F172A]">09:15 - 11:30</div>
                                    <div className="text-xs text-gray-500 flex items-center justify-end mt-1">
                                        <FiMapPin className="mr-1" /> Aula 236-41
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
