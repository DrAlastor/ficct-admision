<?php

namespace Backend\usuario_seguridad\Controllers;

use App\Http\Controllers\Controller;
use Backend\usuario_seguridad\Models\Usuario;
use Backend\usuario_seguridad\Models\Perfil;
use Backend\usuario_seguridad\Models\Rol;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Backend\usuario_seguridad\Services\AuditService;

class UsuarioController extends Controller
{
    /**
     * Devuelve la vista principal del listado de usuarios del sistema.
     * Soporta búsqueda por diferentes campos (nombres, apellidos, CI, email, cargo).
     * Muestra solo los usuarios que no han sido eliminados lógicamente.
     *
     * @param Request $request Petición HTTP que puede contener el parámetro 'search'.
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $query = Usuario::with(['perfil', 'rol'])
                    ->where('eliminado', false)
                    ->orderBy('rol_id', 'asc')
                    ->orderBy('id', 'asc');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('perfil', function($q) use ($search) {
                $q->where('nombres', 'ilike', "%{$search}%")
                  ->orWhere('apellido_paterno', 'ilike', "%{$search}%")
                  ->orWhere('ci', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%")
                  ->orWhere('cargo', 'ilike', "%{$search}%");
            });
        }

        $usuarios = $query->paginate(10);
        $roles = Rol::where('estado', 'Activo')->orWhereNull('estado')->get();
        $nextId = Usuario::max('id') + 1;

        return Inertia::render('Modulos/usuario_seguridad/Usuarios/Index', [
            'usuarios' => $usuarios,
            'roles' => $roles,
            'filters' => $request->only('search'),
            'nextId' => $nextId
        ]);
    }

    /**
     * Genera automáticamente un código único para el usuario basándose en su rol.
     * Ejemplos: ADM001, DOC002, POS2650001, USR003.
     *
     * @param int $rol_id ID del rol asignado al usuario.
     * @return string Código generado.
     */
    private function generarCodigo($rol_id)
    {
        $nextId = Usuario::max('id') + 1;
        switch($rol_id) {
            case 1: return 'ADM' . str_pad($nextId, 3, '0', STR_PAD_LEFT);
            case 2: return 'DOC' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
            case 3: return 'POS' . date('y') . '5' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
            default: return 'USR' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
        }
    }

    /**
     * Registra un nuevo usuario en la base de datos junto con su perfil.
     * Verifica que el CI o Email no existan previamente. Si el usuario existía pero 
     * estaba eliminado lógicamente, permite restaurarlo.
     * Registra la acción en la Bitácora de Auditoría.
     *
     * @param Request $request Datos del formulario de nuevo usuario.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ci' => 'required|string|max:20',
            'nombres' => 'required|string|max:100',
            'apellido_paterno' => 'required|string|max:100',
            'apellido_materno' => 'nullable|string|max:100',
            'telefono' => 'nullable|string|max:20',
            'cargo' => 'nullable|string|max:100',
            'email' => 'required|string|email|max:150',
            'rol_id' => 'required|exists:rol,id',
            'password' => 'nullable|string|min:8'
        ]);

        $perfilExistente = Perfil::where('ci', $validated['ci'])
                                 ->orWhere('email', $validated['email'])
                                 ->first();

        if ($perfilExistente) {
            $usuarioExistente = Usuario::find($perfilExistente->usuario_id);
            if ($usuarioExistente && $usuarioExistente->eliminado) {
                return back()->with([
                    'conflict_user' => $usuarioExistente->id,
                    'conflict_message' => 'Este usuario ya existió. ¿Deseas volver a crearlo?'
                ]);
            }
            return back()->withErrors(['error' => 'El CI o Correo ya está en uso.']);
        }

        DB::beginTransaction();
        try {
            $codigo = $this->generarCodigo($validated['rol_id']);
            $password = !empty($validated['password']) ? $validated['password'] : $validated['ci'];

            $usuario = new Usuario();
            $usuario->id = Usuario::max('id') + 1;
            $usuario->rol_id = $validated['rol_id'];
            $usuario->codigo_inicio = $codigo;
            $usuario->password = Hash::make($password);
            $usuario->estado = 'Activo';
            $usuario->save();

            $perfil = new Perfil();
            $perfil->id = Perfil::max('id') + 1;
            $perfil->usuario_id = $usuario->id;
            $perfil->codigo = $codigo;
            $perfil->ci = $validated['ci'];
            $perfil->nombres = $validated['nombres'];
            $perfil->apellido_paterno = $validated['apellido_paterno'];
            $perfil->apellido_materno = $validated['apellido_materno'] ?? null;
            $perfil->telefono = $validated['telefono'] ?? null;
            $perfil->email = $validated['email'];
            $perfil->cargo = $validated['cargo'] ?? null;
            $perfil->save();

            DB::commit();
            AuditService::log('Usuario creado exitosamente', "Se creó el usuario con CI: {$validated['ci']}");
            return redirect()->route('usuarios.index')->with('success', 'Usuario creado exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Hubo un error al crear el usuario. ' . $e->getMessage()]);
        }
    }

    /**
     * Actualiza la información básica y el rol de un usuario existente.
     * Permite cambiar la contraseña solo si se proporciona una nueva.
     *
     * @param Request $request Datos modificados del usuario.
     * @param int $id ID del usuario a modificar.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        $usuario = Usuario::findOrFail($id);
        $perfil = Perfil::where('usuario_id', $id)->firstOrFail();

        $validated = $request->validate([
            'ci' => 'required|string|max:20|unique:perfil,ci,' . $perfil->id,
            'nombres' => 'required|string|max:100',
            'apellido_paterno' => 'required|string|max:100',
            'apellido_materno' => 'nullable|string|max:100',
            'telefono' => 'nullable|string|max:20',
            'cargo' => 'nullable|string|max:100',
            'email' => 'required|string|email|max:150|unique:perfil,email,' . $perfil->id,
            'rol_id' => 'required|exists:rol,id',
            'password' => 'nullable|string|min:8'
        ]);

        DB::beginTransaction();
        try {
            $usuario->rol_id = $validated['rol_id'];
            if (!empty($validated['password'])) {
                $usuario->password = Hash::make($validated['password']);
            }
            $usuario->save();

            $perfil->update([
                'ci' => $validated['ci'],
                'nombres' => $validated['nombres'],
                'apellido_paterno' => $validated['apellido_paterno'],
                'apellido_materno' => $validated['apellido_materno'] ?? null,
                'telefono' => $validated['telefono'] ?? null,
                'email' => $validated['email'],
                'cargo' => $validated['cargo'] ?? null,
            ]);

            DB::commit();
            AuditService::log('Usuario actualizado exitosamente', "Se actualizaron los datos del usuario ID: {$usuario->id}");
            return redirect()->route('usuarios.index')->with('success', 'Usuario actualizado exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Hubo un error al actualizar el usuario. ' . $e->getMessage()]);
        }
    }

    /**
     * Elimina lógicamente a un usuario del sistema (Soft Delete).
     * El registro se mantiene en base de datos para preservar el historial,
     * pero no se muestra más en las listas activas ni permite iniciar sesión.
     *
     * @param int $id ID del usuario a eliminar.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        try {
            $usuario = Usuario::findOrFail($id);
            $usuario->eliminado = true;
            $usuario->save();
            AuditService::log('Usuario eliminado exitosamente', "Se eliminó al usuario ID: {$usuario->id}");
            return redirect()->route('usuarios.index')->with('success', 'Usuario eliminado exitosamente.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Hubo un error al eliminar el usuario.']);
        }
    }

    /**
     * Reactiva o restaura a un usuario que había sido eliminado lógicamente.
     * Permite actualizar su información en el momento de la reactivación.
     *
     * @param Request $request Datos actualizados del usuario.
     * @param int $id ID del usuario a restaurar.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function restore(Request $request, $id)
    {
        $validated = $request->validate([
            'ci' => 'required|string|max:20',
            'nombres' => 'required|string|max:100',
            'apellido_paterno' => 'required|string|max:100',
            'apellido_materno' => 'nullable|string|max:100',
            'telefono' => 'nullable|string|max:20',
            'cargo' => 'nullable|string|max:100',
            'email' => 'required|string|email|max:150',
            'rol_id' => 'required|exists:rol,id',
            'password' => 'nullable|string|min:8'
        ]);

        DB::beginTransaction();
        try {
            $usuario = Usuario::findOrFail($id);
            $usuario->eliminado = false;
            $usuario->rol_id = $validated['rol_id'];
            if (!empty($validated['password'])) {
                $usuario->password = Hash::make($validated['password']);
            }
            $usuario->save();

            $perfil = Perfil::where('usuario_id', $usuario->id)->firstOrFail();
            $perfil->update([
                'ci' => $validated['ci'],
                'nombres' => $validated['nombres'],
                'apellido_paterno' => $validated['apellido_paterno'],
                'apellido_materno' => $validated['apellido_materno'] ?? null,
                'telefono' => $validated['telefono'] ?? null,
                'email' => $validated['email'],
                'cargo' => $validated['cargo'] ?? null,
            ]);

            DB::commit();
            AuditService::log('Usuario reactivado', "Se reactivó al usuario ID: {$usuario->id}");
            return redirect()->route('usuarios.index')->with('success', 'Usuario reactivado exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Hubo un error al reactivar el usuario.']);
        }
    }
}
