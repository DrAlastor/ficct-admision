<?php

namespace Backend\gestion_academica\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/**
 * CU21 - Gestionar Aulas
 */
class AulaController extends Controller
{
    /**
     * Obtiene y muestra la lista principal de registros o la vista por defecto.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function index()
    {
        $gestionActual = DB::table('gestion')->orderByDesc('id')->first();
        if (!$gestionActual) {
            return Inertia::render('Modulos/gestion_academica/Aulas/Index', [
                'error' => 'No hay una gestión activa.',
                'horarios_generados' => []
            ]);
        }

        // Fetch groups of the current management
        $grupos = DB::table('grupo')
            ->join('materia', 'grupo.materia_id', '=', 'materia.id')
            ->where('grupo.gestion_id', $gestionActual->id)
            ->select('grupo.codigo', 'grupo.nombre as grupo_nombre', 'materia.nombre as materia', 'materia.sigla')
            ->get();

        // Fetch schedules for these groups
        $grupoCodigos = $grupos->pluck('codigo')->toArray();
        $horarios = [];
        
        if (!empty($grupoCodigos)) {
            $horariosRaw = DB::table('horario')
                ->leftJoin('aula', 'horario.aula_id', '=', 'aula.id')
                ->whereIn('horario.grupo_codigo', $grupoCodigos)
                ->select('horario.*', 'aula.nro_aula')
                ->orderBy('horario.hora_inicio')
                ->get();

            // Group schedules by group name, then by block/materia for the frontend
            foreach ($grupos as $g) {
                // A subject in a group has the same time block every day in our algorithm
                $materiasHorarios = $horariosRaw->where('grupo_codigo', $g->codigo);
                if ($materiasHorarios->isNotEmpty()) {
                    $primerHorario = $materiasHorarios->first();
                    $aulasUnicas = $materiasHorarios->pluck('nro_aula')->filter()->unique()->implode(' / ');

                    if (!isset($horarios[$g->grupo_nombre])) {
                        $horarios[$g->grupo_nombre] = [];
                    }
                    $horarios[$g->grupo_nombre][] = [
                        'materia' => $g->materia,
                        'sigla' => $g->sigla,
                        'hora_inicio' => substr($primerHorario->hora_inicio, 0, 5),
                        'hora_fin' => substr($primerHorario->hora_fin, 0, 5),
                        'aula' => $aulasUnicas ?: null,
                    ];
                }
            }
        }

        // Sort schedules inside each group by time
        foreach ($horarios as $key => $h) {
            usort($horarios[$key], function($a, $b) {
                return strcmp($a['hora_inicio'], $b['hora_inicio']);
            });
        }

        // Sort groups alphabetically (M001, M002, N001, T001)
        ksort($horarios);

        return Inertia::render('Modulos/gestion_academica/Aulas/Index', [
            'gestion' => $gestionActual,
            'horarios_generados' => $horarios,
        ]);
    }

    /**
     * Endpoint API para consultar las aulas que están libres en un rango de horas específico.
     * Si la materia es "Computación", filtra para mostrar preferentemente Laboratorios (Piso 4).
     *
     * @param Request $request Contiene hora_inicio, hora_fin y nombre de la materia.
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAulasDisponibles(Request $request)
    {
        $horaInicio = $request->query('hora_inicio');
        $horaFin = $request->query('hora_fin');
        $materiaNombre = $request->query('materia');

        if (!$horaInicio || !$horaFin || !$materiaNombre) {
            return response()->json(['error' => 'Faltan parámetros'], 400);
        }

        // Obtener todas las aulas
        $query = DB::table('aula');

        // Lógica de pisos según la materia
        if (str_contains(strtolower($materiaNombre), 'computación') || str_contains(strtolower($materiaNombre), 'computacion')) {
            // Filtrar laboratorios (Piso 4)
            $query->where('nro_aula', 'like', 'Lab%');
        } else {
            // Filtrar aulas normales (Pisos 1, 2, 3)
            $query->where('nro_aula', 'not like', 'Lab%');
        }

        $aulasCandidatas = $query->get();

        // Obtener aulas ocupadas en esa franja horaria (cualquier día de la semana)
        // Ya que el horario es fijo toda la semana, si un aula está ocupada en ese bloque, está ocupada toda la semana
        $aulasOcupadasIds = DB::table('horario')
            ->whereNotNull('aula_id')
            ->where(function ($q) use ($horaInicio, $horaFin) {
                // Hay choque si:
                // El horario existente inicia ANTES de que termine el solicitado Y termina DESPUES de que inicie el solicitado
                $q->where('hora_inicio', '<', $horaFin)
                  ->where('hora_fin', '>', $horaInicio);
            })
            ->pluck('aula_id')
            ->toArray();

        // Filtrar aulas candidatas que NO estén en la lista de ocupadas
        $aulasDisponibles = $aulasCandidatas->filter(function ($aula) use ($aulasOcupadasIds) {
            return !in_array($aula->id, $aulasOcupadasIds);
        })->values();

        return response()->json($aulasDisponibles);
    }

    /**
     * Asigna manualmente un aula específica a un grupo en un horario determinado.
     * Valida que no haya choques o cruces de horario con otros grupos que ya usen el aula.
     *
     * @param Request $request Contiene grupo_nombre, materia, hora_inicio y aula_id.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function asignarAula(Request $request)
    {
        $request->validate([
            'grupo_nombre' => 'required|string',
            'materia' => 'required|string',
            'hora_inicio' => 'required|string',
            'aula_id' => 'required|integer',
        ]);

        $grupoNombre = $request->input('grupo_nombre');
        $materiaNombre = $request->input('materia');
        $horaInicio = substr($request->input('hora_inicio'), 0, 5); // Ej. 07:00

        // Encontrar el grupo correspondiente a esta materia para este cohorte
        $grupo = DB::table('grupo')
            ->join('materia', 'grupo.materia_id', '=', 'materia.id')
            ->where('grupo.nombre', $grupoNombre)
            ->where('materia.nombre', $materiaNombre)
            ->select('grupo.codigo')
            ->first();

        if (!$grupo) {
            return redirect()->back()->withErrors(['error' => 'Grupo o materia no encontrados.']);
        }

        // Obtener la hora_fin de ese bloque
        $horarioBase = DB::table('horario')
            ->where('grupo_codigo', $grupo->codigo)
            ->where('hora_inicio', 'like', $horaInicio . '%')
            ->first();

        if (!$horarioBase) {
            return redirect()->back()->withErrors(['error' => 'Horario no encontrado.']);
        }

        // Verificar choque nuevamente por seguridad (Concurrencia)
        $choque = DB::table('horario')
            ->whereNotNull('aula_id')
            ->where('aula_id', $request->input('aula_id'))
            ->where('hora_inicio', '<', $horarioBase->hora_fin)
            ->where('hora_fin', '>', $horarioBase->hora_inicio)
            // Ignorar los registros del propio grupo que estamos actualizando
            ->where('grupo_codigo', '!=', $grupo->codigo)
            ->exists();

        if ($choque) {
            return redirect()->back()->withErrors(['error' => 'Excepción de Cruce: El aula ya fue asignada a otro grupo en ese horario.']);
        }

        // Asignar el aula para todos los días de ese bloque y materia (Los 5 días)
        DB::table('horario')
            ->where('grupo_codigo', $grupo->codigo)
            ->where('hora_inicio', 'like', $horaInicio . '%')
            ->update(['aula_id' => $request->input('aula_id')]);

        return redirect()->back()->with('success', 'Aula asignada correctamente.');
    }

    /**
     * Algoritmo de Autogeneración de Aulas.
     * Distribuye y asigna aulas a todos los grupos de forma automatizada, garantizando que:
     * - La capacidad del aula sea mayor o igual al número de inscritos del grupo.
     * - La materia Computación reciba combinaciones de laboratorios y aulas normales.
     * - No existan choques de horarios entre diferentes materias.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function autogenerar(Request $request)
    {
        DB::beginTransaction();

        try {
            $aulas = DB::table('aula')->orderBy('capacidad', 'asc')->get(); // Ordenar de menor a mayor capacidad para optimizar
            $normalAulas = $aulas->filter(fn($a) => !str_contains($a->nro_aula, 'Lab'))->values();
            $labs = $aulas->filter(fn($a) => str_contains($a->nro_aula, 'Lab'))->values();

            $grupos = DB::table('grupo')
                ->join('materia', 'grupo.materia_id', '=', 'materia.id')
                ->select('grupo.codigo', 'grupo.inscritos_actuales', 'materia.nombre as materia')
                ->get()->keyBy('codigo');

            $bloquesHorarios = DB::table('horario')
                ->select('hora_inicio')
                ->groupBy('hora_inicio')
                ->pluck('hora_inicio');

            $dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

            foreach ($bloquesHorarios as $hora_inicio) {
                $horariosBloque = DB::table('horario')->where('hora_inicio', $hora_inicio)->get();
                
                $occupied = []; 
                foreach($horariosBloque as $hb) {
                    if ($hb->aula_id) {
                        $occupied[$hb->dia][$hb->aula_id] = true;
                    }
                }

                $gruposBloque = $horariosBloque->pluck('grupo_codigo')->unique();
                
                $computacionGrupos = [];
                $normalGrupos = [];
                
                foreach($gruposBloque as $gCode) {
                    if (!isset($grupos[$gCode])) continue;
                    
                    $materia = $grupos[$gCode]->materia;
                    if (str_contains(strtolower($materia), 'computación') || str_contains(strtolower($materia), 'computacion')) {
                        $computacionGrupos[] = $gCode;
                    } else {
                        $normalGrupos[] = $gCode;
                    }
                }

                // Asignar Materias Normales
                foreach ($normalGrupos as $gCode) {
                    if ($horariosBloque->where('grupo_codigo', $gCode)->whereNotNull('aula_id')->isNotEmpty()) {
                        continue;
                    }

                    $inscritos = $grupos[$gCode]->inscritos_actuales;
                    $assigned = false;

                    // Para hacer la asignación de aulas normales aleatoria
                    $normalAulasRandom = $normalAulas->shuffle();

                    foreach ($normalAulasRandom as $aula) {
                        // 1. Validar Capacidad Física
                        if ($aula->capacidad < $inscritos) {
                            continue;
                        }

                        $isFreeAllDays = true;
                        foreach ($dias as $dia) {
                            if (isset($occupied[$dia][$aula->id])) {
                                $isFreeAllDays = false;
                                break;
                            }
                        }

                        if ($isFreeAllDays) {
                            DB::table('horario')
                                ->where('grupo_codigo', $gCode)
                                ->where('hora_inicio', $hora_inicio)
                                ->update(['aula_id' => $aula->id]);
                            
                            foreach ($dias as $dia) {
                                $occupied[$dia][$aula->id] = true;
                            }
                            $assigned = true;
                            break;
                        }
                    }

                    if (!$assigned) {
                        throw new \Exception("Capacidad insuficiente o sin aulas disponibles para el grupo " . $grupos[$gCode]->materia . " con $inscritos inscritos.");
                    }
                }

                // Asignar Computación (Múltiples aulas, mezcla de lab y normal)
                $cCount = count($computacionGrupos);
                $diasLabTarget = ($cCount <= 15) ? 2 : 1; 

                foreach ($computacionGrupos as $gCode) {
                    if ($horariosBloque->where('grupo_codigo', $gCode)->whereNotNull('aula_id')->isNotEmpty()) {
                        continue;
                    }

                    $inscritos = $grupos[$gCode]->inscritos_actuales;
                    $diasAsignadosLab = 0;
                    
                    // Mezclar laboratorios y aulas normales para aleatoriedad
                    $labsRandom = $labs->shuffle();
                    $normalAulasRandom = $normalAulas->shuffle();

                    foreach ($dias as $dia) {
                        $diaAsignado = false;
                        if ($diasAsignadosLab < $diasLabTarget) {
                            // Intentar Lab
                            foreach ($labsRandom as $lab) {
                                if ($lab->capacidad < $inscritos) continue;

                                if (!isset($occupied[$dia][$lab->id])) {
                                    DB::table('horario')
                                        ->where('grupo_codigo', $gCode)
                                        ->where('hora_inicio', $hora_inicio)
                                        ->where('dia', $dia)
                                        ->update(['aula_id' => $lab->id]);
                                    $occupied[$dia][$lab->id] = true;
                                    $diasAsignadosLab++;
                                    $diaAsignado = true;
                                    break;
                                }
                            }
                        }
                        
                        // Si no halló lab o ya cumplió cuota, dar aula normal
                        if (!$diaAsignado) {
                            foreach ($normalAulasRandom as $aula) {
                                if ($aula->capacidad < $inscritos) continue;

                                if (!isset($occupied[$dia][$aula->id])) {
                                    DB::table('horario')
                                        ->where('grupo_codigo', $gCode)
                                        ->where('hora_inicio', $hora_inicio)
                                        ->where('dia', $dia)
                                        ->update(['aula_id' => $aula->id]);
                                    $occupied[$dia][$aula->id] = true;
                                    $diaAsignado = true;
                                    break;
                                }
                            }
                        }

                        if (!$diaAsignado) {
                            throw new \Exception("No hay aulas ni laboratorios con capacidad para $inscritos estudiantes el día $dia.");
                        }
                    }
                }
            }

            DB::commit();
            return redirect()->back()->with('success', 'Aulas autogeneradas de forma aleatoria (Validando capacidad de aulas).');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Error en Autogeneración: ' . $e->getMessage()]);
        }
    }
}
