import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-[#f4f8fc] pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-[#063f7c]" />
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
