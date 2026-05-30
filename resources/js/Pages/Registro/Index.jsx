import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import FormDatosPersonales from '@/Components/Registro/FormDatosPersonales';
import FormPreferencias from '@/Components/Registro/FormPreferencias';
import FormDocumentos from '@/Components/Registro/FormDocumentos';

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
        documento_ci: null,
        documento_bachiller: null,
    });

    const [errores, setErrores] = useState(globalErrors);
    const [procesando, setProcesando] = useState(false);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setData(prevData => ({
            ...prevData,
            [name]: files ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcesando(true);
        setErrores({});

        const formData = new FormData();
        Object.keys(data).forEach(key => {
            formData.append(key, data[key]);
        });

        try {
            const response = await axios.post('/registro-cup/pago', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrores(error.response.data.errors);
            } else {
                alert("Ocurrió un error inesperado al procesar tu solicitud.");
            }
            setProcesando(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Registro de Postulantes CUP" />

            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="px-8 py-10 bg-gradient-to-r from-blue-900 to-indigo-800">
                    <h2 className="text-3xl font-extrabold text-white text-center">
                        Admisión CUP - FICCT
                    </h2>
                    <p className="text-blue-100 text-center mt-3 text-lg">
                        Sube tu documentación e inicia tu camino en la facultad
                    </p>
                </div>

                {globalErrors.error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-8 mt-6" role="alert">
                        <span className="block sm:inline">{globalErrors.error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8">

                    <section>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">1. Datos Personales</h3>
                        <FormDatosPersonales data={data} handleChange={handleChange} errores={errores} />
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">2. Preferencias de Carrera (CU-09)</h3>
                        <FormPreferencias data={data} handleChange={handleChange} errores={errores} />
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">3. Documentación Respaldo</h3>
                        <FormDocumentos handleChange={handleChange} errores={errores} />
                    </section>

                    <div className="pt-6 border-t border-gray-200">
                        <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
                            <h4 className="text-lg font-bold text-gray-800 mb-2">Resumen de Inscripción</h4>
                            <div className="flex justify-between items-center text-gray-700">
                                <span>Matrícula Preuniversitaria (CUP)</span>
                                <span className="font-semibold text-lg">300.00 Bs</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={procesando}
                            className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white transition duration-150 ease-in-out ${procesando ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                        >
                            {procesando ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Procesando pago...
                                </span>
                            ) : 'Proceder al Pago Seguro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}