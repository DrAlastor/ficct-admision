<?php

namespace Backend\gestion_academica\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PostulanteController extends Controller
{
    public function index(Request $request)
    {
        // Obtain current management (latest term)
        $gestionActual = DB::table('gestion')->orderByDesc('id')->first();
        
        $postulantesQuery = DB::table('perfil')
            ->join('postulante', 'perfil.id', '=', 'postulante.id')
            ->join('postulacion', 'postulante.id', '=', 'postulacion.postulante_id')
            ->leftJoin('postulacion_carrera as pc1', function($join) {
                $join->on('postulacion.codigo', '=', 'pc1.postulacion_codigo')
                     ->where('pc1.prioridad', '=', 1);
            })
            ->leftJoin('carrera as c1', 'pc1.carrera_codigo', '=', 'c1.codigo')
            ->leftJoin('postulacion_carrera as pc2', function($join) {
                $join->on('postulacion.codigo', '=', 'pc2.postulacion_codigo')
                     ->where('pc2.prioridad', '=', 2);
            })
            ->leftJoin('carrera as c2', 'pc2.carrera_codigo', '=', 'c2.codigo');

        if ($gestionActual) {
            $postulantesQuery->where('postulacion.gestion_id', $gestionActual->id);
        }

        $postulantes = $postulantesQuery->select(
            'perfil.id as perfil_id',
            'perfil.codigo',
            'perfil.nombres',
            'perfil.apellido_paterno',
            'perfil.apellido_materno',
            'perfil.ci',
            'perfil.fecha_nacimiento',
            'perfil.nacionalidad',
            'perfil.sexo',
            'perfil.direccion',
            'perfil.telefono',
            'perfil.email',
            'perfil.cargo',
            'postulante.colegio_procedencia',
            'postulante.ciudad',
            'postulacion.codigo as postulacion_codigo',
            'postulacion.fecha',
            'postulacion.estado',
            'c1.nombre as carrera_opcion_1',
            'c2.nombre as carrera_opcion_2'
        )->get();

        // Get list of carreras for filters
        $carreras = DB::table('carrera')->select('codigo', 'nombre')->get();

        return Inertia::render('Modulos/gestion_academica/Postulantes/Index', [
            'postulantes' => $postulantes,
            'gestionActual' => $gestionActual,
            'carreras' => $carreras
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nombres' => 'required|string|max:100',
            'apellido_paterno' => 'required|string|max:100',
            'apellido_materno' => 'nullable|string|max:100',
            'ci' => 'required|string|max:20',
            'fecha_nacimiento' => 'nullable|date',
            'nacionalidad' => 'nullable|string|max:50',
            'sexo' => 'nullable|string|max:1',
            'direccion' => 'nullable|string',
            'telefono' => 'nullable|string|max:20',
            'email' => 'required|email|max:150',
            'colegio_procedencia' => 'nullable|string|max:150',
            'ciudad' => 'nullable|string|max:100',
        ]);

        DB::beginTransaction();
        try {
            DB::table('perfil')->where('id', $id)->update([
                'nombres' => $validated['nombres'],
                'apellido_paterno' => $validated['apellido_paterno'],
                'apellido_materno' => $validated['apellido_materno'],
                'ci' => $validated['ci'],
                'fecha_nacimiento' => $validated['fecha_nacimiento'],
                'nacionalidad' => $validated['nacionalidad'],
                'sexo' => $validated['sexo'],
                'direccion' => $validated['direccion'],
                'telefono' => $validated['telefono'],
                'email' => $validated['email'],
            ]);

            DB::table('postulante')->where('id', $id)->update([
                'colegio_procedencia' => $validated['colegio_procedencia'],
                'ciudad' => $validated['ciudad'],
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Datos del postulante actualizados correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'No se pudo actualizar los datos. ' . $e->getMessage()]);
        }
    }
}
