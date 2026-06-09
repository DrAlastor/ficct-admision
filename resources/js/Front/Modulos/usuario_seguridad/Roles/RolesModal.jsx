import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { FiX, FiChevronDown, FiChevronUp, FiShield } from 'react-icons/fi';

export default function RolesModal({ isOpen, onClose, rol = null, modulos = [] }) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nombre: '',
        descripcion: '',
        permisos: {}, // { funcion_id: id_accion }
    });

    const [expandedModules, setExpandedModules] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (rol) {
                // Map existing permissions into the state
                const currentPermisos = {};
                rol.funciones?.forEach(func => {
                    currentPermisos[func.id] = func.pivot.id_accion;
                });

                setData({
                    nombre: rol.nombre || '',
                    descripcion: rol.descripcion || '',
                    permisos: currentPermisos,
                });
            } else {
                reset();
            }
            clearErrors();

            // Expand all modules by default
            const allExpanded = {};
            modulos.forEach(mod => {
                allExpanded[mod.id] = true;
            });
            setExpandedModules(allExpanded);
        }
    }, [isOpen, rol, modulos]);

    const toggleModule = (modId) => {
        setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
    };

    const handleSelectAll = (modulo) => {
        // Check if all are already selected
        const allSelected = modulo.funciones.every(f => data.permisos[f.id]);

        const newPermisos = { ...data.permisos };
        if (allSelected) {
            // Deselect all for this module
            modulo.funciones.forEach(f => {
                delete newPermisos[f.id];
            });
        } else {
            // Select all for this module (defaulting to Lectura y Escritura = 3)
            modulo.funciones.forEach(f => {
                newPermisos[f.id] = 3;
            });
        }
        setData('permisos', newPermisos);
    };

    const handleCheckboxChange = (funcId, isChecked) => {
        const newPermisos = { ...data.permisos };
        if (isChecked) {
            newPermisos[funcId] = 3; // Default to 'Lectura y Escritura'
        } else {
            delete newPermisos[funcId];
        }
        setData('permisos', newPermisos);
    };

    const handleSelectChange = (funcId, accionId) => {
        setData('permisos', { ...data.permisos, [funcId]: parseInt(accionId) });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rol) {
            put(route('roles.update', rol.id), {
                onSuccess: () => { reset(); onClose(); },
            });
        } else {
            post(route('roles.store'), {
                onSuccess: () => { reset(); onClose(); },
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl p-4 md:p-6 my-8">
                <div className="relative bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">

                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                        <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">
                            {rol ? 'Editar Rol' : 'Crear Nuevo Rol'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 bg-transparent hover:bg-gray-100 hover:text-gray-900 rounded-full text-sm p-2 transition-colors"
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                        <form id="rol-form" onSubmit={handleSubmit} className="space-y-8">

                            {/* Datos Básicos */}
                            {errors.error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 mb-6 flex items-center">
                                    <span className="mr-2">⚠️</span> {errors.error}
                                </div>
                            )}
                            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                            Nombre del Rol <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.nombre}
                                            onChange={e => setData('nombre', e.target.value)}
                                            placeholder="Ej. Director de Carrera"
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 transition-colors"
                                        />
                                        {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                            Descripción (Opcional)
                                        </label>
                                        <input
                                            type="text"
                                            value={data.descripcion}
                                            onChange={e => setData('descripcion', e.target.value)}
                                            placeholder="¿Qué hace este rol en el sistema?"
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 transition-colors"
                                        />
                                        {errors.descripcion && <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Asignación de Módulos y Funciones */}
                            <div>
                                <div className="flex items-center mb-2">
                                    <FiShield className="text-[#ef172f] mr-3" size={24} />
                                    <h4 className="text-xl font-bold text-[#0F172A] tracking-tight">Asignación de Módulos y Funciones</h4>
                                </div>
                                <p className="text-gray-500 text-sm mb-6 ml-9">Marca las casillas de las funciones a las que este rol tendrá acceso y define su nivel de permiso.</p>

                                <div className="space-y-4">
                                    {modulos.map((modulo) => (
                                        <div key={modulo.id} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm transition-all bg-white">
                                            {/* Modulo Header */}
                                            <div
                                                className="flex flex-wrap md:flex-nowrap items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                                                onClick={() => toggleModule(modulo.id)}
                                            >
                                                <div className="flex flex-col flex-1">
                                                    <h5 className="text-lg font-bold text-[#0F172A]">{modulo.nombre}</h5>
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                        {modulo.funciones?.length || 0} FUNCIONES DISPONIBLES
                                                    </span>
                                                </div>
                                                <div className="flex items-center mt-3 md:mt-0 space-x-4">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); handleSelectAll(modulo); }}
                                                        className="text-xs font-bold bg-[#ef172f]/10 text-[#ef172f] px-4 py-2 rounded-full uppercase hover:bg-[#ef172f]/20 transition-colors"
                                                    >
                                                        {modulo.funciones.every(f => data.permisos[f.id]) ? 'DESELECCIONAR TODO' : 'SELECCIONAR TODO'}
                                                    </button>
                                                    <div className="text-gray-400">
                                                        {expandedModules[modulo.id] ? <FiChevronUp size={24} /> : <FiChevronDown size={24} />}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Funciones List (Accordion Body) */}
                                            {expandedModules[modulo.id] && modulo.funciones && modulo.funciones.length > 0 && (
                                                <div className="border-t border-gray-100 bg-white p-2">
                                                    {modulo.funciones.map((func) => {
                                                        const isChecked = !!data.permisos[func.id];
                                                        return (
                                                            <div key={func.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 rounded-xl transition-colors">

                                                                <div className="flex items-start md:items-center flex-1">
                                                                    <div className="relative flex items-center pt-1 md:pt-0">
                                                                        <input
                                                                            type="checkbox"
                                                                            id={`func-${func.id}`}
                                                                            checked={isChecked}
                                                                            onChange={(e) => handleCheckboxChange(func.id, e.target.checked)}
                                                                            className="w-5 h-5 text-[#ef172f] bg-gray-100 border-gray-300 rounded focus:ring-[#ef172f] focus:ring-2 cursor-pointer transition-all"
                                                                        />
                                                                    </div>
                                                                    <div className="ml-4 flex-1">
                                                                        <label htmlFor={`func-${func.id}`} className="text-sm font-bold text-[#0F172A] cursor-pointer block">{func.nombre}</label>
                                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">{func.descripcion}</p>
                                                                    </div>
                                                                </div>

                                                                {/* Dropdown de permisos (solo si está checked) */}
                                                                {isChecked && (
                                                                    <div className="mt-3 md:mt-0 md:ml-4 w-full md:w-48 shrink-0">
                                                                        <select
                                                                            value={data.permisos[func.id]}
                                                                            onChange={(e) => handleSelectChange(func.id, e.target.value)}
                                                                            className={`w-full text-sm font-bold rounded-xl border ${data.permisos[func.id] == 1 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                                    data.permisos[func.id] == 2 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                                } focus:ring-2 focus:ring-opacity-50 p-2.5 transition-colors cursor-pointer outline-none`}
                                                                        >
                                                                            <option value="1">Solo Lectura</option>
                                                                            <option value="2">Solo Edicion</option>
                                                                            <option value="3">Lectura y Escritura</option>
                                                                        </select>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end p-6 border-t border-gray-100 rounded-b-3xl shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-500 font-bold uppercase text-xs px-6 py-3 rounded-xl mr-2 hover:bg-gray-100 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            form="rol-form"
                            disabled={processing}
                            className="text-white bg-[#07074E] hover:bg-[#06063b] focus:ring-4 focus:ring-indigo-300 font-bold uppercase text-xs px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70"
                        >
                            {processing ? 'Guardando...' : (rol ? 'Actualizar Rol' : 'Crear Rol')}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
