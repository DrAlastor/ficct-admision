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
}
