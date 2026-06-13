<?php

$file = fopen('inserts_1200_postulantes.sql', 'w');

$startUserId = 21; 
$startPostulacionId = 16; 
$startInscripcionId = 61;

fwrite($file, "-- ARCHIVO DE INSERCIONES DE 1200 POSTULANTES PARA GESTION 1-2025\n\n");

$nombres_list = ['Juan', 'Maria', 'Pedro', 'Ana', 'Luis', 'Carlos', 'Jose', 'Marta', 'Sofia', 'Jorge', 'Lucia', 'Miguel', 'Elena', 'Laura', 'Diego', 'Andres', 'Camila', 'Valeria', 'Sebastian', 'Mateo', 'Fernando', 'Ricardo', 'Alejandra', 'Paula'];
$apellidos_list = ['Perez', 'Gomez', 'Rodriguez', 'Fernandez', 'Lopez', 'Martinez', 'Sanchez', 'Gonzalez', 'Torres', 'Ramirez', 'Flores', 'Vargas', 'Rios', 'Cruz', 'Mendoza', 'Salazar', 'Guzman', 'Camacho', 'Rioja', 'Pinto', 'Rojas', 'Suarez', 'Soto', 'Castro'];

$carreras = [1, 2, 3, 4]; 
$grupos_manana = [1, 2, 3, 4];
$grupos_tarde = [5, 6, 7, 8];

$perfiles = [];
$postulantes = [];
$postulaciones = [];
$postulaciones_carrera = [];
$pagos = [];
$documentos = [];
$inscripciones = [];
$evaluaciones = [];

$currentInscripcionId = $startInscripcionId;

for ($i = 0; $i < 1200; $i++) {
    $userId = $startUserId + $i;
    $postulacionId = $startPostulacionId + $i;
    
    // Generar CI
    $ci = 10000000 + $userId;
    
    // User info
    $codigo_inicio = 'POS225' . str_pad($userId, 4, '0', STR_PAD_LEFT);
    
    $nombre = $nombres_list[array_rand($nombres_list)];
    $ape_pat = $apellidos_list[array_rand($apellidos_list)];
    $ape_mat = $apellidos_list[array_rand($apellidos_list)];
    $email = strtolower($nombre . '.' . $ape_pat . $userId . '@gmail.com');
    
    $sexo = (in_array($nombre, ['Maria', 'Ana', 'Marta', 'Sofia', 'Lucia', 'Elena', 'Laura', 'Camila', 'Valeria', 'Alejandra', 'Paula'])) ? 'F' : 'M';
    $fecha_nac = "2008-" . str_pad(rand(1, 12), 2, '0', STR_PAD_LEFT) . "-" . str_pad(rand(1, 28), 2, '0', STR_PAD_LEFT);
    
    $perfiles[] = "($userId, NULL, '$codigo_inicio', '$ci', '$nombre', '$ape_pat', '$ape_mat', '$fecha_nac', 'Boliviana', '$sexo', 'Direccion Ejemplo', '7" . rand(1000000, 9999999) . "', '$email', 'POSTULANTE')";
    $postulantes[] = "($userId, 'Colegio Ejemplo', 'Santa Cruz')";
    $postulaciones[] = "($postulacionId, $userId, 1, '2025-01-15', '08:00:00', 'Habilitado')";
    
    $carrera1 = $carreras[array_rand($carreras)];
    $carreras_restantes = array_diff($carreras, [$carrera1]);
    $carrera2 = $carreras_restantes[array_rand($carreras_restantes)];
    $postulaciones_carrera[] = "($postulacionId, $carrera1, 1)";
    $postulaciones_carrera[] = "($postulacionId, $carrera2, 2)";
    
    $nro_recibo = "REC-" . str_pad($postulacionId, 5, '0', STR_PAD_LEFT);
    $txn_id = "TXN_" . str_pad($postulacionId, 5, '0', STR_PAD_LEFT);
    $pagos[] = "($postulacionId, '$nro_recibo', 700.00, 'Stripe', '$txn_id', 'Completado', '2025-01-16')";
    $documentos[] = "($postulacionId, 'Carnet', 'url.com/ci$postulacionId', 'Validado')";
    
    // Inscripciones y Evaluaciones
    $grupos_asignados = (rand(0, 1) == 0) ? $grupos_manana : $grupos_tarde;
    
    foreach ($grupos_asignados as $grupo_codigo) {
        $inscripciones[] = "($currentInscripcionId, $postulacionId, $grupo_codigo, '2025-01-20', 'Inscrito')";
        
        $nota1 = rand(0, 100);
        $nota2 = rand(0, 100);
        $nota3 = rand(0, 100);
        $promedio = round(($nota1 + $nota2 + $nota3) / 3, 2);
        $estado_materia = ($promedio >= 51) ? 'Aprobado' : 'Reprobado';
        
        // No incluyo ID ya que la tabla EVALUACIONES usa SERIAL
        $evaluaciones[] = "($currentInscripcionId, $nota1, $nota2, $nota3, $promedio, '$estado_materia')";
        
        $currentInscripcionId++;
    }
}

function writeBulkInsert($file, $table, $columns, $values) {
    fwrite($file, "-- =================================================================\n");
    fwrite($file, "-- $table\n");
    fwrite($file, "-- =================================================================\n");
    
    // Dividir en bloques de 1000 para que Supabase no dé error de query muy larga
    $chunks = array_chunk($values, 1000);
    foreach ($chunks as $chunk) {
        fwrite($file, "INSERT INTO $table ($columns) VALUES \n");
        $last = count($chunk) - 1;
        foreach ($chunk as $index => $val) {
            if ($index == $last) {
                fwrite($file, "$val;\n\n");
            } else {
                fwrite($file, "$val,\n");
            }
        }
    }
}

writeBulkInsert($file, 'PERFIL', 'ID, USUARIO_ID, CODIGO, CI, NOMBRES, APELLIDO_PATERNO, APELLIDO_MATERNO, FECHA_NACIMIENTO, NACIONALIDAD, SEXO, DIRECCION, TELEFONO, EMAIL, CARGO', $perfiles);
writeBulkInsert($file, 'POSTULANTE', 'ID, COLEGIO_PROCEDENCIA, CIUDAD', $postulantes);
writeBulkInsert($file, 'POSTULACION', 'CODIGO, POSTULANTE_ID, GESTION_ID, FECHA, HORA, ESTADO', $postulaciones);
writeBulkInsert($file, 'POSTULACION_CARRERA', 'POSTULACION_CODIGO, CARRERA_CODIGO, PRIORIDAD', $postulaciones_carrera);
writeBulkInsert($file, 'PAGO', 'POSTULACION_CODIGO, NRO_RECIBO, MONTO, METODO_PAGO, TRANSACCION_ID, ESTADO, FECHA', $pagos);
writeBulkInsert($file, 'DOCUMENTOS', 'POSTULACION_CODIGO, TIPO_DOCUMENTO, URL_ARCHIVO, ESTADO_VALIDACION', $documentos);
writeBulkInsert($file, 'INSCRIPCIONES_CUP', 'ID, POSTULACION_CODIGO, GRUPO_CODIGO, FECHA_INSCRIPCION, ESTADO', $inscripciones);
writeBulkInsert($file, 'EVALUACIONES', 'INSCRIPCION_ID, NOTA_P1, NOTA_P2, NOTA_P3, PROMEDIO_FINAL, ESTADO_MATERIA', $evaluaciones);

fclose($file);
echo "SQL file generated successfully.\n";
