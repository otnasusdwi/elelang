<?php

namespace App\Services;

use App\Models\Dispute;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DisputeResolutionService
{
    public function resolve(Dispute $dispute, int $adminId, string $status, ?string $resolution, ?string $note): Dispute
    {
        return DB::transaction(function () use ($dispute, $adminId, $status, $resolution, $note) {
            $dispute->refresh();
            $order = $dispute->order()->lockForUpdate()->first();

            $dispute->status = $status;
            $dispute->resolution = $resolution;
            $dispute->resolution_note = $note;
            $dispute->resolved_by = $adminId;
            $dispute->save();

            // Jika resolved dan ada resolution => jalankan escrow action
            if ($status === 'resolved') {
                $escrow = app(EscrowService::class);

                if ($resolution === 'refund') {
                    $escrow->refund($order, 'dispute', $note);
                    $order->status = 'cancelled';
                    $order->save();
                } elseif ($resolution === 'release') {
                    // idealnya order sudah completed, tapi admin bisa override di dispute
                    if ($order->status !== 'completed') {
                        // kalau mau strict, throw error. Untuk MVP, kita allow:
                        $order->status = 'completed';
                        $order->save();
                    }
                    $escrow->release($order, 'dispute', $note);
                }
            }

            return $dispute->fresh()->load(['messages.sender', 'order']);
        });
    }
}