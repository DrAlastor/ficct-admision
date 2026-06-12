<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

\Stripe\Stripe::setApiKey(env('STRIPE_SECRET'));

try {
    $pi = \Stripe\PaymentIntent::create([
        'amount' => 70000,
        'currency' => 'usd', // try USD first
        'metadata' => [
            'postulacion_codigo' => 123
        ],
    ]);
    echo 'SUCCESS_USD: ' . $pi->client_secret . "\n";
} catch (\Throwable $e) {
    echo 'ERROR_USD: ' . $e->getMessage() . "\n";
}

try {
    $pi2 = \Stripe\PaymentIntent::create([
        'amount' => 70000,
        'currency' => 'bob', // try BOB
        'metadata' => [
            'postulacion_codigo' => 123
        ],
    ]);
    echo 'SUCCESS_BOB: ' . $pi2->client_secret . "\n";
} catch (\Throwable $e) {
    echo 'ERROR_BOB: ' . $e->getMessage() . "\n";
}
