<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    $pdf = Barryvdh\DomPDF\Facade\Pdf::loadHTML('<h1>Test</h1>');
    $output = $pdf->output();
    file_put_contents('test.pdf', $output);
    echo "PDF generado correctamente.\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
