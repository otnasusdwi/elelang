<?php

namespace App\Services;

use App\Models\EscrowLedger;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EscrowService
{
    public function getBalance(Order $order): array
    {
        $held = (float) EscrowLedger::query()
            ->where('order_id', $order->id)
            ->where('state', 'held')
            ->sum('amount');

        $released = (float) EscrowLedger::query()
            ->where('order_id', $order->id)
            ->where('state', 'released')
            ->sum('amount');

        $refunded = (float) EscrowLedger::query()
            ->where('order_id', $order->id)
            ->where('state', 'refunded')
            ->sum('amount');

        return [
            'held' => $held,
            'released' => $released,
            'refunded' => $refunded,
            'net_held' => $held - $released - $refunded,
        ];
    }

    public function hold(Order $order, ?string $reference = null, ?string $note = null): EscrowLedger
    {
        return DB::transaction(function () use ($order, $reference, $note) {
            $order->refresh();

            if (in_array($order->status, ['cancelled'], true)) {
                throw ValidationException::withMessages(['order' => ['Order cancelled. Cannot hold.']]);
            }

            // idempotent: kalau sudah ada hold sebesar final_price, jangan duplikat
            $balance = $this->getBalance($order);
            if ($balance['held'] >= (float) $order->final_price) {
                return EscrowLedger::query()
                    ->where('order_id', $order->id)
                    ->where('state', 'held')
                    ->latest('id')
                    ->first();
            }

            $ledger = EscrowLedger::query()->create([
                'order_id' => $order->id,
                'amount' => (float) $order->final_price,
                'state' => 'held',
                'reference' => $reference,
                'note' => $note,
            ]);

            // Optional: update order status "paid"
            $order->status = 'paid';
            $order->save();

            return $ledger;
        });
    }

    public function release(Order $order, ?string $reference = null, ?string $note = null): EscrowLedger
    {
        return DB::transaction(function () use ($order, $reference, $note) {
            $order->refresh();

            if ($order->status !== 'completed') {
                throw ValidationException::withMessages(['order' => ['Order belum completed. Tidak bisa release.']]);
            }

            $balance = $this->getBalance($order);
            if ($balance['net_held'] <= 0) {
                throw ValidationException::withMessages(['escrow' => ['Tidak ada dana yang bisa di-release.']]);
            }

            return EscrowLedger::query()->create([
                'order_id' => $order->id,
                'amount' => $balance['net_held'],
                'state' => 'released',
                'reference' => $reference,
                'note' => $note,
            ]);
        });
    }

    public function refund(Order $order, ?string $reference = null, ?string $note = null): EscrowLedger
    {
        return DB::transaction(function () use ($order, $reference, $note) {
            $order->refresh();

            $balance = $this->getBalance($order);
            if ($balance['net_held'] <= 0) {
                throw ValidationException::withMessages(['escrow' => ['Tidak ada dana yang bisa di-refund.']]);
            }

            return EscrowLedger::query()->create([
                'order_id' => $order->id,
                'amount' => $balance['net_held'],
                'state' => 'refunded',
                'reference' => $reference,
                'note' => $note,
            ]);
        });
    }
}