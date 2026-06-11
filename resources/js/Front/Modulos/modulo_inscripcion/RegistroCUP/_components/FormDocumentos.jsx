import React from 'react';
import { FiInfo } from 'react-icons/fi';

export default function FormDocumentos({ data, handleChange, errores }) {
    const fileName = data?.documento_requisitos?.name;
    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start">
                <FiInfo className="text-blue-600 mt-1 mr-3 flex-shrink-0" size={20} />
                <div className="text-sm text-blue-900">
                    <p className="font-bold mb-1">Por favor, escanea o toma fotos de los siguientes documentos y guárdalos en un ÚNICO archivo PDF:</p>
                    <ul className="list-disc pl-5 space-y-1 font-medium mt-2">
                        <li>Original y Fotocopia del Título de Bachiller</li>
                        <li>Fotocopia de Carnet de Identidad (CI)</li>
                        <li>Formulario de preinscripción impreso</li>
                        <li>Libreta o Certificado de último año de secundaria</li>
                    </ul>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-[#063f7c] mb-2">
                    Subir Requisitos (Solo PDF)
                </label>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="documento_requisitos" className="flex flex-col items-center justify-center w-full h-40 border-2 border-[#063f7c]/30 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-blue-50/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-10 h-10 mb-4 text-[#063f7c]/50" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            {fileName ? (
                                <div className="text-center">
                                    <p className="mb-2 text-sm font-bold text-[#063f7c]">Documento Listo</p>
                                    <p className="text-sm text-gray-800 font-medium bg-blue-100 px-4 py-2 rounded-lg">{fileName}</p>
                                    <p className="text-xs text-gray-500 font-medium mt-2">Haz clic para cambiar de archivo</p>
                                </div>
                            ) : (
                                <>
                                    <p className="mb-2 text-sm text-gray-600"><span className="font-bold text-[#063f7c]">Haz clic para explorar</span> o arrastra tu archivo aquí</p>
                                    <p className="text-xs text-gray-500 font-medium">Solo archivos con extensión .pdf (Max. 10MB)</p>
                                </>
                            )}
                        </div>
                        <input
                            id="documento_requisitos"
                            type="file"
                            name="documento_requisitos"
                            onChange={handleChange}
                            accept=".pdf"
                            className="hidden"
                        />
                    </label>
                </div>
                {errores.documento_requisitos && <span className="text-red-500 text-sm mt-2 font-bold block">{errores.documento_requisitos[0]}</span>}
            </div>
        </div>
    );
}
