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
    public function index(Request $request)
    {
        $query = Usuario::with(['perfil', 'rol'])
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ci' => 'required|string|max:20|unique:perfil,ci',
            'nombres' => 'required|string|max:100',
            'apellido_paterno' => 'required|string|max:100',
            'apellido_materno' => 'nullable|string|max:100',
            'telefono' => 'nullable|string|max:20',
            'cargo' => 'nullable|string|max:100',
            'email' => 'required|string|email|max:150|unique:perfil,email',
            'rol_id' => 'required|exists:rol,id',
            'password' => 'nullable|string|min:8'
        ]);

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

    public function destroy($id)
    {
        try {
            $usuario = Usuario::findOrFail($id);
            // Delete logic (soft delete by setting estado=Inactivo or actual delete)
            $usuario->estado = 'Inactivo';
            $usuario->save();
            AuditService::log('Usuario deshabilitado exitosamente', "Se deshabilitó al usuario ID: {$usuario->id}");
            return redirect()->route('usuarios.index')->with('success', 'Usuario deshabilitado exitosamente.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Hubo un error al eliminar el usuario.']);
        }
    }
}
