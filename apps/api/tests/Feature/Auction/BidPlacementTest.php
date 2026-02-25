<?php

namespace Tests\Feature\Auction;

use App\Models\Auction;
use App\Models\Bid;
use App\Models\Commodity;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class BidPlacementTest extends TestCase
{
    use RefreshDatabase;

    public function test_cannot_bid_before_start(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer', 'status' => 'active']);
        $seller = User::factory()->create(['role' => 'seller', 'status' => 'active']);
        $commodity = Commodity::factory()->create(['seller_id' => $seller->id, 'status' => 'published']);

        $auction = Auction::create([
            'commodity_id' => $commodity->id,
            'start_at' => Carbon::now()->addMinutes(10),
            'end_at' => Carbon::now()->addMinutes(20),
            'status' => 'scheduled',
            'anti_sniping_seconds' => 10,
            'extend_minutes' => 10,
        ]);

        $token = $buyer->createToken('t')->plainTextToken;

        $this->postJson("/api/auctions/{$auction->id}/bids", ['amount' => 100], [
            'Authorization' => "Bearer {$token}",
        ])->assertStatus(422);
    }

    public function test_can_bid_when_live(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer', 'status' => 'active']);
        $seller = User::factory()->create(['role' => 'seller', 'status' => 'active']);
        $commodity = Commodity::factory()->create(['seller_id' => $seller->id, 'status' => 'published']);

        $auction = Auction::create([
            'commodity_id' => $commodity->id,
            'start_at' => Carbon::now()->subMinute(),
            'end_at' => Carbon::now()->addMinute(),
            'status' => 'live',
            'anti_sniping_seconds' => 10,
            'extend_minutes' => 10,
        ]);

        $token = $buyer->createToken('t')->plainTextToken;

        $this->postJson("/api/auctions/{$auction->id}/bids", ['amount' => 100], [
            'Authorization' => "Bearer {$token}",
        ])->assertStatus(201);

        $this->assertDatabaseHas('bids', [
            'auction_id' => $auction->id,
            'buyer_id' => $buyer->id,
        ]);
    }

    public function test_anti_sniping_extends_end_at(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer', 'status' => 'active']);
        $seller = User::factory()->create(['role' => 'seller', 'status' => 'active']);
        $commodity = Commodity::factory()->create(['seller_id' => $seller->id, 'status' => 'published']);

        $auction = Auction::create([
            'commodity_id' => $commodity->id,
            'start_at' => Carbon::now()->subMinute(),
            'end_at' => Carbon::now()->addSeconds(5), // within threshold
            'status' => 'live',
            'anti_sniping_seconds' => 10,
            'extend_minutes' => 10,
            'extended_count' => 0,
        ]);

        $oldEnd = $auction->end_at->copy();

        $token = $buyer->createToken('t')->plainTextToken;

        $this->postJson("/api/auctions/{$auction->id}/bids", ['amount' => 100], [
            'Authorization' => "Bearer {$token}",
        ])->assertStatus(201)
            ->assertJson(['extended' => true]);

        $auction->refresh();

        $this->assertTrue($auction->end_at->gt($oldEnd));
        $this->assertEquals(1, (int) $auction->extended_count);
    }

    public function test_bid_must_be_higher_than_current_highest(): void
    {
        $buyer1 = User::factory()->create(['role' => 'buyer', 'status' => 'active']);
        $buyer2 = User::factory()->create(['role' => 'buyer', 'status' => 'active']);
        $seller = User::factory()->create(['role' => 'seller', 'status' => 'active']);
        $commodity = Commodity::factory()->create(['seller_id' => $seller->id, 'status' => 'published']);

        $auction = Auction::create([
            'commodity_id' => $commodity->id,
            'start_at' => Carbon::now()->subMinute(),
            'end_at' => Carbon::now()->addMinute(),
            'status' => 'live',
            'anti_sniping_seconds' => 10,
            'extend_minutes' => 10,
        ]);

        Bid::create(['auction_id' => $auction->id, 'buyer_id' => $buyer1->id, 'amount' => 200]);

        $token = $buyer2->createToken('t')->plainTextToken;

        $this->postJson("/api/auctions/{$auction->id}/bids", ['amount' => 200], [
            'Authorization' => "Bearer {$token}",
        ])->assertStatus(422);
    }
}
