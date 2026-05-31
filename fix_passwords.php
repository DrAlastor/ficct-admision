<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

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
