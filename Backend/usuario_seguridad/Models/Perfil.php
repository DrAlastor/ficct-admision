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
     * Relación de pertenencia con Usuario.
     * Un perfil pertenece y detalla a un registro de usuario en específico.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    /**
     * Relación uno a uno opcional con Postulante.
     * Un perfil de rol 'Postulante' tiene un registro en la tabla postulante para guardar documentos.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function postulante()
    {
        return $this->hasOne(Postulante::class, 'id', 'id');
    }
}
