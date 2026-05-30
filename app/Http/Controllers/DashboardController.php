<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Determinar a qué dashboard redirigir según el rol_id
        // 1: Admin
        // 2: Docente
        // 3: Postulante / Estudiante
        
        switch ($user->rol_id) {
            case 1:
                $usuarios = \App\Models\Usuario::select(
                    'usuario.id',
                    'usuario.codigo_inicio',
                    'usuario.estado',
                    'rol.nombre as rol_nombre',
                    'perfil.ci',
                    'perfil.nombres',
                    'perfil.apellido_paterno',
                    'perfil.apellido_materno',
                    'perfil.telefono'
                )
                ->join('rol', 'usuario.rol_id', '=', 'rol.id')
                ->leftJoin('perfil', 'usuario.id', '=', 'perfil.usuario_id')
                ->get();
                return Inertia::render('Dashboard/AdminDashboard', ['user' => $user, 'usuarios' => $usuarios]);
            case 2:
                return Inertia::render('Dashboard/DocenteDashboard', ['user' => $user]);
            case 3:
                return Inertia::render('Dashboard/EstudianteDashboard', ['user' => $user]);
            default:
                abort(403, 'Rol no autorizado.');
        }
    }
}
