<?php

namespace App\Http\Controllers\API\v1\Dashboard\Payment;

use App\Traits\ApiResponse;
use App\Http\Controllers\Controller;

abstract class PaymentBaseController extends Controller
{
    use ApiResponse;

    public function __construct()
    {
        parent::__construct();
//        $this->middleware(['sanctum.check'])->except(['created', 'store']);
    }
}
