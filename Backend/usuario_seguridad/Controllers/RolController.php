<?php

namespace Backend\usuario_seguridad\Controllers;

use App\Http\Controllers\Controller;
use Backend\usuario_seguridad\Models\Rol;
use Backend\usuario_seguridad\Models\Modulo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Backend\usuario_seguridad\Services\AuditService;

class RolController extends Controller
{
    /**
     * Muestra la lista de roles del sistema.
     * Soporta búsqueda por nombre y descripción. También devuelve los módulos
     * y sus funciones asociadas para el formulario de permisos.
     *
     * @param Request $request Petición HTTP con posibles filtros de búsqueda.
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $query = Rol::with('funciones')
                    ->orderBy('id', 'asc');
        
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('nombre', 'ilike', "%{$search}%")
                  ->orWhere('descripcion', 'ilike', "%{$search}%");
        }

        $roles = $query->paginate(10);
        $modulos = Modulo::with('funciones')->get();

        return Inertia::render('Modulos/usuario_seguridad/Roles/Index', [
            'roles' => $roles,
            'modulos' => $modulos,
            'filters' => $request->only('search')
        ]);
    }

    /**
     * Crea un nuevo rol en la base de datos y le asigna los permisos especificados.
     *
     * @param Request $request Contiene el 'nombre', 'descripcion' y un arreglo 'permisos'
     *                         (donde clave es funcion_id y valor es id_accion).
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:50|unique:rol,nombre',
            'descripcion' => 'nullable|string',
            'permisos' => 'nullable|array'
        ]);

        DB::beginTransaction();
        try {
            $rol = new Rol();
            $rol->id = Rol::max('id') + 1;
            $rol->nombre = $validated['nombre'];
            $rol->descripcion = $validated['descripcion'] ?? 'Sin descripción';
            $rol->estado = 'Activo';
            $rol->save();

            if (!empty($validated['permisos'])) {
                $attachData = [];
                foreach ($validated['permisos'] as $funcion_id => $id_accion) {
                    if ($id_accion) {
                        $attachData[$funcion_id] = [
                            'id_accion' => $id_accion, 
                            'descripcion' => 'Permiso asignado manualmente'
                        ];
                    }
                }
                $rol->funciones()->attach($attachData);
            }

            DB::commit();
            AuditService::log('Rol creado exitosamente', "Se creó el rol: {$validated['nombre']}");
            return redirect()->route('roles.index')->with('success', 'Rol creado exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al crear el rol: ' . $e->getMessage()]);
        }
    }

    /**
     * Actualiza el nombre, descripción y los permisos de un rol existente.
     * Sincroniza la tabla pivote `rol_funcion` para reflejar los nuevos permisos.
     *
     * @param Request $request Petición HTTP con los nuevos datos.
     * @param int $id ID del rol a modificar.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        $rol = Rol::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:50|unique:rol,nombre,' . $rol->id,
            'descripcion' => 'nullable|string',
            'permisos' => 'nullable|array'
        ]);

        DB::beginTransaction();
        try {
            $rol->update([
                'nombre' => $validated['nombre'],
                'descripcion' => $validated['descripcion'] ?? 'Sin descripción',
            ]);

            $syncData = [];
            if (!empty($validated['permisos'])) {
                foreach ($validated['permisos'] as $funcion_id => $id_accion) {
                    if ($id_accion) {
                        $syncData[$funcion_id] = [
                            'id_accion' => $id_accion, 
                            'descripcion' => 'Permiso actualizado'
                        ];
                    }
                }
            }
            $rol->funciones()->sync($syncData);

            DB::commit();
            AuditService::log('Rol actualizado exitosamente', "Se actualizó el rol: {$rol->nombre}");
            return redirect()->route('roles.index')->with('success', 'Rol actualizado exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al actualizar el rol: ' . $e->getMessage()]);
        }
    }

    /**
     * Elimina lógicamente un rol (lo marca como 'Inactivo').
     * Solo permite eliminar el rol si no tiene usuarios asociados.
     *
     * @param int $id ID del rol a eliminar.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        $rol = Rol::findOrFail($id);
        
        $usersCount = DB::table('usuario')->where('rol_id', $id)->count();
        if ($usersCount > 0) {
            return back()->withErrors(['error' => 'No se puede eliminar el rol porque tiene usuarios asignados.']);
        }

        try {
            $rolNombre = $rol->nombre;
            $rol->estado = 'Inactivo';
            $rol->save();
            AuditService::log('Rol eliminado exitosamente', "Se eliminó el rol: {$rolNombre}");
            return redirect()->route('roles.index')->with('success', 'Rol eliminado exitosamente.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Error al eliminar el rol.']);
        }
    }
}
