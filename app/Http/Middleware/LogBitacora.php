<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Backend\usuario_seguridad\Models\Bitacora;
use Illuminate\Support\Facades\Auth;

class LogBitacora
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Solo registrar si el usuario está autenticado y la petición modifica algo (o es una acción importante)
        // Por ejemplo, registramos los POST, PUT, DELETE, y los inicios/cierres de sesión
        $method = $request->method();
        $isLogin = $request->is('login') && $method === 'POST';
        $isLogout = $request->is('logout') && $method === 'POST';

        if (Auth::check() && ($isLogin || $isLogout)) {
            $accion = $isLogin ? "Inicio de Sesión" : "Cierre de Sesión";

            \Backend\usuario_seguridad\Services\AuditService::log($accion, null);
        }

        return $response;
    }
}
