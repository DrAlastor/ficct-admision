<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;
use Carbon\Carbon;

class SeedPostulantesData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admision:seed-postulantes {gestion} {--count=100}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generar datos aleatorios masivos de postulantes para una gesti??n (ej. 1-2025).';

    /**
     * Execute the console command.
     * Comando para la terminal: php artisan admision:seed-postulantes 1-2025 --count=1200
     */
    public function handle()
    {
        $gestionStr = $this->argument('gestion');
        $count = (int) $this->option('count');

        if (!preg_match('/^([12])-(\d{4})$/', $gestionStr, $matches)) {
            $this->error('Formato de gesti??n inv??lido. Usa el formato Semestre-A??o (ej. 1-2025).');
            return;
        }

        $semestre = (int) $matches[1];
        $anio = (int) $matches[2];

        $this->info("Iniciando la generaci??n de {$count} postulantes para la gesti??n {$gestionStr}...");

        DB::beginTransaction();
        try {
            // 1. Verificar o crear la gesti??n
            $gestion = DB::table('gestion')->where('semestre', $semestre)->where('a??o', $anio)->first();
            if (!$gestion) {
                $gestionId = DB::table('gestion')->insertGetId([
                    'semestre' => $semestre,
                    'a??o' => $anio
                ]);
                $gestion = DB::table('gestion')->where('id', $gestionId)->first();
                $this->info("Se cre?? la nueva gesti??n: {$gestionStr} (ID: {$gestionId})");
            }

            // 2. Obtener materias y carreras
            $materias = DB::table('materia')->get();
            if ($materias->count() < 4) {
                $this->error("Se necesitan al menos 4 materias en el sistema (encontradas: {$materias->count()}).");
                DB::rollBack();
                return;
            }

            // Usaremos los grupos M001 y T001 (en caso de no existir los suficientes, tomaremos los primeros 8)
            $gruposManana = DB::table('grupo')->where('nombre', 'M001')->pluck('codigo')->toArray();
            $gruposTarde = DB::table('grupo')->where('nombre', 'T001')->pluck('codigo')->toArray();

            if (count($gruposManana) < 4 || count($gruposTarde) < 4) {
                // Fallback a cualquier grupo para no crashear
                $todosGrupos = DB::table('grupo')->pluck('codigo')->toArray();
                if (count($todosGrupos) < 4) {
                    $this->error("No hay suficientes grupos creados.");
                    DB::rollBack();
                    return;
                }
                $gruposManana = array_slice($todosGrupos, 0, 4);
                $gruposTarde = array_slice($todosGrupos, 0, 4);
            }

            $carreras = DB::table('carrera')->get();
            if ($carreras->isEmpty()) {
                $this->error("No hay carreras registradas.");
                DB::rollBack();
                return;
            }
            $carreraIds = $carreras->pluck('codigo')->toArray();
            
            // Cupos por carrera (copia para simular la l??gica de admisi??n)
            $cuposDisponibles = [];
            foreach ($carreras as $c) {
                $cuposDisponibles[$c->codigo] = $c->cupo_maximo;
            }

            $faker = Faker::create('es_ES');
            
            $nextUsuarioId = DB::table('usuario')->max('id') + 1;
            $nextPerfilId = DB::table('perfil')->max('id') + 1;
            
            $this->output->progressStart($count);

            $postulantesGenerados = [];

            // Contrase??a gen??rica (solo se hashea una vez por rendimiento)
            $hashedPassword = Hash::make('password123');

            for ($i = 0; $i < $count; $i++) {
                // Generar Usuario
                $codigoInicio = 'POS' . substr($anio, -2) . '5' . str_pad($nextUsuarioId, 4, '0', STR_PAD_LEFT);
                
                DB::table('usuario')->insert([
                    'id' => $nextUsuarioId,
                    'rol_id' => 3, // Postulante
                    'codigo_inicio' => $codigoInicio,
                    'password' => $hashedPassword,
                    'estado' => 'Inactivo',
                    'eliminado' => false
                ]);

                // Generar Perfil
                $ci = $faker->unique()->randomNumber(8, true);
                $nombres = $faker->firstName;
                $apellido_paterno = $faker->lastName;
                $apellido_materno = $faker->lastName;
                $email = "{$nombres}.{$apellido_paterno}{$nextUsuarioId}@example.com";

                DB::table('perfil')->insert([
                    'id' => $nextPerfilId,
                    'usuario_id' => $nextUsuarioId,
                    'codigo' => $codigoInicio,
                    'ci' => $ci,
                    'nombres' => $nombres,
                    'apellido_paterno' => $apellido_paterno,
                    'apellido_materno' => $apellido_materno,
                    'fecha_nacimiento' => $faker->dateTimeBetween('-25 years', '-17 years')->format('Y-m-d'),
                    'nacionalidad' => 'Boliviana',
                    'sexo' => $faker->randomElement(['M', 'F']),
                    'direccion' => $faker->address,
                    'telefono' => $faker->numerify('7#######'),
                    'email' => strtolower($email),
                    'cargo' => 'POSTULANTE'
                ]);

                // Generar Postulante
                DB::table('postulante')->insert([
                    'id' => $nextPerfilId,
                    'colegio_procedencia' => $faker->randomElement(['Nacional Florida', 'Marista', 'La Salle', 'Don Bosco', 'San Agustin', 'Cristo Rey']),
                    'ciudad' => 'Santa Cruz'
                ]);

                // Generar Postulacion
                $postulacionId = DB::table('postulacion')->insertGetId([
                    'postulante_id' => $nextPerfilId,
                    'gestion_id' => $gestion->id,
                    'fecha' => Carbon::now()->format('Y-m-d'),
                    'hora' => Carbon::now()->format('H:i:s'),
                    'estado' => 'Evaluando' // Estado inicial antes de la admisi??n
                ]);

                // Generar Postulacion_Carrera
                shuffle($carreraIds);
                DB::table('postulacion_carrera')->insert([
                    'postulacion_codigo' => $postulacionId,
                    'carrera_codigo' => $carreraIds[0],
                    'prioridad' => 1
                ]);
                DB::table('postulacion_carrera')->insert([
                    'postulacion_codigo' => $postulacionId,
                    'carrera_codigo' => $carreraIds[1],
                    'prioridad' => 2
                ]);

                // Generar Pago y Documentos
                DB::table('pago')->insert([
                    'postulacion_codigo' => $postulacionId,
                    'nro_recibo' => 'REC-' . strtoupper(uniqid()),
                    'monto' => 700.00,
                    'metodo_pago' => $faker->randomElement(['PayPal', 'Stripe', 'Transferencia']),
                    'transaccion_id' => 'TXN_' . strtoupper(uniqid()),
                    'estado' => 'Completado',
                    'fecha' => Carbon::now()->format('Y-m-d')
                ]);
                DB::table('documentos')->insert([
                    'postulacion_codigo' => $postulacionId,
                    'tipo_documento' => 'Carnet',
                    'url_archivo' => 'url.com/ci_' . $ci,
                    'estado_validacion' => 'Validado'
                ]);

                // Inscribir a los 4 grupos
                $promedioGeneral = 0;
                $aproboCUP = true;
                
                if (!$esGestionActual) {
                    $misGrupos = $faker->randomElement([$gruposManana, $gruposTarde]);
                    
                    foreach ($misGrupos as $grupoId) {
                        $inscripcionId = DB::table('inscripciones_cup')->insertGetId([
                            'postulacion_codigo' => $postulacionId,
                            'grupo_codigo' => $grupoId,
                            'fecha_inscripcion' => Carbon::now()->format('Y-m-d'),
                            'estado' => 'Inscrito'
                        ]);

                        // Probabilidad de que el estudiante pase la materia: ~40% general
                        $isGoodStudent = $faker->boolean(40);
                        
                        if ($isGoodStudent) {
                            $p1 = $faker->randomFloat(2, 60, 100);
                            $p2 = $faker->randomFloat(2, 60, 100);
                            $p3 = $faker->randomFloat(2, 60, 100);
                        } else {
                            // Podr??a aplazarse en alguna evaluaci??n
                            $p1 = $faker->randomFloat(2, 0, 90);
                            $p2 = $faker->randomFloat(2, 0, 90);
                            $p3 = $faker->randomFloat(2, 0, 59); // Forzamos reprobaci??n
                        }

                        $promedioMateria = round(($p1 + $p2 + $p3) / 3, 2);
                        $estadoMateria = ($promedioMateria >= 60) ? 'Aprobado' : 'Reprobado';

                        if ($estadoMateria === 'Reprobado') {
                            $aproboCUP = false; // Reprueba el CUP si alguna materia es < 60
                        }

                        $promedioGeneral += $promedioMateria;

                        DB::table('evaluaciones')->insert([
                            'inscripcion_id' => $inscripcionId,
                            'nota_p1' => $p1,
                            'nota_p2' => $p2,
                            'nota_p3' => $p3,
                            'promedio_final' => $promedioMateria,
                            'estado_materia' => $estadoMateria
                        ]);
                    }
                    $promedioGeneral = round($promedioGeneral / 4, 2);
                }

                $postulantesGenerados[] = [
                    'postulacion_id' => $postulacionId,
                    'aprobo_cup' => $aproboCUP,
                    'promedio_general' => $promedioGeneral,
                    'opcion_1' => $carreraIds[0],
                    'opcion_2' => $carreraIds[1]
                ];

                $nextUsuarioId++;
                $nextPerfilId++;
                
                $this->output->progressAdvance();
            }

            $this->output->progressFinish();
            $this->info("Generaci??n finalizada. Procesando l??gica de admisi??n basada en cupos...");

            // 3. L??gica de Admisi??n
            if (!$esGestionActual) {
                $aprobados = array_filter($postulantesGenerados, function($p) {
                    return $p['aprobo_cup'] === true;
                });

                // Ordenar aprobados por promedio descendente
                usort($aprobados, function($a, $b) {
                    return $b['promedio_general'] <=> $a['promedio_general'];
                });

                $admitidos1raOpcion = [];
                $admitidos2daOpcion = [];
                $rechazados = [];
                $reprobados = array_filter($postulantesGenerados, function($p) {
                    return $p['aprobo_cup'] === false;
                });

                $noAsignados = [];
                foreach ($aprobados as $postulante) {
                    $carreraOpt1 = $postulante['opcion_1'];
                    if ($cuposDisponibles[$carreraOpt1] > 0) {
                        $cuposDisponibles[$carreraOpt1]--;
                        $admitidos1raOpcion[] = [
                            'postulacion_id' => $postulante['postulacion_id'],
                            'carrera_id' => $carreraOpt1
                        ];
                    } else {
                        $noAsignados[] = $postulante;
                    }
                }

                foreach ($noAsignados as $postulante) {
                    $carreraOpt2 = $postulante['opcion_2'];
                    if ($cuposDisponibles[$carreraOpt2] > 0) {
                        $cuposDisponibles[$carreraOpt2]--;
                        $admitidos2daOpcion[] = [
                            'postulacion_id' => $postulante['postulacion_id'],
                            'carrera_id' => $carreraOpt2
                        ];
                    } else {
                        $rechazados[] = $postulante['postulacion_id'];
                    }
                }

                $carrerasMap = $carreras->keyBy('codigo');

                foreach ($admitidos1raOpcion as $adm) {
                    $nombreCarrera = $carrerasMap[$adm['carrera_id']]->nombre;
                    DB::table('postulacion')->where('codigo', $adm['postulacion_id'])
                      ->update(['estado' => "Aceptado: {$nombreCarrera}"]);
                }

                foreach ($admitidos2daOpcion as $adm) {
                    $nombreCarrera = $carrerasMap[$adm['carrera_id']]->nombre;
                    DB::table('postulacion')->where('codigo', $adm['postulacion_id'])
                      ->update(['estado' => "Aceptado: {$nombreCarrera}"]);
                }

                foreach ($rechazados as $pId) {
                    DB::table('postulacion')->where('codigo', $pId)
                      ->update(['estado' => "Rechazado (Sin Cupo)"]);
                }

                foreach ($reprobados as $p) {
                    DB::table('postulacion')->where('codigo', $p['postulacion_id'])
                      ->update(['estado' => "Reprobado"]);
                }
            } else {
                // Gesti??n Actual: Todos quedan en "Habilitado"
                foreach ($postulantesGenerados as $p) {
                    DB::table('postulacion')->where('codigo', $p['postulacion_id'])
                      ->update(['estado' => 'Habilitado']);
                }
            }

            DB::commit();
            
            $this->info("??Completado! Resumen de Admisi??n para la Gesti??n {$gestionStr}:");
            $this->info("- Total Postulantes Generados: {$count}");
            $this->info("- Aceptados (2da Opci??n): " . count($admitidos2daOpcion));
            $this->info("- Rechazados (Sin Cupo): " . count($rechazados));

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("Hubo un error al generar los datos: " . $e->getMessage());
        }
    }
}
