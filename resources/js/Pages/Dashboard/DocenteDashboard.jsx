import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head } from '@inertiajs/react';
import { FiBook, FiUsers, FiClock, FiFileText } from 'react-icons/fi';

export default function DocenteDashboard({ auth }) {
    return (
        <SidebarLayout title="PORTAL DOCENTE" subtitle="GESTIÓN ACADÉMICA Y CONTROL DE ALUMNOS">
            <Head title="Docente - Dashboard" />

            {/* Tarjetas de Acceso Rápido */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition">
                    <div className="bg-blue-100 p-4 rounded-full text-blue-600 mr-4">
                        <FiBook size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">Materias</div>
                        <div className="text-2xl font-black text-gray-800">4</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition">
                    <div className="bg-green-100 p-4 rounded-full text-green-600 mr-4">
                        <FiUsers size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">Alumnos</div>
                        <div className="text-2xl font-black text-gray-800">120</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition">
                    <div className="bg-orange-100 p-4 rounded-full text-orange-600 mr-4">
                        <FiClock size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">Horas/Semana</div>
                        <div className="text-2xl font-black text-gray-800">16</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition">
                    <div className="bg-red-100 p-4 rounded-full text-red-600 mr-4">
                        <FiFileText size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">Exámenes</div>
                        <div className="text-2xl font-black text-gray-800">Próximos</div>
                    </div>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Tabla de Materias y Horarios */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-wide border-b pb-3 mb-4">
                        <span className="text-red-500 mr-2">•</span> Mis Materias y Horarios
                    </h3>
                    <div className="space-y-4">
                        {/* Materia 1 */}
                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-gray-800">Introducción a la Informática</span>
                                <span className="bg-[#0F172A] text-white text-[10px] font-bold px-2 py-1 rounded tracking-widest">GRUPO A</span>
                            </div>
                            <div className="text-sm text-gray-600 flex items-center">
                                <FiClock className="mr-2" /> Lun-Mié-Vie 07:00 - 09:15 | Aula: 236-40
                            </div>
                        </div>
                        {/* Materia 2 */}
                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-gray-800">Arquitectura de Computadoras</span>
                                <span className="bg-[#0F172A] text-white text-[10px] font-bold px-2 py-1 rounded tracking-widest">GRUPO C</span>
                            </div>
                            <div className="text-sm text-gray-600 flex items-center">
                                <FiClock className="mr-2" /> Mar-Jue 09:15 - 11:30 | Aula: 236-41
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla de Exámenes Recientes */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-wide border-b pb-3 mb-4">
                        <span className="text-red-500 mr-2">•</span> Control de Alumnos y Exámenes
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Selecciona una materia a la izquierda para ver el listado de alumnos y registrar notas.
                    </p>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 text-center">
                        <FiUsers className="mx-auto text-blue-300 mb-2" size={32} />
                        <p className="font-bold text-blue-800">Listado no seleccionado</p>
                        <p className="text-xs text-blue-600 mt-1">Haz clic en un grupo para cargar la lista de estudiantes.</p>
                    </div>
                </div>
            </div>

        </SidebarLayout>
    );
}
