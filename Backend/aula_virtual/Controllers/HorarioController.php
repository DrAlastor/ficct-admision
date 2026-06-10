<?php

namespace Backend\aula_virtual\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HorarioController extends Controller
{
    /**
     * Muestra la cuadrícula de horarios asignados al usuario.
     * Si el usuario es Postulante, muestra los horarios de sus materias inscritas.
     * Si el usuario es Docente, muestra los horarios de los grupos que dicta.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $user = Auth::user();

        // Verificar permisos
        if ($user->rol_id != 1) {
            $permiso = DB::table('rol_funcion')
                ->join('funcion', 'rol_funcion.funcion_id', '=', 'funcion.id')
                ->where('rol_funcion.rol_id', $user->rol_id)
                ->where('funcion.permiso', 'aula.horario')
                ->first();

            if (!$permiso) {
                abort(403, 'No tienes permiso para acceder a esta función.');
            }
        }

        // Cargar configuración de diseño (reusamos la de la boleta)
        $config = ['primaryColor' => '#07074E', 'secondaryColor' => '#1a237e', 'accentColor' => '#ef172f'];
        if (Storage::disk('local')->exists('boleta_config.json')) {
            $config = json_decode(Storage::disk('local')->get('boleta_config.json'), true);
        }

        $perfil = DB::table('perfil')->where('usuario_id', $user->id)->first();

        if (!$perfil) {
            return Inertia::render('Modulos/aula_virtual/Horario/Index', [
                'status' => 'error',
                'message' => 'Perfil no encontrado.',
                'horarioData' => null,
                'config' => $config
            ]);
        }

        $carreraNombre = 'N/A';
        $inscripciones = collect();

        if ($user->rol_id == 3) {
            $postulacion = DB::table('postulacion')
                ->where('postulante_id', $perfil->id)
                ->orderByDesc('codigo')
                ->first();

            if ($postulacion) {
                $postulacionCarrera = DB::table('postulacion_carrera')
                    ->join('carrera', 'postulacion_carrera.carrera_codigo', '=', 'carrera.codigo')
                    ->where('postulacion_carrera.postulacion_codigo', $postulacion->codigo)
                    ->orderBy('postulacion_carrera.prioridad')
                    ->first();
                
                if ($postulacionCarrera) {
                    $carreraNombre = $postulacionCarrera->sigla . ' ' . $postulacionCarrera->nombre;
                }

                $inscripciones = DB::table('inscripciones_cup')
                    ->join('grupo', 'inscripciones_cup.grupo_codigo', '=', 'grupo.codigo')
                    ->join('materia', 'grupo.materia_id', '=', 'materia.id')
                    ->where('inscripciones_cup.postulacion_codigo', $postulacion->codigo)
                    ->select(
                        'grupo.nombre as grupo_nombre',
                        'materia.sigla as materia_sigla',
                        'grupo.codigo as grupo_id',
                        'materia.nombre as materia_nombre'
                    )
                    ->get();
            }
        } elseif ($user->rol_id == 2) {
            $carreraNombre = 'DOCENCIA'; 
            
            $inscripciones = DB::table('carga_horaria')
                ->join('grupo', 'carga_horaria.grupo_codigo', '=', 'grupo.codigo')
                ->join('materia', 'grupo.materia_id', '=', 'materia.id')
                ->where('carga_horaria.docente_id', $perfil->id)
                ->select(
                        'grupo.nombre as grupo_nombre',
                        'materia.sigla as materia_sigla',
                        'grupo.codigo as grupo_id',
                        'materia.nombre as materia_nombre'
                )
                ->get();
        }

        if ($inscripciones->isEmpty()) {
            return Inertia::render('Modulos/aula_virtual/Horario/Index', [
                'status' => 'processing',
                'message' => 'No tienes horarios asignados aún.',
                'horarioData' => null,
                'config' => $config
            ]);
        }

        // Obtener todas las sesiones de las materias inscritas
        $horarios = [];
        $materiasUnicas = [];

        foreach ($inscripciones as $inscripcion) {
            $sesiones = DB::table('horario')
                ->where('grupo_codigo', $inscripcion->grupo_id)
                ->get();
                
            $materiasUnicas[$inscripcion->materia_sigla] = $inscripcion->materia_sigla;

            foreach ($sesiones as $sesion) {
                // Estandarizar el formato del día para el mapeo
                $diaMap = [
                    'Lunes' => 'Lun',
                    'Martes' => 'Mar',
                    'Miércoles' => 'Mie',
                    'Jueves' => 'Jue',
                    'Viernes' => 'Vie',
                    'Sábado' => 'Sab',
                    'LUNES' => 'Lun',
                    'MARTES' => 'Mar',
                    'MIERCOLES' => 'Mie',
                    'MIÉRCOLES' => 'Mie',
                    'JUEVES' => 'Jue',
                    'VIERNES' => 'Vie',
                    'SABADO' => 'Sab',
                    'SÁBADO' => 'Sab'
                ];
                
                $diaNorm = $diaMap[$sesion->dia] ?? substr($sesion->dia, 0, 3);

                $horarios[] = [
                    'dia' => $diaNorm,
                    'hora_inicio' => substr($sesion->hora_inicio, 0, 5),
                    'hora_fin' => substr($sesion->hora_fin, 0, 5),
                    'materia' => $inscripcion->materia_sigla . ' - ' . $inscripcion->grupo_nombre,
                    'sigla' => $inscripcion->materia_sigla // Útil para asignar colores en React
                ];
            }
        }

        $nombreCompleto = trim(strtoupper($perfil->apellido_paterno . ' ' . $perfil->apellido_materno . ' ' . $perfil->nombres));

        return Inertia::render('Modulos/aula_virtual/Horario/Index', [
            'status' => 'success',
            'horarioData' => [
                'registro' => $perfil->codigo,
                'nombre' => $nombreCompleto,
                'carrera' => strtoupper($carreraNombre),
                'lugar' => 'SANTA CRUZ',
                'clases' => $horarios,
                'total_materias' => count($materiasUnicas),
                'lista_materias' => implode(', ', array_values($materiasUnicas))
            ],
            'config' => $config
        ]);
    }
}
