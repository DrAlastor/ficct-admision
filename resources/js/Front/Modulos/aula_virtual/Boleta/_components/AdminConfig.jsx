import React from 'react';
import { FiEdit3, FiSave, FiCheckCircle } from 'react-icons/fi';

export default function AdminConfig({ 
    isEditing, 
    setIsEditing, 
    data, 
    setData, 
    submitConfig, 
    processing, 
    recentlySuccessful 
}) {
    return (
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-5 relative z-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center mr-3">
                        <FiEdit3 className="text-indigo-600" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">Editor de Diseño (Modo Admin)</h3>
                        <p className="text-xs text-gray-500">Tienes permiso de Lectura/Escritura para modificar el diseño global de la boleta.</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-full text-sm font-bold transition shadow-sm"
                >
                    {isEditing ? 'Cerrar Panel' : 'Configurar Colores'}
                </button>
            </div>
            
            {isEditing && (
                <form onSubmit={submitConfig} className="mt-5 border-t border-gray-100 pt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Color Principal</label>
                        <div className="flex items-center">
                            <input type="color" value={data.primaryColor} onChange={e => setData('primaryColor', e.target.value)} className="h-10 w-10 rounded cursor-pointer border-2 border-white shadow-sm p-0" />
                            <input type="text" value={data.primaryColor} onChange={e => setData('primaryColor', e.target.value)} className="ml-3 border-gray-200 rounded-md text-sm w-full font-mono bg-white" />
                        </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Color Secundario</label>
                        <div className="flex items-center">
                            <input type="color" value={data.secondaryColor} onChange={e => setData('secondaryColor', e.target.value)} className="h-10 w-10 rounded cursor-pointer border-2 border-white shadow-sm p-0" />
                            <input type="text" value={data.secondaryColor} onChange={e => setData('secondaryColor', e.target.value)} className="ml-3 border-gray-200 rounded-md text-sm w-full font-mono bg-white" />
                        </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Color Íconos (Acento)</label>
                        <div className="flex items-center">
                            <input type="color" value={data.accentColor} onChange={e => setData('accentColor', e.target.value)} className="h-10 w-10 rounded cursor-pointer border-2 border-white shadow-sm p-0" />
                            <input type="text" value={data.accentColor} onChange={e => setData('accentColor', e.target.value)} className="ml-3 border-gray-200 rounded-md text-sm w-full font-mono bg-white" />
                        </div>
                    </div>
                    <div className="md:col-span-3 flex justify-end items-center mt-2">
                        {recentlySuccessful && <span className="text-green-500 text-sm font-bold mr-4 flex items-center bg-green-50 px-3 py-1.5 rounded-full"><FiCheckCircle className="mr-1.5"/> ¡Diseño actualizado!</span>}
                        <button disabled={processing} type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-full text-sm font-bold flex items-center transition shadow-md disabled:opacity-50">
                            <FiSave className="mr-2" size={18} /> Guardar Diseño Global
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
