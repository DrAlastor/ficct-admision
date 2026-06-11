import React, { useState } from 'react';
import { FiClock, FiMapPin, FiBookOpen, FiChevronDown, FiX, FiCheck } from 'react-icons/fi';
import axios from 'axios';
import { router } from '@inertiajs/react';

export default function AulasGeneradas({ horarios }) {
    const gruposNombres = Object.keys(horarios);
    const [openGroups, setOpenGroups] = useState({});
    
    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedMateria, setSelectedMateria] = useState(null);
    const [aulasDisponibles, setAulasDisponibles] = useState([]);
    const [loadingAulas, setLoadingAulas] = useState(false);
    const [selectedAulaId, setSelectedAulaId] = useState('');

    if (gruposNombres.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <FiClock className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-400">Aún no hay horarios generados para asignar aulas</h3>
                <p className="text-gray-400 mt-2">Por favor, dirígete al módulo de Gestión de Horarios para generarlos primero.</p>
            </div>
        );
    }

    const toggleGroup = (grupo) => {
        setOpenGroups(prev => ({ ...prev, [grupo]: !prev[grupo] }));
    };

    const openAulaModal = async (grupo, item) => {
        setSelectedMateria({ grupo, ...item });
        setModalOpen(true);
        setSelectedAulaId('');
        setLoadingAulas(true);
        try {
            const response = await axios.get(route('aulas.admin.aulas_disponibles'), {
                params: {
                    hora_inicio: item.hora_inicio,
                    hora_fin: item.hora_fin,
                    materia: item.materia
                }
            });
            setAulasDisponibles(response.data);
        } catch (error) {
            console.error('Error fetching aulas', error);
        } finally {
            setLoadingAulas(false);
        }
    };

    const submitAula = () => {
        if (!selectedAulaId) return;
        router.post(route('aulas.admin.asignar_aula'), {
            grupo_nombre: selectedMateria.grupo,
            materia: selectedMateria.materia,
            hora_inicio: selectedMateria.hora_inicio,
            aula_id: selectedAulaId
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setModalOpen(false);
                setSelectedAulaId('');
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end mb-4">
                <button 
                    onClick={() => router.post(route('aulas.admin.autogenerar'), {}, { preserveScroll: true })}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl flex items-center shadow-md transition-colors"
                >
                    <FiCheck className="mr-2" />
                    Autogenerar Aulas Físicas
                </button>
            </div>

            {gruposNombres.map((grupo) => (
                <div key={grupo} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Header Acordeon */}
                    <button 
                        onClick={() => toggleGroup(grupo)}
                        className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl tracking-widest">
                                {grupo}
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-[#0F172A] text-lg">Malla Horaria</h4>
                                <p className="text-sm text-gray-500 font-medium">Asignación de aulas físicas</p>
                            </div>
                        </div>
                        <div className={`p-2 rounded-full bg-gray-50 text-gray-400 transition-transform ${openGroups[grupo] ? 'rotate-180' : ''}`}>
                            <FiChevronDown size={20} />
                        </div>
                    </button>

                    {/* Contenido Acordeon */}
                    <div className={`transition-all duration-300 ease-in-out ${openGroups[grupo] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                        <div className="p-6 pt-0 border-t border-gray-50">
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {horarios[grupo].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-blue-100 transition-all group">
                                        <div className="flex items-center">
                                            <div className="flex flex-col justify-center items-center px-4 py-2 bg-white rounded-lg border border-gray-100 shadow-sm mr-4 text-center min-w-[100px]">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Bloque</span>
                                                <span className="text-[#0F172A] font-black text-sm">{item.hora_inicio}</span>
                                                <span className="text-gray-300 text-xs my-0.5">a</span>
                                                <span className="text-[#0F172A] font-black text-sm">{item.hora_fin}</span>
                                            </div>

                                            <div>
                                                <h5 className="font-bold text-gray-800 text-base mb-1 group-hover:text-blue-600 transition-colors flex items-center">
                                                    <FiBookOpen className="mr-2 text-gray-400" />
                                                    {item.materia} <span className="ml-2 text-xs font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded-md">{item.sigla}</span>
                                                </h5>
                                                <p className="text-sm font-medium text-gray-500 flex items-center mt-2">
                                                    <FiMapPin className={`mr-1.5 ${item.aula ? 'text-red-500' : 'text-amber-500'}`} /> Aula asignada: 
                                                    {item.aula ? (
                                                        <strong className="ml-1 text-blue-700">{item.aula}</strong>
                                                    ) : (
                                                        <span className="ml-1 text-amber-500 font-bold italic">Pendiente</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => openAulaModal(grupo, item)}
                                            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold rounded-lg transition-colors"
                                        >
                                            {item.aula ? 'Reasignar Aula' : 'Asignar Aula'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Modal de Asignación de Aula */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="font-black text-gray-800 text-lg">Asignar Aula Físicamente</h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {selectedMateria?.materia} - Grupo {selectedMateria?.grupo}
                                </p>
                            </div>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                                <FiX size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <div className="mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                                <p className="text-sm text-indigo-800 flex items-center mb-2 font-bold">
                                    <FiClock className="mr-2" /> Bloque de Horario:
                                </p>
                                <p className="text-xs text-indigo-600">
                                    Lunes a Viernes de {selectedMateria?.hora_inicio} a {selectedMateria?.hora_fin}
                                </p>
                            </div>

                            <label className="block text-sm font-bold text-gray-700 mb-2">Seleccione un Aula Disponible</label>
                            
                            {loadingAulas ? (
                                <div className="py-8 text-center text-gray-400">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                                    <p className="text-sm font-medium">Buscando aulas libres...</p>
                                </div>
                            ) : aulasDisponibles.length === 0 ? (
                                <div className="py-6 px-4 bg-red-50 text-red-600 rounded-xl text-center text-sm font-medium border border-red-100">
                                    No hay aulas disponibles en esta franja horaria.
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                    {aulasDisponibles.map(aula => (
                                        <div 
                                            key={aula.id} 
                                            onClick={() => setSelectedAulaId(aula.id)}
                                            className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex justify-between items-center ${
                                                selectedAulaId === aula.id 
                                                ? 'border-indigo-600 bg-indigo-50' 
                                                : 'border-gray-100 hover:border-indigo-200'
                                            }`}
                                        >
                                            <div>
                                                <h4 className={`font-bold ${selectedAulaId === aula.id ? 'text-indigo-800' : 'text-gray-700'}`}>
                                                    Aula {aula.nro_aula}
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-1">Capacidad: {aula.capacidad} estudiantes</p>
                                            </div>
                                            {selectedAulaId === aula.id && (
                                                <div className="h-6 w-6 bg-indigo-600 text-white rounded-full flex items-center justify-center">
                                                    <FiCheck size={14} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button 
                                onClick={() => setModalOpen(false)} 
                                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={submitAula}
                                disabled={!selectedAulaId}
                                className={`px-6 py-2.5 rounded-xl font-bold flex items-center transition-colors ${
                                    selectedAulaId 
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow' 
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <FiCheck className="mr-2" /> Confirmar Asignación
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
