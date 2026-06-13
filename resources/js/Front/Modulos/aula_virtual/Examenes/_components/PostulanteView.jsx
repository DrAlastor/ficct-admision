import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { FiCheckCircle, FiClock, FiPlay, FiKey, FiX } from 'react-icons/fi';

export default function PostulanteView({ examenes, inscripciones }) {
    const [selectedExamen, setSelectedExamen] = useState(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        password: ''
    });

    const getEstadoClass = (estado) => {
        if (estado === 'Aprobado') return 'bg-green-100 text-green-700 border-green-200';
        if (estado === 'Reprobado') return 'bg-red-100 text-red-700 border-red-200';
        if (estado === 'Cursando') return 'bg-blue-100 text-blue-700 border-blue-200';
        return 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const openPasswordModal = (examen) => {
        setSelectedExamen(examen);
        reset();
    };

    const closePasswordModal = () => {
        setSelectedExamen(null);
        reset();
    };

    const submitPassword = (e) => {
        e.preventDefault();
        if (selectedExamen) {
            post(route('examenes.rendir', selectedExamen.id), {
                onSuccess: () => {
                    // Si es exitoso, Inertia renderiza la página de Rendir automáticamente
                },
                onError: () => {
                    // Error como contraseña incorrecta se muestra mediante page props flash
                }
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Exámenes Globales Disponibles */}
            <div>
                <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide mb-4 flex items-center">
                    <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
                    Exámenes Globales Pendientes
                </h3>
                {examenes.filter(e => !e.ya_realizado).length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                        <FiCheckCircle className="mx-auto text-green-400 mb-3" size={40} />
                        <h4 className="text-lg font-black text-gray-700">No tienes exámenes pendientes</h4>
                        <p className="text-sm text-gray-500">Mantente atento a las fechas programadas para tu turno.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {examenes.filter(e => !e.ya_realizado).map(ex => (
                            <div key={ex.id} className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10"></div>
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="bg-blue-100 text-blue-800 text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider">{ex.tipo}</span>
                                        <span className="flex items-center text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                                            <FiClock className="mr-1" /> {ex.duracion_minutos} min
                                        </span>
                                    </div>
                                    <h4 className="text-xl font-black text-gray-800 mb-1">Examen Global - Turno {ex.turno}</h4>
                                    <p className="text-xs text-gray-500 mb-4">Cierra el {ex.fecha_fin}</p>
                                </div>
                                <button 
                                    onClick={() => openPasswordModal(ex)} 
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center transition-colors shadow-sm"
                                >
                                    <FiPlay className="mr-2" /> Iniciar Examen Global
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Contraseña */}
            {selectedExamen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                        <div className="bg-indigo-600 p-5 flex justify-between items-center text-white">
                            <h3 className="font-black text-lg flex items-center">
                                <FiKey className="mr-2" /> Autenticación de Examen
                            </h3>
                            <button onClick={closePasswordModal} className="text-indigo-200 hover:text-white transition-colors">
                                <FiX size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-6 text-center">
                                Ingresa la contraseña asignada por el administrador para iniciar el <strong className="text-gray-800">{selectedExamen.tipo}</strong> del turno <strong>{selectedExamen.turno}</strong>.
                            </p>
                            <form onSubmit={submitPassword}>
                                <div className="mb-6">
                                    <input 
                                        type="text" 
                                        required 
                                        value={data.password} 
                                        onChange={e => setData('password', e.target.value)} 
                                        placeholder="Contraseña del examen"
                                        className="w-full border-gray-300 rounded-xl py-3 text-center text-lg font-mono tracking-widest text-indigo-800 bg-indigo-50 shadow-inner focus:ring-indigo-500 focus:border-indigo-500"
                                        autoFocus
                                    />
                                    {errors.password && <p className="text-red-500 text-xs mt-2 text-center">{errors.password}</p>}
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={processing} 
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-xl shadow-md transition-all flex justify-center items-center"
                                >
                                    {processing ? 'Verificando...' : 'Acceder al Examen'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Mis Calificaciones */}
            <div>
                <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide mb-4 flex items-center">
                    <span className="w-2 h-6 bg-purple-500 rounded-full mr-3"></span>
                    Mis Calificaciones Globales (EVALUACIONES)
                </h3>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left font-black text-gray-500 text-xs uppercase">Materia</th>
                                    <th className="px-6 py-4 text-center font-black text-gray-500 text-xs uppercase">P1 (30%)</th>
                                    <th className="px-6 py-4 text-center font-black text-gray-500 text-xs uppercase">P2 (30%)</th>
                                    <th className="px-6 py-4 text-center font-black text-gray-500 text-xs uppercase">Final (40%)</th>
                                    <th className="px-6 py-4 text-center font-black text-gray-800 text-xs uppercase">Nota Final</th>
                                    <th className="px-6 py-4 text-center font-black text-gray-500 text-xs uppercase">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {inscripciones.map(ins => (
                                    <tr key={ins.inscripcion_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-bold text-gray-800">{ins.materia_nombre}</td>
                                        <td className="px-6 py-4 text-center font-mono text-gray-600">{ins.nota_p1 || '0.00'}</td>
                                        <td className="px-6 py-4 text-center font-mono text-gray-600">{ins.nota_p2 || '0.00'}</td>
                                        <td className="px-6 py-4 text-center font-mono text-gray-600">{ins.nota_p3 || '0.00'}</td>
                                        <td className="px-6 py-4 text-center font-mono font-black text-purple-700">{ins.promedio_final || '0.00'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1.5 rounded-md text-xs font-bold border ${getEstadoClass(ins.estado_materia || 'Cursando')}`}>
                                                {ins.estado_materia || 'Cursando'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
