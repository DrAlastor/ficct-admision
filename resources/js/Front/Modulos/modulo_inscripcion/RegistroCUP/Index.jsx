import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { FaPaypal, FaStripe } from 'react-icons/fa';
import FormDatosPersonales from './_components/FormDatosPersonales';
import FormPreferencias from './_components/FormPreferencias';
import FormDocumentos from './_components/FormDocumentos';
import PaymentModal from './_components/PaymentModal';
import ConsultarRegistro from './_components/ConsultarRegistro';
import { FiCheckCircle, FiSearch, FiArrowLeft } from 'react-icons/fi';
import { Link } from '@inertiajs/react';

/**
 * Componente público de Registro para nuevos postulantes.
 * Recopila datos personales, de contacto, preferencias de carrera y 
 * documentos (CI, Bachiller) para luego iniciar el proceso de pago.
 *
 * @returns {JSX.Element}
 */
export default function RegistroIndex({ precio_matricula, metodos_activos = [], stripe_key, paypal_client_id }) {
    const { props } = usePage();
    const globalErrors = props.errors || {};

    const [metodoSeleccionado, setMetodoSeleccionado] = useState(
        metodos_activos.length > 0 ? (metodos_activos[0].nombre.toLowerCase().includes('stripe') ? 'stripe' : 'paypal') : 'stripe'
    );

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
        documento_requisitos: null,
    });

    const [errores, setErrores] = useState(globalErrors);
    const [procesando, setProcesando] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [showConsultar, setShowConsultar] = useState(false);
    const [pagoExitoso, setPagoExitoso] = useState(false);
    
    const [postulacionCodigo, setPostulacionCodigo] = useState(null);
    const [montoAPagar, setMontoAPagar] = useState(700);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setData((prevData) => ({
            ...prevData,
            [name]: files ? files[0] : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrores({});
        
        // Simplemente validamos que hay un documento (y el resto lo valida HTML5 required)
        if (!data.documento_requisitos) {
            setErrores({ documento_requisitos: ['Debes subir el documento de requisitos.'] });
            alert('Falta un requisito: Debes subir el documento PDF antes de poder pagar.');
            return;
        }

        // Iniciar la inscripción real en el backend (crea Postulacion Pendiente)
        setProcesando(true);
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            formData.append(key, data[key]);
        });

        try {
            const response = await axios.post('/registro-cup/iniciar-inscripcion', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                setPostulacionCodigo(response.data.postulacion_codigo);
                setMontoAPagar(response.data.monto);
                setShowModal(true); // Abre la pasarela real
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                const apiErrors = error.response.data.errors;
                if (apiErrors) {
                    setErrores(apiErrors);
                    alert('Hay errores en el formulario. Por favor sube a la parte superior y revisa los campos marcados en rojo (por ejemplo, es posible que el Carnet o Correo que intentas registrar ya estén en uso).');
                } else if (error.response.data.error) {
                    alert('Error de servidor: ' + error.response.data.error);
                } else {
                    alert('Ocurrió un error de validación. Revisa los datos.');
                }
            } else {
                const serverMsg = error.response?.data?.message || error.response?.data?.error || error.message || '';
                alert('Ocurrió un error inesperado al procesar tu solicitud.' + (serverMsg ? '\n\nDetalle: ' + serverMsg : ''));
                console.error('Error en iniciar-inscripcion:', error.response?.status, error.response?.data);
            }
        } finally {
            setProcesando(false);
        }
    };

    const handlePaymentSuccess = () => {
        setShowModal(false);
        setPagoExitoso(true);
    };

    if (pagoExitoso) {
        return (
            <div className="min-h-screen bg-[#f4f8fc] flex items-center justify-center p-4">
                <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center border-t-8 border-green-500 animate-in fade-in zoom-in duration-500">
                    <FiCheckCircle className="mx-auto text-green-500 mb-6" size={80} />
                    <h2 className="text-3xl font-black text-gray-800 mb-4">¡Pago Registrado!</h2>
                    <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                        Se ha realizado el pago correctamente. <b>Por favor espera a que se te validen los datos</b> por parte de administración.<br/><br/>
                        Ya si decides revisar de nuevo, puedes volver a esta página y utilizar la opción de <b>"Consultar registro"</b> con tu correo electrónico para ver si estás Habilitado, Pendiente o Rechazado.
                    </p>
                    <Link 
                        href="/"
                        className="inline-block bg-[#063f7c] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#052f5d] transition-colors shadow-lg"
                    >
                        Volver al inicio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f8fc] px-4 py-12 sm:px-6 lg:px-8">
            <Head title="Registro de Postulantes CUP" />

            <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-blue-950/10 bg-white shadow-2xl shadow-blue-950/10">
                <div className="relative overflow-hidden bg-[#063f7c] px-8 py-10">
                    <div className="absolute left-8 top-8 h-20 w-20 rounded-full border-8 border-[#f59e0b]/25" />
                    <div className="absolute bottom-6 right-10 h-28 w-28 rounded-full bg-[#ef172f]/20 blur-2xl" />
                    <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                        <div className="flex-1 flex flex-col sm:flex-row items-center gap-4">
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
                        <div className="sm:ml-auto flex flex-col gap-3">
                            <Link 
                                href="/"
                                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center transition-colors shadow-lg"
                            >
                                <FiArrowLeft className="mr-2" />
                                Volver a Inicio
                            </Link>
                            <button 
                                onClick={() => setShowConsultar(true)}
                                className="bg-[#f59e0b] hover:bg-[#d97706] text-white px-6 py-2.5 rounded-xl font-bold flex items-center transition-colors shadow-lg"
                            >
                                <FiSearch className="mr-2" />
                                Consultar registro
                            </button>
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
                        <FormDocumentos data={data} handleChange={handleChange} errores={errores} />
                    </section>

                    <div className="border-t border-blue-950/10 pt-6">
                        <div className="mb-6 rounded-xl border border-blue-950/10 bg-[#f4f8fc] p-6">
                            <h4 className="mb-4 text-lg font-bold text-[#063f7c]">
                                Resumen de Inscripcion
                            </h4>
                            <div className="flex items-center justify-between gap-4 text-gray-700 mb-6">
                                <span>Matricula Preuniversitaria (CUP)</span>
                                <span className="rounded-md bg-[#ef172f] px-4 py-2 text-lg font-bold text-white">
                                    {precio_matricula ? Number(precio_matricula).toFixed(2) : '700.00'} Bs
                                </span>
                            </div>

                            <h4 className="mb-3 text-md font-bold text-[#063f7c]">
                                Selecciona un Método de Pago:
                            </h4>
                            {metodos_activos.length === 0 ? (
                                <div className="text-red-500 font-bold p-3 bg-red-50 border border-red-200 rounded-lg">
                                    No hay métodos de pago configurados. Por favor contacta a soporte.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {metodos_activos.map(metodo => {
                                        const isStripe = metodo.nombre.toLowerCase().includes('stripe');
                                        const val = isStripe ? 'stripe' : 'paypal';
                                        return (
                                            <div 
                                                key={metodo.id}
                                                onClick={() => setMetodoSeleccionado(val)}
                                                className={`cursor-pointer rounded-xl border-2 p-4 flex items-center transition-all ${
                                                    metodoSeleccionado === val 
                                                        ? 'border-[#063f7c] bg-blue-50/50 shadow-md' 
                                                        : 'border-transparent bg-white hover:border-gray-200 shadow-sm'
                                                }`}
                                            >
                                                <div className={`p-3 rounded-lg mr-4 ${isStripe ? 'bg-[#635BFF]/10 text-[#635BFF]' : 'bg-[#003087]/10 text-[#003087]'}`}>
                                                    {isStripe ? <FaStripe size={28} /> : <FaPaypal size={24} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{metodo.nombre}</p>
                                                    <p className="text-xs text-gray-500">Pago seguro y encriptado</p>
                                                </div>
                                                {metodoSeleccionado === val && (
                                                    <div className="ml-auto w-5 h-5 bg-[#063f7c] rounded-full flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
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
                            {procesando ? 'Procesando pago...' : 'Pagar'}
                        </button>
                    </div>
                </form>

            {/* Modal de Pago Real (Stripe/PayPal) */}
            <PaymentModal 
                show={showModal} 
                onClose={() => setShowModal(false)}
                monto={montoAPagar}
                metodoPago={metodoSeleccionado === 'stripe' ? 'Stripe (Tarjetas)' : 'PayPal'}
                postulacionCodigo={postulacionCodigo}
                onPaymentSuccess={handlePaymentSuccess}
                stripeKey={stripe_key}
                paypalClientId={paypal_client_id}
            />

                <ConsultarRegistro 
                    isOpen={showConsultar}
                    onClose={() => setShowConsultar(false)}
                />
            </div>
        </div>
    );
}
