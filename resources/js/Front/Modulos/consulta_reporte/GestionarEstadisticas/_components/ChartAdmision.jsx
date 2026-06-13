import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';

export default function ChartAdmision({ data, modo, usarPorcentaje }) {
    const d1 = data?.[0];
    const d2 = modo === 'versus' ? data?.[1] : null;

    // ─── Estados de Admisión (Treemap/Pie) ───
    const estadosChart = useMemo(() => {
        if (!d1?.admision?.estados?.length) return null;

        const estados = d1.admision.estados;
        const colorMap = {
            'Habilitado': '#3b82f6',
            'Reprobado': '#ef4444',
            'Rechazado (Sin Cupo)': '#f97316',
            'Evaluando': '#eab308',
        };

        // Cualquier estado que empiece con "Aceptado" -> verde
        const labels = estados.map(e => {
            if (e.estado.startsWith('Aceptado')) return 'Aceptados';
            return e.estado;
        });

        // Agrupar Aceptados
        const agrupado = {};
        estados.forEach(e => {
            const key = e.estado.startsWith('Aceptado') ? 'Aceptados' : e.estado;
            agrupado[key] = (agrupado[key] || 0) + e.total;
        });

        const finalLabels = Object.keys(agrupado);
        const finalValues = Object.values(agrupado);
        const colors = finalLabels.map(l => {
            if (l === 'Aceptados') return '#22c55e';
            return colorMap[l] || '#94a3b8';
        });

        return {
            options: {
                chart: { type: 'donut', fontFamily: 'Inter, sans-serif' },
                labels: finalLabels,
                colors,
                plotOptions: {
                    pie: {
                        donut: {
                            size: '68%',
                            labels: {
                                show: true,
                                total: { show: true, label: 'Total', fontSize: '14px', fontWeight: 800 },
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
            series: finalValues,
        };
    }, [d1, usarPorcentaje]);

    // ─── Versus: Comparativa de admisión entre gestiones ───
    const versusChart = useMemo(() => {
        if (!d1 || !d2) return null;

        const getAdmisionCounts = (gestion) => {
            if (!gestion?.admision?.estados) return { aceptados: 0, reprobados: 0, rechazados: 0, otros: 0, total: 0 };
            
            let aceptados = 0, reprobados = 0, rechazados = 0, otros = 0;
            gestion.admision.estados.forEach(e => {
                if (e.estado.startsWith('Aceptado')) aceptados += e.total;
                else if (e.estado === 'Reprobado') reprobados += e.total;
                else if (e.estado === 'Rechazado (Sin Cupo)') rechazados += e.total;
                else otros += e.total;
            });
            return { aceptados, reprobados, rechazados, otros, total: aceptados + reprobados + rechazados + otros };
        };

        const c1 = getAdmisionCounts(d1);
        const c2 = getAdmisionCounts(d2);

        const categorias = [d1.label, d2.label];

        const series = usarPorcentaje
            ? [
                { name: 'Aceptados', data: [
                    c1.total > 0 ? parseFloat(((c1.aceptados / c1.total) * 100).toFixed(1)) : 0,
                    c2.total > 0 ? parseFloat(((c2.aceptados / c2.total) * 100).toFixed(1)) : 0,
                ]},
                { name: 'Reprobados', data: [
                    c1.total > 0 ? parseFloat(((c1.reprobados / c1.total) * 100).toFixed(1)) : 0,
                    c2.total > 0 ? parseFloat(((c2.reprobados / c2.total) * 100).toFixed(1)) : 0,
                ]},
                { name: 'Rechazados', data: [
                    c1.total > 0 ? parseFloat(((c1.rechazados / c1.total) * 100).toFixed(1)) : 0,
                    c2.total > 0 ? parseFloat(((c2.rechazados / c2.total) * 100).toFixed(1)) : 0,
                ]},
            ]
            : [
                { name: 'Aceptados', data: [c1.aceptados, c2.aceptados] },
                { name: 'Reprobados', data: [c1.reprobados, c2.reprobados] },
                { name: 'Rechazados', data: [c1.rechazados, c2.rechazados] },
            ];

        return {
            options: {
                chart: { type: 'bar', stacked: false, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
                plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
                colors: ['#22c55e', '#ef4444', '#f97316'],
                xaxis: { categories: categorias, labels: { style: { fontSize: '13px', fontWeight: 700 } } },
                yaxis: { title: { text: usarPorcentaje ? '%' : 'Cantidad' } },
                legend: { position: 'top', fontWeight: 700 },
                dataLabels: { enabled: true, formatter: (val) => usarPorcentaje ? `${val}%` : val, style: { fontSize: '11px', fontWeight: 700 } },
                grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
            },
            series,
        };
    }, [d1, d2, usarPorcentaje]);

    // ─── Admitidos por Carrera ───
    const admitidosCarreraChart = useMemo(() => {
        if (!d1?.admision?.admitidos_por_carrera?.length) return null;

        const admitidos = d1.admision.admitidos_por_carrera;
        // Parse "Aceptado: Ingeniería Informática" -> carrera name
        const parsed = admitidos.map(a => ({
            carrera: a.estado.replace('Aceptado: ', ''),
            total: a.total,
        }));

        const total = parsed.reduce((a, b) => a + b.total, 0);

        return {
            options: {
                chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
                plotOptions: { bar: { borderRadius: 8, columnWidth: '55%', distributed: true } },
                colors: ['#22c55e', '#10b981', '#059669', '#047857', '#065f46'],
                xaxis: {
                    categories: parsed.map(p => p.carrera),
                    labels: { style: { fontSize: '10px', fontWeight: 600 }, rotate: -30 },
                },
                yaxis: { title: { text: usarPorcentaje ? '%' : 'Admitidos' } },
                dataLabels: {
                    enabled: true,
                    formatter: (val) => usarPorcentaje ? `${val}%` : val,
                    style: { fontSize: '11px', fontWeight: 700 },
                },
                legend: { show: false },
                grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
            },
            series: [{
                name: 'Admitidos',
                data: usarPorcentaje
                    ? parsed.map(p => total > 0 ? parseFloat(((p.total / total) * 100).toFixed(1)) : 0)
                    : parsed.map(p => p.total),
            }],
        };
    }, [d1, usarPorcentaje]);

    // ─── Pagos por Método ───
    const pagosChart = useMemo(() => {
        if (!d1?.pagos?.por_metodo?.length) return null;

        const metodos = d1.pagos.por_metodo;
        const labels = metodos.map(m => m.metodo_pago);
        const values = metodos.map(m => m.cantidad);

        return {
            options: {
                chart: { type: 'pie', fontFamily: 'Inter, sans-serif' },
                labels,
                colors: ['#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#8b5cf6'],
                legend: { position: 'bottom', fontWeight: 600, fontSize: '12px' },
                dataLabels: {
                    enabled: true,
                    formatter: (val, opts) => {
                        const v = opts.w.config.series[opts.seriesIndex];
                        return usarPorcentaje ? `${val.toFixed(1)}%` : v;
                    },
                },
                tooltip: {
                    y: {
                        formatter: (val, opts) => {
                            const m = metodos[opts.seriesIndex];
                            return `${val} pagos (Bs ${parseFloat(m?.total_monto || 0).toLocaleString('es-BO')})`;
                        },
                    },
                },
            },
            series: values,
        };
    }, [d1, usarPorcentaje]);

    if (!d1) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Estados de Admisión */}
            {estadosChart && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
                        🎓 Estados de Admisión
                    </h3>
                    <Chart options={estadosChart.options} series={estadosChart.series} type="donut" height={340} />
                </div>
            )}

            {/* Versus comparativa */}
            {versusChart && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
                        ⚔️ Comparativa de Admisión
                    </h3>
                    <Chart options={versusChart.options} series={versusChart.series} type="bar" height={340} />
                </div>
            )}

            {/* Admitidos por Carrera */}
            {admitidosCarreraChart && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
                        🏛️ Admitidos por Carrera
                    </h3>
                    <Chart options={admitidosCarreraChart.options} series={admitidosCarreraChart.series} type="bar" height={340} />
                </div>
            )}

            {/* Pagos por Método */}
            {pagosChart && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
                        💰 Distribución de Pagos por Método
                    </h3>
                    <Chart options={pagosChart.options} series={pagosChart.series} type="pie" height={340} />
                </div>
            )}
        </div>
    );
}
