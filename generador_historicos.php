<?php
$nombresM = ['Carlos', 'Andres', 'Jorge', 'Luis', 'Juan', 'Pedro', 'Miguel', 'Jose', 'Diego', 'Fernando', 'Ricardo', 'Roberto'];
$nombresF = ['Maria', 'Ana', 'Laura', 'Sofia', 'Lucia', 'Carmen', 'Elena', 'Marta', 'Paula', 'Gabriela', 'Valeria', 'Daniela'];
$apellidos = ['Perez', 'Gomez', 'Rodriguez', 'Fernandez', 'Lopez', 'Martinez', 'Sanchez', 'Garcia', 'Torres', 'Ramirez', 'Vargas', 'Rojas'];
$colegios = ['Don Bosco', 'La Salle', 'Marista', 'Uboldi', 'Nacional Florida', 'Evangelico', 'Domingo Savio', 'Espana'];
$ciudades = ['Santa Cruz', 'La Paz', 'Cochabamba', 'Tarija', 'Sucre', 'Oruro', 'Potosi', 'Beni', 'Pando'];
$carreras = ['Ingenieria Informatica', 'Ingenieria en Redes', 'Ingenieria de Sistemas'];
$grupos = ['M001', 'M002', 'M003', 'T001', 'N001'];
$metodos = ['Stripe (Tarjetas)', 'PayPal', 'Transferencia Bancaria'];

$materias = [
    'MAT100' => 'Licenciado en Matematicas',
    'FIS100' => 'Fisico',
    'INF100' => 'Ingeniero Informatico',
    'LIN100' => 'Licenciado en Filologia'
];

function generarDocentes($ci_base) {
    global $grupos, $materias, $nombresM, $nombresF, $apellidos;
    $pool = [];
    foreach ($grupos as $grupo) {
        foreach ($materias as $sigla => $prof) {
            $nombreDoc = (rand(0,1) == 0) ? $nombresM[array_rand($nombresM)] : $nombresF[array_rand($nombresF)];
            $pool[$grupo][$sigla] = [
                'ci' => $ci_base++,
                'nombre' => $nombreDoc,
                'apellido' => $apellidos[array_rand($apellidos)],
                'profesion' => $prof,
                'hora_semanal' => rand(10, 40)
            ];
        }
    }
    return $pool;
}

function generarArchivo($filename, $cantidad, $ci_postulante_base, $ci_docente_base) {
    global $nombresM, $nombresF, $apellidos, $colegios, $ciudades, $carreras, $grupos, $metodos, $materias;
    
    $docentes_pool = generarDocentes($ci_docente_base);
    $file = fopen($filename, 'w');
    fputcsv($file, ['CI','Nombres','Apellido Paterno','Apellido Materno','Email','Sexo','Colegio','Ciudad','Carrera','Monto Pago','Metodo Pago','Nro Recibo','Materia','Grupo','CI Docente','Nombre Docente','Apellido Docente','Profesion Docente','Hora Semanal Docente','Nota P1','Nota P2','Nota P3','Promedio Final','Estado Materia']);
    
    for ($i = 0; $i < $cantidad; $i++) {
        $ci = $ci_postulante_base++;
        $sexo = (rand(0,1) == 0) ? 'M' : 'F';
        $nombre = ($sexo == 'M') ? $nombresM[array_rand($nombresM)] : $nombresF[array_rand($nombresF)];
        $paterno = $apellidos[array_rand($apellidos)];
        $materno = $apellidos[array_rand($apellidos)];
        $email = strtolower($nombre . '.' . $paterno . '.' . $ci . '@test.com');
        $colegio = $colegios[array_rand($colegios)];
        $ciudad = $ciudades[array_rand($ciudades)];
        $carrera = $carreras[array_rand($carreras)];
        
        $monto = 700;
        $metodo = $metodos[array_rand($metodos)];
        $recibo = 'REC-TEST-' . $ci;
        
        $grupo = $grupos[array_rand($grupos)];
        
        foreach ($materias as $sigla => $prof) {
            $doc = $docentes_pool[$grupo][$sigla];
            
            $p1 = rand(0, 33);
            $p2 = rand(0, 33);
            $p3 = rand(0, 34);
            $promedio = $p1 + $p2 + $p3;
            $estado = ($promedio >= 60) ? 'Aprobado' : 'Reprobado';
            
            fputcsv($file, [
                $ci, $nombre, $paterno, $materno, $email, $sexo, $colegio, $ciudad, $carrera,
                $monto, $metodo, $recibo,
                $sigla, $grupo,
                $doc['ci'], $doc['nombre'], $doc['apellido'], $doc['profesion'], $doc['hora_semanal'],
                $p1, $p2, $p3, $promedio, $estado
            ]);
        }
    }
    fclose($file);
    echo "Archivo {$filename} generado correctamente.\\n";
}

generarArchivo('historico125.csv', 200, 10000000, 10500000);
generarArchivo('historico225.csv', 130, 11000000, 11500000);
?>
