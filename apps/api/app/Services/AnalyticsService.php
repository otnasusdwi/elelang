<?php

namespace App\Services;

use App\Models\Auction;
use App\Models\Dispute;
use App\Models\EscrowLedger;
use App\Models\Order;
use App\Models\Review;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    public function summary(): array
    {
        $totalAuctions = Auction::query()->count();
        $totalOrders = Order::query()->count();
        $totalDisputes = Dispute::query()->count();

        $ordersByStatus = Order::query()
            ->select('status', DB::raw('COUNT(*) as cnt'))
            ->groupBy('status')
            ->pluck('cnt', 'status')
            ->toArray();

        $escrowHeld = (float) EscrowLedger::query()->where('state', 'held')->sum('amount');
        $escrowReleased = (float) EscrowLedger::query()->where('state', 'released')->sum('amount');
        $escrowRefunded = (float) EscrowLedger::query()->where('state', 'refunded')->sum('amount');

        $avgRating = (float) Review::query()->avg('rating');
        $reviewCount = Review::query()->count();

        return [
            'totals' => [
                'auctions' => $totalAuctions,
                'orders' => $totalOrders,
                'disputes' => $totalDisputes,
                'reviews' => $reviewCount,
            ],
            'orders_by_status' => $ordersByStatus,
            'escrow' => [
                'held' => round($escrowHeld, 2),
                'released' => round($escrowReleased, 2),
                'refunded' => round($escrowRefunded, 2),
            ],
            'reviews' => [
                'average_rating' => round($avgRating, 2),
                'count' => $reviewCount,
            ],
        ];
    }

    public function timeSeries(int $days = 30): array
    {
        $days = max(1, min($days, 365));
        $to = Carbon::today();
        $from = $to->copy()->subDays($days - 1);

        // Orders per day + GMV per day
        $rows = Order::query()
            ->selectRaw('DATE(created_at) as d, COUNT(*) as orders, SUM(final_price) as gmv')
            ->whereBetween('created_at', [$from->startOfDay(), $to->endOfDay()])
            ->groupBy('d')
            ->orderBy('d')
            ->get()
            ->keyBy('d');

        $series = [];
        for ($i = 0; $i < $days; $i++) {
            $d = $from->copy()->addDays($i)->format('Y-m-d');
            $r = $rows->get($d);

            $series[] = [
                'date' => $d,
                'orders' => (int) ($r->orders ?? 0),
                'gmv' => (float) ($r->gmv ?? 0),
            ];
        }

        return [
            'from' => $from->format('Y-m-d'),
            'to' => $to->format('Y-m-d'),
            'days' => $days,
            'series' => $series,
        ];
    }
}