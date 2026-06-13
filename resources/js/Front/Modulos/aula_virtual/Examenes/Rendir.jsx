import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { FiClock, FiCheckCircle, FiSend, FiArrowLeft, FiArrowRight } from 'react-icons/fi';

export default function Rendir({ examen, preguntas }) {
    const [respuestas, setRespuestas] = useState({});
    const [timeLeft, setTimeLeft] = useState(examen.duracion_minutos * 60);
    const [preguntaActual, setPreguntaActual] = useState(0);
    const [enviando, setEnviando] = useState(false);

    // Timer logic
    useEffect(() => {
        if (timeLeft <= 0 && !enviando) {
            submitExamen();
            return;
        }
        
        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, enviando]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleSelectOption = (preguntaId, opcion) => {
        setRespuestas(prev => ({
            ...prev,
            [preguntaId]: opcion
        }));
    };

    const submitExamen = () => {
        if (enviando) return;
        setEnviando(true);

        const respuestasArray = Object.entries(respuestas).map(([pregunta_id, seleccionada]) => ({
            pregunta_id: parseInt(pregunta_id),
            seleccionada
        }));

        router.post(route('examenes.calificar', examen.id), {
            respuestas: respuestasArray
        });
    };

    const confirmarEnvio = () => {
        const contestadas = Object.keys(respuestas).length;
        const faltantes = preguntas.length - contestadas;
        
        let msg = `Estás a punto de enviar el Examen Global. Has contestado ${contestadas} de ${preguntas.length} preguntas.`;
        if (faltantes > 0) msg += `\n\nATENCIÓN: Tienes ${faltantes} preguntas sin contestar.`;
        msg += '\n\n¿Estás seguro que deseas enviar? Tus respuestas se calificarán y asignarán a cada materia inscrita automáticamente. Esta acción no se puede deshacer.';

        if (confirm(msg)) {
            submitExamen();
        }
    };

    const currentP = preguntas[preguntaActual];
    const opcionSeleccionada = respuestas[currentP?.id];
    const isWarning = timeLeft < 300; 

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Head title={`Rendir Examen Global - Turno ${examen.turno}`} />

            {/* Navbar fijo superior */}
            <header className={`sticky top-0 z-50 border-b shadow-sm ${isWarning ? 'bg-red-600 text-white border-red-700' : 'bg-indigo-900 text-white border-indigo-950'}`}>
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div>
                        <h1 className="font-black text-lg tracking-tight truncate">Examen Global - Turno {examen.turno}</h1>
                        <span className="text-xs font-bold opacity-80 uppercase tracking-widest">{examen.tipo}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center font-mono font-black text-xl px-4 py-1.5 rounded-lg ${isWarning ? 'bg-red-700 animate-pulse' : 'bg-indigo-800'}`}>
                            <FiClock className="mr-2" /> {formatTime(timeLeft)}
                        </div>
                        <button 
                            onClick={confirmarEnvio}
                            disabled={enviando}
                            className="bg-emerald-500 hover:bg-emerald-400 text-white font-black px-5 py-2 rounded-lg text-sm flex items-center transition-colors shadow-sm disabled:opacity-50"
                        >
                            <FiSend className="mr-2" /> Terminar
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Navegador de preguntas (Sidebar) */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sticky top-24">
                        <h3 className="font-black text-gray-800 uppercase tracking-wide mb-4 text-sm border-b pb-2">Navegación Mixta</h3>
                        <div className="grid grid-cols-5 gap-2">
                            {preguntas.map((p, idx) => {
                                const respondida = !!respuestas[p.id];
                                const activa = preguntaActual === idx;
                                
                                let btnClass = "h-10 w-full rounded-lg font-bold text-sm flex items-center justify-center transition-all ";
                                
                                if (activa) {
                                    btnClass += "ring-2 ring-indigo-500 ring-offset-2 ";
                                }
                                
                                if (respondida) {
                                    btnClass += "bg-indigo-100 text-indigo-700 border border-indigo-200";
                                } else {
                                    btnClass += "bg-white text-gray-500 border border-gray-300 hover:bg-gray-50";
                                }

                                return (
                                    <button 
                                        key={p.id}
                                        onClick={() => setPreguntaActual(idx)}
                                        className={btnClass}
                                        title={`Pregunta de ${p.materia_nombre}`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <div className="mt-6 space-y-2 text-xs font-bold text-gray-500">
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-indigo-100 border border-indigo-200 mr-2"></span> Respondidas: {Object.keys(respuestas).length}</div>
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-white border border-gray-300 mr-2"></span> Pendientes: {preguntas.length - Object.keys(respuestas).length}</div>
                        </div>
                    </div>
                </div>

                {/* Área de la pregunta activa */}
                <div className="md:col-span-3">
                    {currentP && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[400px] flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full -z-10"></div>
                            
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest">
                                    Pregunta {preguntaActual + 1} de {preguntas.length}
                                </h2>
                                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-md text-xs font-bold shadow-sm uppercase">
                                    {currentP.materia_nombre}
                                </span>
                            </div>
                            
                            <p className="text-xl font-bold text-gray-800 leading-relaxed mb-8">
                                {currentP.enunciado}
                            </p>

                            <div className="space-y-3 flex-1">
                                {['A', 'B', 'C', 'D'].map(letra => {
                                    const textoOpcion = currentP[`opcion_${letra.toLowerCase()}`];
                                    const isSelected = opcionSeleccionada === letra;
                                    
                                    return (
                                        <button
                                            key={letra}
                                            onClick={() => handleSelectOption(currentP.id, letra)}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center group ${
                                                isSelected 
                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-sm' 
                                                : 'border-gray-200 bg-white hover:border-indigo-200 hover:bg-gray-50 text-gray-700'
                                            }`}
                                        >
                                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black mr-4 shrink-0 transition-colors ${
                                                isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-500'
                                            }`}>
                                                {letra}
                                            </span>
                                            <span className="font-medium text-base">{textoOpcion}</span>
                                            {isSelected && <FiCheckCircle className="ml-auto text-indigo-500 shrink-0" size={20} />}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-100">
                                <button
                                    onClick={() => setPreguntaActual(prev => Math.max(0, prev - 1))}
                                    disabled={preguntaActual === 0}
                                    className="flex items-center text-sm font-bold text-gray-500 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                                >
                                    <FiArrowLeft className="mr-2" /> Anterior
                                </button>
                                
                                {preguntaActual < preguntas.length - 1 ? (
                                    <button
                                        onClick={() => setPreguntaActual(prev => Math.min(preguntas.length - 1, prev + 1))}
                                        className="flex items-center text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 rounded-lg transition-colors shadow-sm"
                                    >
                                        Siguiente <FiArrowRight className="ml-2" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={confirmarEnvio}
                                        className="flex items-center text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 px-6 py-2.5 rounded-lg transition-colors shadow-sm"
                                    >
                                        Finalizar y Enviar <FiSend className="ml-2" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
