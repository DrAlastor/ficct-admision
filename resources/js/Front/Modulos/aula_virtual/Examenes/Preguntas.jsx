import React, { useState } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { FiArrowLeft, FiDatabase, FiCheckCircle, FiXCircle, FiTrash2 } from 'react-icons/fi';

import PreguntaForm from './_components/PreguntaForm';
import PreguntaList from './_components/PreguntaList';

export default function Preguntas({ materias, preguntas }) {
    const { flash } = usePage().props;
    const [materiaSeleccionada, setMateriaSeleccionada] = useState(materias.length > 0 ? materias[0].id : '');

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [preguntaToDelete, setPreguntaToDelete] = useState(null);

    const generarPrueba = () => {
        setShowConfirmModal(false);
        router.post(route('examenes.preguntas.seeder'));
    };

    const limpiarTodo = () => {
        setShowClearModal(false);
        router.delete(route('examenes.preguntas.clear'));
    };

    const pedirEliminarPregunta = (id) => {
        setPreguntaToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmarEliminarPregunta = () => {
        if(preguntaToDelete) {
            router.delete(route('examenes.preguntas.destroy', preguntaToDelete));
            setShowDeleteModal(false);
            setPreguntaToDelete(null);
        }
    };

    const preguntasFiltradas = preguntas.filter(p => p.materia_id == materiaSeleccionada);

    return (
        <SidebarLayout title="BANCO DE PREGUNTAS" subtitle="Gestión de preguntas por materia">
            <Head title="Banco de Preguntas" />

            <div className="max-w-7xl mx-auto pb-10">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-r-xl flex items-center">
                        <FiCheckCircle className="text-green-600 mr-3 flex-shrink-0" size={20} />
                        <p className="text-sm font-bold text-green-800">{flash.success}</p>
                    </div>
                )}
                
                <div className="mb-6 flex justify-between items-center">
                    <Link href={route('examenes.index')} className="text-gray-500 hover:text-indigo-600 font-bold flex items-center transition-colors">
                        <FiArrowLeft className="mr-2" /> Volver a Exámenes
                    </Link>
                    <div className="flex space-x-3">
                        <button onClick={() => setShowClearModal(true)} className="bg-red-100 hover:bg-red-200 text-red-800 font-black px-4 py-2 rounded-lg text-sm flex items-center transition-colors">
                            <FiXCircle className="mr-2" /> Limpiar Todo
                        </button>
                        <button onClick={() => setShowConfirmModal(true)} className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-black px-4 py-2 rounded-lg text-sm flex items-center transition-colors">
                            <FiDatabase className="mr-2" /> Auto-generar
                        </button>
                    </div>
                </div>

                {/* Modal de Confirmación para Autogenerar */}
                {showConfirmModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all animate-[fadeIn_0.2s_ease-out]">
                            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-amber-100 rounded-full text-amber-600 mb-4">
                                <FiDatabase size={32} />
                            </div>
                            <h3 className="text-lg font-black text-center text-gray-800 mb-2">Generar Temarios Automáticos</h3>
                            <p className="text-sm text-center text-gray-600 mb-6">
                                ¿Deseas autogenerar 10 preguntas basadas en los temarios oficiales de <b>Matemáticas, Física, Inglés y Computación</b>? 
                                Esto facilitará las pruebas del sistema.
                            </p>
                            <div className="flex justify-between space-x-3">
                                <button 
                                    onClick={() => setShowConfirmModal(false)}
                                    className="w-1/2 py-2.5 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={generarPrueba}
                                    className="w-1/2 py-2.5 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
                                >
                                    Sí, Generar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Confirmación para Limpiar Todo */}
                {showClearModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all animate-[fadeIn_0.2s_ease-out]">
                            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full text-red-600 mb-4">
                                <FiXCircle size={32} />
                            </div>
                            <h3 className="text-lg font-black text-center text-gray-800 mb-2">Eliminar Banco de Preguntas</h3>
                            <p className="text-sm text-center text-gray-600 mb-6">
                                Estás a punto de eliminar <b>absolutamente todas las preguntas</b> de todas las materias. Esta acción no se puede deshacer. ¿Continuar?
                            </p>
                            <div className="flex justify-between space-x-3">
                                <button 
                                    onClick={() => setShowClearModal(false)}
                                    className="w-1/2 py-2.5 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={limpiarTodo}
                                    className="w-1/2 py-2.5 font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                >
                                    Sí, Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Confirmación para Eliminar Pregunta Individual */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all animate-[fadeIn_0.2s_ease-out]">
                            <div className="flex items-center justify-center w-14 h-14 mx-auto bg-red-50 rounded-full text-red-500 mb-4 border border-red-100">
                                <FiTrash2 size={24} />
                            </div>
                            <h3 className="text-lg font-black text-center text-gray-800 mb-2">Eliminar Pregunta</h3>
                            <p className="text-sm text-center text-gray-600 mb-6">
                                ¿Estás seguro de eliminar esta pregunta individual del banco? No podrás recuperarla.
                            </p>
                            <div className="flex justify-between space-x-3">
                                <button 
                                    onClick={() => { setShowDeleteModal(false); setPreguntaToDelete(null); }}
                                    className="w-1/2 py-2 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={confirmarEliminarPregunta}
                                    className="w-1/2 py-2 font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors text-sm shadow-sm"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <PreguntaForm materias={materias} />
                    
                    <PreguntaList 
                        materias={materias}
                        materiaSeleccionada={materiaSeleccionada}
                        setMateriaSeleccionada={setMateriaSeleccionada}
                        preguntasFiltradas={preguntasFiltradas}
                        pedirEliminarPregunta={pedirEliminarPregunta}
                    />
                </div>
            </div>
        </SidebarLayout>
    );
}
