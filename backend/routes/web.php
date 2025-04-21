<?php

use App\Http\Controllers\API\v1\Dashboard\Payment\{MaksekeskusController,
    MercadoPagoController,
    MollieController,
    MoyasarController,
    PayStackController,
    RazorPayController,
    StripeController};
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Dashboard Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('order-stripe-success',        [StripeController::class,      'orderResultTransaction']);
Route::get('order-mollie-success',        [MollieController::class,      'orderResultTransaction']);
Route::get('order-moya-sar-success',      [MoyasarController::class,     'orderResultTransaction']);
Route::get('order-razorpay-success',      [RazorPayController::class,    'orderResultTransaction']);
Route::get('order-paystack-success',      [PayStackController::class,    'orderResultTransaction']);
Route::get('order-mercado-pago-success',  [MercadoPagoController::class, 'orderResultTransaction']);
Route::get('order-maksekeskus-success',   [MaksekeskusController::class, 'orderResultTransaction']);

Route::get('/', function () {
    return view('welcome');
});

