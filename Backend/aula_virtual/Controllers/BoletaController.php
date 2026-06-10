<?php

namespace Backend\aula_virtual\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
class BoletaController extends Controller
{
    /**
     * Muestra la boleta de inscripción o asignación de carga horaria.
     * Si el usuario es Postulante, muestra las materias en las que está inscrito.
     * Si el usuario es Docente, muestra las materias que tiene asignadas.
     * También permite al Administrador visualizar y previsualizar la configuración de colores.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $user = Auth::user();

        $can_edit = false;

        // Verificar permisos dinámicos (1 = Admin, tiene acceso total)
        if ($user->rol_id == 1) {
            $can_edit = true;
        } else {
            $permiso = DB::table('rol_funcion')
                ->join('funcion', 'rol_funcion.funcion_id', '=', 'funcion.id')
                ->where('rol_funcion.rol_id', $user->rol_id)
                ->where('funcion.permiso', 'aula.boleta')
                ->first();

            // Solo verificamos que tenga el permiso asignado en rol_funcion
            if (!$permiso) {
                abort(403, 'No tienes permiso para acceder a esta función.');
            }

            // Si tiene id_accion == 3 (Lectura y Escritura) o 2 (Solo edicion), puede editar
            if (in_array($permiso->id_accion, [2, 3])) {
                $can_edit = true;
            }
        }

        // Cargar configuración de diseño
        $config = ['primaryColor' => '#07074E', 'secondaryColor' => '#1a237e', 'accentColor' => '#ef172f'];
        if (Storage::disk('local')->exists('boleta_config.json')) {
            $config = json_decode(Storage::disk('local')->get('boleta_config.json'), true);
        }

        // Obtener el perfil del usuario
        $perfil = DB::table('perfil')->where('usuario_id', $user->id)->first();

        if (!$perfil) {
            return Inertia::render('Modulos/aula_virtual/Boleta/Index', [
                'status' => 'error',
                'message' => 'Perfil no encontrado.',
                'boleta' => null
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
                $inscripciones = DB::table('inscripciones_cup')
                    ->join('grupo', 'inscripciones_cup.grupo_codigo', '=', 'grupo.codigo')
                    ->join('materia', 'grupo.materia_id', '=', 'materia.id')
                    ->where('inscripciones_cup.postulacion_codigo', $postulacion->codigo)
                    ->select(
                        'grupo.nombre as grupo_nombre',
                        'grupo.modalidad',
                        'materia.nombre as materia_nombre',
                        'grupo.codigo as grupo_id'
                    )
                    ->get();
            } else {
                return Inertia::render('Modulos/aula_virtual/Boleta/Index', [
                    'status' => 'processing',
                    'message' => 'No se encontraron registros de postulación habilitados.',
                    'boleta' => null
                ]);
            }
        } elseif ($user->rol_id == 2) {
            $carreraNombre = 'DOCENCIA'; 
            
            $inscripciones = DB::table('carga_horaria')
                ->join('grupo', 'carga_horaria.grupo_codigo', '=', 'grupo.codigo')
                ->join('materia', 'grupo.materia_id', '=', 'materia.id')
                ->where('carga_horaria.docente_id', $perfil->id)
                ->select(
                    'grupo.nombre as grupo_nombre',
                    'grupo.modalidad',
                    'materia.nombre as materia_nombre',
                    'grupo.codigo as grupo_id'
                )
                ->get();
        } else {
            // Admin u otro rol sin materias/horarios de clases
            return Inertia::render('Modulos/aula_virtual/Boleta/Index', [
                'status' => 'error',
                'message' => 'El perfil actual no cuenta con asignación de horarios (Solo Postulantes o Docentes).',
                'boleta' => null
            ]);
        }

        // Si no tiene asignaciones pero tiene permiso para editar, mostramos previsualización
        if ($inscripciones->isEmpty() && $can_edit) {
            return Inertia::render('Modulos/aula_virtual/Boleta/Index', [
                'status' => 'admin_preview',
                'message' => 'Modo de edición de diseño de la boleta.',
                'can_edit' => $can_edit,
                'config' => $config,
                'boleta' => [
                    'grupo' => 'M001 (PREVIEW)',
                    'materias' => [
                        [
                            'nombre' => 'MATEMÁTICAS',
                            'modalidad' => 'Presencial',
                            'sesiones' => [
                                ['dia' => 'Lunes', 'hora_inicio' => '07:00:00', 'hora_fin' => '08:30:00', 'nro_aula' => 'Aula 11 - 236']
                            ]
                        ],
                        [
                            'nombre' => 'COMPUTACIÓN',
                            'modalidad' => 'Presencial',
                            'sesiones' => [
                                ['dia' => 'Martes', 'hora_inicio' => '11:30:00', 'hora_fin' => '13:00:00', 'nro_aula' => 'Lab 41 - 236']
                            ]
                        ]
                    ]
                ]
            ]);
        }

        if ($inscripciones->isEmpty()) {
            return Inertia::render('Modulos/aula_virtual/Boleta/Index', [
                'status' => 'processing',
                'message' => $docente ? 'No tienes carga horaria asignada aún.' : 'Boleta en procesamiento.',
                'can_edit' => $can_edit,
                'config' => $config,
                'boleta' => null
            ]);
        }

        // Determinar nombre del Grupo (para docentes puede que enseñen en varios, así que mostramos "Múltiples")
        $gruposUnicos = $inscripciones->pluck('grupo_nombre')->unique();
        $grupoNombre = $gruposUnicos->count() > 1 ? 'Múltiples' : $gruposUnicos->first();

        // Recuperar horarios
        $materiasDetalle = [];
        foreach ($inscripciones as $inscripcion) {
            $sesiones = DB::table('horario')
                ->join('aula', 'horario.aula_id', '=', 'aula.id')
                ->where('horario.grupo_codigo', $inscripcion->grupo_id)
                ->orderBy('horario.dia')
                ->orderBy('horario.hora_inicio')
                ->select('horario.dia', 'horario.hora_inicio', 'horario.hora_fin', 'aula.nro_aula')
                ->get();

            $materiasDetalle[] = [
                'nombre' => $inscripcion->materia_nombre . ($gruposUnicos->count() > 1 ? " ({$inscripcion->grupo_nombre})" : ''),
                'modalidad' => $inscripcion->modalidad,
                'sesiones' => $sesiones
            ];
        }

        return Inertia::render('Modulos/aula_virtual/Boleta/Index', [
            'status' => 'assigned',
            'message' => 'Información de horarios generada con éxito.',
            'can_edit' => $can_edit,
            'config' => $config,
            'boleta' => [
                'grupo' => $grupoNombre,
                'materias' => $materiasDetalle
            ]
        ]);
    }

    /**
     * Guarda la configuración de diseño de la boleta (colores primario, secundario y acento).
     * Esta configuración se almacena en un archivo JSON en el disco local y aplica 
     * globalmente para todos los usuarios.
     *
     * @param Request $request Contiene 'primaryColor', 'secondaryColor' y 'accentColor'.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function saveConfig(Request $request)
    {
        $user = Auth::user();

        // Validar permisos antes de guardar
        $can_edit = false;
        if ($user->rol_id == 1) {
            $can_edit = true;
        } else {
            $permiso = DB::table('rol_funcion')
                ->join('funcion', 'rol_funcion.funcion_id', '=', 'funcion.id')
                ->where('rol_funcion.rol_id', $user->rol_id)
                ->where('funcion.permiso', 'aula.boleta')
                ->first();

            if ($permiso && in_array($permiso->id_accion, [2, 3])) {
                $can_edit = true;
            }
        }

        if (!$can_edit) {
            abort(403, 'No tienes permiso para modificar el diseño.');
        }

        $validated = $request->validate([
            'primaryColor' => 'required|string|max:20',
            'secondaryColor' => 'required|string|max:20',
            'accentColor' => 'required|string|max:20',
        ]);

        Storage::disk('local')->put('boleta_config.json', json_encode($validated));

        return back()->with('success', 'Diseño de la boleta actualizado.');
    }
}
