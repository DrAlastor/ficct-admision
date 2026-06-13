import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';

export default function ChartNotas({ data, modo, usarPorcentaje }) {
    const d1 = data?.[0];
    const d2 = modo === 'versus' ? data?.[1] : null;

    // ─── Radar: Promedios por Materia ───
    const radarChart = useMemo(() => {
        if (!d1?.notas?.promedios_por_materia?.length) return null;

        const categorias = d1.notas.promedios_por_materia.map(m => m.materia);
        const series = [{
            name: d1.label,
            data: d1.notas.promedios_por_materia.map(m => parseFloat(m.promedio)),
        }];

        if (d2?.notas?.promedios_por_materia?.length) {
            series.push({
                name: d2.label,
                data: categorias.map(cat => {
                    const found = d2.notas.promedios_por_materia.find(m => m.materia === cat);
                    return found ? parseFloat(found.promedio) : 0;
                }),
            });
        }

        return {
            options: {
                chart: { type: 'radar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
                xaxis: { categories: categorias },
                yaxis: { max: 100, min: 0, tickAmount: 5 },
                colors: ['#6366f1', '#f43f5e'],
                stroke: { width: 2 },
                fill: { opacity: 0.15 },
                markers: { size: 4, hover: { size: 6 } },
                legend: { show: !!d2, position: 'top', fontWeight: 700 },
                plotOptions: { radar: { polygons: { strokeColors: '#e2e8f0', connectorColors: '#e2e8f0', fill: { colors: ['#f8fafc', '#fff'] } } } },
            },
            series,
        };
    }, [d1, d2]);

    // ─── Distribución de Notas (Histograma) ───
    const distribucionChart = useMemo(() => {
        if (!d1?.notas?.distribucion) return null;

        const dist = d1.notas.distribucion;
        const categorias = Object.keys(dist);
        const valores1 = Object.values(dist);
        const total1 = valores1.reduce((a, b) => a + b, 0);

        const series = [{
            name: d1.label,
            data: usarPorcentaje ? valores1.map(v => total1 > 0 ? parseFloat(((v / total1) * 100).toFixed(1)) : 0) : valores1,
        }];

        if (d2?.notas?.distribucion) {
            const valores2 = categorias.map(k => d2.notas.distribucion[k] || 0);
            const total2 = valores2.reduce((a, b) => a + b, 0);
            series.push({
                name: d2.label,
                data: usarPorcentaje ? valores2.map(v => total2 > 0 ? parseFloat(((v / total2) * 100).toFixed(1)) : 0) : valores2,
            });
        }

        return {
            options: {
                chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
                plotOptions: { bar: { borderRadius: 6, columnWidth: '60%' } },
                colors: d2 ? ['#6366f1', '#f43f5e'] : ['#6366f1'],
                xaxis: {
                    categories: categorias,
                    title: { text: 'Rango de Notas' },
                    labels: { style: { fontSize: '11px', fontWeight: 700 } },
                },
                yaxis: { title: { text: usarPorcentaje ? '%' : 'Cantidad' }, labels: { style: { fontSize: '11px' } } },
                dataLabels: { enabled: true, formatter: (val) => usarPorcentaje ? `${val}%` : val, style: { fontSize: '10px', fontWeight: 700 } },
                legend: { show: !!d2, position: 'top', fontWeight: 700 },
                grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
                annotations: {
                    xaxis: [{
                        x: '40-51', x2: '40-51',
                        borderColor: '#ef4444',
                        label: { text: '← Reprobado | Aprobado →', style: { color: '#ef4444', fontSize: '10px', fontWeight: 700 } }
                    }]
                },
                tooltip: { y: { formatter: (val) => usarPorcentaje ? `${val}%` : `${val} evaluaciones` } },
            },
            series,
        };
    }, [d1, d2, usarPorcentaje]);

    // ─── Heatmap por materia (notas max/min/promedio) ───
    const heatmapChart = useMemo(() => {
        if (!d1?.notas?.promedios_por_materia?.length) return null;

        const materias = d1.notas.promedios_por_materia;

        const series = [
            {
                name: 'Nota Máxima',
                data: materias.map(m => ({
                    x: m.materia,
                    y: parseFloat(m.max_nota || 0),
                })),
            },
            {
                name: 'Promedio',
                data: materias.map(m => ({
                    x: m.materia,
                    y: parseFloat(m.promedio || 0),
                })),
            },
            {
                name: 'Nota Mínima',
                data: materias.map(m => ({
                    x: m.materia,
                    y: parseFloat(m.min_nota || 0),
                })),
            },
        ];

        return {
            options: {
                chart: { type: 'heatmap', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
                plotOptions: {
                    heatmap: {
                        radius: 8,
                        colorScale: {
                            ranges: [
                                { from: 0, to: 30, color: '#ef4444', name: 'Muy Bajo' },
                                { from: 31, to: 50, color: '#f97316', name: 'Bajo' },
                                { from: 51, to: 65, color: '#eab308', name: 'Regular' },
                                { from: 66, to: 80, color: '#22c55e', name: 'Bueno' },
                                { from: 81, to: 100, color: '#6366f1', name: 'Excelente' },
                            ],
                        },
                    },
                },
                dataLabels: { enabled: true, style: { fontSize: '12px', fontWeight: 800, colors: ['#fff'] } },
                legend: { show: true, position: 'top' },
                xaxis: { labels: { style: { fontSize: '11px', fontWeight: 600 } } },
            },
            series,
        };
    }, [d1]);

    if (!d1) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar */}
            {radarChart && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
                        🎯 Promedio por Materia
                    </h3>
                    <Chart options={radarChart.options} series={radarChart.series} type="radar" height={340} />
                </div>
            )}

            {/* Distribución */}
            {distribucionChart && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
                        📈 Distribución de Notas
                    </h3>
                    <Chart options={distribucionChart.options} series={distribucionChart.series} type="bar" height={340} />
                </div>
            )}

            {/* Heatmap */}
            {heatmapChart && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:col-span-2">
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
                        🔥 Mapa de Calor — Rendimiento por Materia
                    </h3>
                    <Chart options={heatmapChart.options} series={heatmapChart.series} type="heatmap" height={220} />
                </div>
            )}
        </div>
    );
}
