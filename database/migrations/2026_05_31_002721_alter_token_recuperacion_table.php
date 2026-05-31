<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE token_recuperacion ALTER COLUMN fecha_creacion TYPE TIMESTAMP');
        DB::statement('ALTER TABLE token_recuperacion ALTER COLUMN fecha_expiracion TYPE TIMESTAMP');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE token_recuperacion ALTER COLUMN fecha_creacion TYPE DATE');
        DB::statement('ALTER TABLE token_recuperacion ALTER COLUMN fecha_expiracion TYPE DATE');
    }
};
