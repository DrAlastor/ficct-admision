<?php

namespace Backend\Modulo1_Seguridad\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Backend\Modulo1_Seguridad\Models\Usuario;
use Backend\Modulo1_Seguridad\Models\Perfil;
use Backend\Modulo1_Seguridad\Models\TokenRecuperacion;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class PasswordResetController extends Controller
{
    public function create()
    {
        return Inertia::render('Modulos/Modulo1_Seguridad/ForgotPassword');
    }

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

    public function showTokenForm(Request $request)
    {
        return Inertia::render('Modulos/Modulo1_Seguridad/EnterToken', ['email' => $request->query('email')]);
    }

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
