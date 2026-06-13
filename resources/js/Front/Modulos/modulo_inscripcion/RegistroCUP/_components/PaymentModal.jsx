import React, { useState, useEffect } from 'react';
import { FiX, FiCheckCircle, FiShield, FiAlertTriangle } from 'react-icons/fi';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios from 'axios';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

const StripeForm = ({ monto, postulacionCodigo, onPaymentSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Create PaymentIntent as soon as the component loads
        setLoading(true);
        axios.post('/api/create-payment-intent', {
            postulacion_codigo: postulacionCodigo,
            monto: monto
        }).then(res => {
            setClientSecret(res.data.clientSecret);
            setLoading(false);
        }).catch(err => {
            console.error('Error creando PaymentIntent:', err.response?.status, err.response?.data);
            const msg = err.response?.data?.error || err.response?.data?.message || 'Error al inicializar el pago con Stripe.';
            setError(msg);
            setLoading(false);
        });
    }, [monto, postulacionCodigo]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements || !clientSecret) {
            return;
        }

        setProcessing(true);
        setError(null);

        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement),
                billing_details: {
                    name: 'Postulante FICCT',
                },
            }
        });

        if (result.error) {
            setError(result.error.message);
            setProcessing(false);
        } else {
            if (result.paymentIntent.status === 'succeeded') {
                onPaymentSuccess();
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <CardElement options={{
                    hidePostalCode: true,
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                                color: '#aab7c4',
                            },
                        },
                        invalid: {
                            color: '#9e2146',
                        },
                    },
                }} />
            </div>
            
            {loading && (
                <div className="text-blue-500 text-sm font-medium text-center">
                    Conectando con Stripe...
                </div>
            )}

            {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                    <FiAlertTriangle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                    <span className="text-red-600 text-sm font-medium">{error}</span>
                </div>
            )}

            <button 
                type="submit" 
                disabled={!stripe || processing || !clientSecret}
                className="w-full bg-[#00D084] hover:bg-[#00b371] text-white font-black py-4 rounded-xl shadow-lg shadow-green-200 transition-all transform hover:scale-[1.02] flex items-center justify-center text-lg disabled:opacity-50"
            >
                {processing ? 'Procesando...' : `PAGAR BS. ${monto} DE FORMA SEGURA`}
            </button>
        </form>
    );
};

export default function PaymentModal({ show, onClose, monto, metodoPago, postulacionCodigo, onPaymentSuccess }) {
    const [paypalError, setPaypalError] = useState(null);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center relative overflow-hidden bg-gradient-to-r from-slate-50 to-white">
                    <div>
                        <h3 className="text-xl font-black text-gray-800 tracking-tight">Completar Pago</h3>
                        <p className="text-sm text-gray-500 font-medium mt-1 flex items-center">
                            <FiShield className="mr-1 text-green-500" /> Transacción encriptada y segura
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 relative z-10">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="p-8">
                    {/* Resumen */}
                    <div className="bg-indigo-50/50 rounded-2xl p-5 mb-8 border border-indigo-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600 font-medium text-sm">Concepto</span>
                            <span className="font-bold text-gray-800">Matrícula CUP</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium text-sm">Total a Pagar</span>
                            <span className="text-2xl font-black text-[#07074E]">Bs. {monto}</span>
                        </div>
                    </div>

                    {metodoPago === 'Stripe (Tarjetas)' && (
                        <Elements stripe={stripePromise}>
                            <StripeForm monto={monto} postulacionCodigo={postulacionCodigo} onPaymentSuccess={onPaymentSuccess} />
                        </Elements>
                    )}

                    {metodoPago === 'PayPal' && (
                        <>
                            <PayPalScriptProvider options={{ "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID, currency: "USD" }}>
                                <PayPalButtons 
                                    style={{ layout: "vertical", shape: "rect", color: "blue" }}
                                    createOrder={(data, actions) => {
                                        setPaypalError(null);
                                        return axios.post('/api/paypal/create-order', {
                                            postulacion_codigo: postulacionCodigo,
                                            monto: monto
                                        }).then(res => {
                                            if (res.data.id) {
                                                return res.data.id;
                                            }
                                            throw new Error('No se recibió ID de orden de PayPal.');
                                        }).catch(err => {
                                            const msg = err.response?.data?.error || err.message || 'Error al crear la orden de PayPal.';
                                            console.error('Error PayPal createOrder:', msg, err.response?.data);
                                            setPaypalError(typeof msg === 'object' ? JSON.stringify(msg) : msg);
                                            throw err; // Re-throw para que PayPal sepa que falló
                                        });
                                    }}
                                    onApprove={(data, actions) => {
                                        return axios.post('/api/paypal/capture-order', {
                                            order_id: data.orderID,
                                            postulacion_codigo: postulacionCodigo
                                        }).then(res => {
                                            if (res.data.status === 'COMPLETED') {
                                                onPaymentSuccess();
                                            }
                                        }).catch(err => {
                                            const msg = err.response?.data?.error || err.message || 'Error al capturar el pago.';
                                            setPaypalError(typeof msg === 'object' ? JSON.stringify(msg) : msg);
                                        });
                                    }}
                                    onError={(err) => {
                                        console.error('PayPal SDK Error:', err);
                                        // Solo mostrar error si no es el que ya capturamos en createOrder
                                        if (!paypalError) {
                                            setPaypalError('Error en la conexión con PayPal. Verifica las credenciales o intenta más tarde.');
                                        }
                                    }}
                                    onCancel={() => {
                                        setPaypalError(null); // Limpiar error si el usuario cancela
                                    }}
                                />
                            </PayPalScriptProvider>

                            {paypalError && (
                                <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                                    <FiAlertTriangle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                                    <span className="text-red-600 text-sm font-medium">{paypalError}</span>
                                </div>
                            )}
                        </>
                    )}

                    {/* BOTÓN DE BYPASS PARA PRUEBAS LOCALES */}
                    <div className="mt-6 border-t border-gray-100 pt-6">
                        <p className="text-center text-xs text-gray-400 mb-3">Opciones de Desarrollador</p>
                        <button
                            type="button"
                            onClick={() => {
                                axios.post('/registro-cup/pago-ficticio', { 
                                    postulacion_codigo: postulacionCodigo,
                                    metodo_pago: metodoPago 
                                })
                                    .then(() => onPaymentSuccess())
                                    .catch(err => alert("Error en pago ficticio: " + (err.response?.data?.error || err.message)));
                            }}
                            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg transition-all text-sm flex items-center justify-center"
                        >
                            <FiCheckCircle className="mr-2" size={18} />
                            SIMULAR PAGO EXITOSO (BYPASS)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
