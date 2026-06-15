<?php

namespace Backend\aula_virtual\Models;

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

    /**
     * Relación con el modelo de InscripcionCup.
     * Una evaluación pertenece a un registro de inscripción específico.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function inscripcion()
    {
        return $this->belongsTo(\Backend\modulo_inscripcion\Models\InscripcionCup::class, 'inscripcion_id');
    }
}
