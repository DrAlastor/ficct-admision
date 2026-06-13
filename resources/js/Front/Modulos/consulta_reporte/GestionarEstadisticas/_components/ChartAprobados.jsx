import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';

export default function ChartAprobados({ data, modo, usarPorcentaje }) {
    const d1 = data?.[0];
    const d2 = modo === 'versus' ? data?.[1] : null;

    // ─── Aprobados vs Reprobados (General) ───
    const generalChart = useMemo(() => {
        if (!d1?.notas) return null;

        if (modo === 'versus' && d2) {
            // Barras agrupadas para versus
            const categorias = [d1.label, d2.label];
            const series = [
                { name: 'Aprobados', data: [d1.notas.aprobados, d2.notas.aprobados] },
                { name: 'Reprobados', data: [d1.notas.reprobados, d2.notas.reprobados] },
            ];

            if (usarPorcentaje) {
                const total1 = d1.notas.aprobados + d1.notas.reprobados;
                const total2 = d2.notas.aprobados + d2.notas.reprobados;
                series[0].data = [
                    total1 > 0 ? parseFloat(((d1.notas.aprobados / total1) * 100).toFixed(1)) : 0,
                    total2 > 0 ? parseFloat(((d2.notas.aprobados / total2) * 100).toFixed(1)) : 0,
                ];
                series[1].data = [
                    total1 > 0 ? parseFloat(((d1.notas.reprobados / total1) * 100).toFixed(1)) : 0,
                    total2 > 0 ? parseFloat(((d2.notas.reprobados / total2) * 100).toFixed(1)) : 0,
                ];
            }

            return {
                type: 'bar',
                options: {
                    chart: { type: 'bar', stacked: true, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
                    plotOptions: { bar: { borderRadius: 8, columnWidth: '50%' } },
                    colors: ['#22c55e', '#ef4444'],
                    xaxis: { categories: categorias, labels: { style: { fontSize: '12px', fontWeight: 700 } } },
                    yaxis: { title: { text: usarPorcentaje ? '%' : 'Cantidad' } },
                    legend: { position: 'top', fontWeight: 700 },
                    dataLabels: { enabled: true, formatter: (val) => usarPorcentaje ? `${val}%` : val, style: { fontSize: '11px', fontWeight: 700 } },
                    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
                    tooltip: { y: { formatter: (val) => usarPorcentaje ? `${val}%` : `${val} evaluaciones` } },
                },
                series,
            };
        }

        // Modo individual: radialBar
        const total = d1.notas.aprobados + d1.notas.reprobados;
        const pctAprobados = total > 0 ? parseFloat(((d1.notas.aprobados / total) * 100).toFixed(1)) : 0;
        const pctReprobados = total > 0 ? parseFloat(((d1.notas.reprobados / total) * 100).toFixed(1)) : 0;

        return {
            type: 'radialBar',
            options: {
                chart: { type: 'radialBar', fontFamily: 'Inter, sans-serif' },
                plotOptions: {
                    radialBar: {
                        hollow: { size: '50%' },
                        track: { background: '#f1f5f9' },
                        dataLabels: {
                            name: { fontSize: '13px', fontWeight: 700 },
                            value: {
                                fontSize: '24px',
                                fontWeight: 800,
                                formatter: (val) => usarPorcentaje ? `${val}%` : Math.round((val / 100) * total),
                            },
                            total: {
                                show: true,
                                label: 'Total Evaluaciones',
                                fontSize: '11px',
                                fontWeight: 600,
                                formatter: () => total,
                            },
                        },
                    },
                },
                labels: ['Aprobados', 'Reprobados'],
                colors: ['#22c55e', '#ef4444'],
                legend: { show: true, position: 'bottom', fontWeight: 700 },
            },
            series: [pctAprobados, pctReprobados],
        };
    }, [d1, d2, modo, usarPorcentaje]);

    // ─── Aprobados/Reprobados por Materia ───
    const materiaChart = useMemo(() => {
        if (!d1?.notas?.aprobados_por_materia?.length) return null;

        const materias = d1.notas.aprobados_por_materia;
        const categorias = materias.map(m => m.materia);

        const series = [
            { name: 'Aprobados', data: materias.map(m => parseInt(m.aprobados)) },
            { name: 'Reprobados', data: materias.map(m => parseInt(m.reprobados)) },
        ];

        if (usarPorcentaje) {
            series[0].data = materias.map(m => {
                const t = parseInt(m.aprobados) + parseInt(m.reprobados);
                return t > 0 ? parseFloat(((parseInt(m.aprobados) / t) * 100).toFixed(1)) : 0;
            });
            series[1].data = materias.map(m => {
                const t = parseInt(m.aprobados) + parseInt(m.reprobados);
                return t > 0 ? parseFloat(((parseInt(m.reprobados) / t) * 100).toFixed(1)) : 0;
            });
        }

        return {
            options: {
                chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
                plotOptions: { bar: { horizontal: false, borderRadius: 6, columnWidth: '55%' } },
                colors: ['#22c55e', '#ef4444'],
                xaxis: { categories: categorias, labels: { style: { fontSize: '11px', fontWeight: 700 } } },
                yaxis: { title: { text: usarPorcentaje ? '%' : 'Cantidad' } },
                legend: { position: 'top', fontWeight: 700 },
                dataLabels: { enabled: true, formatter: (val) => usarPorcentaje ? `${val}%` : val, style: { fontSize: '10px' } },
                grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
                tooltip: { y: { formatter: (val) => usarPorcentaje ? `${val}%` : val } },
            },
            series,
        };
    }, [d1, usarPorcentaje]);

    if (!d1) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General */}
            {generalChart && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
                        ✅ Aprobados vs Reprobados {modo === 'versus' ? '(Comparativa)' : '(General)'}
                    </h3>
                    <Chart options={generalChart.options} series={generalChart.series} type={generalChart.type} height={340} />
                </div>
            )}

            {/* Por Materia */}
            {materiaChart && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
                        📚 Aprobados/Reprobados por Materia
                    </h3>
                    <Chart options={materiaChart.options} series={materiaChart.series} type="bar" height={340} />
                </div>
            )}
        </div>
    );
}
