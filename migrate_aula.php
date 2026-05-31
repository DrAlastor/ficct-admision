<?php
use Illuminate\Support\Facades\DB;

try {
    DB::statement("
        CREATE TABLE ASISTENCIA (
            ID SERIAL PRIMARY KEY,
            INSCRIPCION_ID INT REFERENCES INSCRIPCIONES_CUP(ID) ON DELETE CASCADE ON UPDATE CASCADE,
            FECHA DATE NOT NULL,
            ESTADO VARCHAR(20) NOT NULL
        );
    ");
    echo "Tabla ASISTENCIA creada.\n";
} catch (\Exception $e) {
    echo "Error ASISTENCIA: " . $e->getMessage() . "\n";
}

try {
    DB::statement("
        CREATE TABLE EXAMEN (
            ID SERIAL PRIMARY KEY,
            MATERIA_ID INT REFERENCES MATERIA(ID) ON DELETE CASCADE ON UPDATE CASCADE,
            TITULO VARCHAR(255) NOT NULL,
            DESCRIPCION TEXT,
            FECHA_HABILITACION TIMESTAMP NOT NULL,
            FECHA_CIERRE TIMESTAMP NOT NULL,
            DURACION_MINUTOS INT NOT NULL DEFAULT 60
        );
    ");
    echo "Tabla EXAMEN creada.\n";
} catch (\Exception $e) {
    echo "Error EXAMEN: " . $e->getMessage() . "\n";
}
