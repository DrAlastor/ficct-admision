<?php

namespace Backend\usuario_seguridad\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Muestra la vista principal de Inicio de Sesión (Login).
     * Renderiza el componente de React pasando si está habilitado
     * o no la recuperación de contraseña.
     *
     * @return \Inertia\Response
     */
    public function create(): Response
    {
        return Inertia::render('Modulos/usuario_seguridad/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Maneja la petición entrante de autenticación de un usuario.
     * Valida credenciales, regenera la sesión para evitar fijación de sesión,
     * y marca el estado del usuario como "Activo" (En línea).
     *
     * @param LoginRequest $request Petición que incluye CI/Código y contraseña.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();
        
        $user = Auth::user();
        if ($user) {
            $user->estado = 'Activo';
            $user->save();
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destruye la sesión autenticada actual (Cerrar Sesión).
     * Marca el estado del usuario como "Inactivo" (Desconectado), 
     * invalida la sesión HTTP y regenera el token CSRF.
     *
     * @param Request $request Petición HTTP.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::user();
        if ($user) {
            $user->estado = 'Inactivo';
            $user->save();
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
