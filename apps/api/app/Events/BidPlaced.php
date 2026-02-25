<?php

namespace App\Events;

use App\Models\Auction;
use App\Models\Bid;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BidPlaced implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Auction $auction,
        public Bid $bid
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel('auction.' . $this->auction->id);
    }

    public function broadcastAs(): string
    {
        return 'BidPlaced';
    }

    public function broadcastWith(): array
    {
        return [
            'auction_id' => $this->auction->id,
            'bid' => [
                'id' => $this->bid->id,
                'buyer_id' => $this->bid->buyer_id,
                'amount' => (float) $this->bid->amount,
                'created_at' => optional($this->bid->created_at)->toISOString(),
            ],
            'end_at' => optional($this->auction->end_at)->toISOString(),
            'extended_count' => (int) $this->auction->extended_count,
        ];
    }
}
