<?php

namespace Backend\modulo_docencia\Controllers;

use App\Http\Controllers\Controller;
use Backend\modulo_docencia\Models\Docente;
use Backend\usuario_seguridad\Models\Perfil;
use Backend\usuario_seguridad\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class DocenteController extends Controller
{
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
                return [
                    'id' => $docente->id,
                    'nombres' => $docente->perfil->nombres,
                    'apellido_paterno' => $docente->perfil->apellido_paterno,
                    'apellido_materno' => $docente->perfil->apellido_materno,
                    'ci' => $docente->perfil->ci,
                    'email' => $docente->perfil->email,
                    'telefono' => $docente->perfil->telefono,
                    'profesion' => $docente->profesion,
                    'grado_academico' => $docente->grado_academico,
                    'experiencia_anos' => $docente->experiencia_anos,
                    'estado' => $docente->perfil->usuario->estado ?? 'Activo',
                    'perfil' => $docente->perfil, // Devolver todo el perfil para edición
                    'docente' => $docente // Devolver todo el docente para edición
                ];
            });

        return Inertia::render('Modulos/modulo_docencia/GestionarDocente/Index', [
            'docentes' => $docentes,
            'filters' => $request->only('search')
        ]);
    }

    public function store(Request $request)
    {
        // Validar requerimientos
        $request->validate([
            'ci' => 'required|unique:perfil,ci',
            'nombres' => 'required',
            'apellido_paterno' => 'required',
            'email' => 'required|email|unique:perfil,email',
            'profesion' => 'required',
            'grado_academico' => 'required',
            'maestria' => 'required|in:Si,No',
            'diplomado_educacion_superior' => 'required|in:Si,No',
            'experiencia_anos' => 'required|integer|min:0',
        ]);

        // REGLA DE NEGOCIO: Diplomado, 4 años Exp o Maestría
        // Interpretación: Diplomado == 'Si' AND (Experiencia >= 4 OR Maestría == 'Si')
        if ($request->diplomado_educacion_superior === 'No' || ($request->experiencia_anos < 4 && $request->maestria === 'No')) {
            return back()->withErrors([
                'requisitos' => 'No es apto según normativas. Debe tener Diplomado y (Experiencia de al menos 4 años o Maestría).'
            ]);
        }

        DB::beginTransaction();

        try {
            // 1. Crear Usuario
            $codigoInicio = 'DOC' . str_pad(Usuario::where('rol_id', 2)->count() + 1, 4, '0', STR_PAD_LEFT);
            
            // Para asegurar unicidad en caso de fallos, verificamos que el código no exista
            while(Usuario::where('codigo_inicio', $codigoInicio)->exists()){
                $count = Usuario::where('rol_id', 2)->count() + rand(10, 100);
                $codigoInicio = 'DOC' . str_pad($count, 4, '0', STR_PAD_LEFT);
            }

            $usuario = Usuario::create([
                'codigo_inicio' => $codigoInicio,
                'password' => Hash::make($request->ci), // Default password
                'estado' => 'Activo',
                'rol_id' => 2 // Rol Docente
            ]);

            // 2. Crear Perfil
            $perfil = Perfil::create([
                'usuario_id' => $usuario->id,
                'codigo' => $codigoInicio,
                'ci' => $request->ci,
                'nombres' => $request->nombres,
                'apellido_paterno' => $request->apellido_paterno,
                'apellido_materno' => $request->apellido_materno,
                'fecha_nacimiento' => $request->fecha_nacimiento,
                'nacionalidad' => $request->nacionalidad,
                'sexo' => $request->sexo,
                'direccion' => $request->direccion,
                'telefono' => $request->telefono,
                'email' => $request->email,
                'cargo' => 'DOCENTE TITULAR'
            ]);

            // 3. Crear Docente
            Docente::create([
                'id' => $perfil->id,
                'profesion' => $request->profesion,
                'area_profesional' => $request->area_profesional,
                'grado_academico' => $request->grado_academico,
                'maestria' => $request->maestria,
                'diplomado_educacion_superior' => $request->diplomado_educacion_superior,
                'experiencia_anos' => $request->experiencia_anos,
                'grupos_maximos' => 4 // Default
            ]);

            DB::commit();

            return redirect()->route('docentes.index')->with('success', 'Docente registrado correctamente.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al registrar el docente: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, $id)
    {
        $docente = Docente::findOrFail($id);
        $perfil = Perfil::findOrFail($id);
        
        $request->validate([
            'ci' => 'required|unique:perfil,ci,' . $id,
            'nombres' => 'required',
            'apellido_paterno' => 'required',
            'email' => 'required|email|unique:perfil,email,' . $id,
            'profesion' => 'required',
            'grado_academico' => 'required',
            'maestria' => 'required|in:Si,No',
            'diplomado_educacion_superior' => 'required|in:Si,No',
            'experiencia_anos' => 'required|integer|min:0',
        ]);

        if ($request->diplomado_educacion_superior === 'No' || ($request->experiencia_anos < 4 && $request->maestria === 'No')) {
            return back()->withErrors([
                'requisitos' => 'No es apto según normativas. Debe tener Diplomado y (Experiencia de al menos 4 años o Maestría).'
            ]);
        }

        DB::beginTransaction();

        try {
            $perfil->update([
                'ci' => $request->ci,
                'nombres' => $request->nombres,
                'apellido_paterno' => $request->apellido_paterno,
                'apellido_materno' => $request->apellido_materno,
                'fecha_nacimiento' => $request->fecha_nacimiento,
                'nacionalidad' => $request->nacionalidad,
                'sexo' => $request->sexo,
                'direccion' => $request->direccion,
                'telefono' => $request->telefono,
                'email' => $request->email,
            ]);

            $docente->update([
                'profesion' => $request->profesion,
                'area_profesional' => $request->area_profesional,
                'grado_academico' => $request->grado_academico,
                'maestria' => $request->maestria,
                'diplomado_educacion_superior' => $request->diplomado_educacion_superior,
                'experiencia_anos' => $request->experiencia_anos,
            ]);

            if ($request->has('estado')) {
                $usuario = Usuario::findOrFail($perfil->usuario_id);
                $usuario->update(['estado' => $request->estado]);
            }

            DB::commit();

            return redirect()->route('docentes.index')->with('success', 'Docente actualizado correctamente.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al actualizar el docente: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        $docente = Docente::findOrFail($id);
        $perfil = Perfil::findOrFail($id);
        $usuario = Usuario::findOrFail($perfil->usuario_id);

        // Borrado lógico cambiando estado a Inactivo o Eliminado
        $usuario->update([
            'estado' => 'Inactivo',
            'eliminado' => true
        ]);

        return redirect()->route('docentes.index')->with('success', 'Docente dado de baja correctamente.');
    }
}
