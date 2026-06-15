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
     * Relación de pertenencia con Módulo.
     * Una función pertenece a un módulo específico del sistema.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function modulo()
    {
        return $this->belongsTo(Modulo::class, 'modulo_id');
    }

    /**
     * Relación muchos a muchos con Rol.
     * Una función puede estar habilitada para múltiples roles (mediante rol_funcion).
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function roles()
    {
        return $this->belongsToMany(Rol::class, 'rol_funcion', 'funcion_id', 'rol_id')
                    ->withPivot('id_accion', 'descripcion');
    }
}
