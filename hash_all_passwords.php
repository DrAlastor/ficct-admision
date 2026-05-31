<?php
use Backend\Modulo1_Seguridad\Models\Usuario;
use Illuminate\Support\Facades\Hash;

$users = Usuario::all();
$count = 0;
foreach ($users as $user) {
    if (strlen($user->password) < 60) {
        $user->password = Hash::make($user->password);
        $user->save();
        $count++;
    }
}
echo "Hashed $count passwords.\n";
