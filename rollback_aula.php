<?php
use Illuminate\Support\Facades\DB;

try {
    DB::statement("DROP TABLE IF EXISTS ASISTENCIA CASCADE;");
    echo "Tabla ASISTENCIA eliminada.\n";
} catch (\Exception $e) {
    echo "Error ASISTENCIA: " . $e->getMessage() . "\n";
}

try {
    DB::statement("DROP TABLE IF EXISTS EXAMEN CASCADE;");
    echo "Tabla EXAMEN eliminada.\n";
} catch (\Exception $e) {
    echo "Error EXAMEN: " . $e->getMessage() . "\n";
}
