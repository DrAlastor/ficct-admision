import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: '¡Hola! 👋 Soy FICCT-Bot, tu asistente de la Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones. ¿En qué te puedo ayudar hoy?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setInput('');

        // Prepare history for API (excluding the first welcome message if it's too generic, but we can send all)
        const historyToSend = messages.slice(1).map(m => ({ role: m.role, text: m.text }));

        // Add user message to UI
        const newMessages = [...messages, { role: 'user', text: userMsg }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const response = await fetch('/chatbot/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    message: userMsg,
                    history: historyToSend
                })
            });

            const data = await response.json();

            if (data.success) {
                setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'model', text: data.reply || 'Hubo un error al contactar al servidor.' }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: 'Ups, parece que perdí la conexión. Intenta de nuevo más tarde.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chatbot Window */}
            {isOpen && (
                <div className="mb-4 flex h-[450px] w-80 flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl transition-all sm:w-96">
                    {/* Header */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-[#063f7c] to-[#0a5aa7] px-4 py-3 text-white">
                        <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#063f7c]">
                                <FaRobot className="h-4 w-4" />
                            </span>
                            <div>
                                <h3 className="font-bold text-sm">FICCT-Bot</h3>
                                <span className="text-xs text-blue-200">Asistente Virtual IA</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="rounded-full p-1 text-white hover:bg-white/20"
                        >
                            <FaTimes className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
                        <div className="flex flex-col gap-3">
                            {messages.map((msg, index) => (
                                <div 
                                    key={index} 
                                    className={`flex max-w-[85%] flex-col rounded-2xl px-4 py-2 text-sm ${
                                        msg.role === 'user' 
                                        ? 'self-end bg-[#063f7c] text-white rounded-br-none' 
                                        : 'self-start bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="self-start rounded-2xl rounded-bl-none border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">
                                    <div className="flex items-center gap-1">
                                        <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></div>
                                        <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="border-t border-slate-100 bg-white p-3">
                        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 focus-within:border-[#063f7c] focus-within:ring-1 focus-within:ring-[#063f7c]">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Escribe tu duda aquí..."
                                className="w-full border-0 bg-transparent px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-0"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#063f7c] text-white transition-colors hover:bg-[#0a5aa7] disabled:opacity-50"
                            >
                                <FaPaperPlane className="h-3 w-3" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#063f7c] to-[#0a5aa7] text-white shadow-lg shadow-blue-900/30 transition-transform hover:scale-105"
                >
                    <FaRobot className="h-6 w-6" />
                </button>
            )}
        </div>
    );
}
