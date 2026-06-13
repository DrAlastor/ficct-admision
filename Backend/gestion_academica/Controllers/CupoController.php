<?php

namespace Backend\gestion_academica\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/**
 * CU18 - Gestionar Cupos
 */
class CupoController extends Controller
{
    /**
     * Obtiene y muestra la lista principal de registros o la vista por defecto.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function index()
    {
        $carreras = DB::table('carrera')->orderBy('codigo')->get();
        
        // Obtener el cupo actual de un grupo (o 70 por defecto)
        $limite_grupo = DB::table('grupo')->max('cupo') ?? 70;

        return Inertia::render('Modulos/gestion_academica/Cupos/Index', [
            'carreras' => $carreras,
            'limite_grupo_actual' => $limite_grupo
        ]);
    }

    /**
     * Valida y actualiza los datos de un registro existente en la base de datos.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'carreras' => 'required|array',
            'carreras.*.codigo' => 'required|integer',
            'carreras.*.cupo_maximo' => 'required|integer|min:0',
            'limite_grupo' => 'required|integer|min:0',
        ]);

        DB::beginTransaction();
        try {
            // Actualizar carreras
            foreach ($validated['carreras'] as $carreraData) {
                DB::table('carrera')
                    ->where('codigo', $carreraData['codigo'])
                    ->update(['cupo_maximo' => $carreraData['cupo_maximo']]);
            }

            // Actualizar todos los grupos y aulas al mismo límite estricto
            DB::table('grupo')->update(['cupo' => $validated['limite_grupo']]);
            DB::table('aula')->update(['capacidad' => $validated['limite_grupo']]);

            DB::commit();
            return redirect()->back()->with('success', 'Cupos configurados exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Hubo un error al guardar los cupos: ' . $e->getMessage()]);
        }
    }
}
