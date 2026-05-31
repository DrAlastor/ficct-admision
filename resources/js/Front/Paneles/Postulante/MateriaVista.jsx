import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { FiCheckSquare, FiFileText, FiAward, FiArrowLeft, FiClock } from 'react-icons/fi';

export default function MateriaVista({ inscripcion, asistencias, examenes, flash }) {
    const { post, processing } = useForm();

    const handleAsistencia = () => {
        post(route('estudiante.materia.asistencia', inscripcion.inscripcion_id), {
            preserveScroll: true
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center">
                    <button onClick={() => window.history.back()} className="mr-4 text-gray-500 hover:text-gray-700">
                        <FiArrowLeft size={24} />
                    </button>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {inscripcion.materia_nombre} <span className="text-sm font-normal text-gray-500">({inscripcion.grupo_nombre})</span>
                    </h2>
                </div>
            }
        >
            <Head title={`Materia - ${inscripcion.materia_nombre}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {flash?.success && (
                        <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-green-700">{flash.success}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {flash?.error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{flash.error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* ASISTENCIA */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 bg-white border-b border-gray-200">
                                <div className="flex items-center text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                                    <FiCheckSquare className="mr-2 text-indigo-600" />
                                    Asistencia
                                </div>
                                
                                <button 
                                    onClick={handleAsistencia}
                                    disabled={processing}
                                    className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded hover:bg-indigo-700 transition disabled:opacity-50 mb-6"
                                >
                                    Marcar Asistencia de Hoy
                                </button>

                                <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Historial Reciente</h4>
                                {asistencias.length > 0 ? (
                                    <ul className="space-y-2">
                                        {asistencias.map((asist, idx) => (
                                            <li key={idx} className="flex justify-between items-center text-sm border border-gray-100 p-2 rounded">
                                                <span className="text-gray-700">{asist.fecha}</span>
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${asist.estado === 'Presente' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {asist.estado}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500">Sin registros de asistencia.</p>
                                )}
                            </div>
                        </div>

                        {/* EXÁMENES */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 bg-white border-b border-gray-200">
                                <div className="flex items-center text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                                    <FiFileText className="mr-2 text-indigo-600" />
                                    Exámenes Virtuales
                                </div>

                                {examenes.length > 0 ? (
                                    <div className="space-y-4">
                                        {examenes.map((ex, idx) => (
                                            <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition">
                                                <h4 className="font-bold text-gray-900">{ex.titulo}</h4>
                                                <p className="text-xs text-gray-500 mt-1 mb-3">{ex.descripcion}</p>
                                                <div className="flex items-center text-xs text-gray-600 mb-4">
                                                    <FiClock className="mr-1"/> Duración: {ex.duracion_minutos} min
                                                </div>
                                                <button className="w-full bg-gray-800 text-white text-sm font-bold py-2 rounded hover:bg-gray-700 transition">
                                                    Empezar Examen
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No hay exámenes habilitados por el momento.</p>
                                )}
                            </div>
                        </div>

                        {/* NOTAS */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 bg-white border-b border-gray-200">
                                <div className="flex items-center text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                                    <FiAward className="mr-2 text-indigo-600" />
                                    Mis Notas
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="font-semibold text-gray-700">Parcial 1 (P1)</span>
                                        <span className="font-bold text-xl text-gray-900">{inscripcion.nota_p1 || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="font-semibold text-gray-700">Parcial 2 (P2)</span>
                                        <span className="font-bold text-xl text-gray-900">{inscripcion.nota_p2 || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="font-semibold text-gray-700">Examen Final (P3)</span>
                                        <span className="font-bold text-xl text-gray-900">{inscripcion.nota_p3 || 0}</span>
                                    </div>

                                    <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="font-black text-indigo-900 uppercase">Promedio Final</span>
                                            <span className="font-black text-2xl text-indigo-600">{inscripcion.promedio_final || 0}</span>
                                        </div>
                                        <div className="text-right mt-1">
                                            <span className="text-xs font-bold text-indigo-400 uppercase">{inscripcion.estado_materia}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
