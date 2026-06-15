<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Pagos</title>
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
        <p>Reporte Oficial de Pagos</p>
    </div>

    <div class="info-box">
        <strong>Gestión:</strong> {{ $gestion->semestre }}-{{ $gestion->anio }} <br>
        <strong>Total Pagos Registrados:</strong> {{ count($pagos) }} <br>
        <strong>Total Recaudado:</strong> {{ number_format((float)$totalRecaudado, 2, '.', '') }} Bs.
    </div>

    <table>
        <thead>
            <tr>
                <th width="5%">Nro</th>
                <th width="15%">Nro. Recibo</th>
                <th width="30%">Postulante</th>
                <th width="15%">Método</th>
                <th width="15%">Fecha</th>
                <th width="20%" style="text-align: right;">Monto</th>
            </tr>
        </thead>
        <tbody>
            @foreach($pagos as $index => $pago)
            <tr>
                <td style="text-align: center;">{{ $index + 1 }}</td>
                <td>{{ $pago->nro_recibo }}</td>
                <td>{{ $pago->nombre_completo }}</td>
                <td>{{ $pago->metodo_pago }}</td>
                <td>{{ $pago->fecha }}</td>
                <td style="text-align: right;">{{ number_format((float)$pago->monto, 2, '.', '') }} Bs.</td>
            </tr>
            @endforeach
            
            @if(count($pagos) == 0)
            <tr>
                <td colspan="6" style="text-align: center;">No hay pagos registrados para esta gestión.</td>
            </tr>
            @endif
        </tbody>
    </table>

    <div class="footer">
        Generado el: {{ date('d/m/Y H:i') }}
    </div>

</body>
</html>
