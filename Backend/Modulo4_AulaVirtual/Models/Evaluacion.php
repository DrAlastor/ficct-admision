<?php

namespace Backend\Modulo4_AulaVirtual\Models;

use Illuminate\Database\Eloquent\Model;

class Evaluacion extends Model
{
    protected $table = 'evaluaciones';
    public $timestamps = false;

    protected $fillable = [
        'inscripcion_id',
        'nota_p1',
        'nota_p2',
        'nota_p3',
        'promedio_final',
        'estado_materia'
    ];

    public function inscripcion()
    {
        return $this->belongsTo(\Backend\Modulo2_Admision\Models\InscripcionCup::class, 'inscripcion_id');
    }
}
