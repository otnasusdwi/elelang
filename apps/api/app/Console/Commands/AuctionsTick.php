<?php

namespace App\Console\Commands;

use App\Events\AuctionEnded;
use App\Events\AuctionStarted;
use App\Models\Auction;
use App\Services\AuctionSettlementService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AuctionsTick extends Command
{
    protected $signature = 'auctions:tick {--dry-run : Only show what would be changed}';
    protected $description = 'Update auction statuses (scheduled->live, live->ended) and auto-settle ended auctions';

    public function handle(AuctionSettlementService $settlement): int
    {
        $dry = (bool) $this->option('dry-run');
        $now = Carbon::now('UTC');

        // 1) scheduled -> live
        $scheduledToLive = Auction::query()
            ->where('status', 'scheduled')
            ->where('start_at', '<=', $now)
            ->where('end_at', '>', $now)
            ->count();

        // 2) live -> ended
        $liveToEnded = Auction::query()
            ->where('status', 'live')
            ->where('end_at', '<=', $now)
            ->count();

        $this->info("Now(UTC): {$now->toISOString()}");
        $this->info("scheduled->live candidates: {$scheduledToLive}");
        $this->info("live->ended candidates: {$liveToEnded}");

        if ($dry) {
            $this->warn('Dry run mode. No changes applied.');
            return self::SUCCESS;
        }

        // 1) scheduled -> live (efficient: 1 get + 1 update + broadcast without refetch)
        $toStart = Auction::query()
            ->where('status', 'scheduled')
            ->where('start_at', '<=', $now)
            ->where('end_at', '>', $now)
            ->get(['id', 'status', 'start_at', 'end_at', 'extended_count']);

        if ($toStart->isNotEmpty()) {
            $ids = $toStart->pluck('id');

            // bulk update
            Auction::query()
                ->whereIn('id', $ids)
                ->update(['status' => 'live', 'updated_at' => $now]);

            // broadcast events using already-loaded models (avoid N+1)
            foreach ($toStart as $a) {
                $a->status = 'live';
                // optional: keep timestamps consistent for payload
                $a->updated_at = $now;
                event(new AuctionStarted($a));
            }
        }

        // 2) live -> ended + auto-settlement (efficient + safe)
        $endedCandidates = Auction::query()
            ->where('status', 'live')
            ->where('end_at', '<=', $now);

        $totalCandidates = (clone $endedCandidates)->count();
        $this->info("live->ended candidates (count): {$totalCandidates}");

        $processed = 0;
        $endedCount = 0;
        $settledCount = 0;
        $noBidCount = 0;
        $skippedCount = 0;
        $failedCount = 0;

        // chunk by id to avoid loading too many rows at once
        $endedCandidates
            ->orderBy('id')
            ->select(['id'])
            ->chunkById(200, function ($rows) use (
                $now,
                $settlement,
                &$processed,
                &$endedCount,
                &$settledCount,
                &$noBidCount,
                &$skippedCount,
                &$failedCount
            ) {
                foreach ($rows as $row) {
                    $processed++;

                    try {
                        DB::transaction(function () use (
                            $row,
                            $now,
                            $settlement,
                            &$endedCount,
                            &$settledCount,
                            &$noBidCount,
                            &$skippedCount
                        ) {
                            $auction = Auction::query()
                                ->whereKey($row->id)
                                ->lockForUpdate()
                                ->first();

                            if (!$auction) {
                                $skippedCount++;
                                return;
                            }

                            // Another worker may have processed it, or end_at changed
                            if ($auction->status !== 'live' || $auction->end_at->gt($now)) {
                                $skippedCount++;
                                return;
                            }

                            // Mark ended
                            $auction->status = 'ended';
                            $auction->save();
                            $endedCount++;

                            // Broadcast ended event
                            event(new AuctionEnded($auction->fresh()));

                            // Auto settlement (creates order if there is a top bid)
                            try {
                                $settlement->closeAuction($auction->id);
                                $settledCount++;
                            } catch (ValidationException $ve) {
                                // closeAuction can throw when there are no bids
                                $noBidCount++;
                            }
                        }, 3);
                    } catch (\Throwable $e) {
                        $failedCount++;
                        // Optional: log detail to laravel log (recommended)
                        // \Log::error('auctions:tick failed closing auction', ['auction_id' => $row->id, 'err' => $e->getMessage()]);
                    }
                }
            });

        $this->info("live->ended processed: {$processed}");
        $this->info("ended marked: {$endedCount}");
        $this->info("settled (order created): {$settledCount}");
        $this->info("no-bid ended: {$noBidCount}");
        $this->info("skipped (already processed/changed): {$skippedCount}");
        $this->info("failed: {$failedCount}");

        return self::SUCCESS;
    }
}
