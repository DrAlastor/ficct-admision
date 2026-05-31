<?php

use Backend\Modulo1_Seguridad\Controllers\Auth\AuthenticatedSessionController;
use Backend\Modulo1_Seguridad\Controllers\Auth\ConfirmablePasswordController;
use Backend\Modulo1_Seguridad\Controllers\Auth\EmailVerificationNotificationController;
use Backend\Modulo1_Seguridad\Controllers\Auth\EmailVerificationPromptController;
use Backend\Modulo1_Seguridad\Controllers\Auth\NewPasswordController;
use Backend\Modulo1_Seguridad\Controllers\Auth\PasswordController;
use Backend\Modulo1_Seguridad\Controllers\Auth\PasswordResetLinkController;
use Backend\Modulo1_Seguridad\Controllers\Auth\RegisteredUserController;
use Backend\Modulo1_Seguridad\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])
        ->name('register');

    Route::post('register', [RegisteredUserController::class, 'store']);

    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    Route::get('forgot-password', [\Backend\Modulo1_Seguridad\Controllers\Auth\PasswordResetController::class, 'create'])
        ->name('password.request');

    Route::post('forgot-password', [\Backend\Modulo1_Seguridad\Controllers\Auth\PasswordResetController::class, 'store'])
        ->name('password.email');

    Route::get('login-with-token', [\Backend\Modulo1_Seguridad\Controllers\Auth\PasswordResetController::class, 'showTokenForm'])
        ->name('password.token.view');

    Route::post('login-with-token', [\Backend\Modulo1_Seguridad\Controllers\Auth\PasswordResetController::class, 'verifyToken'])
        ->name('password.token.verify');
});

Route::middleware('auth')->group(function () {
    Route::get('verify-email', EmailVerificationPromptController::class)
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
        ->name('password.confirm');

    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);

    Route::put('password', [PasswordController::class, 'update'])->name('password.update');

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});
