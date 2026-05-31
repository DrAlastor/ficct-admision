import { Head, Link } from '@inertiajs/react';
import React from 'react';

export default function Welcome({ auth }) {
    const carreras = [
        {
            titulo: 'Ingeniería Informática',
            descripcion: 'Domina el desarrollo de software, algoritmos e inteligencia artificial para crear soluciones tecnológicas innovadoras.',
            icono: (
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
            )
        },
        {
            titulo: 'Ingeniería en Sistemas',
            descripcion: 'Gestiona la información y optimiza procesos organizacionales integrando tecnología y negocios a gran escala.',
            icono: (
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
            )
        },
        {
            titulo: 'Redes y Telecomunicaciones',
            descripcion: 'Diseña y administra la infraestructura de conectividad global, desde redes locales hasta telecomunicaciones satelitales.',
            icono: (
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                </svg>
            )
        },
        {
            titulo: 'Ingeniería Robótica',
            descripcion: 'Crea el futuro mediante la integración de mecánica, electrónica y sistemas computacionales para automatización.',
            icono: (
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-600 selection:text-white">
            <Head title="Bienvenido - FICCT" />

            {/* Navbar */}
            <nav className="absolute top-0 w-full z-50 px-6 py-4 flex justify-between items-center border-b border-white/10 bg-black/10 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-white tracking-tight">FICCT</span>
                </div>
                <div className="flex gap-4">
                    {auth.user ? (
                        <Link href={route('dashboard')} className="text-white hover:text-blue-200 transition font-medium">
                            Dashboard
                        </Link>
                    ) : (
                        <Link href={route('login')} className="text-white hover:text-blue-200 transition font-medium">
                            Iniciar Sesión
                        </Link>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
                <div className="absolute inset-0 bg-[url('https://laravel.com/assets/img/welcome/background.svg')] opacity-20 object-cover object-center mix-blend-overlay"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 drop-shadow-lg">
                        Facultad de Ingeniería en Ciencias de <br className="hidden md:block" /> la Computación y Telecomunicaciones
                    </h1>
                    <p className="mt-4 max-w-2xl text-xl text-blue-100 mx-auto mb-10">
                        Formando a los líderes tecnológicos del mañana. Descubre tu pasión y construye el futuro con nosotros.
                    </p>
                    <div className="flex justify-center gap-4">
                        <a href="#carreras" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-3 rounded-full font-semibold transition backdrop-blur-sm">
                            Explorar Carreras
                        </a>
                        <Link href={route('registro.create')} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-1">
                            Inscripción CUP
                        </Link>
                    </div>
                </div>
                
                {/* Decorative shape */}
                <div className="absolute bottom-0 w-full overflow-hidden leading-none rotate-180">
                    <svg className="relative block w-full h-[50px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#f9fafb"></path>
                    </svg>
                </div>
            </section>

            {/* Carreras Section */}
            <section id="carreras" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">
                            Nuestra Oferta Académica
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            Programas diseñados para la innovación y la excelencia tecnológica.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {carreras.map((carrera, index) => (
                            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                                <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    {carrera.icono}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{carrera.titulo}</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {carrera.descripcion}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-1/2 bg-blue-50 rounded-r-full opacity-50"></div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-10 sm:p-16 text-center shadow-2xl transform hover:scale-[1.02] transition duration-300">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-6">
                            ¿Estás interesado en algunas de nuestras carreras?
                        </h2>
                        <p className="text-blue-100 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
                            Regístrate y postula a alguna de nuestras carreras. El proceso de admisión (CUP) es tu primer paso hacia el éxito profesional.
                        </p>
                        <Link
                            href={route('registro.create')}
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-indigo-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-xl transition-transform transform hover:-translate-y-1"
                        >
                            ¡Registrarme al CUP Ahora!
                            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 py-12 text-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-gray-400 text-sm">
                        &copy; 2026 Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones. Todos los derechos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
}
