<?php
use Illuminate\Support\Facades\Hash;
use Backend\Modulo1_Seguridad\Models\Usuario;

$user = Usuario::where('codigo_inicio', 'POS2250001')->first();
if ($user) {
    $user->password = Hash::make('90000001');
    $user->save();
    echo "Password Hashed Successfully!\n";
} else {
    echo "User not found\n";
}
