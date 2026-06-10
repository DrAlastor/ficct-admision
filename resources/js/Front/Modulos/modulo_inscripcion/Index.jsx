import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import FormDatosPersonales from '@/Components/Registro/FormDatosPersonales';
import FormPreferencias from '@/Components/Registro/FormPreferencias';
import FormDocumentos from '@/Components/Registro/FormDocumentos';

/**
 * Componente público de Registro para nuevos postulantes.
 * Recopila datos personales, de contacto, preferencias de carrera y 
 * documentos (CI, Bachiller) para luego iniciar el proceso de pago.
 *
 * @returns {JSX.Element}
 */
export default function RegistroIndex() {
    const { props } = usePage();
    const globalErrors = props.errors || {};

    const [data, setData] = useState({
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        ci: '',
        email: '',
        fecha_nacimiento: '',
        nacionalidad: '',
        sexo: '',
        direccion: '',
        telefono: '',
        carrera_opcion1: '',
        carrera_opcion2: '',
        turno_sugerido: '',
        tipo_colegio: '',
        documento_ci: null,
        documento_bachiller: null,
    });

    const [errores, setErrores] = useState(globalErrors);
    const [procesando, setProcesando] = useState(false);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setData((prevData) => ({
            ...prevData,
            [name]: files ? files[0] : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcesando(true);
        setErrores({});

        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            formData.append(key, data[key]);
        });

        try {
            const response = await axios.post('/registro-cup/pago', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrores(error.response.data.errors);
            } else {
                alert('Ocurrio un error inesperado al procesar tu solicitud.');
            }
            setProcesando(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f8fc] px-4 py-12 sm:px-6 lg:px-8">
            <Head title="Registro de Postulantes CUP" />

            <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-blue-950/10 bg-white shadow-2xl shadow-blue-950/10">
                <div className="relative overflow-hidden bg-[#063f7c] px-8 py-10">
                    <div className="absolute left-8 top-8 h-20 w-20 rounded-full border-8 border-[#f59e0b]/25" />
                    <div className="absolute bottom-6 right-10 h-28 w-28 rounded-full bg-[#ef172f]/20 blur-2xl" />
                    <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                        <img
                            src="/ficct-logo.png"
                            alt="Logo FICCT"
                            className="h-24 w-auto object-contain drop-shadow-xl"
                        />
                        <div>
                            <p className="text-sm font-bold uppercase tracking-wide text-[#fbbf24]">
                                Facultad de Ingenieria en Ciencias de la Computacion y Telecomunicaciones
                            </p>
                            <h2 className="mt-2 text-3xl font-extrabold text-white">
                                Preinscripcion CUP - FICCT
                            </h2>
                            <p className="mt-3 text-lg text-blue-50">
                                Sube tu documentacion e inicia tu camino en la facultad
                            </p>
                        </div>
                    </div>
                </div>

                {globalErrors.error && (
                    <div
                        className="relative mx-8 mt-6 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
                        role="alert"
                    >
                        <span className="block sm:inline">{globalErrors.error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8 p-8 sm:p-10">
                    <section className="rounded-xl border border-blue-950/10 bg-white p-6 shadow-sm">
                        <h3 className="mb-5 border-b border-blue-950/10 pb-3 text-xl font-bold text-[#063f7c]">
                            1. Datos Personales
                        </h3>
                        <FormDatosPersonales data={data} handleChange={handleChange} errores={errores} />
                    </section>

                    <section className="rounded-xl border border-blue-950/10 bg-white p-6 shadow-sm">
                        <h3 className="mb-5 border-b border-blue-950/10 pb-3 text-xl font-bold text-[#063f7c]">
                            2. Preferencias de Carrera
                        </h3>
                        <FormPreferencias data={data} handleChange={handleChange} errores={errores} />
                    </section>

                    <section className="rounded-xl border border-blue-950/10 bg-white p-6 shadow-sm">
                        <h3 className="mb-5 border-b border-blue-950/10 pb-3 text-xl font-bold text-[#063f7c]">
                            3. Documentacion Respaldo
                        </h3>
                        <FormDocumentos handleChange={handleChange} errores={errores} />
                    </section>

                    <div className="border-t border-blue-950/10 pt-6">
                        <div className="mb-6 rounded-xl border border-blue-950/10 bg-[#f4f8fc] p-6">
                            <h4 className="mb-2 text-lg font-bold text-[#063f7c]">
                                Resumen de Inscripcion
                            </h4>
                            <div className="flex items-center justify-between gap-4 text-gray-700">
                                <span>Matricula Preuniversitaria (CUP)</span>
                                <span className="rounded-md bg-[#ef172f] px-4 py-2 text-lg font-bold text-white">
                                    700.00 Bs
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={procesando}
                            className={`flex w-full justify-center rounded-lg border border-transparent px-4 py-4 text-lg font-bold text-white shadow-lg transition duration-150 ease-in-out ${
                                procesando
                                    ? 'cursor-not-allowed bg-blue-300'
                                    : 'bg-[#063f7c] shadow-blue-950/20 hover:bg-[#052f5d] focus:outline-none focus:ring-2 focus:ring-[#ef172f] focus:ring-offset-2'
                            }`}
                        >
                            {procesando ? (
                                <span className="flex items-center">
                                    <svg
                                        className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Procesando pago...
                                </span>
                            ) : (
                                'Proceder al Pago Seguro'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
