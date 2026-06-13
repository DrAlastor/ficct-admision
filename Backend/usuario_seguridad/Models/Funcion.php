<?php

namespace Backend\usuario_seguridad\Models;

use Illuminate\Database\Eloquent\Model;

class Funcion extends Model
{
    protected $table = 'funcion';
    public $timestamps = false;

    protected $fillable = [
        'modulo_id',
        'nombre',
        'permiso',
        'descripcion'
    ];

    /**
     * Ejecuta la acción o procedimiento 'modulo' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function modulo()
    {
        return $this->belongsTo(Modulo::class, 'modulo_id');
    }

    /**
     * Ejecuta la acción o procedimiento 'roles' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function roles()
    {
        return $this->belongsToMany(Rol::class, 'rol_funcion', 'funcion_id', 'rol_id')
                    ->withPivot('id_accion', 'descripcion');
    }
}
