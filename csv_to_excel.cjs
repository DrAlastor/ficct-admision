const XLSX = require('xlsx');
const fs = require('fs');

try {
    console.log("Leyendo archivo CSV...");
    const workbook = XLSX.readFile('estadisticas_nuevas_100.csv', { type: 'file' });
    
    console.log("Escribiendo archivo Excel...");
    XLSX.writeFile(workbook, 'estadisticas_nuevas_100_v2.xlsx');
    
    console.log("¡Archivo estadisticas_nuevas_100_v2.xlsx generado exitosamente!");
} catch (error) {
    console.error("Error convirtiendo a Excel:", error.message);
}
