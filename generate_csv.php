<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$faker = Faker\Factory::create('es_ES');
$fp = fopen('usuarios_prueba_50.csv', 'w');
$header = ['ci', 'nombres', 'apellido paterno', 'apellido materno', 'email', 'telefono', 'cargo', 'rol id', 'profesion', 'grado academico', 'password'];
fputcsv($fp, $header);

for ($i = 1; $i <= 50; $i++) {
    $rol_id = $faker->randomElement([2, 3, 4, 4, 4, 4]); // Más postulantes (4) que docentes (2) o coordinadores (3)
    $cargo = '';
    $profesion = '';
    $grado = '';
    
    if ($rol_id == 2) {
        $cargo = 'Docente';
        $profesion = $faker->randomElement(['Ingeniero de Sistemas', 'Ingeniero Informático', 'Licenciado en Redes']);
        $grado = $faker->randomElement(['Licenciatura', 'Maestría', 'Doctorado']);
    } elseif ($rol_id == 3) {
        $cargo = 'Coordinador';
    } elseif ($rol_id == 4) {
        $cargo = 'Postulante';
    }

    $row = [
        $faker->unique()->randomNumber(8, true),
        $faker->firstName,
        $faker->lastName,
        $faker->lastName,
        'user'.$i.'_'.$faker->unique()->safeEmail,
        $faker->numerify('7#######'),
        $cargo,
        $rol_id,
        $profesion,
        $grado,
        'password123'
    ];
    fputcsv($fp, $row);
}
fclose($fp);
echo "CSV generado exitosamente.\n";
