import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { FiX, FiCheckCircle, FiUsers, FiMonitor } from 'react-icons/fi';

export default function InscribirGrupoModal({ show, onClose, grupos }) {
    const { post, processing } = useForm();
    const [selectedGroup, setSelectedGroup] = useState(null);

    if (!show) return null;

    const handleInscribir = () => {
        if (!selectedGroup) return;
        if(confirm(`¿Estás seguro de inscribirte al grupo ${selectedGroup}? Esta acción no se puede deshacer.`)) {
            post(route('grupos.inscribir_postulante'), {
                data: { grupo_nombre: selectedGroup }, // Note: inertia's post needs data as second arg
                preserveScroll: true,
                onSuccess: () => {
                    alert("¡Inscripción exitosa!");
                    onClose();
                    window.location.reload();
                },
                onError: (err) => {
                    alert(err.error || "Ocurrió un error");
                }
            });
        }
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (!selectedGroup) return;
        
        if(confirm(`¿Estás seguro de inscribirte al grupo ${selectedGroup}? Esta acción no se puede deshacer.`)) {
            router.post(route('grupos.inscribir_postulante'), 
            {
                grupo_nombre: selectedGroup
            }, 
            {
                preserveScroll: true,
                onSuccess: () => {
                    alert("¡Inscripción exitosa!");
                    onClose();
                },
                onError: (err) => {
                    alert(err.error || err.grupo_nombre || "Ocurrió un error al inscribir");
                }
            });
        }
    };

    const turnos = ['Mañana', 'Tarde', 'Noche'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                
                {/* Header */}
                <div className="p-6 md:p-8 bg-gradient-to-r from-[#07074E] to-blue-900 text-white flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight flex items-center">
                            <FiCheckCircle className="mr-3 text-green-400" />
                            Inscripción de Grupo
                        </h2>
                        <p className="text-blue-200 mt-1 font-medium">Selecciona el grupo de tu preferencia según la disponibilidad.</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-gray-50/50">
                    <form id="enrollForm" onSubmit={submitForm}>
                        <div className="space-y-8">
                            {turnos.map(turno => {
                                const gruposTurno = grupos.filter(g => g.turno === turno);
                                if (gruposTurno.length === 0) return null;

                                return (
                                    <div key={turno}>
                                        <h3 className="text-lg font-black text-slate-800 border-b pb-2 mb-4 flex items-center">
                                            Turno <span className="ml-1 text-indigo-600">{turno}</span>
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {gruposTurno.map(grupo => {
                                                const isAvailable = grupo.disponible > 0;
                                                const isSelected = selectedGroup === grupo.nombre;
                                                
                                                return (
                                                    <div 
                                                        key={grupo.nombre}
                                                        onClick={() => isAvailable && setSelectedGroup(grupo.nombre)}
                                                        className={`relative rounded-2xl border-2 transition-all duration-200 p-4 ${
                                                            !isAvailable 
                                                                ? 'opacity-60 bg-gray-100 border-gray-200 cursor-not-allowed' 
                                                                : isSelected 
                                                                    ? 'border-indigo-500 bg-indigo-50/50 shadow-md transform -translate-y-1 cursor-pointer' 
                                                                    : 'border-transparent bg-white hover:border-indigo-200 hover:shadow-md cursor-pointer'
                                                        }`}
                                                    >
                                                        {isSelected && (
                                                            <div className="absolute top-3 right-3 text-indigo-600">
                                                                <FiCheckCircle size={20} />
                                                            </div>
                                                        )}
                                                        <div className="text-2xl font-black text-slate-800 tracking-widest mb-1">{grupo.nombre}</div>
                                                        <div className="text-xs font-bold text-gray-500 flex items-center mb-3">
                                                            {grupo.modalidad === 'Presencial' ? <FiUsers className="mr-1"/> : <FiMonitor className="mr-1"/>}
                                                            Modalidad {grupo.modalidad}
                                                        </div>
                                                        <div className={`text-sm font-black px-3 py-1.5 rounded-lg inline-block ${
                                                            isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                            {isAvailable ? `${grupo.disponible} Cupos Disponibles` : 'Grupo Lleno'}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-white flex justify-between items-center shrink-0">
                    <div className="text-sm font-medium text-slate-500">
                        {selectedGroup ? (
                            <span>Grupo seleccionado: <strong className="text-indigo-600 text-lg ml-1">{selectedGroup}</strong></span>
                        ) : (
                            <span>Por favor, selecciona un grupo disponible.</span>
                        )}
                    </div>
                    <div className="space-x-3">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            form="enrollForm"
                            disabled={!selectedGroup || processing}
                            className="px-8 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-600/30"
                        >
                            {processing ? 'Inscribiendo...' : 'Confirmar Inscripción'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
