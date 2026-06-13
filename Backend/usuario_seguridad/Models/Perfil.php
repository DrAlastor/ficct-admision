<?php

namespace Backend\usuario_seguridad\Models;

use Illuminate\Database\Eloquent\Model;

class Perfil extends Model
{
    protected $table = 'perfil';
    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'codigo',
        'ci',
        'nombres',
        'apellido_paterno',
        'apellido_materno',
        'fecha_nacimiento',
        'nacionalidad',
        'sexo',
        'direccion',
        'telefono',
        'email',
        'cargo'
    ];

    /**
     * Ejecuta la acción o procedimiento 'usuario' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    /**
     * Ejecuta la acción o procedimiento 'postulante' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function postulante()
    {
        return $this->hasOne(Postulante::class, 'id', 'id');
    }
}
