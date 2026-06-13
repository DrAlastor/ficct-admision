import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';

export default function ChartGrupos({ data, modo, usarPorcentaje }) {
    const d1 = data?.[0];
    const d2 = modo === 'versus' ? data?.[1] : null;

    // ─── Promedio por Grupo (agrupado por nombre de grupo) ───
    const promedioGrupoChart = useMemo(() => {
        if (!d1?.grupos?.length) return null;

        // Agrupar por nombre de grupo y calcular promedio general
        const grupoMap = {};
        d1.grupos.forEach(g => {
            if (!grupoMap[g.grupo]) grupoMap[g.grupo] = { promedios: [], aprobados: 0, reprobados: 0, total: 0 };
            grupoMap[g.grupo].promedios.push(parseFloat(g.promedio));
            grupoMap[g.grupo].aprobados += parseInt(g.aprobados);
            grupoMap[g.grupo].reprobados += parseInt(g.reprobados);
            grupoMap[g.grupo].total += parseInt(g.total_inscritos);
        });

        const nombres = Object.keys(grupoMap);
        const promedios = nombres.map(n => {
            const p = grupoMap[n].promedios;
            return parseFloat((p.reduce((a, b) => a + b, 0) / p.length).toFixed(2));
        });

        const series = [{
            name: d1.label,
            data: promedios,
        }];

        if (d2?.grupos?.length) {
            const grupoMap2 = {};
            d2.grupos.forEach(g => {
                if (!grupoMap2[g.grupo]) grupoMap2[g.grupo] = { promedios: [] };
                grupoMap2[g.grupo].promedios.push(parseFloat(g.promedio));
            });

            series.push({
                name: d2.label,
                data: nombres.map(n => {
                    const g2 = grupoMap2[n];
                    if (!g2) return 0;
                    const p = g2.promedios;
                    return parseFloat((p.reduce((a, b) => a + b, 0) / p.length).toFixed(2));
                }),
            });
        }

        return {
            options: {
                chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
                plotOptions: { bar: { borderRadius: 8, columnWidth: '55%', distributed: !d2 } },
                colors: d2 ? ['#6366f1', '#f43f5e'] : ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'],
                xaxis: { categories: nombres, labels: { style: { fontSize: '12px', fontWeight: 700 } } },
                yaxis: { max: 100, title: { text: 'Promedio' }, labels: { style: { fontSize: '11px' } } },
                dataLabels: { enabled: true, style: { fontSize: '11px', fontWeight: 700 } },
                legend: { show: !!d2, position: 'top', fontWeight: 700 },
                grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
                annotations: {
                    yaxis: [{
                        y: 51,
                        borderColor: '#ef4444',
                        strokeDashArray: 4,
                        label: { text: 'Mínimo aprobación (51)', style: { color: '#ef4444', fontSize: '10px', fontWeight: 700 }, position: 'front' }
                    }]
                },
            },
            series,
        };
    }, [d1, d2]);

    // ─── Aprobados/Reprobados por Grupo ───
    const aprobReprobGrupoChart = useMemo(() => {
        if (!d1?.grupos?.length) return null;

        const grupoMap = {};
        d1.grupos.forEach(g => {
            if (!grupoMap[g.grupo]) grupoMap[g.grupo] = { aprobados: 0, reprobados: 0 };
            grupoMap[g.grupo].aprobados += parseInt(g.aprobados);
            grupoMap[g.grupo].reprobados += parseInt(g.reprobados);
        });

        const nombres = Object.keys(grupoMap);

        const series = [
            { name: 'Aprobados', data: nombres.map(n => {
                const g = grupoMap[n];
                const total = g.aprobados + g.reprobados;
                return usarPorcentaje ? (total > 0 ? parseFloat(((g.aprobados / total) * 100).toFixed(1)) : 0) : g.aprobados;
            }) },
            { name: 'Reprobados', data: nombres.map(n => {
                const g = grupoMap[n];
                const total = g.aprobados + g.reprobados;
                return usarPorcentaje ? (total > 0 ? parseFloat(((g.reprobados / total) * 100).toFixed(1)) : 0) : g.reprobados;
            }) },
        ];

        return {
            options: {
                chart: { type: 'bar', stacked: true, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
                plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
                colors: ['#22c55e', '#ef4444'],
                xaxis: { categories: nombres, labels: { style: { fontSize: '12px', fontWeight: 700 } } },
                yaxis: { title: { text: usarPorcentaje ? '%' : 'Cantidad' } },
                legend: { position: 'top', fontWeight: 700 },
                dataLabels: { enabled: true, formatter: (val) => usarPorcentaje ? `${val}%` : val, style: { fontSize: '10px' } },
                grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
                tooltip: { y: { formatter: (val) => usarPorcentaje ? `${val}%` : val } },
            },
            series,
        };
    }, [d1, usarPorcentaje]);

    // ─── Rendimiento por Grupo y Materia (Radar) ───
    const radarGrupoChart = useMemo(() => {
        if (!d1?.grupos?.length) return null;

        // Obtener nombres de grupo únicos
        const gruposUnicos = [...new Set(d1.grupos.map(g => g.grupo))];
        const materiasUnicas = [...new Set(d1.grupos.map(g => g.materia))];

        if (gruposUnicos.length === 0 || materiasUnicas.length === 0) return null;

        const series = gruposUnicos.map(nombre => ({
            name: nombre,
            data: materiasUnicas.map(mat => {
                const found = d1.grupos.find(g => g.grupo === nombre && g.materia === mat);
                return found ? parseFloat(found.promedio) : 0;
            }),
        }));

        return {
            options: {
                chart: { type: 'radar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
                xaxis: { categories: materiasUnicas },
                yaxis: { max: 100, min: 0, tickAmount: 5 },
                colors: ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6'],
                stroke: { width: 2 },
                fill: { opacity: 0.1 },
                markers: { size: 3 },
                legend: { position: 'top', fontWeight: 700 },
                plotOptions: { radar: { polygons: { strokeColors: '#e2e8f0', fill: { colors: ['#f8fafc', '#fff'] } } } },
            },
            series,
        };
    }, [d1]);

    if (!d1) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Promedio por Grupo */}
            {promedioGrupoChart && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
                        🏆 Promedio General por Grupo
                    </h3>
                    <Chart options={promedioGrupoChart.options} series={promedioGrupoChart.series} type="bar" height={340} />
                </div>
            )}

            {/* Aprobados/Reprobados por Grupo */}
            {aprobReprobGrupoChart && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
                        📊 Aprobados/Reprobados por Grupo
                    </h3>
                    <Chart options={aprobReprobGrupoChart.options} series={aprobReprobGrupoChart.series} type="bar" height={340} />
                </div>
            )}

            {/* Radar por Grupo y Materia */}
            {radarGrupoChart && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:col-span-2">
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
                        🎯 Rendimiento Comparativo de Grupos por Materia
                    </h3>
                    <Chart options={radarGrupoChart.options} series={radarGrupoChart.series} type="radar" height={380} />
                </div>
            )}
        </div>
    );
}
