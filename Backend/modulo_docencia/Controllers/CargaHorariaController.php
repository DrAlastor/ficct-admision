<?php

namespace Backend\modulo_docencia\Controllers;

use App\Http\Controllers\Controller;
use Backend\modulo_docencia\Models\Docente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CargaHorariaController extends Controller
{
    /**
     * Muestra la lista de docentes para gestionar su carga horaria
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        
        $docentes = Docente::with(['perfil.usuario'])
            ->when($search, function($query, $search) {
                $query->whereHas('perfil', function($q) use ($search) {
                    $q->where('nombres', 'ilike', "%{$search}%")
                      ->orWhere('apellido_paterno', 'ilike', "%{$search}%")
                      ->orWhere('apellido_materno', 'ilike', "%{$search}%")
                      ->orWhere('ci', 'ilike', "%{$search}%");
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
}
