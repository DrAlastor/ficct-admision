<?php

namespace Backend\Modulo1_Seguridad\Controllers;

use App\Http\Controllers\Controller;
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
                $usuarios = \Backend\Modulo1_Seguridad\Models\Usuario::select(
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
                return Inertia::render('Paneles/Admin/AdminDashboard', ['user' => $user, 'usuarios' => $usuarios]);
            case 2:
                // Fetch docente's assigned classes
                $perfil = \Backend\Modulo1_Seguridad\Models\Perfil::where('usuario_id', $user->id)->first();
                $materias = [];
                
                if ($perfil) {
                    $cargas = \Illuminate\Support\Facades\DB::table('carga_horaria')
                        ->join('grupo', 'carga_horaria.grupo_codigo', '=', 'grupo.codigo')
                        ->join('materia', 'grupo.materia_id', '=', 'materia.id')
                        ->join('horario', 'grupo.codigo', '=', 'horario.grupo_codigo')
                        ->join('aula', 'horario.aula_id', '=', 'aula.id')
                        ->where('carga_horaria.docente_id', $perfil->id)
                        ->select(
                            'grupo.codigo as grupo_codigo',
                            'grupo.nombre as grupo_nombre',
                            'materia.nombre as materia_nombre',
                            'grupo.modalidad',
                            'grupo.inscritos_actuales',
                            'grupo.cupo',
                            'horario.dia',
                            'horario.hora_inicio',
                            'horario.hora_fin',
                            'aula.nro_aula'
                        )
                        ->get();
                        
                    foreach ($cargas as $carga) {
                        $materias[] = [
                            'grupo_codigo' => $carga->grupo_codigo,
                            'grupo_nombre' => $carga->grupo_nombre,
                            'materia' => $carga->materia_nombre,
                            'modalidad' => $carga->modalidad,
                            'inscritos' => $carga->inscritos_actuales,
                            'cupo' => $carga->cupo,
                            'horario' => $carga->dia . ' ' . substr($carga->hora_inicio, 0, 5) . ' - ' . substr($carga->hora_fin, 0, 5),
                            'aula' => $carga->nro_aula
                        ];
                    }
                }

                return Inertia::render('Paneles/Docente/DocenteDashboard', [
                    'user' => $user,
                    'perfil' => $perfil,
                    'materias' => $materias
                ]);
            case 3:
                // Fetch postulante's schedule
                $perfil = \Backend\Modulo1_Seguridad\Models\Perfil::where('usuario_id', $user->id)->first();
                $materias = [];
                $grupoAsignado = '';
                
                if ($perfil) {
                    $postulacion = \Illuminate\Support\Facades\DB::table('postulacion')
                        ->where('postulante_id', $perfil->id)
                        ->first();
                        
                    if ($postulacion) {
                        $inscripciones = \Illuminate\Support\Facades\DB::table('inscripciones_cup')
                            ->join('grupo', 'inscripciones_cup.grupo_codigo', '=', 'grupo.codigo')
                            ->join('materia', 'grupo.materia_id', '=', 'materia.id')
                            ->join('horario', 'grupo.codigo', '=', 'horario.grupo_codigo')
                            ->join('aula', 'horario.aula_id', '=', 'aula.id')
                            ->leftJoin('carga_horaria', 'grupo.codigo', '=', 'carga_horaria.grupo_codigo')
                            ->leftJoin('perfil as docente_perfil', 'carga_horaria.docente_id', '=', 'docente_perfil.id')
                            ->where('inscripciones_cup.postulacion_codigo', $postulacion->codigo)
                            ->select(
                                'materia.nombre as materia',
                                'grupo.nombre as grupo',
                                'horario.dia',
                                'horario.hora_inicio',
                                'horario.hora_fin',
                                'aula.nro_aula as aula',
                                'docente_perfil.nombres as docente_nombres',
                                'docente_perfil.apellido_paterno as docente_paterno'
                            )
                            ->get();
                            
                        foreach ($inscripciones as $inscripcion) {
                            $grupoAsignado = $inscripcion->grupo; // They belong to the same cohort usually
                            $docente = $inscripcion->docente_nombres ? $inscripcion->docente_nombres . ' ' . $inscripcion->docente_paterno : null;
                            $materias[] = [
                                'materia' => $inscripcion->materia,
                                'dia' => $inscripcion->dia,
                                'hora_inicio' => substr($inscripcion->hora_inicio, 0, 5),
                                'hora_fin' => substr($inscripcion->hora_fin, 0, 5),
                                'aula' => $inscripcion->aula,
                                'docente' => $docente
                            ];
                        }
                    }
                }

                return Inertia::render('Paneles/Postulante/EstudianteDashboard', [
                    'user' => $user,
                    'materias' => $materias,
                    'grupoAsignado' => $grupoAsignado
                ]);
            default:
                abort(403, 'Rol no autorizado.');
        }
    }
}
