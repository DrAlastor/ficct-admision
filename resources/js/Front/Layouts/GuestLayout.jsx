import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-[#f4f8fc] pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    <img
                        src="/ficct/logos/escudo-ficct.png"
                        alt="Logo oficial FICCT"
                        className="h-24 w-auto object-contain drop-shadow-lg"
                    />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden rounded-xl border border-blue-950/10 bg-white shadow-xl shadow-blue-950/10 sm:max-w-md">
                <div className="h-2 bg-gradient-to-r from-[#063f7c] via-[#ef172f] to-[#f59e0b]" />
                <div className="px-6 py-5">
                {children}
                </div>
            </div>
        </div>
    );
}
