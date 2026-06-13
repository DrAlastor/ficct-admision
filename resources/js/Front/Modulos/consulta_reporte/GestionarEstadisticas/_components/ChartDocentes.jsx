import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';

export default function ChartDocentes({ data, modo, usarPorcentaje }) {
    const d1 = data?.[0];
    const d2 = modo === 'versus' ? data?.[1] : null;

    // ─── Horas por Docente ───
    const horasChart = useMemo(() => {
        if (!d1?.docentes?.horas?.length) return null;

        const docs = d1.docentes.horas;
        const nombres = docs.map(d => `${d.nombres} ${d.apellido_paterno}`);
        const horas = docs.map(d => parseFloat(parseFloat(d.total_horas).toFixed(1)));

        return {
            options: {
                chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
                plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '60%', distributed: true } },
                colors: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#6366f1', '#818cf8', '#4f46e5', '#7c3aed', '#9333ea'],
                xaxis: {
                    categories: nombres,
                    title: { text: 'Horas Semanales' },
                    labels: { style: { fontSize: '11px' } },
                },
                yaxis: { labels: { style: { fontSize: '11px', fontWeight: 600 } } },
                dataLabels: { enabled: true, formatter: (val) => `${val}h`, style: { fontSize: '11px', fontWeight: 700 } },
                legend: { show: false },
                grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
                tooltip: { y: { formatter: (val) => `${val} horas` } },
            },
            series: [{ name: 'Horas', data: horas }],
        };
    }, [d1]);

    // ─── Asistencias de Docentes ───
    const asistDocChart = useMemo(() => {
        if (!d1?.docentes?.asistencias_docente?.length) return null;

        const docs = d1.docentes.asistencias_docente;
        const nombres = docs.map(d => `${d.nombres} ${d.apellido_paterno}`);
        const totalSesiones = docs.map(d => parseInt(d.total_sesiones));
        const asistencias = docs.map(d => parseInt(d.asistencias));
        const inasistencias = docs.map(d => parseInt(d.inasistencias));

        const series = usarPorcentaje
            ? [
                { name: 'Presente', data: docs.map(d => {
                    const t = parseInt(d.total_sesiones);
                    return t > 0 ? parseFloat(((parseInt(d.asistencias) / t) * 100).toFixed(1)) : 0;
                }) },
                { name: 'Ausente', data: docs.map(d => {
                    const t = parseInt(d.total_sesiones);
                    return t > 0 ? parseFloat(((parseInt(d.inasistencias) / t) * 100).toFixed(1)) : 0;
                }) },
            ]
            : [
                { name: 'Presente', data: asistencias },
                { name: 'Ausente', data: inasistencias },
            ];

        return {
            options: {
                chart: { type: 'bar', stacked: true, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
                plotOptions: { bar: { horizontal: false, borderRadius: 6, columnWidth: '55%' } },
                colors: ['#22c55e', '#ef4444'],
                xaxis: { categories: nombres, labels: { style: { fontSize: '10px', fontWeight: 600 }, rotate: -45 } },
                yaxis: { title: { text: usarPorcentaje ? '%' : 'Sesiones' } },
                legend: { position: 'top', fontWeight: 700 },
                dataLabels: { enabled: true, formatter: (val) => usarPorcentaje ? `${val}%` : val, style: { fontSize: '10px' } },
                grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
                tooltip: { y: { formatter: (val) => usarPorcentaje ? `${val}%` : `${val} sesiones` } },
            },
            series,
        };
    }, [d1, usarPorcentaje]);

    // ─── Asistencias de Postulantes (Top 10 mejores y peores) ───
    const asistPostChart = useMemo(() => {
        if (!d1?.docentes?.asistencias_postulante?.length) return null;

        const todos = d1.docentes.asistencias_postulante.map(p => ({
            nombre: `${p.nombres} ${p.apellido_paterno}`,
            presentes: parseInt(p.presentes),
            faltas: parseInt(p.faltas),
            total: parseInt(p.total_registros),
            tasa: parseInt(p.total_registros) > 0
                ? parseFloat(((parseInt(p.presentes) / parseInt(p.total_registros)) * 100).toFixed(1))
                : 0,
        }));

        // Top 10 con mejor asistencia
        const mejores = [...todos].sort((a, b) => b.tasa - a.tasa).slice(0, 10);

        return {
            options: {
                chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
                plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '60%', distributed: true } },
                colors: ['#22c55e', '#16a34a', '#15803d', '#4ade80', '#86efac', '#34d399', '#10b981', '#059669', '#047857', '#065f46'],
                xaxis: {
                    max: 100,
                    title: { text: '% Asistencia' },
                    labels: { style: { fontSize: '11px' } },
                },
                yaxis: {
                    categories: mejores.map(m => m.nombre),
                    labels: { style: { fontSize: '10px', fontWeight: 600 } },
                },
                dataLabels: { enabled: true, formatter: (val) => `${val}%`, style: { fontSize: '10px', fontWeight: 700 } },
                legend: { show: false },
                grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
            },
            series: [{ name: '% Asistencia', data: mejores.map(m => m.tasa) }],
        };
    }, [d1]);

    // ─── Grupos por Docente ───
    const gruposDocChart = useMemo(() => {
        if (!d1?.docentes?.listado?.length) return null;

        const docs = d1.docentes.listado;
        const nombres = docs.map(d => `${d.nombres} ${d.apellido_paterno}`);
        const gruposTotales = docs.map(d => parseInt(d.total_grupos));

        return {
            options: {
                chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
                plotOptions: { bar: { borderRadius: 8, columnWidth: '50%', distributed: true } },
                colors: ['#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'],
                xaxis: { categories: nombres, labels: { style: { fontSize: '11px', fontWeight: 700 } } },
                yaxis: { title: { text: 'Grupos Asignados' }, labels: { style: { fontSize: '11px' } } },
                dataLabels: { enabled: true, style: { fontSize: '12px', fontWeight: 700 } },
                legend: { show: false },
                grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
            },
            series: [{ name: 'Grupos', data: gruposTotales }],
        };
    }, [d1]);

    if (!d1) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Horas por Docente */}
            {horasChart && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
                        ⏱️ Carga Horaria por Docente
                    </h3>
                    <Chart options={horasChart.options} series={horasChart.series} type="bar" height={300} />
                </div>
            )}

            {/* Grupos por Docente */}
            {gruposDocChart && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
                        👨‍🏫 Grupos Asignados por Docente
                    </h3>
                    <Chart options={gruposDocChart.options} series={gruposDocChart.series} type="bar" height={300} />
                </div>
            )}

            {/* Asistencias Docentes */}
            {asistDocChart && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
                        📋 Asistencia de Docentes
                    </h3>
                    <Chart options={asistDocChart.options} series={asistDocChart.series} type="bar" height={300} />
                </div>
            )}

            {/* Asistencias Postulantes */}
            {asistPostChart && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
                        🎓 Top 10 Asistencia de Postulantes
                    </h3>
                    <Chart options={asistPostChart.options} series={asistPostChart.series} type="bar" height={350} />
                </div>
            )}
        </div>
    );
}
