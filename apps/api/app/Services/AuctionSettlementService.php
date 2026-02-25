<?php

namespace App\Services;

use App\Models\Auction;
use App\Models\Bid;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AuctionSettlementService
{
    public function closeAuction(int $auctionId): Order
    {
        return DB::transaction(function () use ($auctionId) {

            /** @var Auction $auction */
            $auction = Auction::query()
                ->with('commodity')
                ->whereKey($auctionId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($auction->status === 'ended') {
                // idempotent: kalau sudah ada order, return itu
                $existing = Order::query()->where('auction_id', $auction->id)->first();
                if ($existing) return $existing;

                throw ValidationException::withMessages([
                    'auction' => ['Auction sudah ended tapi order belum ada.'],
                ]);
            }

            // Ambil bid tertinggi
            $topBid = Bid::query()
                ->where('auction_id', $auction->id)
                ->orderByDesc('amount')
                ->orderByDesc('id')
                ->first();

            if (!$topBid) {
                // kalau tidak ada bid, auction ended tanpa order
                $auction->status = 'ended';
                $auction->save();

                throw ValidationException::withMessages([
                    'auction' => ['Tidak ada bid. Order tidak dibuat.'],
                ]);
            }

            $sellerId = $auction->commodity->seller_id;

            // Buat order (1 auction = 1 order)
            $order = Order::query()->firstOrCreate(
                ['auction_id' => $auction->id],
                [
                    'commodity_id' => $auction->commodity_id,
                    'seller_id' => $sellerId,
                    'buyer_id' => $topBid->buyer_id,
                    'final_price' => (float) $topBid->amount,
                    'status' => 'pending',
                ]
            );

            // Tutup auction
            $auction->status = 'ended';
            $auction->save();

            return $order->load(['auction', 'commodity.media', 'buyer', 'seller']);
        });
    }
}