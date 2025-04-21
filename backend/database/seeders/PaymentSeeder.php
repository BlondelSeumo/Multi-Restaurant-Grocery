<?php

namespace Database\Seeders;

use App\Models\Payment;
use App\Traits\Loggable;
use Illuminate\Database\Seeder;
use Throwable;

class PaymentSeeder extends Seeder
{
    use Loggable;

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        $payments = [
            ['tag' => 'cash',                    'input' => 1],
            ['tag' => 'wallet',                  'input' => 2],
            ['tag' => Payment::TAG_PAY_TABS,     'input' => 3],
            ['tag' => Payment::TAG_FLUTTER_WAVE, 'input' => 4],
            ['tag' => Payment::TAG_PAY_STACK,    'input' => 5],
            ['tag' => Payment::TAG_MERCADO_PAGO, 'input' => 6],
            ['tag' => Payment::TAG_RAZOR_PAY,    'input' => 7],
            ['tag' => Payment::TAG_STRIPE,       'input' => 8],
            ['tag' => Payment::TAG_PAY_PAL,      'input' => 9],
            ['tag' => Payment::TAG_MAKSEKESKUS,  'input' => 10],
        ];

        foreach ($payments as $payment) {
            try {
                Payment::updateOrCreate([
                    'tag'   => data_get($payment, 'tag')
                ], [
                    'input' => data_get($payment, 'input')
                ]);
            } catch (Throwable $e) {
                $this->error($e);
            }
        }

    }

}
