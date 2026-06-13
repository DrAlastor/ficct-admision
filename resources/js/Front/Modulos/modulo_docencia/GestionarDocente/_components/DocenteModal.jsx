import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { FiX, FiSave, FiUser, FiBriefcase } from 'react-icons/fi';
import InputError from '@/Components/InputError';

export default function DocenteModal({ isOpen, onClose, docente }) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        ci: '',
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        fecha_nacimiento: '',
        nacionalidad: 'Boliviana',
        sexo: 'M',
        direccion: '',
        telefono: '',
        email: '',
        profesion: '',
        area_profesional: '',
        grado_academico: '',
        maestria: 'No',
        diplomado_educacion_superior: 'No',
        experiencia_anos: 0,
        estado: 'Activo'
    });

    useEffect(() => {
        if (isOpen) {
            if (docente) {
                setData({
                    ci: docente.perfil.ci || '',
                    nombres: docente.perfil.nombres || '',
                    apellido_paterno: docente.perfil.apellido_paterno || '',
                    apellido_materno: docente.perfil.apellido_materno || '',
                    fecha_nacimiento: docente.perfil.fecha_nacimiento || '',
                    nacionalidad: docente.perfil.nacionalidad || 'Boliviana',
                    sexo: docente.perfil.sexo || 'M',
                    direccion: docente.perfil.direccion || '',
                    telefono: docente.perfil.telefono || '',
                    email: docente.perfil.email || '',
                    profesion: docente.docente.profesion || '',
                    area_profesional: docente.docente.area_profesional || '',
                    grado_academico: docente.docente.grado_academico || '',
                    maestria: docente.docente.maestria || 'No',
                    diplomado_educacion_superior: docente.docente.diplomado_educacion_superior || 'No',
                    experiencia_anos: docente.docente.experiencia_anos || 0,
                    estado: docente.estado || 'Activo'
                });
            } else {
                reset();
            }
            clearErrors();
        }
    }, [isOpen, docente]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (docente) {
            put(route('docentes.update', docente.id), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post(route('docentes.store'), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50 backdrop-blur-sm" onClick={onClose} />

                <div className="relative inline-block w-full max-w-4xl p-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-gray-800 tracking-tight">
                                {docente ? 'Editar Docente' : 'Nuevo Docente'}
                            </h3>
                            <p className="text-sm text-gray-500 font-medium mt-1">
                                {docente ? 'Modifica los datos del docente' : 'Completa el formulario para registrar un nuevo docente'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 bg-gray-100 rounded-full hover:text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    {errors.requisitos && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium">
                            {errors.requisitos}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* SECCIÓN 1: PERFIL PERSONAL */}
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h4 className="flex items-center text-lg font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">
                                <FiUser className="mr-2 text-indigo-600" />
                                Perfil Personal
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Carnet de Identidad</label>
                                    <input
                                        type="text"
                                        value={data.ci}
                                        onChange={e => setData('ci', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                        placeholder="Ej: 8000000"
                                        required
                                    />
                                    <InputError message={errors.ci} className="mt-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Nombres</label>
                                    <input
                                        type="text"
                                        value={data.nombres}
                                        onChange={e => setData('nombres', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                        required
                                    />
                                    <InputError message={errors.nombres} className="mt-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Apellido Paterno</label>
                                    <input
                                        type="text"
                                        value={data.apellido_paterno}
                                        onChange={e => setData('apellido_paterno', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                        required
                                    />
                                    <InputError message={errors.apellido_paterno} className="mt-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Apellido Materno</label>
                                    <input
                                        type="text"
                                        value={data.apellido_materno}
                                        onChange={e => setData('apellido_materno', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Fecha de Nacimiento</label>
                                    <input
                                        type="date"
                                        value={data.fecha_nacimiento}
                                        onChange={e => setData('fecha_nacimiento', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Sexo</label>
                                    <select
                                        value={data.sexo}
                                        onChange={e => setData('sexo', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                    >
                                        <option value="M">Masculino</option>
                                        <option value="F">Femenino</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Nacionalidad</label>
                                    <input
                                        type="text"
                                        value={data.nacionalidad}
                                        onChange={e => setData('nacionalidad', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Teléfono</label>
                                    <input
                                        type="text"
                                        value={data.telefono}
                                        onChange={e => setData('telefono', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Dirección</label>
                                    <input
                                        type="text"
                                        value={data.direccion}
                                        onChange={e => setData('direccion', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 2: PERFIL PROFESIONAL */}
                        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                            <h4 className="flex items-center text-lg font-bold text-gray-800 mb-6 border-b border-indigo-200 pb-2">
                                <FiBriefcase className="mr-2 text-indigo-600" />
                                Perfil Profesional
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Profesión</label>
                                    <input
                                        type="text"
                                        value={data.profesion}
                                        onChange={e => setData('profesion', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                        placeholder="Ej: Ingeniero Informático"
                                        required
                                    />
                                    <InputError message={errors.profesion} className="mt-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Área Profesional</label>
                                    <input
                                        type="text"
                                        value={data.area_profesional}
                                        onChange={e => setData('area_profesional', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                        placeholder="Ej: Tecnología"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Grado Académico</label>
                                    <select
                                        value={data.grado_academico}
                                        onChange={e => setData('grado_academico', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                        required
                                    >
                                        <option value="">Selecciona...</option>
                                        <option value="Licenciatura">Licenciatura</option>
                                        <option value="Maestría">Maestría</option>
                                        <option value="Doctorado">Doctorado</option>
                                    </select>
                                    <InputError message={errors.grado_academico} className="mt-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Experiencia (Años)</label>
                                    <input
                                        type="number"
                                        value={data.experiencia_anos}
                                        onChange={e => setData('experiencia_anos', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                        min="0"
                                        required
                                    />
                                    <InputError message={errors.experiencia_anos} className="mt-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">¿Tiene Diplomado en Ed. Superior?</label>
                                    <select
                                        value={data.diplomado_educacion_superior}
                                        onChange={e => setData('diplomado_educacion_superior', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                        required
                                    >
                                        <option value="Si">Sí</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">¿Tiene Maestría?</label>
                                    <select
                                        value={data.maestria}
                                        onChange={e => setData('maestria', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                        required
                                    >
                                        <option value="Si">Sí</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>

                                {docente && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Estado de la Cuenta</label>
                                        <select
                                            value={data.estado}
                                            onChange={e => setData('estado', e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none font-bold"
                                        >
                                            <option value="Activo">Activo</option>
                                            <option value="Inactivo">Inactivo</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8 border-t pt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-3 font-bold text-white bg-[#07074E] rounded-xl hover:bg-[#0A0F5C] focus:ring-4 focus:ring-indigo-200 transition-all flex items-center shadow-md hover:shadow-lg disabled:opacity-50"
                            >
                                <FiSave className="mr-2" />
                                {docente ? 'Guardar Cambios' : 'Registrar Docente'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
