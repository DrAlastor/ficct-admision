<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Notas - {{ $grupo->materia_nombre }} ({{ $grupo->grupo_codigo }})</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 30px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #4338ca;
            padding-bottom: 10px;
        }
        .header h1 {
            color: #4338ca;
            margin: 0 0 5px 0;
            font-size: 24px;
        }
        .header p {
            margin: 0;
            color: #555;
            font-size: 14px;
        }
        .info-box {
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-size: 11px;
        }
        th {
            background-color: #4338ca;
            color: white;
            font-weight: bold;
            text-align: center;
        }
        td.text-center {
            text-align: center;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .estado-aprobado {
            color: #15803d;
            font-weight: bold;
        }
        .estado-reprobado {
            color: #b91c1c;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            text-align: right;
            font-size: 10px;
            color: #777;
        }
    </style>
</head>
<body>

    <div class="header">
        <h1>FICCT - Sistema de Admisión</h1>
        <p>Reporte Oficial de Evaluaciones y Calificaciones</p>
    </div>

    <div class="info-box">
        <strong>Materia:</strong> {{ $grupo->materia_nombre }} <br>
        <strong>Grupo:</strong> {{ $grupo->grupo_nombre }} ({{ $grupo->grupo_codigo }}) <br>
        <strong>Total Evaluados:</strong> {{ count($estudiantes) }}
    </div>

    <table>
        <thead>
            <tr>
                <th width="5%">Nro</th>
                <th width="15%">C.I.</th>
                <th width="35%">Apellidos y Nombres</th>
                <th width="10%">P1 (30%)</th>
                <th width="10%">P2 (30%)</th>
                <th width="10%">Final (40%)</th>
                <th width="10%">Nota Final</th>
                <th width="15%">Estado</th>
            </tr>
        </thead>
        <tbody>
            @foreach($estudiantes as $index => $alumno)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $alumno->ci }}</td>
                <td>{{ $alumno->apellido_paterno }} {{ $alumno->apellido_materno }} {{ $alumno->nombres }}</td>
                <td class="text-center">{{ $alumno->nota_p1 ?? '0.00' }}</td>
                <td class="text-center">{{ $alumno->nota_p2 ?? '0.00' }}</td>
                <td class="text-center">{{ $alumno->nota_p3 ?? '0.00' }}</td>
                <td class="text-center" style="font-weight: bold;">{{ $alumno->promedio_final ?? '0.00' }}</td>
                <td class="text-center">
                    @if(($alumno->estado_materia ?? 'Reprobado') === 'Aprobado')
                        <span class="estado-aprobado">Aprobado</span>
                    @else
                        <span class="estado-reprobado">Reprobado</span>
                    @endif
                </td>
            </tr>
            @endforeach
            
            @if(count($estudiantes) == 0)
            <tr>
                <td colspan="8" class="text-center">No hay alumnos evaluados en este grupo todavía.</td>
            </tr>
            @endif
        </tbody>
    </table>

    <div class="footer">
        Generado el: {{ date('d/m/Y H:i') }}
    </div>

</body>
</html>
