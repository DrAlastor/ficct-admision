import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { FiLock, FiKey, FiCheckCircle, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();
    const [showPasswords, setShowPasswords] = useState(false);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    const inputClasses = "w-full pl-12 pr-12 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-[#24337A] focus:border-transparent focus:bg-white transition-all shadow-sm";
    const errorClasses = "w-full pl-12 pr-12 py-3.5 bg-red-50/50 border border-red-300 rounded-xl text-red-900 font-medium focus:ring-2 focus:ring-red-500 focus:border-transparent focus:bg-white transition-all shadow-sm";

    return (
        <section className={className}>
            <form onSubmit={updatePassword} className="space-y-6">
                
                {/* Contraseña Actual */}
                <div className="relative group">
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1" htmlFor="current_password">
                        Contraseña Actual
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#24337A] transition-colors">
                            <FiLock size={20} />
                        </div>
                        <input
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            type={showPasswords ? "text" : "password"}
                            className={errors.current_password ? errorClasses : inputClasses}
                            autoComplete="current-password"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPasswords(!showPasswords)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#24337A] transition-colors focus:outline-none"
                        >
                            {showPasswords ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                    </div>
                    {errors.current_password && (
                        <div className="mt-2 flex items-center text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                            <FiAlertCircle className="mr-2 shrink-0" />
                            <span className="font-medium">{errors.current_password}</span>
                        </div>
                    )}
                </div>

                {/* Separador Visual */}
                <div className="flex items-center py-2">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase tracking-wider">Nueva Credencial</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                {/* Nueva Contraseña */}
                <div className="relative group">
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1" htmlFor="password">
                        Nueva Contraseña
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#24337A] transition-colors">
                            <FiKey size={20} />
                        </div>
                        <input
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type={showPasswords ? "text" : "password"}
                            className={errors.password ? errorClasses : inputClasses}
                            autoComplete="new-password"
                            placeholder="Mínimo 8 caracteres"
                        />
                    </div>
                    {errors.password && (
                        <div className="mt-2 flex items-center text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                            <FiAlertCircle className="mr-2 shrink-0" />
                            <span className="font-medium">{errors.password}</span>
                        </div>
                    )}
                </div>

                {/* Confirmar Contraseña */}
                <div className="relative group">
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1" htmlFor="password_confirmation">
                        Confirmar Contraseña
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#24337A] transition-colors">
                            <FiCheckCircle size={20} />
                        </div>
                        <input
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            type={showPasswords ? "text" : "password"}
                            className={errors.password_confirmation ? errorClasses : inputClasses}
                            autoComplete="new-password"
                            placeholder="Repite la nueva contraseña"
                        />
                    </div>
                    {errors.password_confirmation && (
                        <div className="mt-2 flex items-center text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                            <FiAlertCircle className="mr-2 shrink-0" />
                            <span className="font-medium">{errors.password_confirmation}</span>
                        </div>
                    )}
                </div>

                {/* Submit Action */}
                <div className="pt-4 flex items-center justify-between">
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-out duration-300 transform"
                        enterFrom="opacity-0 scale-95 translate-y-2"
                        enterTo="opacity-100 scale-100 translate-y-0"
                        leave="transition ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="flex items-center text-green-600 font-bold bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                            <FiCheckCircle className="mr-2" size={20} />
                            ¡Contraseña Actualizada!
                        </div>
                    </Transition>

                    {!recentlySuccessful && <div></div>}

                    <button 
                        disabled={processing}
                        className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-[#07074E] to-[#24337A] hover:from-[#0a0d3b] hover:to-[#17225c] focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg transform transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {processing ? (
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Guardando...
                            </div>
                        ) : (
                            'Guardar Cambios'
                        )}
                    </button>
                </div>
            </form>
        </section>
    );
}
