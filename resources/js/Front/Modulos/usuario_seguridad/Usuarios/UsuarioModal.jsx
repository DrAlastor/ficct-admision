import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { FiX, FiMail, FiUser, FiShield } from 'react-icons/fi';

export default function UsuarioModal({ isOpen, onClose, usuario = null, roles = [], nextId = 1 }) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        ci: '',
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        telefono: '',
        cargo: '',
        email: '',
        rol_id: '',
        password: '',
    });

    useEffect(() => {
        if (isOpen) {
            if (usuario) {
                setData({
                    ci: usuario.perfil?.ci || '',
                    nombres: usuario.perfil?.nombres || '',
                    apellido_paterno: usuario.perfil?.apellido_paterno || '',
                    apellido_materno: usuario.perfil?.apellido_materno || '',
                    telefono: usuario.perfil?.telefono || '',
                    cargo: usuario.perfil?.cargo || '',
                    email: usuario.perfil?.email || '',
                    rol_id: usuario.rol_id || '',
                    password: '',
                });
            } else {
                reset();
            }
            clearErrors();
        }
    }, [isOpen, usuario]);

    const getPredictedCodigo = () => {
        if (!data.rol_id) return 'Seleccione un rol...';
        const nextIdStr = nextId.toString();
        switch (parseInt(data.rol_id)) {
            case 1: return `ADM${nextIdStr.padStart(3, '0')}`;
            case 2: return `DOC${nextIdStr.padStart(4, '0')}`;
            case 3: return `POS${new Date().getFullYear().toString().slice(-2)}5${nextIdStr.padStart(4, '0')}`;
            default: return `USR${nextIdStr.padStart(4, '0')}`;
        }
    };
    const currentCodigo = usuario ? usuario.codigo_inicio : getPredictedCodigo();

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (usuario) {
            put(route('usuarios.update', usuario.id), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post(route('usuarios.store'), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl p-4 md:p-6 my-8">
                {/* Modal content */}
                <div className="relative bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                        <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">
                            {usuario ? 'Editar Usuario' : 'Registrar Usuario'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 bg-transparent hover:bg-gray-100 hover:text-gray-900 rounded-full text-sm p-2 inline-flex items-center transition-colors"
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* Body - Scrollable */}
                    <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                        <form id="usuario-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* Error General */}
                            {errors.error && (
                                <div className="col-span-1 md:col-span-2 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 flex items-center">
                                    <span className="mr-2">⚠️</span> {errors.error}
                                </div>
                            )}

                            {/* Columna 1: DATOS PERSONALES */}
                            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                <div className="flex items-center mb-6 border-b border-gray-100 pb-3">
                                    <FiUser className="text-[#07074E] mr-3" size={20} />
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-[#07074E]">Datos Personales</h4>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">CI</label>
                                        <input
                                            type="text"
                                            value={data.ci}
                                            onChange={e => setData('ci', e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 transition-colors"
                                        />
                                        {errors.ci && <p className="mt-1 text-sm text-red-600">{errors.ci}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Nombres</label>
                                        <input
                                            type="text"
                                            value={data.nombres}
                                            onChange={e => setData('nombres', e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 transition-colors"
                                        />
                                        {errors.nombres && <p className="mt-1 text-sm text-red-600">{errors.nombres}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Ap. Paterno</label>
                                            <input
                                                type="text"
                                                value={data.apellido_paterno}
                                                onChange={e => setData('apellido_paterno', e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 transition-colors"
                                            />
                                            {errors.apellido_paterno && <p className="mt-1 text-sm text-red-600">{errors.apellido_paterno}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Ap. Materno</label>
                                            <input
                                                type="text"
                                                value={data.apellido_materno}
                                                onChange={e => setData('apellido_materno', e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 transition-colors"
                                            />
                                            {errors.apellido_materno && <p className="mt-1 text-sm text-red-600">{errors.apellido_materno}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Teléfono</label>
                                        <input
                                            type="text"
                                            value={data.telefono}
                                            onChange={e => setData('telefono', e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 transition-colors"
                                        />
                                        {errors.telefono && <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Cargo</label>
                                        <input
                                            type="text"
                                            value={data.cargo}
                                            onChange={e => setData('cargo', e.target.value)}
                                            placeholder="Ej. Docente Titular, Encargado, etc."
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 transition-colors"
                                        />
                                        {errors.cargo && <p className="mt-1 text-sm text-red-600">{errors.cargo}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Correo Electrónico</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                                <FiMail />
                                            </div>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block pl-10 p-3 transition-colors"
                                                placeholder="correo@ejemplo.com"
                                            />
                                        </div>
                                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Columna 2: ACCESOS DE USUARIO */}
                            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                <div className="flex items-center mb-6 border-b border-gray-100 pb-3">
                                    <FiShield className="text-[#ef172f] mr-3" size={20} />
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-[#07074E]">Accesos de Usuario</h4>
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Rol en el Sistema</label>
                                        <select
                                            value={data.rol_id}
                                            onChange={e => setData('rol_id', e.target.value)}
                                            className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 shadow-sm transition-all"
                                        >
                                            <option value="">Seleccione un rol</option>
                                            {roles.map((rol) => (
                                                <option key={rol.id} value={rol.id}>
                                                    {rol.nombre}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.rol_id && <p className="mt-1 text-sm text-red-600">{errors.rol_id}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Código de Usuario</label>
                                        <div className="w-full bg-gray-100 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl block p-3 cursor-not-allowed">
                                            {currentCodigo}
                                        </div>
                                        <p className="mt-1 text-xs text-gray-400">Este código se genera automáticamente.</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                            Contraseña {usuario && '(Dejar en blanco para no cambiar)'}
                                        </label>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 transition-colors"
                                            placeholder={!usuario ? "Si se deja vacío, será el CI" : "Nueva contraseña..."}
                                        />
                                        <p className="mt-2 text-xs font-bold text-gray-400 uppercase tracking-wide">
                                            Debe tener minimo 8 caracteres si se especifica manualmente.
                                        </p>
                                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end p-6 border-t border-gray-100 rounded-b-3xl shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-500 bg-transparent hover:bg-gray-100 hover:text-gray-900 font-bold uppercase text-xs px-6 py-3 rounded-xl mr-2 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            form="usuario-form"
                            disabled={processing}
                            className="text-white bg-[#07074E] hover:bg-[#06063b] focus:ring-4 focus:outline-none focus:ring-indigo-300 font-bold uppercase text-xs px-6 py-3 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Guardando...' : (usuario ? 'Actualizar Usuario' : 'Registrar Usuario')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
