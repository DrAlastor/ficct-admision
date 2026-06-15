<?php

namespace Backend\gestion_academica\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

/**
 * CU19 - Gestionar Grupos
 */
class GrupoController extends Controller
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
            ->select('nombre', 'cupo', 'inscritos_actuales', 'modalidad')
            ->groupBy('nombre', 'cupo', 'inscritos_actuales', 'modalidad')
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

    /**
     * Algoritmo de Generación de Grupos.
     * Calcula la cantidad de grupos necesarios basándose en el total de inscritos y el cupo máximo.
     * Crea automáticamente grupos para todas las materias distribuyéndolos en turnos: 
     * Mañana (M), Tarde (T), Noche (N) y Virtual (V) si excede la capacidad física.
     *
     * @param Request $request Petición HTTP.
     * @return \Illuminate\Http\RedirectResponse
     */
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

            // Lógica secuencial de Turnos: Llenar hasta 20 por turno primero
            $proyeccionRestante = $proyeccion;

            $cantM = min($proyeccionRestante, 20);
            $proyeccionRestante -= $cantM;

            $cantT = min($proyeccionRestante, 20);
            $proyeccionRestante -= $cantT;

            $cantN = min($proyeccionRestante, 20);
            $proyeccionRestante -= $cantN;

            // Si aún sobran grupos (proyeccion > 60), serán virtuales. Los repartimos equitativamente.
            if ($proyeccionRestante > 0) {
                $vM = floor($proyeccionRestante / 3);
                $r = $proyeccionRestante % 3;
                
                $cantM += $vM + ($r > 0 ? 1 : 0);
                $cantT += $vM + ($r > 1 ? 1 : 0);
                $cantN += $vM;
            }

            // Nomenclatura de grupos y cálculo de modalidad según aforo máximo (20 por turno)
            $gruposAGenerar = [];
            
            for($i = 1; $i <= $cantM; $i++) { 
                $modalidad = ($i <= 20) ? 'Presencial' : 'Virtual';
                $gruposAGenerar[] = ['nombre' => 'M' . str_pad($i, 3, '0', STR_PAD_LEFT), 'modalidad' => $modalidad]; 
            }
            for($i = 1; $i <= $cantT; $i++) { 
                $modalidad = ($i <= 20) ? 'Presencial' : 'Virtual';
                $gruposAGenerar[] = ['nombre' => 'T' . str_pad($i, 3, '0', STR_PAD_LEFT), 'modalidad' => $modalidad]; 
            }
            for($i = 1; $i <= $cantN; $i++) { 
                $modalidad = ($i <= 20) ? 'Presencial' : 'Virtual';
                $gruposAGenerar[] = ['nombre' => 'N' . str_pad($i, 3, '0', STR_PAD_LEFT), 'modalidad' => $modalidad]; 
            }

            // Insertar estos grupos para TODAS las materias
            foreach ($materias as $materia) {
                foreach ($gruposAGenerar as $g) {
                    DB::table('grupo')->insert([
                        'materia_id' => $materia->id,
                        'nombre' => $g['nombre'],
                        'inscritos_actuales' => 0,
                        'cupo' => $cupo_maximo,
                        'modalidad' => $g['modalidad'],
                        'gestion_id' => $gestionActual->id
                    ]);
                }
            }

            DB::commit();
            return redirect()->back()->with('success', 'Se generaron ' . count($gruposAGenerar) . ' grupos por materia exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Error al generar grupos: ' . $e->getMessage()]);
        }
    }

    /**
     * Activa o desactiva el periodo de inscripciones para la gestión actual.
     * Modifica el estado 'inscripciones_abiertas' en la tabla de gestión, permitiendo o 
     * bloqueando el acceso de los postulantes para auto-inscribirse a los grupos.
     *
     * @param Request $request Petición HTTP.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function toggleInscripciones(Request $request)
    {
        $gestionActual = DB::table('gestion')->orderByDesc('id')->first();
        if (!$gestionActual) {
            return redirect()->back()->withErrors(['error' => 'No hay gestión activa.']);
        }

        $newState = !$gestionActual->inscripciones_abiertas;
        DB::table('gestion')->where('id', $gestionActual->id)->update([
            'inscripciones_abiertas' => $newState
        ]);

        $estadoStr = $newState ? 'Habilitadas' : 'Deshabilitadas';
        return redirect()->back()->with('success', "Inscripciones $estadoStr exitosamente.");
    }

    /**
     * Valida y actualiza los datos de un registro existente en la base de datos.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function update(Request $request, $nombre)
    {
        $request->validate([
            'cupo' => 'required|integer|min:1',
            'modalidad' => 'required|string|max:50'
        ]);

        $gestionActual = DB::table('gestion')->orderByDesc('id')->first();
        
        DB::table('grupo')
            ->where('gestion_id', $gestionActual->id)
            ->where('nombre', $nombre)
            ->update([
                'cupo' => $request->cupo,
                'modalidad' => $request->modalidad
            ]);

        return redirect()->back()->with('success', "Grupo $nombre actualizado exitosamente.");
    }

    /**
     * Elimina (física o lógicamente) un registro de la base de datos.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function destroy($nombre)
    {
        $gestionActual = DB::table('gestion')->orderByDesc('id')->first();
        
        DB::table('grupo')
            ->where('gestion_id', $gestionActual->id)
            ->where('nombre', $nombre)
            ->delete();

        return redirect()->back()->with('success', "Grupo $nombre eliminado exitosamente.");
    }

    /**
     * Genera y descarga la lista de alumnos de un grupo específico en formato PDF.
     *
     * @param string $nombre Nombre del grupo (ej. M001).
     * @return \Illuminate\Http\Response
     */
    public function descargarListaPdf($nombre)
    {
        return $this->generarLista($nombre, 'pdf');
    }

    /**
     * Genera y descarga la lista de alumnos de un grupo específico en formato CSV.
     *
     * @param string $nombre Nombre del grupo (ej. M001).
     * @return \Symfony\Component\HttpFoundation\StreamedResponse
     */
    public function descargarListaCsv($nombre)
    {
        return $this->generarLista($nombre, 'csv');
    }

    /**
     * Método interno reutilizable para construir la lista de alumnos de un grupo.
     * Obtiene los datos del perfil (Nombres, Apellidos, CI) de cada postulante inscrito.
     *
     * @param string $nombre Nombre del grupo.
     * @param string $format Formato solicitado ('pdf' o 'csv').
     * @return \Illuminate\Http\Response|\Symfony\Component\HttpFoundation\StreamedResponse
     */
    private function generarLista($nombre, $format)
    {
        $gestionActual = DB::table('gestion')->orderByDesc('id')->first();
        if (!$gestionActual) {
            abort(404, 'No hay gestión activa');
        }

        // Obtener un grupo representativo (la materia de computación u otra) para sacar el ID
        $grupo = DB::table('grupo')
            ->where('gestion_id', $gestionActual->id)
            ->where('nombre', $nombre)
            ->first();

        if (!$grupo) {
            abort(404, 'Grupo no encontrado');
        }

        // Obtener los inscritos a ESTE grupo (como Inscriben a los 4 de golpe, con 1 basta para listar a los alumnos)
        $inscritos = DB::table('inscripciones_cup')
            ->join('postulacion', 'inscripciones_cup.postulacion_codigo', '=', 'postulacion.codigo')
            ->join('postulante', 'postulacion.postulante_id', '=', 'postulante.id')
            ->join('perfil', 'postulante.id', '=', 'perfil.id')
            ->where('inscripciones_cup.grupo_codigo', $grupo->codigo)
            ->select('perfil.ci', 'perfil.nombres', 'perfil.apellido_paterno', 'perfil.apellido_materno')
            ->orderBy('perfil.apellido_paterno')
            ->orderBy('perfil.apellido_materno')
            ->orderBy('perfil.nombres')
            ->get();

        if ($format === 'pdf') {
            $pdf = Pdf::loadView('reportes.lista_alumnos', [
                'grupo' => $grupo,
                'inscritos' => $inscritos
            ]);
            return $pdf->download("Lista_Alumnos_$nombre.pdf");
        } else {
            $csvFileName = "Lista_Alumnos_$nombre.csv";
            $headers = array(
                "Content-type"        => "text/csv; charset=UTF-8",
                "Content-Disposition" => "attachment; filename=$csvFileName",
                "Pragma"              => "no-cache",
                "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
                "Expires"             => "0"
            );

            $callback = function() use($inscritos) {
                $file = fopen('php://output', 'w');
                // UTF-8 BOM para Excel
                fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
                fputcsv($file, array('CI', 'Apellido Paterno', 'Apellido Materno', 'Nombres'));

                foreach ($inscritos as $row) {
                    fputcsv($file, array($row->ci, $row->apellido_paterno, $row->apellido_materno, $row->nombres));
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        }
    }

    /**
     * Asignación Aleatoria (Algoritmo de balanceo).
     * Busca todos los postulantes habilitados que aún no se han inscrito y los distribuye
     * automáticamente entre los grupos que aún tienen cupo disponible.
     * Útil cuando cierra el periodo de inscripciones voluntarias.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function asignarAlumnosAleatoriamente()
    {
        $gestionActual = DB::table('gestion')->orderByDesc('id')->first();
        if (!$gestionActual) {
            return redirect()->back()->withErrors(['error' => 'No hay gestión activa.']);
        }

        DB::beginTransaction();
        try {
            // Postulantes Habilitados de esta gestión que NO tienen ninguna inscripción en inscripciones_cup
            $postulantesSinGrupo = DB::table('postulacion')
                ->where('gestion_id', $gestionActual->id)
                ->where('estado', 'Habilitado')
                ->whereNotIn('codigo', function ($query) {
                    $query->select('postulacion_codigo')->from('inscripciones_cup');
                })
                ->get();

            if ($postulantesSinGrupo->isEmpty()) {
                return redirect()->back()->with('success', 'Todos los postulantes habilitados ya tienen grupo.');
            }

            // Ordenamos aleatoriamente para distribuirlos
            $postulantesSinGrupo = $postulantesSinGrupo->shuffle();

            // Obtenemos los grupos agrupados por Nombre que tengan cupo
            // El cupo disponible se calcula en base a la materia de Computación o cualquiera ya que se llenan a la par
            $gruposPorNombre = DB::table('grupo')
                ->where('gestion_id', $gestionActual->id)
                ->whereColumn('inscritos_actuales', '<', 'cupo')
                ->select('nombre', 'cupo', 'inscritos_actuales')
                ->groupBy('nombre', 'cupo', 'inscritos_actuales')
                ->get();

            if ($gruposPorNombre->isEmpty()) {
                DB::rollBack();
                return redirect()->back()->withErrors(['error' => 'No hay grupos con cupo disponible. Genere más grupos o amplíe los cupos.']);
            }

            // Agrupamos TODOS los registros de 'grupo' (cada nombre tiene 4 registros para las 4 materias)
            $todosLosRegistrosGrupo = DB::table('grupo')->where('gestion_id', $gestionActual->id)->get()->groupBy('nombre');

            $idxPostulante = 0;
            $totalPostulantes = $postulantesSinGrupo->count();

            foreach ($gruposPorNombre as $g) {
                $cupoDisponible = $g->cupo - $g->inscritos_actuales;
                $inscritosEnEsteGrupo = 0;

                while ($inscritosEnEsteGrupo < $cupoDisponible && $idxPostulante < $totalPostulantes) {
                    $postulacion = $postulantesSinGrupo[$idxPostulante];
                    
                    // Inscribir en las 4 materias de este grupo
                    $materiasDelGrupo = $todosLosRegistrosGrupo[$g->nombre] ?? collect();
                    $inserts = [];
                    foreach ($materiasDelGrupo as $matGrupo) {
                        $inserts[] = [
                            'postulacion_codigo' => $postulacion->codigo,
                            'grupo_codigo' => $matGrupo->codigo,
                            'fecha_inscripcion' => now()->toDateString(),
                            'estado' => 'Inscrito'
                        ];
                    }
                    if(!empty($inserts)){
                        DB::table('inscripciones_cup')->insert($inserts);
                    }
                    
                    $inscritosEnEsteGrupo++;
                    $idxPostulante++;
                }

                // Actualizar los inscritos_actuales en la tabla grupo (para los 4 registros de este nombre)
                if ($inscritosEnEsteGrupo > 0) {
                    DB::table('grupo')
                        ->where('gestion_id', $gestionActual->id)
                        ->where('nombre', $g->nombre)
                        ->increment('inscritos_actuales', $inscritosEnEsteGrupo);
                }

                if ($idxPostulante >= $totalPostulantes) {
                    break;
                }
            }

            DB::commit();

            if ($idxPostulante < $totalPostulantes) {
                $sinAsignar = $totalPostulantes - $idxPostulante;
                return redirect()->back()->with('success', "Se asignaron $idxPostulante postulantes. Faltó cupo para $sinAsignar postulantes.");
            }

            return redirect()->back()->with('success', "Se asignaron exitosamente a todos los $totalPostulantes postulantes a grupos al azar.");

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Error al asignar: ' . $e->getMessage()]);
        }
    }

    /**
     * Permite a un postulante auto-inscribirse voluntariamente en un grupo determinado.
     * Verifica que esté habilitado, que las inscripciones estén abiertas y que el grupo 
     * seleccionado aún tenga cupos disponibles. Al inscribirse en un grupo (ej. M001), 
     * se inscribe automáticamente en las 4 materias de dicho grupo.
     *
     * @param Request $request Contiene el 'grupo_nombre'.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function inscribirPostulante(Request $request)
    {
        $request->validate([
            'grupo_nombre' => 'required|string'
        ]);

        $user = \Illuminate\Support\Facades\Auth::user();
        $perfil = \Backend\usuario_seguridad\Models\Perfil::where('usuario_id', $user->id)->first();
        if (!$perfil) {
            return redirect()->back()->withErrors(['error' => 'Perfil no encontrado.']);
        }

        $gestionActual = DB::table('gestion')->orderByDesc('id')->first();
        if (!$gestionActual || !$gestionActual->inscripciones_abiertas) {
            return redirect()->back()->withErrors(['error' => 'Las inscripciones no están abiertas.']);
        }

        $postulacion = DB::table('postulacion')
            ->where('postulante_id', $perfil->id)
            ->where('gestion_id', $gestionActual->id)
            ->first();

        if (!$postulacion || $postulacion->estado !== 'Habilitado') {
            return redirect()->back()->withErrors(['error' => 'No estás habilitado para inscribirte.']);
        }

        // Verificar si ya está inscrito
        $yaInscrito = DB::table('inscripciones_cup')
            ->where('postulacion_codigo', $postulacion->codigo)
            ->exists();
            
        if ($yaInscrito) {
            return redirect()->back()->withErrors(['error' => 'Ya estás inscrito en un grupo.']);
        }

        DB::beginTransaction();
        try {
            // Validar cupos en el grupo (usamos el primero para revisar cupo)
            $materiasDelGrupo = DB::table('grupo')
                ->where('gestion_id', $gestionActual->id)
                ->where('nombre', $request->grupo_nombre)
                ->lockForUpdate() // Evitar race conditions
                ->get();

            if ($materiasDelGrupo->isEmpty()) {
                DB::rollBack();
                return redirect()->back()->withErrors(['error' => 'El grupo seleccionado no existe.']);
            }

            $g = $materiasDelGrupo->first();
            if ($g->inscritos_actuales >= $g->cupo) {
                DB::rollBack();
                return redirect()->back()->withErrors(['error' => 'El grupo seleccionado ya no tiene cupos disponibles.']);
            }

            $inserts = [];
            foreach ($materiasDelGrupo as $mat) {
                $inserts[] = [
                    'postulacion_codigo' => $postulacion->codigo,
                    'grupo_codigo' => $mat->codigo,
                    'fecha_inscripcion' => now()->toDateString(),
                    'estado' => 'Inscrito'
                ];
            }

            DB::table('inscripciones_cup')->insert($inserts);
            DB::table('grupo')
                ->where('gestion_id', $gestionActual->id)
                ->where('nombre', $request->grupo_nombre)
                ->increment('inscritos_actuales', 1);

            DB::commit();
            return redirect()->back()->with('success', 'Te has inscrito exitosamente al grupo ' . $request->grupo_nombre);

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Error al inscribirse: ' . $e->getMessage()]);
        }
    }
}
