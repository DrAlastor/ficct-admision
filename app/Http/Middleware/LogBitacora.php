<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Bitacora;
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

        if (Auth::check() && ($method !== 'GET' || $isLogin || $isLogout)) {
            $accion = "Método: {$method} | Ruta: /{$request->path()}";
            
            if ($isLogin) {
                $accion = "Inicio de Sesión";
            } elseif ($isLogout) {
                $accion = "Cierre de Sesión";
            }

            Bitacora::create([
                'usuario_id' => Auth::id(),
                'accion' => substr($accion, 0, 255),
                'fecha' => now()->toDateString(),
                'hora' => now()->toTimeString(),
                'ip' => $request->ip() ?? '127.0.0.1'
            ]);
        }

        return $response;
    }
}
