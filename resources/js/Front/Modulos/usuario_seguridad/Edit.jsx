import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head } from '@inertiajs/react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import { FiShield } from 'react-icons/fi';

export default function Edit({ mustVerifyEmail, status, perfil, rol_id }) {
    return (
        <SidebarLayout title="GESTIONAR CONTRASEÑA" subtitle="SEGURIDAD DE LA CUENTA">
            <Head title="Gestionar Contraseña" />

            <div className="py-8 flex justify-center items-start min-h-[70vh]">
                <div className="w-full max-w-2xl">
                    {/* Glassmorphism Container */}
                    <div className="relative bg-white/80 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[2rem] p-8 md:p-10 overflow-hidden group hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] transition-all duration-500">
                        {/* Decorative abstract elements */}
                        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl -mt-24 -mr-24 pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
                        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-purple-400/20 to-pink-500/20 rounded-full blur-3xl -mb-24 -ml-24 pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
                        
                        {/* Header Section */}
                        <div className="relative z-10 flex items-center mb-8 border-b border-gray-100 pb-6">
                            <div className="bg-gradient-to-br from-[#07074E] to-[#24337A] p-4 rounded-2xl shadow-xl mr-5 text-white transform transition-transform group-hover:rotate-12 duration-300">
                                <FiShield size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">Cambio de Contraseña</h2>
                                <p className="text-sm md:text-base text-gray-500 font-medium mt-1">
                                    Protege tu cuenta asegurándote de usar una clave fuerte y aleatoria.
                                </p>
                            </div>
                        </div>

                        {/* Form Section */}
                        <div className="relative z-10">
                            <UpdatePasswordForm className="w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
