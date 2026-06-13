import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiArrowRight, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import { router } from '@inertiajs/react';

export default function GestionarCargaModal({ isOpen, onClose, docente }) {
    const [disponibles, setDisponibles] = useState([]);
    const [asignados, setAsignados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        if (isOpen && docente) {
            fetchGrupos();
        }
    }, [isOpen, docente]);

    const fetchGrupos = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const response = await axios.get(`/carga-horaria/${docente.id}/grupos`);
            setDisponibles(response.data.disponibles || []);
            setAsignados(response.data.asignados || []);
        } catch (error) {
            setErrorMsg('Error al cargar los grupos disponibles.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const moveToAsignados = (grupo) => {
        if (asignados.length >= docente.grupos_maximos) {
            setErrorMsg(`Límite Excedido: Un docente solo puede tener hasta ${docente.grupos_maximos} grupos.`);
            return;
        }
        setDisponibles(disponibles.filter(g => g.id !== grupo.id));
        setAsignados([...asignados, grupo]);
        setErrorMsg(null);
    };

    const moveToDisponibles = (grupo) => {
        setAsignados(asignados.filter(g => g.id !== grupo.id));
        setDisponibles([...disponibles, grupo]);
        setErrorMsg(null);
    };

    const handleSave = async () => {
        if (asignados.length > docente.grupos_maximos) {
            setErrorMsg(`Límite Excedido: Un docente solo puede tener hasta ${docente.grupos_maximos} grupos.`);
            return;
        }

        setSaving(true);
        setErrorMsg(null);
        try {
            const grupoIds = asignados.map(g => g.id);
            await axios.post(`/carga-horaria/${docente.id}`, { grupos: grupoIds });
            router.reload({ only: ['docentes'] });
            onClose();
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMsg(error.response.data.message);
            } else {
                setErrorMsg('Error al guardar la carga horaria.');
            }
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50 backdrop-blur-sm" onClick={!saving ? onClose : null} />

                <div className="relative inline-block w-full max-w-5xl p-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl flex flex-col max-h-[90vh]">
                    <div className="flex items-center justify-between mb-6 flex-shrink-0">
                        <div>
                            <h3 className="text-2xl font-black text-gray-800 tracking-tight">
                                Gestionar Carga Horaria
                            </h3>
                            <p className="text-sm text-gray-500 font-medium mt-1">
                                {docente.nombres} - {docente.profesion}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={saving}
                            className="p-2 text-gray-400 bg-gray-100 rounded-full hover:text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold flex items-center flex-shrink-0">
                            <FiAlertCircle className="mr-2 flex-shrink-0" size={20} />
                            {errorMsg}
                        </div>
                    )}

                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-6 min-h-[400px]">
                        {/* DISPONIBLES */}
                        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col overflow-hidden">
                            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                                <h4 className="font-bold text-gray-700">Grupos Disponibles</h4>
                                <span className="text-xs text-gray-500 font-medium">Seleccione para asignar</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {loading ? (
                                    <div className="text-center py-8 text-gray-500 font-medium">Cargando...</div>
                                ) : disponibles.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400 font-medium border-2 border-dashed border-gray-200 rounded-xl">
                                        No hay grupos disponibles.
                                    </div>
                                ) : (
                                    disponibles.map(grupo => (
                                        <div key={grupo.id} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:border-indigo-300 transition-colors flex justify-between items-center group">
                                            <div>
                                                <div className="font-bold text-gray-800">{grupo.materia}</div>
                                                <div className="text-sm text-gray-500 font-medium mt-1 flex items-center gap-2">
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-bold text-gray-700 border border-gray-200">{grupo.grupo}</span>
                                                    <span>{grupo.modalidad}</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => moveToAsignados(grupo)}
                                                className="bg-indigo-50 text-indigo-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-100"
                                                title="Asignar al docente"
                                            >
                                                <FiArrowRight size={20} className="hidden md:block" />
                                                <span className="md:hidden font-bold text-sm">Asignar</span>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* ASIGNADOS */}
                        <div className="flex-1 bg-indigo-50 border border-indigo-100 rounded-2xl flex flex-col overflow-hidden">
                            <div className="bg-indigo-100 px-4 py-3 border-b border-indigo-200 flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-indigo-900">Grupos Asignados</h4>
                                    <span className="text-xs text-indigo-700 font-medium">Responsabilidad actual</span>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-black ${asignados.length > docente.grupos_maximos ? 'bg-red-500 text-white' : 'bg-indigo-200 text-indigo-800'}`}>
                                    {asignados.length} / {docente.grupos_maximos}
                                </span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {loading ? (
                                    <div className="text-center py-8 text-indigo-400 font-medium">Cargando...</div>
                                ) : asignados.length === 0 ? (
                                    <div className="text-center py-8 text-indigo-400 font-medium border-2 border-dashed border-indigo-200 rounded-xl">
                                        Ningún grupo asignado.
                                    </div>
                                ) : (
                                    asignados.map(grupo => (
                                        <div key={grupo.id} className="bg-white border border-indigo-200 p-4 rounded-xl shadow-sm hover:border-red-300 transition-colors flex justify-between items-center group">
                                            <button 
                                                onClick={() => moveToDisponibles(grupo)}
                                                className="bg-red-50 text-red-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                                                title="Remover asignación"
                                            >
                                                <FiArrowLeft size={20} className="hidden md:block" />
                                                <span className="md:hidden font-bold text-sm">Remover</span>
                                            </button>
                                            <div className="text-right">
                                                <div className="font-bold text-indigo-900">{grupo.materia}</div>
                                                <div className="text-sm text-indigo-600 font-medium mt-1 flex justify-end items-center gap-2">
                                                    <span>{grupo.modalidad}</span>
                                                    <span className="bg-indigo-100 px-2 py-0.5 rounded text-xs font-bold border border-indigo-200">{grupo.grupo}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 border-t pt-6 flex-shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="px-6 py-3 font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || asignados.length > docente.grupos_maximos}
                            className="px-6 py-3 font-bold text-white bg-[#07074E] rounded-xl hover:bg-[#0A0F5C] focus:ring-4 focus:ring-indigo-200 transition-all flex items-center shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                            <FiSave className="mr-2" />
                            {saving ? 'Guardando...' : 'Confirmar Carga Horaria'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
