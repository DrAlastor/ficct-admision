<?php

namespace Backend\modulo_docencia\Controllers;

use App\Http\Controllers\Controller;
use Backend\modulo_docencia\Models\Docente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/**
 * CU26 - Gestionar Carga Horaria
 */
class CargaHorariaController extends Controller
{
    /**
     * Muestra la lista de docentes para gestionar su carga horaria
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        
        // Obtener la gestión académica activa
        $gestionActual = DB::table('gestion')->orderByDesc('id')->first();
        $gestionId = $gestionActual ? $gestionActual->id : null;

        $docentes = Docente::with(['perfil.usuario'])
            ->when($search, function($query, $search) {
                $query->whereHas('perfil', function($q) use ($search) {
                    $q->where('nombres', 'ilike', "%{$search}%")
                      ->orWhere('apellido_paterno', 'ilike', "%{$search}%")
                      ->orWhere('apellido_materno', 'ilike', "%{$search}%")
                      ->orWhere('ci', 'ilike', "%{$search}%");
                });
            })
            // Restricción: Filtrar la lista de docentes para que sólo se muestren aquellos de la gestión en curso
            ->when($gestionId, function($query, $gestionId) {
                $query->whereHas('perfil.usuario', function($q) use ($gestionId) {
                    $q->where('gestion_id', $gestionId);
                });
            })
            ->get()
            ->map(function ($docente) {
                // Obtener cuántos grupos tiene asignados actualmente
                $gruposAsignados = DB::table('carga_horaria')
                    ->where('docente_id', $docente->id)
                    ->count();

                return [
                    'id' => $docente->id,
                    'nombres' => trim($docente->perfil->nombres . ' ' . $docente->perfil->apellido_paterno . ' ' . $docente->perfil->apellido_materno),
                    'ci' => $docente->perfil->ci,
                    'profesion' => $docente->profesion,
                    'area_profesional' => $docente->area_profesional,
                    'grupos_asignados' => $gruposAsignados,
                    'grupos_maximos' => $docente->grupos_maximos,
                    'estado' => $docente->perfil->usuario->estado ?? 'Activo',
                ];
            });

        return Inertia::render('Modulos/modulo_docencia/GestionarCargaHoraria/Index', [
            'docentes' => $docentes,
            'filters' => $request->only('search')
        ]);
    }

    /**
     * Obtiene los grupos disponibles y asignados para un docente específico.
     * Llamado vía Axios/Fetch para rellenar el modal.
     */
    public function getGrupos($docente_id)
    {
        $docente = Docente::findOrFail($docente_id);

        // Grupos asignados al docente actual
        $gruposAsignados = DB::table('carga_horaria')
            ->join('grupo', 'carga_horaria.grupo_codigo', '=', 'grupo.codigo')
            ->join('materia', 'grupo.materia_id', '=', 'materia.id')
            ->where('carga_horaria.docente_id', $docente_id)
            ->select(
                'grupo.codigo as id',
                'grupo.nombre as grupo',
                'materia.sigla',
                'materia.nombre as materia',
                'grupo.modalidad'
            )
            ->get();

        // Grupos disponibles (que NO están en carga_horaria)
        $gruposOcupados = DB::table('carga_horaria')->pluck('grupo_codigo')->toArray();

        $gruposDisponibles = DB::table('grupo')
            ->join('materia', 'grupo.materia_id', '=', 'materia.id')
            ->whereNotIn('grupo.codigo', $gruposOcupados)
            ->select(
                'grupo.codigo as id',
                'grupo.nombre as grupo',
                'materia.sigla',
                'materia.nombre as materia',
                'grupo.modalidad'
            )
            ->get();

        return response()->json([
            'docente' => [
                'id' => $docente->id,
                'maximos' => $docente->grupos_maximos,
            ],
            'asignados' => $gruposAsignados,
            'disponibles' => $gruposDisponibles
        ]);
    }

    /**
     * Guarda la carga horaria del docente.
     */
    public function store(Request $request, $docente_id)
    {
        $request->validate([
            'grupos' => 'array',
            'grupos.*' => 'integer'
        ]);

        $grupos = $request->input('grupos', []);
        $docente = Docente::findOrFail($docente_id);

        if (count($grupos) > $docente->grupos_maximos) {
            return response()->json([
                'message' => 'Límite Excedido: Se violan las políticas de carga horaria (Máximo ' . $docente->grupos_maximos . ').'
            ], 422);
        }

        // Validar que ninguno de los grupos seleccionados esté asignado a OTRO docente.
        $gruposAjenos = DB::table('carga_horaria')
            ->whereIn('grupo_codigo', $grupos)
            ->where('docente_id', '!=', $docente_id)
            ->count();

        if ($gruposAjenos > 0) {
            return response()->json([
                'message' => 'Conflicto: Uno o más grupos seleccionados ya fueron asignados a otro docente.'
            ], 409);
        }

        DB::beginTransaction();
        try {
            // Eliminar la carga horaria actual del docente
            DB::table('carga_horaria')->where('docente_id', $docente_id)->delete();

            // Insertar la nueva carga
            $insertData = [];
            foreach ($grupos as $grupo_codigo) {
                $insertData[] = [
                    'docente_id' => $docente_id,
                    'grupo_codigo' => $grupo_codigo
                ];
            }

            if (!empty($insertData)) {
                DB::table('carga_horaria')->insert($insertData);
            }

            DB::commit();
            return response()->json(['message' => 'Carga horaria guardada exitosamente.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al guardar la carga horaria: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Algoritmo Heurístico para asignar grupos a los docentes de la gestión actual
     * basado de forma inteligente en la compatibilidad de su profesión y área profesional con las materias requeridas.
     */
    public function autocargar(Request $request)
    {
        // 1. Verificar existencia de gestión activa
        $gestionActual = DB::table('gestion')->orderByDesc('id')->first();
        if (!$gestionActual) {
            return response()->json(['message' => 'No hay una gestión activa.'], 400);
        }

        DB::beginTransaction();
        try {
            // 1. Obtener todos los docentes de la gestión actual
            $docentes = Docente::whereHas('perfil.usuario', function($q) use ($gestionActual) {
                $q->where('gestion_id', $gestionActual->id);
            })->get();

            // 2. Obtener grupos de la gestión actual con su materia_id
            $grupos = DB::table('grupo')
                ->where('gestion_id', $gestionActual->id)
                ->get();

            // 3. Obtener todas las materias y clasificarlas por ID
            // Según la bd de prueba:
            // 1: Computación (INF100)
            // 2: Matemáticas (MAT100)
            // 3: Física (FIS100)
            // 4: Inglés (LIN100)
            $materias = DB::table('materia')->get()->keyBy('id');

            // 4. Limpiar todas las asignaciones de carga horaria para los grupos de esta gestión
            $gruposCodigo = $grupos->pluck('codigo')->toArray();
            if (!empty($gruposCodigo)) {
                DB::table('carga_horaria')->whereIn('grupo_codigo', $gruposCodigo)->delete();
            }

            $insertData = [];

            // 5. Diccionario heurístico de palabras clave por materia (Usaremos IDs fijos o nombres)
            // Mapearemos materia_id a una expresión regular o conjunto de palabras
            $materiaKeywords = [
                'Computación' => ['informátic', 'sistem', 'computaci', 'programaci', 'software', 'redes'],
                'Matemáticas' => ['matemátic', 'exactas', 'ingenier', 'financier'],
                'Física' => ['físic', 'mecánic', 'civil'],
                'Inglés' => ['idioma', 'inglés', 'linguístic', 'letras']
            ];

            // Rastrear cuántos grupos tiene asignados cada docente temporalmente
            $docenteGruposCount = [];
            foreach ($docentes as $d) {
                $docenteGruposCount[$d->id] = 0;
            }

            foreach ($grupos as $grupo) {
                $materia = $materias->get($grupo->materia_id);
                if (!$materia) continue;

                $materiaNombre = $materia->nombre;
                $keywords = $materiaKeywords[$materiaNombre] ?? [];

                // Buscar un docente apto y con capacidad
                $docenteAsignado = null;
                foreach ($docentes as $docente) {
                    if ($docenteGruposCount[$docente->id] >= $docente->grupos_maximos) {
                        continue;
                    }

                    // Verificar aptitud
                    $perfilTexto = mb_strtolower($docente->profesion . ' ' . $docente->area_profesional);
                    $esApto = false;

                    // Si no tiene palabras clave configuradas para la materia, o es una materia genérica, asume que cualquiera puede dictar (fallback).
                    // Para mayor precisión, sólo permitiremos que dicte si coincide una keyword.
                    if (empty($keywords)) {
                        $esApto = true;
                    } else {
                        foreach ($keywords as $kw) {
                            if (str_contains($perfilTexto, $kw)) {
                                $esApto = true;
                                break;
                            }
                        }
                    }

                    if ($esApto) {
                        $docenteAsignado = $docente;
                        break;
                    }
                }

                // Asignar
                if ($docenteAsignado) {
                    $insertData[] = [
                        'docente_id' => $docenteAsignado->id,
                        'grupo_codigo' => $grupo->codigo
                    ];
                    $docenteGruposCount[$docenteAsignado->id]++;
                }
            }

            // Guardar nuevas asignaciones
            if (!empty($insertData)) {
                DB::table('carga_horaria')->insert($insertData);
            }

            DB::commit();

            return response()->json([
                'message' => 'Carga horaria asignada automáticamente con éxito. ' . count($insertData) . ' grupos asignados.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al auto-cargar: ' . $e->getMessage()], 500);
        }
    }
}
