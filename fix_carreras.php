<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

$files = ['estadisticas_prueba.csv', 'estadisticas_nuevas_100.csv'];

$carreras = DB::table('carrera')->get()->keyBy(fn($c) => Str::slug(trim($c->nombre)));

$updates = 0;

foreach ($files as $file) {
    if (!file_exists($file)) continue;
    $handle = fopen($file, "r");
    $header = fgetcsv($handle, 1000, ",");
    while (($row = fgetcsv($handle, 1000, ",")) !== FALSE) {
        $ci = $row[0];
        $carreraName = $row[8]; // index 8 is Carrera based on CSV header
        
        $carreraSlug = Str::slug(trim($carreraName));
        if (isset($carreras[$carreraSlug])) {
            $carreraId = $carreras[$carreraSlug]->codigo;
            
            // Buscar perfil
            $perfil = DB::table('perfil')->where('ci', $ci)->first();
            if ($perfil) {
                $postulacion = DB::table('postulacion')->where('postulante_id', $perfil->id)->first();
                if ($postulacion) {
                    DB::table('postulacion_carrera')
                        ->where('postulacion_codigo', $postulacion->codigo)
                        ->update(['carrera_codigo' => $carreraId]);
                    $updates++;
                }
            }
        }
    }
    fclose($handle);
}

echo "Se actualizaron $updates registros de postulacion_carrera correctamente.\n";
