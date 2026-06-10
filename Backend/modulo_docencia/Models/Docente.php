<?php

namespace Backend\modulo_docencia\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Docente extends Model
{
    use HasFactory;

    protected $table = 'docente';
    public $timestamps = false;

    // PK custom
    protected $primaryKey = 'id';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'profesion',
        'area_profesional',
        'grado_academico',
        'maestria',
        'diplomado_educacion_superior',
        'experiencia_anos',
        'grupos_maximos'
    ];

    public function perfil()
    {
        return $this->belongsTo(\Backend\usuario_seguridad\Models\Perfil::class, 'id', 'id');
    }
}
