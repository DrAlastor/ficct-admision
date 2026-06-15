<?php

namespace Backend\gestion_academica\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/**
 * CU20 - Gestionar Horarios
 */
class GestionHorarioController extends Controller
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
            return Inertia::render('Modulos/gestion_academica/Horarios/Index', [
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
                $materiaHorario = $horariosRaw->where('grupo_codigo', $g->codigo)->first();
                if ($materiaHorario) {
                    if (!isset($horarios[$g->grupo_nombre])) {
                        $horarios[$g->grupo_nombre] = [];
                    }
                    $horarios[$g->grupo_nombre][] = [
                        'materia' => $g->materia,
                        'sigla' => $g->sigla,
                        'hora_inicio' => substr($materiaHorario->hora_inicio, 0, 5),
                        'hora_fin' => substr($materiaHorario->hora_fin, 0, 5),
                        'aula' => $materiaHorario->nro_aula,
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

        return Inertia::render('Modulos/gestion_academica/Horarios/Index', [
            'gestion' => $gestionActual,
            'horarios_generados' => $horarios,
        ]);
    }

    /**
     * Genera automáticamente una matriz de horarios base para los grupos creados.
     * Asigna bloques de horas en días de semana según la modalidad (Mañana, Tarde, Noche, Virtual).
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function generar(Request $request)
    {
        $gestionActual = DB::table('gestion')->orderByDesc('id')->first();
        if (!$gestionActual) {
            return redirect()->back()->withErrors(['error' => 'No hay gestión activa.']);
        }

        DB::beginTransaction();

        try {
            $grupos = DB::table('grupo')
                ->join('materia', 'grupo.materia_id', '=', 'materia.id')
                ->where('grupo.gestion_id', $gestionActual->id)
                ->select('grupo.codigo', 'grupo.nombre as grupo_nombre', 'materia.nombre as materia_nombre', 'materia.sigla')
                ->get();

            if ($grupos->isEmpty()) {
                throw new \Exception('No hay grupos generados en la gestión actual para armar el horario.');
            }

            $gruposByName = $grupos->groupBy('grupo_nombre');

            $grupoCodigos = $grupos->pluck('codigo')->toArray();
            DB::table('horario')->whereIn('grupo_codigo', $grupoCodigos)->delete();
            
            $turnos = DB::table('turno')->get()->keyBy('id');

            $bloques = [
                'M' => [ // Mañana
                    ['start' => '07:00:00', 'end' => '08:30:00'],
                    ['start' => '08:30:00', 'end' => '10:00:00'],
                    ['start' => '10:00:00', 'end' => '11:30:00'],
                    ['start' => '11:30:00', 'end' => '13:00:00'],
                ],
                'T' => [ // Tarde
                    ['start' => '12:00:00', 'end' => '13:30:00'],
                    ['start' => '13:30:00', 'end' => '15:00:00'],
                    ['start' => '15:00:00', 'end' => '16:30:00'],
                    ['start' => '16:30:00', 'end' => '18:00:00'],
                ],
                'N' => [ // Noche
                    ['start' => '16:00:00', 'end' => '17:30:00'],
                    ['start' => '17:30:00', 'end' => '19:00:00'],
                    ['start' => '19:00:00', 'end' => '20:30:00'],
                    ['start' => '20:30:00', 'end' => '22:00:00'],
                ],
            ];

            $dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

            foreach ($gruposByName as $nombreGrupo => $materiasDelGrupo) {
                $letraTurno = strtoupper(substr($nombreGrupo, 0, 1));
                $turno_id = 1; 
                if ($letraTurno == 'T') $turno_id = 2;
                if ($letraTurno == 'N') $turno_id = 3;

                if (!isset($bloques[$letraTurno])) {
                    $letraTurno = 'M';
                }

                $bloquesDisponibles = $bloques[$letraTurno];
                shuffle($bloquesDisponibles); // Randomize blocks for this group

                foreach ($materiasDelGrupo as $index => $materia) {
                    $bloqueAsignado = array_pop($bloquesDisponibles);
                    $reqStart = $bloqueAsignado['start'];
                    $reqEnd = $bloqueAsignado['end'];

                    // Insert for 5 days without aula assigned yet
                    $inserts = [];
                    foreach ($dias as $dia) {
                        $inserts[] = [
                            'grupo_codigo' => $materia->codigo,
                            'aula_id' => null, // Aulas se asignarán en otro caso de uso
                            'turno_id' => $turno_id,
                            'dia' => $dia,
                            'hora_inicio' => $reqStart,
                            'hora_fin' => $reqEnd
                        ];
                    }
                    DB::table('horario')->insert($inserts);
                }
            }

            DB::commit();
            return redirect()->back()->with('success', 'Malla horaria generada correctamente.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

}
