<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Lista de Alumnos - {{ $grupo->nombre }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 30px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #07074E;
            padding-bottom: 10px;
        }
        .header h1 {
            color: #07074E;
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
            padding: 10px;
            text-align: left;
            font-size: 12px;
        }
        th {
            background-color: #07074E;
            color: white;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
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
        <p>Lista Oficial de Estudiantes Inscritos</p>
    </div>

    <div class="info-box">
        <strong>Grupo:</strong> {{ $grupo->nombre }} <br>
        <strong>Modalidad:</strong> {{ $grupo->modalidad }} <br>
        <strong>Cupo Máximo:</strong> {{ $grupo->cupo }} <br>
        <strong>Total Inscritos:</strong> {{ count($inscritos) }}
    </div>

    <table>
        <thead>
            <tr>
                <th width="5%">Nro</th>
                <th width="20%">C.I.</th>
                <th width="25%">Apellido Paterno</th>
                <th width="25%">Apellido Materno</th>
                <th width="25%">Nombres</th>
            </tr>
        </thead>
        <tbody>
            @foreach($inscritos as $index => $alumno)
            <tr>
                <td style="text-align: center;">{{ $index + 1 }}</td>
                <td>{{ $alumno->ci }}</td>
                <td>{{ $alumno->apellido_paterno }}</td>
                <td>{{ $alumno->apellido_materno }}</td>
                <td>{{ $alumno->nombres }}</td>
            </tr>
            @endforeach
            
            @if(count($inscritos) == 0)
            <tr>
                <td colspan="5" style="text-align: center;">No hay alumnos inscritos en este grupo todavía.</td>
            </tr>
            @endif
        </tbody>
    </table>

    <div class="footer">
        Generado el: {{ date('d/m/Y H:i') }}
    </div>

</body>
</html>
