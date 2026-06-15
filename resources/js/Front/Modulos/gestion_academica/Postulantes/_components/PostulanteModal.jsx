import React, { useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { FiX, FiSave, FiUser, FiCalendar, FiMapPin, FiMail, FiPhone, FiCheckCircle, FiFileText } from 'react-icons/fi';

export default function PostulanteModal({ isOpen, onClose, postulante }) {
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        ci: '',
        fecha_nacimiento: '',
        nacionalidad: '',
        sexo: '',
        direccion: '',
        telefono: '',
        email: '',
        colegio_procedencia: '',
        ciudad: '',
    });

    useEffect(() => {
        if (isOpen && postulante) {
            setData({
                nombres: postulante.nombres || '',
                apellido_paterno: postulante.apellido_paterno || '',
                apellido_materno: postulante.apellido_materno || '',
                ci: postulante.ci || '',
                fecha_nacimiento: postulante.fecha_nacimiento || '',
                nacionalidad: postulante.nacionalidad || '',
                sexo: postulante.sexo || '',
                direccion: postulante.direccion || '',
                telefono: postulante.telefono || '',
                email: postulante.email || '',
                colegio_procedencia: postulante.colegio_procedencia || '',
                ciudad: postulante.ciudad || '',
            });
            clearErrors();
        } else {
            reset();
            clearErrors();
        }
    }, [isOpen, postulante]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/postulantes/${postulante.perfil_id}`, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    const [showConfirm, setShowConfirm] = React.useState(false);

    const handleAceptar = () => {
        setShowConfirm(true);
    };

    const confirmAceptar = () => {
        router.post(`/postulantes/${postulante.perfil_id}/aceptar`, {}, {
            onSuccess: () => {
                setShowConfirm(false);
                onClose();
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div 
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-[#07074E] p-6 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="relative z-10 flex items-center">
                        <div className="bg-white/20 p-3 rounded-2xl mr-4 backdrop-blur-sm">
                            <FiUser size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Editar Postulante</h2>
                            <p className="text-blue-200 text-sm font-medium">Modificar datos del perfil</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="relative z-10 text-blue-200 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-8 max-h-[80vh] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Read Only Data */}
                        {postulante && (
                            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50 mb-6 flex flex-wrap gap-4 text-sm">
                                <div className="flex-1 min-w-[120px]">
                                    <span className="block text-gray-500 font-bold mb-1">Código</span>
                                    <span className="font-medium text-[#07074E]">{postulante.codigo || '-'}</span>
                                </div>
                                <div className="flex-1 min-w-[120px]">
                                    <span className="block text-gray-500 font-bold mb-1">Cargo</span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#07074E] text-white">
                                        {postulante.cargo || '-'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-[120px]">
                                    <span className="block text-gray-500 font-bold mb-1">Estado</span>
                                    <span className="font-medium text-gray-800">{postulante.estado || '-'}</span>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nombres */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nombres</label>
                                <input
                                    type="text"
                                    value={data.nombres}
                                    onChange={e => setData('nombres', e.target.value)}
                                    className={`w-full rounded-xl border ${errors.nombres ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#07074E]/20 focus:border-[#07074E] transition-all`}
                                    placeholder="Nombres del postulante"
                                    required
                                />
                                {errors.nombres && <p className="text-red-500 text-xs mt-1 font-medium">{errors.nombres}</p>}
                            </div>

                            {/* Apellido Paterno */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Apellido Paterno</label>
                                <input
                                    type="text"
                                    value={data.apellido_paterno}
                                    onChange={e => setData('apellido_paterno', e.target.value)}
                                    className={`w-full rounded-xl border ${errors.apellido_paterno ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#07074E]/20 focus:border-[#07074E] transition-all`}
                                    placeholder="Apellido paterno"
                                    required
                                />
                                {errors.apellido_paterno && <p className="text-red-500 text-xs mt-1 font-medium">{errors.apellido_paterno}</p>}
                            </div>

                            {/* Apellido Materno */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Apellido Materno</label>
                                <input
                                    type="text"
                                    value={data.apellido_materno}
                                    onChange={e => setData('apellido_materno', e.target.value)}
                                    className={`w-full rounded-xl border ${errors.apellido_materno ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#07074E]/20 focus:border-[#07074E] transition-all`}
                                    placeholder="Apellido materno"
                                />
                                {errors.apellido_materno && <p className="text-red-500 text-xs mt-1 font-medium">{errors.apellido_materno}</p>}
                            </div>

                            {/* CI */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Carnet de Identidad</label>
                                <input
                                    type="text"
                                    value={data.ci}
                                    onChange={e => setData('ci', e.target.value)}
                                    className={`w-full rounded-xl border ${errors.ci ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#07074E]/20 focus:border-[#07074E] transition-all`}
                                    placeholder="Número de CI"
                                    required
                                />
                                {errors.ci && <p className="text-red-500 text-xs mt-1 font-medium">{errors.ci}</p>}
                            </div>

                            {/* Fecha de Nacimiento */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Fecha de Nacimiento</label>
                                <input
                                    type="date"
                                    value={data.fecha_nacimiento}
                                    onChange={e => setData('fecha_nacimiento', e.target.value)}
                                    className={`w-full rounded-xl border ${errors.fecha_nacimiento ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#07074E]/20 focus:border-[#07074E] transition-all`}
                                />
                                {errors.fecha_nacimiento && <p className="text-red-500 text-xs mt-1 font-medium">{errors.fecha_nacimiento}</p>}
                            </div>

                            {/* Nacionalidad */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nacionalidad</label>
                                <input
                                    type="text"
                                    value={data.nacionalidad}
                                    onChange={e => setData('nacionalidad', e.target.value)}
                                    className={`w-full rounded-xl border ${errors.nacionalidad ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#07074E]/20 focus:border-[#07074E] transition-all`}
                                    placeholder="Nacionalidad"
                                />
                                {errors.nacionalidad && <p className="text-red-500 text-xs mt-1 font-medium">{errors.nacionalidad}</p>}
                            </div>

                            {/* Sexo */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Sexo</label>
                                <select
                                    value={data.sexo}
                                    onChange={e => setData('sexo', e.target.value)}
                                    className={`w-full rounded-xl border ${errors.sexo ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#07074E]/20 focus:border-[#07074E] transition-all`}
                                >
                                    <option value="">Seleccione</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                </select>
                                {errors.sexo && <p className="text-red-500 text-xs mt-1 font-medium">{errors.sexo}</p>}
                            </div>

                            {/* Dirección */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Dirección</label>
                                <input
                                    type="text"
                                    value={data.direccion}
                                    onChange={e => setData('direccion', e.target.value)}
                                    className={`w-full rounded-xl border ${errors.direccion ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#07074E]/20 focus:border-[#07074E] transition-all`}
                                    placeholder="Dirección actual"
                                />
                                {errors.direccion && <p className="text-red-500 text-xs mt-1 font-medium">{errors.direccion}</p>}
                            </div>

                            {/* Teléfono */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Teléfono / Celular</label>
                                <input
                                    type="text"
                                    value={data.telefono}
                                    onChange={e => setData('telefono', e.target.value)}
                                    className={`w-full rounded-xl border ${errors.telefono ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#07074E]/20 focus:border-[#07074E] transition-all`}
                                    placeholder="Ej: 71234567"
                                />
                                {errors.telefono && <p className="text-red-500 text-xs mt-1 font-medium">{errors.telefono}</p>}
                            </div>

                            {/* Email */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Correo Electrónico</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className={`w-full rounded-xl border ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#07074E]/20 focus:border-[#07074E] transition-all`}
                                    placeholder="correo@ejemplo.com"
                                    required
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
                            </div>

                            <div className="col-span-1 md:col-span-2 mt-4 pt-4 border-t border-gray-100">
                                <h3 className="text-lg font-bold text-[#07074E] mb-4">Datos del Postulante</h3>
                            </div>

                            {/* Colegio de Procedencia */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Colegio de Procedencia</label>
                                <input
                                    type="text"
                                    value={data.colegio_procedencia}
                                    onChange={e => setData('colegio_procedencia', e.target.value)}
                                    className={`w-full rounded-xl border ${errors.colegio_procedencia ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#07074E]/20 focus:border-[#07074E] transition-all`}
                                    placeholder="Nombre del colegio"
                                />
                                {errors.colegio_procedencia && <p className="text-red-500 text-xs mt-1 font-medium">{errors.colegio_procedencia}</p>}
                            </div>

                            {/* Ciudad */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Ciudad</label>
                                <input
                                    type="text"
                                    value={data.ciudad}
                                    onChange={e => setData('ciudad', e.target.value)}
                                    className={`w-full rounded-xl border ${errors.ciudad ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#07074E]/20 focus:border-[#07074E] transition-all`}
                                    placeholder="Ciudad"
                                />
                                {errors.ciudad && <p className="text-red-500 text-xs mt-1 font-medium">{errors.ciudad}</p>}
                            </div>
                        </div>

                        {/* Footer / Botones */}
                        <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
                            <a
                                href={`/postulantes/${postulante?.perfil_id}/documento`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 rounded-xl font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-center"
                                title="Ver documento subido (Requisitos)"
                            >
                                <FiFileText className="mr-2" size={18} />
                                Ver Documento
                            </a>
                            {postulante?.estado === 'Pendiente' && (
                                <button
                                    type="button"
                                    onClick={handleAceptar}
                                    className="px-6 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-70 mr-auto"
                                >
                                    <FiCheckCircle className="mr-2" size={18} />
                                    Aceptar Postulante
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                                disabled={processing}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-3 rounded-xl font-bold text-white bg-[#07074E] hover:bg-[#06063b] shadow-md hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-70"
                            >
                                {processing ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <FiSave className="mr-2" size={18} />
                                        Guardar Cambios
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Custom Confirm Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="mx-auto w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                                <FiCheckCircle size={32} />
                            </div>
                            <h3 className="text-xl font-black text-gray-800 mb-2">Aceptar Postulante</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                ¿Estás seguro de que quieres aceptar a este postulante? Se generarán sus credenciales y se enviarán por correo. Su estado cambiará a "Habilitado".
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmAceptar}
                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all"
                                >
                                    Sí, Aceptar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
