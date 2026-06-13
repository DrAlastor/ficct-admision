import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';

export default function ChartPostulantes({ data, modo, usarPorcentaje }) {
    const d1 = data?.[0];
    const d2 = modo === 'versus' ? data?.[1] : null;

    // ─── Postulantes por Carrera ───
    const carreraChart = useMemo(() => {
        if (!d1?.postulantes?.por_carrera?.length) return null;

        const categorias = d1.postulantes.por_carrera.map(c => c.carrera);
        const valores1 = d1.postulantes.por_carrera.map(c => c.total);
        const total1 = valores1.reduce((a, b) => a + b, 0);

        const series = [{
            name: d1.label,
            data: usarPorcentaje ? valores1.map(v => parseFloat(((v / total1) * 100).toFixed(1))) : valores1,
        }];

        if (d2?.postulantes?.por_carrera?.length) {
            const valores2 = categorias.map(cat => {
                const found = d2.postulantes.por_carrera.find(c => c.carrera === cat);
                return found ? found.total : 0;
            });
            const total2 = valores2.reduce((a, b) => a + b, 0);
            series.push({
                name: d2.label,
                data: usarPorcentaje ? valores2.map(v => total2 > 0 ? parseFloat(((v / total2) * 100).toFixed(1)) : 0) : valores2,
            });
        }

        return {
            options: {
                chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
                plotOptions: { bar: { borderRadius: 8, columnWidth: '55%', distributed: !d2 } },
                colors: d2 ? ['#6366f1', '#f43f5e'] : ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'],
                xaxis: { categories: categorias, labels: { style: { fontSize: '11px', fontWeight: 700 } } },
                yaxis: { title: { text: usarPorcentaje ? 'Porcentaje (%)' : 'Cantidad' }, labels: { style: { fontSize: '11px' } } },
                dataLabels: { enabled: true, style: { fontSize: '11px', fontWeight: 700 }, formatter: (val) => usarPorcentaje ? `${val}%` : val },
                legend: { show: !!d2, position: 'top', fontWeight: 700 },
                tooltip: { y: { formatter: (val) => usarPorcentaje ? `${val}%` : `${val} postulantes` } },
                grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
            },
            series,
        };
    }, [d1, d2, usarPorcentaje]);

    // ─── Postulantes por Sexo ───
    const sexoChart = useMemo(() => {
        if (!d1?.postulantes?.por_sexo) return null;
        const sexoData = d1.postulantes.por_sexo;
        const labels = Object.keys(sexoData).map(s => s === 'M' ? 'Masculino' : s === 'F' ? 'Femenino' : s);
        const values = Object.values(sexoData);

        return {
            options: {
                chart: { type: 'donut', fontFamily: 'Inter, sans-serif' },
                labels,
                colors: ['#6366f1', '#f472b6', '#94a3b8'],
                plotOptions: {
                    pie: {
                        donut: {
                            size: '70%',
                            labels: {
                                show: true,
                                total: { show: true, label: 'Total', fontSize: '14px', fontWeight: 800, color: '#1e293b' },
                            },
                        },
                    },
                },
                legend: { position: 'bottom', fontWeight: 600, fontSize: '12px' },
                dataLabels: {
                    enabled: true,
                    formatter: (val, opts) => {
                        const v = opts.w.config.series[opts.seriesIndex];
                        return usarPorcentaje ? `${val.toFixed(1)}%` : v;
                    },
                },
                tooltip: { y: { formatter: (val) => `${val} postulantes` } },
            },
            series: values,
        };
    }, [d1, usarPorcentaje]);

    // ─── Top 10 Colegios ───
    const colegioChart = useMemo(() => {
        if (!d1?.postulantes?.por_colegio?.length) return null;
        const colegios = d1.postulantes.por_colegio;
        const total = colegios.reduce((a, b) => a + b.total, 0);

        return {
            options: {
                chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
                plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '65%', distributed: true } },
                colors: ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed', '#ddd6fe'],
                xaxis: {
                    categories: colegios.map(c => c.colegio),
                    title: { text: usarPorcentaje ? 'Porcentaje (%)' : 'Cantidad' },
                    labels: { style: { fontSize: '11px' } },
                },
                yaxis: { labels: { style: { fontSize: '11px', fontWeight: 600 } } },
                dataLabels: {
                    enabled: true,
                    formatter: (val) => usarPorcentaje ? `${val}%` : val,
                    style: { fontSize: '11px', fontWeight: 700 },
                },
                legend: { show: false },
                grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
                tooltip: { y: { formatter: (val) => usarPorcentaje ? `${val}%` : `${val} postulantes` } },
            },
            series: [{
                name: 'Postulantes',
                data: usarPorcentaje
                    ? colegios.map(c => parseFloat(((c.total / total) * 100).toFixed(1)))
                    : colegios.map(c => c.total),
            }],
        };
    }, [d1, usarPorcentaje]);

    // ─── Por Ciudad ───
    const ciudadChart = useMemo(() => {
        if (!d1?.postulantes?.por_ciudad?.length) return null;
        const ciudades = d1.postulantes.por_ciudad;

        return {
            options: {
                chart: { type: 'pie', fontFamily: 'Inter, sans-serif' },
                labels: ciudades.map(c => c.ciudad),
                colors: ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#14b8a6', '#f97316'],
                legend: { position: 'bottom', fontWeight: 600, fontSize: '12px' },
                dataLabels: {
                    enabled: true,
                    formatter: (val, opts) => {
                        const v = opts.w.config.series[opts.seriesIndex];
                        return usarPorcentaje ? `${val.toFixed(1)}%` : v;
                    },
                },
                tooltip: { y: { formatter: (val) => `${val} postulantes` } },
            },
            series: ciudades.map(c => c.total),
        };
    }, [d1, usarPorcentaje]);

    if (!d1) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Por Carrera */}
            {carreraChart && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
                        📊 Postulantes por Carrera
                    </h3>
                    <Chart options={carreraChart.options} series={carreraChart.series} type="bar" height={320} />
                </div>
            )}

            {/* Por Sexo */}
            {sexoChart && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
                        👥 Distribución por Sexo
                    </h3>
                    <Chart options={sexoChart.options} series={sexoChart.series} type="donut" height={320} />
                </div>
            )}

            {/* Top 10 Colegios */}
            {colegioChart && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
                        🏫 Top 10 Colegios de Procedencia
                    </h3>
                    <Chart options={colegioChart.options} series={colegioChart.series} type="bar" height={350} />
                </div>
            )}

            {/* Por Ciudad */}
            {ciudadChart && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
                        🌎 Postulantes por Ciudad
                    </h3>
                    <Chart options={ciudadChart.options} series={ciudadChart.series} type="pie" height={320} />
                </div>
            )}
        </div>
    );
}
