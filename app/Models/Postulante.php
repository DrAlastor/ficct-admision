<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Postulante extends Model
{
    protected $table = 'postulante';
    
    protected $primaryKey = 'id';
    public $incrementing = false;
    
    public $timestamps = false;

    protected $fillable = [
        'id',
        'colegio_procedencia',
        'ciudad'
    ];
}