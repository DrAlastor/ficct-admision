import React from 'react';

export default function FormDocumentos({ handleChange, errores }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Escáner del CI (PDF, JPG, PNG)
                </label>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="documento_ci" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Haz clic para subir</span> o arrastra</p>
                        </div>
                        <input
                            id="documento_ci"
                            type="file"
                            name="documento_ci"
                            onChange={handleChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            required
                        />
                    </label>
                </div>
                {errores.documento_ci && <span className="text-red-500 text-sm mt-1 block">{errores.documento_ci[0]}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificado de Bachiller
                </label>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="documento_bachiller" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Haz clic para subir</span> o arrastra</p>
                        </div>
                        <input
                            id="documento_bachiller"
                            type="file"
                            name="documento_bachiller"
                            onChange={handleChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            required
                        />
                    </label>
                </div>
                {errores.documento_bachiller && <span className="text-red-500 text-sm mt-1 block">{errores.documento_bachiller[0]}</span>}
            </div>
        </div>
    );
}
