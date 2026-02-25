<?php

namespace App\Events;

use App\Models\Auction;
use App\Models\Bid;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AuctionEnded implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Auction $auction) {}

    public function broadcastOn(): Channel
    {
        return new Channel('auction.' . $this->auction->id);
    }

    public function broadcastAs(): string
    {
        return 'AuctionEnded';
    }

    public function broadcastWith(): array
    {
        /** @var Bid|null $topBid */
        $topBid = $this->auction->bids()
            ->orderByDesc('amount')
            ->orderByDesc('id')
            ->first(['id', 'buyer_id', 'amount', 'created_at']);

        return [
            'auction_id' => $this->auction->id,
            'status' => $this->auction->status,
            'start_at' => optional($this->auction->start_at)->toISOString(),
            'end_at' => optional($this->auction->end_at)->toISOString(),
            'extended_count' => (int) $this->auction->extended_count,
            'winner_bid_id' => $topBid?->id,
            'winner_buyer_id' => $topBid?->buyer_id,
            'winning_amount' => $topBid ? (float) $topBid->amount : null,
        ];
    }
}
