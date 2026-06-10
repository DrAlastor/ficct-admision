<?php

namespace Backend\usuario_seguridad\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Backend\usuario_seguridad\Models\Usuario;
use Backend\usuario_seguridad\Models\Perfil;
use Backend\usuario_seguridad\Models\TokenRecuperacion;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class PasswordResetController extends Controller
{
    /**
     * Muestra la vista donde el usuario ingresa su correo para solicitar
     * un token de recuperación de contraseña de 6 dígitos.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        return Inertia::render('Modulos/usuario_seguridad/ForgotPassword');
    }

    /**
     * Valida el correo y genera un código de 6 dígitos que se guarda
     * en la tabla `token_recuperacion`. 
     * Simula el envío por correo electrónico registrándolo en los logs del sistema.
     *
     * @param Request $request Contiene el 'email' del usuario.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $perfil = Perfil::where('email', $request->email)->first();

        if (!$perfil) {
            return back()->withErrors(['email' => 'No encontramos a ningún usuario con este correo electrónico.']);
        }

        $usuario = $perfil->usuario;

        // Generate 6-digit token
        $token = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

        TokenRecuperacion::create([
            'usuario_id' => $usuario->id,
            'token' => $token,
            'fecha_creacion' => Carbon::now(),
            'fecha_expiracion' => Carbon::now()->addHours(2),
            'usado' => false
        ]);

        // Simulated email send (Logged for now)
        Log::info("TOKEN DE RECUPERACIÓN PARA {$perfil->email}: {$token}");

        return redirect()->route('password.token.view', ['email' => $request->email])
                         ->with('status', 'Hemos enviado un código de recuperación a tu correo.');
    }

    /**
     * Muestra la vista para ingresar el token de 6 dígitos recibido por correo.
     *
     * @param Request $request Contiene el 'email' del usuario en la query string.
     * @return \Inertia\Response
     */
    public function showTokenForm(Request $request)
    {
        return Inertia::render('Modulos/usuario_seguridad/EnterToken', ['email' => $request->query('email')]);
    }

    /**
     * Verifica que el token ingresado coincida con el almacenado, no haya expirado
     * (2 horas de vigencia) y no haya sido usado antes.
     * Si es válido, lo marca como usado, inicia sesión automáticamente y redirige
     * a la vista de edición de perfil para que cambie la contraseña.
     *
     * @param Request $request Contiene 'email' y 'token'.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function verifyToken(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string|size:6'
        ]);

        $perfil = Perfil::where('email', $request->email)->first();

        if (!$perfil) {
            return back()->withErrors(['email' => 'Usuario no encontrado.']);
        }

        $tokenRecord = TokenRecuperacion::where('usuario_id', $perfil->usuario_id)
            ->where('token', $request->token)
            ->where('usado', false)
            ->where('fecha_expiracion', '>', Carbon::now())
            ->first();

        if (!$tokenRecord) {
            return back()->withErrors(['token' => 'El código es inválido o ha expirado.']);
        }

        // Mark as used
        $tokenRecord->update(['usado' => true]);

        // Log the user in
        Auth::login($perfil->usuario);

        // Redirect to profile
        return redirect()->route('profile.edit')->with('status', 'Has iniciado sesión con tu código temporal. Por favor, cambia tu contraseña ahora.');
    }
}
