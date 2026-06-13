<?php

namespace Backend\usuario_seguridad\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Usuario extends Authenticatable
{
    use Notifiable;

    // Apuntamos a tu tabla exacta
    protected $table = 'usuario';
    
    // Desactivamos los timestamps automáticos de Laravel
    public $timestamps = false;

    // Los campos que permitimos llenar desde el controlador
    protected $fillable = [
        'codigo_inicio', 
        'password', 
        'estado', 
        'rol_id'
    ];

    // Ocultamos la contraseña por seguridad cuando se hacen consultas
    protected $hidden = [
        'password',
    ];

    /**
     * Ejecuta la acción o procedimiento 'casts' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    /**
     * Ejecuta la acción o procedimiento 'perfil' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function perfil()
    {
        return $this->hasOne(Perfil::class, 'usuario_id');
    }

    /**
     * Ejecuta la acción o procedimiento 'rol' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function rol()
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }
}