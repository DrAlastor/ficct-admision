<?php

namespace Backend\gestion_academica\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/**
 * CU24 - Gestionar Carreras
 */
class CarreraController extends Controller
{
    /**
     * Obtiene y muestra la lista principal de registros o la vista por defecto.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function index()
    {
        $carreras = DB::table('carrera')
            ->join('facultad', 'carrera.facultad_id', '=', 'facultad.id')
            ->select('carrera.*', 'facultad.nombre as facultad')
            ->orderBy('carrera.codigo')
            ->get();
            
        return Inertia::render('Modulos/gestion_academica/Carreras/Index', [
            'carreras' => $carreras
        ]);
    }

    /**
     * Valida y almacena un nuevo registro en la base de datos.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'sigla' => 'required|string|max:10',
            'nombre' => 'required|string|max:150',
            'cupo_maximo' => 'required|integer|min:1'
        ]);

        DB::table('carrera')->insert([
            'facultad_id' => 1, // FICCT por defecto como indicó el requerimiento
            'sigla' => $validated['sigla'],
            'nombre' => $validated['nombre'],
            'cupo_maximo' => $validated['cupo_maximo']
        ]);

        return redirect()->back()->with('success', 'Carrera creada exitosamente.');
    }

    /**
     * Valida y actualiza los datos de un registro existente en la base de datos.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function update(Request $request, $codigo)
    {
        $validated = $request->validate([
            'sigla' => 'required|string|max:10',
            'nombre' => 'required|string|max:150',
            'cupo_maximo' => 'required|integer|min:1'
        ]);

        DB::table('carrera')->where('codigo', $codigo)->update([
            'sigla' => $validated['sigla'],
            'nombre' => $validated['nombre'],
            'cupo_maximo' => $validated['cupo_maximo']
        ]);

        return redirect()->back()->with('success', 'Carrera actualizada exitosamente.');
    }

    /**
     * Elimina (física o lógicamente) un registro de la base de datos.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function destroy($codigo)
    {
        // Verificación de integridad referencial
        $tienePostulantes = DB::table('postulacion_carrera')
            ->where('carrera_codigo', $codigo)
            ->exists();

        if ($tienePostulantes) {
            return redirect()->back()->withErrors([
                'carrera' => 'No se puede eliminar la carrera porque ya tiene opciones seleccionadas por postulantes.'
            ]);
        }

        DB::table('carrera')->where('codigo', $codigo)->delete();

        return redirect()->back()->with('success', 'Carrera eliminada exitosamente.');
    }

    /**
     * =========================================================================
     * ALGORITMO DE ASIGNACIÓN DE CUPOS POR MÉRITO
     * =========================================================================
     * Este método procesa a todos los postulantes habilitados y decide quién entra 
     * a cada carrera basándose estrictamente en el "cupo_maximo" de la carrera y
     * el "promedio_final" del estudiante (ordenados de mayor a menor nota).
     * 
     * @param int $gestion_id ID de la gestión académica a procesar
     * @return \Illuminate\Http\RedirectResponse
     */
    public function procesarAsignacionCupos($gestion_id)
    {
        DB::beginTransaction();
        try {
            // 1. Obtener todas las carreras y sus cupos máximos permitidos
            $carreras = DB::table('carrera')->get()->keyBy('codigo');
            $cuposDisponibles = [];
            foreach ($carreras as $c) {
                $cuposDisponibles[$c->codigo] = $c->cupo_maximo;
            }

            // 2. Obtener a todos los postulantes con su nota global.
            // La nota global es el promedio de todas sus materias cursadas.
            $postulantes = DB::table('postulacion as p')
                ->join('inscripciones_cup as i', 'p.codigo', '=', 'i.postulacion_codigo')
                ->join('evaluaciones as ev', 'i.id', '=', 'ev.inscripcion_id')
                ->where('p.gestion_id', $gestion_id)
                ->where('p.estado', 'Habilitado')
                ->select(
                    'p.codigo as postulacion_codigo',
                    'p.postulante_id',
                    DB::raw('AVG(ev.promedio_final) as nota_global')
                )
                ->groupBy('p.codigo', 'p.postulante_id')
                // 3. ORDENAR POR MÉRITO ACADÉMICO (De mayor a menor nota) - ESTRICTO
                ->orderByDesc('nota_global')
                ->get();

            foreach ($postulantes as $postulante) {
                // Si la nota global es menor a 60, automáticamente reprueba el CUP
                if ($postulante->nota_global < 60) {
                    DB::table('postulacion')
                        ->where('codigo', $postulante->postulacion_codigo)
                        ->update(['estado' => 'Reprobado (Nota Insuficiente)']);
                    continue;
                }

                // Obtener las opciones de carrera del postulante (1ra opción y 2da opción)
                $opciones = DB::table('postulacion_carrera')
                    ->where('postulacion_codigo', $postulante->postulacion_codigo)
                    ->orderBy('prioridad', 'asc')
                    ->get();

                $asignado = false;

                foreach ($opciones as $opcion) {
                    $codigoCarrera = $opcion->carrera_codigo;
                    
                    // 4. VERIFICAR SI HAY CUPO EN LA CARRERA SELECCIONADA
                    if (isset($cuposDisponibles[$codigoCarrera]) && $cuposDisponibles[$codigoCarrera] > 0) {
                        
                        // Restar un cupo porque el alumno ingresó
                        $cuposDisponibles[$codigoCarrera]--;
                        
                        // Actualizar el estado oficial del alumno
                        DB::table('postulacion')
                            ->where('codigo', $postulante->postulacion_codigo)
                            ->update([
                                'estado' => 'Aceptado - Carrera: ' . $carreras[$codigoCarrera]->nombre
                            ]);
                            
                        $asignado = true;
                        break; // Sale del loop porque ya logró ingresar a esta opción
                    }
                }

                // 5. RECHAZO POR FALTA DE CUPO
                // Si recorrió sus opciones y no había cupo en ninguna, queda fuera.
                if (!$asignado) {
                    DB::table('postulacion')
                        ->where('codigo', $postulante->postulacion_codigo)
                        ->update(['estado' => 'Rechazado (Sin Cupo)']);
                }
            }

            DB::commit();
            return redirect()->back()->with('success', 'Asignación de cupos procesada exitosamente.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Error al procesar asignación: ' . $e->getMessage()]);
        }
    }
}
