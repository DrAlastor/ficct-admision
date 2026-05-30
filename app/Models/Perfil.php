<?php

namespace App\Models;

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
        'email'
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function postulante()
    {
        return $this->hasOne(Postulante::class, 'id', 'id');
    }
}
