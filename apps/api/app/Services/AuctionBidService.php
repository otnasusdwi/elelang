<?php

namespace App\Services;

use App\Models\Auction;
use App\Models\Bid;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Events\AuctionExtended;
use App\Events\BidPlaced;

class AuctionBidService
{
    /**
     * Place bid safely with transaction & row lock.
     * Returns: ['bid' => Bid, 'auction' => Auction, 'extended' => bool, 'highest' => float]
     */
    public function placeBid(int $auctionId, int $buyerId, float $amount): array
    {
        return DB::transaction(function () use ($auctionId, $buyerId, $amount) {
            /** @var Auction $auction */
            $auction = Auction::query()
                ->whereKey($auctionId)
                ->lockForUpdate()
                ->firstOrFail();

            $now = now('UTC');

            // Validate auction time window (computed "live")
            if ($now->lt($auction->start_at)) {
                throw ValidationException::withMessages([
                    'auction' => ['Auction belum dimulai.'],
                ]);
            }
            if ($now->gte($auction->end_at)) {
                throw ValidationException::withMessages([
                    'auction' => ['Auction sudah berakhir.'],
                ]);
            }
            if (in_array($auction->status, ['cancelled', 'ended'], true)) {
                throw ValidationException::withMessages([
                    'auction' => ['Auction tidak aktif.'],
                ]);
            }

            // Highest bid so far
            $highest = (float) Bid::query()
                ->where('auction_id', $auction->id)
                ->max('amount');

            if ($amount <= $highest) {
                throw ValidationException::withMessages([
                    'amount' => ["Bid harus lebih tinggi dari bid tertinggi saat ini ({$highest})."],
                ]);
            }

            // Insert bid
            $bid = Bid::query()->create([
                'auction_id' => $auction->id,
                'buyer_id' => $buyerId,
                'amount' => $amount,
            ]);

            // Anti-sniping: if remaining seconds <= threshold => extend end_at
            $extended = false;
            $remainingSeconds = $auction->end_at->diffInSeconds($now, false); // positive if end_at > now

            // diffInSeconds with false: if end_at in future, returns positive? Actually diffInSeconds($now,false) gives signed based on order.
            // To be safe:
            $remainingSeconds = $now->diffInSeconds($auction->end_at, false); // positive if end_at after now

            if ($remainingSeconds > 0 && $remainingSeconds <= (int) $auction->anti_sniping_seconds) {
                $auction->end_at = $auction->end_at->copy()->addMinutes((int) $auction->extend_minutes);
                $auction->extended_count = (int) $auction->extended_count + 1;
                $auction->status = 'live'; // optional ensure
                $auction->save();
                $extended = true;
            } else {
                // Optional: keep status live while active
                $auction->status = 'live';
                $auction->save();
            }

            $auctionFresh = $auction->fresh();

            // broadcast bid event
            event(new BidPlaced($auctionFresh, $bid));

            // broadcast extend event kalau terjadi
            if ($extended) {
                event(new AuctionExtended($auctionFresh));
            }

            return [
                'bid' => $bid,
                'auction' => $auction->fresh(),
                'extended' => $extended,
                'highest' => $amount,
            ];
        }, 3);
    }
}
