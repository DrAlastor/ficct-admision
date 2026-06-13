<?php

namespace Backend\usuario_seguridad\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

/**
 * CU00 - Panel Principal
 */
class DashboardController extends Controller
{
    /**
     * Muestra el panel principal (Dashboard) correspondiente al rol del usuario.
     * - Administrador (1): Ve estadísticas globales (cantidad de usuarios, activos, inactivos) y bitácora reciente.
     * - Docente (2): Ve un resumen de las materias y grupos que dicta (incluyendo cupos y horarios).
     * - Postulante (4): Ve su grupo asignado y su propio horario de clases.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $user = Auth::user();

        // Determinar a qué dashboard redirigir según el rol_id
        // 1: Admin
        // 2: Docente
        // 3: Coordinador
        // 4: Postulante / Estudiante
        
        switch ($user->rol_id) {
            case 1:
            case 3:
                $usuariosQuery = \Backend\usuario_seguridad\Models\Usuario::where('eliminado', false)->get();
                
                // Asegurarnos de que el usuario actual se marque y cuente como Activo (útil si se reinició la BD)
                if ($user->estado !== 'Activo') {
                    $user->estado = 'Activo';
                    $user->save();
                    
                    // Actualizar en la colección para el conteo
                    $userEnColeccion = $usuariosQuery->firstWhere('id', $user->id);
                    if ($userEnColeccion) {
                        $userEnColeccion->estado = 'Activo';
                    }
                }

                $totalUsuarios = $usuariosQuery->count();
                $totalActivos = $usuariosQuery->where('estado', 'Activo')->count();
                $totalInactivos = $usuariosQuery->where('estado', 'Inactivo')->count();
                $totalAdmins = $usuariosQuery->where('rol_id', 1)->count();
                $totalDocentes = $usuariosQuery->where('rol_id', 2)->count();
                $totalPostulantes = $usuariosQuery->where('rol_id', 4)->count();

                $bitacora = \Illuminate\Support\Facades\DB::table('bitacora')
                    ->leftJoin('perfil', 'bitacora.usuario_id', '=', 'perfil.usuario_id')
                    ->select('bitacora.id', 'bitacora.accion', 'bitacora.detalle', 'bitacora.fecha_hora', 'perfil.nombres', 'perfil.apellido_paterno')
                    ->orderBy('bitacora.fecha_hora', 'desc')
                    ->take(5)
                    ->get();

                return Inertia::render('Paneles/Administrador/AdminDashboard', [
                    'user' => $user, 
                    'stats' => [
                        'total' => $totalUsuarios,
                        'online' => $totalActivos,
                        'offline' => $totalInactivos,
                        'admins' => $totalAdmins,
                        'docentes' => $totalDocentes,
                        'postulantes' => $totalPostulantes
                    ],
                    'bitacoraReciente' => $bitacora
                ]);
            case 2:
                // Asignacion de clases a docentes
                $perfil = \Backend\usuario_seguridad\Models\Perfil::where('usuario_id', $user->id)->first();
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
            case 4:
                // Fetch postulante's schedule
                $perfil = \Backend\usuario_seguridad\Models\Perfil::where('usuario_id', $user->id)->first();
                $materias = [];
                $grupoAsignado = '';
                
                $gestionActual = \Illuminate\Support\Facades\DB::table('gestion')->orderByDesc('id')->first();
                $inscripcionesAbiertas = $gestionActual ? $gestionActual->inscripciones_abiertas : false;
                $yaInscrito = false;
                $gruposDisponibles = [];
                
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
                            
                        if ($inscripciones->count() > 0) {
                            $yaInscrito = true;
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
                        } else if ($inscripcionesAbiertas && $gestionActual) {
                            // Fetch available groups for enrollment
                            $gruposDisponibles = \Illuminate\Support\Facades\DB::table('grupo')
                                ->where('gestion_id', $gestionActual->id)
                                ->select('nombre', 'cupo', 'inscritos_actuales', 'modalidad')
                                ->groupBy('nombre', 'cupo', 'inscritos_actuales', 'modalidad')
                                ->orderBy('nombre')
                                ->get()
                                ->map(function($g) {
                                    $turno = 'Mañana';
                                    if(str_starts_with($g->nombre, 'T')) $turno = 'Tarde';
                                    if(str_starts_with($g->nombre, 'N')) $turno = 'Noche';
                                    $g->turno = $turno;
                                    $g->disponible = $g->cupo - $g->inscritos_actuales;
                                    return $g;
                                });
                        }
                    }
                }

                return Inertia::render('Paneles/Postulante/EstudianteDashboard', [
                    'user' => $user,
                    'materias' => $materias,
                    'grupoAsignado' => $grupoAsignado,
                    'inscripcionesAbiertas' => $inscripcionesAbiertas,
                    'yaInscrito' => $yaInscrito,
                    'gruposDisponibles' => $gruposDisponibles
                ]);
            default:
                abort(403, 'Rol no autorizado.');
        }
    }
}
