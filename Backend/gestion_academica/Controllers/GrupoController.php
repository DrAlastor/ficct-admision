<?php

namespace Backend\gestion_academica\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class GrupoController extends Controller
{
    public function index()
    {
        $gestionActual = DB::table('gestion')->orderByDesc('id')->first();
        if (!$gestionActual) {
            return Inertia::render('Modulos/gestion_academica/Grupos/Index', [
                'error' => 'No hay una gestión activa.',
                'gestion' => null,
                'inscritos' => 0,
                'cupo_maximo' => 0,
                'proyeccion_grupos' => 0,
                'grupos_actuales' => []
            ]);
        }

        // Contar postulantes de la gestion actual (sin importar estado, o solo habilitados, acá contaremos todos de la gestion)
        $totalInscritos = DB::table('postulacion')
            ->where('gestion_id', $gestionActual->id)
            ->count();

        // Obtener el límite estricto de cupo por grupo definido en el CU18
        $cupo_maximo = DB::table('grupo')->max('cupo') ?? 70;

        // Proyección matemática
        $proyeccion_grupos = ($cupo_maximo > 0) ? ceil($totalInscritos / $cupo_maximo) : 0;

        // Recuperar grupos que ya se hayan generado para esta gestión
        $gruposActualesQuery = DB::table('grupo')
            ->where('gestion_id', $gestionActual->id)
            ->select('nombre', 'cupo', 'inscritos_actuales')
            ->groupBy('nombre', 'cupo', 'inscritos_actuales')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Modulos/gestion_academica/Grupos/Index', [
            'gestion' => $gestionActual,
            'inscritos' => $totalInscritos,
            'cupo_maximo' => $cupo_maximo,
            'proyeccion_grupos' => $proyeccion_grupos,
            'grupos_actuales' => $gruposActualesQuery
        ]);
    }

    public function generar(Request $request)
    {
        $gestionActual = DB::table('gestion')->orderByDesc('id')->first();
        if (!$gestionActual) {
            return redirect()->back()->withErrors(['error' => 'No hay gestión activa.']);
        }

        $totalInscritos = DB::table('postulacion')
            ->where('gestion_id', $gestionActual->id)
            ->count();

        // El cupo se mantiene según lo establecido por el administrador
        $cupo_maximo = DB::table('grupo')->max('cupo') ?? 70;

        if ($cupo_maximo <= 0) {
            return redirect()->back()->withErrors(['error' => 'El cupo máximo por grupo debe ser mayor a 0. Configúralo primero.']);
        }

        $proyeccion = ceil($totalInscritos / $cupo_maximo);
        if ($proyeccion <= 0) {
            return redirect()->back()->withErrors(['error' => 'No hay suficientes inscritos para generar grupos.']);
        }

        $materias = DB::table('materia')->get();
        if ($materias->isEmpty()) {
            return redirect()->back()->withErrors(['error' => 'No existen materias configuradas en el sistema.']);
        }

        DB::beginTransaction();
        try {
            // Eliminar solo los grupos de la gestión ACTUAL (para permitir regeneración si se equivocaron). 
            // Los grupos de gestiones pasadas se mantienen intactos para historial.
            DB::table('grupo')->where('gestion_id', $gestionActual->id)->delete();

            // Lógica de Turnos: Distribuir grupos en Mañana (M), Tarde (T), Noche (N)
            // Ejemplo: si proyeccion = 4 -> M=2, T=1, N=1
            $q = floor($proyeccion / 3);
            $r = $proyeccion % 3;
            $cantM = $q + ($r > 0 ? 1 : 0);
            $cantT = $q + ($r > 1 ? 1 : 0);
            $cantN = $q;

            // Nomenclatura de grupos
            $nombresGrupos = [];
            for($i = 1; $i <= $cantM; $i++) { $nombresGrupos[] = 'M' . str_pad($i, 3, '0', STR_PAD_LEFT); }
            for($i = 1; $i <= $cantT; $i++) { $nombresGrupos[] = 'T' . str_pad($i, 3, '0', STR_PAD_LEFT); }
            for($i = 1; $i <= $cantN; $i++) { $nombresGrupos[] = 'N' . str_pad($i, 3, '0', STR_PAD_LEFT); }

            // Insertar estos grupos para TODAS las materias
            foreach ($materias as $materia) {
                foreach ($nombresGrupos as $nombre) {
                    DB::table('grupo')->insert([
                        'materia_id' => $materia->id,
                        'nombre' => $nombre,
                        'inscritos_actuales' => 0,
                        'cupo' => $cupo_maximo,
                        'modalidad' => 'Presencial',
                        'gestion_id' => $gestionActual->id
                    ]);
                }
            }

            DB::commit();
            return redirect()->back()->with('success', 'Se generaron ' . count($nombresGrupos) . ' grupos por materia exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Error al generar grupos: ' . $e->getMessage()]);
        }
    }
}
