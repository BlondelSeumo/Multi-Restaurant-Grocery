<?php

namespace App\Traits;

use App\Models\Transaction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * @property-read Transaction|null $transaction
 * @property-read Collection|Transaction[] $transactions
 * @property-read int $transactions_count
 */
trait Payable
{
    public function createTransaction(array $data): Model|Transaction
    {
        return $this->transactions()
            ->whereNull('parent_id')
            ->updateOrCreate([
                'payable_id'     => $this->id,
                'payable_type'   => get_class($this),
                'type'           => $data['type'] ?? Transaction::TYPE_MODEL,
                'payment_sys_id' => data_get($data, 'payment_sys_id'),
            ], [
                'price'              => data_get($data, 'price'),
                'user_id'            => data_get($data, 'user_id', auth('sanctum')->id()),
                'payment_trx_id'     => data_get($data, 'payment_trx_id'),
                'note'               => data_get($data, 'note', ''),
                'perform_time'       => data_get($data, 'perform_time', now()),
                'status_description' => data_get($data, 'status_description', 'Transaction in progress'),
                'status'             => data_get($data, 'status', Transaction::STATUS_PROGRESS),
                'type'               => data_get($data, 'type', Transaction::TYPE_MODEL),
            ]);
    }

    public function createManyTransaction(array $data): Model|Transaction
    {
        return $this->transactions()->create([
            'payable_id'    	 => $this->id,
            'payable_type'  	 => get_class($this),
            'price'              => $data['price'] ?? 0,
            'user_id'            => $data['user_id'] ?? auth('sanctum')->id(),
            'payment_sys_id'     => $data['payment_sys_id'] ?? '',
            'payment_trx_id'     => $data['payment_trx_id'] ?? '',
            'note'               => $data['note'] ?? '',
            'perform_time'       => $data['perform_time'] ?? now(),
            'status_description' => $data['status_description'] ?? 'Transaction in progress',
            'status'             => $data['status'] ?? Transaction::STATUS_PROGRESS,
            'request'            => $data['request'] ?? null,
            'type'               => $data['type'] ?? Transaction::TYPE_MODEL,
            'parent_id'          => $data['parent_id'] ?? null,
        ]);
    }

    public function transactions(): MorphMany
    {
        return $this->morphMany(Transaction::class, 'payable')
            ->where('type', Transaction::TYPE_MODEL)
            ->whereNull('parent_id');
    }

    public function transaction(): MorphOne
    {
        return $this->morphOne(Transaction::class, 'payable')
            ->where('type', Transaction::TYPE_MODEL)
            ->whereNull('parent_id');
    }
}
