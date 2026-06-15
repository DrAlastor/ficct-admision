<?php

namespace Backend\gestion_academica\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\CredencialesPostulanteMail;
use Backend\usuario_seguridad\Models\Usuario;
use Backend\usuario_seguridad\Models\Perfil;
use Backend\modulo_inscripcion\Models\Postulacion;
use Backend\modulo_inscripcion\Models\Documento;
use Inertia\Inertia;

/**
 * CU17 - Gestionar Postulantes
 */
class PostulanteController extends Controller
{
    /**
     * Obtiene y muestra la lista principal de registros o la vista por defecto.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
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

    /**
     * Valida y actualiza los datos de un registro existente en la base de datos.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
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

    /**
     * Revisa una postulación pendiente y la marca como 'Habilitado'.
     *
     * @param int $id ID de la postulacion
     * @return \Illuminate\Http\RedirectResponse
     */
    public function aceptar($id)
    {
        DB::beginTransaction();
        try {
            $perfil = Perfil::findOrFail($id);
            $postulacion = Postulacion::where('postulante_id', $id)->orderBy('codigo', 'desc')->first();

            if (!$postulacion || $postulacion->estado !== 'Pendiente') {
                throw new \Exception('La postulación no está pendiente o no existe.');
            }

            // Crear Usuario
            $usuario = new Usuario();
            $usuario->id = Usuario::max('id') + 1;
            $usuario->codigo_inicio = $perfil->codigo;
            $usuario->password = Hash::make($perfil->ci);
            $usuario->estado = 'Inactivo';
            $usuario->rol_id = 4;
            $usuario->save();

            // Vincular Usuario al Perfil y asignar cargo
            $perfil->usuario_id = $usuario->id;
            $perfil->cargo = 'POSTULANTE';
            $perfil->save();

            // Cambiar estado
            $postulacion->estado = 'Habilitado';
            $postulacion->save();

            Documento::where('postulacion_codigo', $postulacion->codigo)->update([
                'estado_validacion' => 'Subido'
            ]);

            DB::commit();

            // Enviar Correo
            try {
                Mail::to($perfil->email)->send(new CredencialesPostulanteMail(
                    $perfil->nombres,
                    $perfil->codigo, 
                    $perfil->ci
                ));
            } catch (\Throwable $e) {
                // Log o ignorar fallo de correo para no revertir la BD
                \Log::warning("Error enviando email a {$perfil->email}: " . $e->getMessage());
            }

            return redirect()->back()->with('success', 'Postulante aceptado y credenciales enviadas.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Error al aceptar: ' . $e->getMessage()]);
        }
    }

    /**
     * Muestra el documento (requisitos) subido por el postulante.
     *
     * @param int $id ID del postulante (perfil)
     * @return \Illuminate\Http\RedirectResponse
     */
    public function verDocumento($id)
    {
        $postulacion = Postulacion::where('postulante_id', $id)->orderBy('codigo', 'desc')->first();
        if (!$postulacion) {
            return back()->withErrors(['error' => 'No se encontró la postulación.']);
        }

        $documento = Documento::where('postulacion_codigo', $postulacion->codigo)->first();
        if (!$documento || !$documento->url_archivo) {
            return back()->withErrors(['error' => 'No se encontró el documento o no fue subido.']);
        }

        try {
            // Intentar generar URL temporal de S3
            $url = \Illuminate\Support\Facades\Storage::disk('s3_archivos')->temporaryUrl(
                $documento->url_archivo,
                now()->addMinutes(30)
            );
            return redirect($url);
        } catch (\Exception $e) {
            try {
                // Si la configuración no permite temporaryUrl, usar la URL directa o de otro disco
                $url = \Illuminate\Support\Facades\Storage::disk('s3_archivos')->url($documento->url_archivo);
                return redirect($url);
            } catch (\Exception $e2) {
                return back()->withErrors(['error' => 'Error al obtener el documento: ' . $e2->getMessage()]);
            }
        }
    }
}
