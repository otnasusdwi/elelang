<?php

namespace Database\Seeders;

use App\Models\Auction;
use App\Models\Bid;
use App\Models\Commodity;
use App\Models\CommodityMedia;
use App\Models\EscrowLedger;
use App\Models\HandoverProof;
use App\Models\Logistics;
use App\Models\Order;
use App\Models\Review;
use App\Models\User;
use App\Services\AuctionSettlementService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class DevSeeder extends Seeder
{
    public function run(): void
    {
        // ---------- Users ----------
        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        $seller1 = User::query()->updateOrCreate(
            ['email' => 'seller1@example.com'],
            [
                'name' => 'Seller One',
                'password' => Hash::make('password123'),
                'role' => 'seller',
                'status' => 'active',
            ]
        );

        $seller2 = User::query()->updateOrCreate(
            ['email' => 'seller2@example.com'],
            [
                'name' => 'Seller Two',
                'password' => Hash::make('password123'),
                'role' => 'seller',
                'status' => 'active',
            ]
        );

        $buyers = [];
        for ($i = 1; $i <= 3; $i++) {
            $buyers[] = User::query()->updateOrCreate(
                ['email' => "buyer{$i}@example.com"],
                [
                    'name' => "Buyer {$i}",
                    'password' => Hash::make('password123'),
                    'role' => 'buyer',
                    'status' => 'active',
                ]
            );
        }

        // ---------- Clear old dev data ----------
        HandoverProof::query()->delete();
        Logistics::query()->delete();
        Review::query()->delete();
        EscrowLedger::query()->delete();
        Order::query()->delete();
        Bid::query()->delete();
        Auction::query()->delete();
        CommodityMedia::query()->delete();
        Commodity::query()->delete();

        // ---------- Commodities + Media ----------
        $commodities = [];

        $commodityDefs = [
            ['seller' => $seller1, 'name' => 'Ikan Tuna Segar', 'weight' => 12.5, 'grade' => 'L'],
            ['seller' => $seller1, 'name' => 'Ikan Cakalang', 'weight' => 8.2, 'grade' => 'M'],
            ['seller' => $seller2, 'name' => 'Ikan Tongkol', 'weight' => 10.0, 'grade' => 'M'],
            ['seller' => $seller2, 'name' => 'Ikan Kerapu', 'weight' => 6.5, 'grade' => 'S'],
            ['seller' => $seller2, 'name' => 'Udang Vaname', 'weight' => 5.0, 'grade' => 'S'],
        ];

        foreach ($commodityDefs as $idx => $def) {
            $c = Commodity::query()->create([
                'seller_id' => $def['seller']->id,
                'name' => $def['name'],
                'weight_kg' => $def['weight'],
                'size_grade' => $def['grade'],
                'location' => 'TPI Buleleng',
                'catch_method' => 'Jaring',
                'catch_time' => Carbon::now()->subHours(5),
                'description' => 'Seed data untuk testing',
                'status' => 'published',
            ]);

            CommodityMedia::query()->create([
                'commodity_id' => $c->id,
                'type' => 'image',
                'url' => '/storage/uploads/dummy-' . ($idx + 1) . '.jpg',
                'sort_order' => 0,
            ]);

            $commodities[] = $c;
        }

        // ---------- Auctions ----------
        $now = Carbon::now();

        $scheduled1 = Auction::query()->create([
            'commodity_id' => $commodities[0]->id,
            'start_at' => $now->copy()->addMinutes(30),
            'end_at' => $now->copy()->addMinutes(60),
            'status' => 'scheduled',
            'timezone' => 'Asia/Makassar',
            'anti_sniping_seconds' => 10,
            'extend_minutes' => 10,
            'extended_count' => 0,
        ]);

        $scheduled2 = Auction::query()->create([
            'commodity_id' => $commodities[1]->id,
            'start_at' => $now->copy()->addHours(2),
            'end_at' => $now->copy()->addHours(2)->addMinutes(30),
            'status' => 'scheduled',
            'timezone' => 'Asia/Makassar',
            'anti_sniping_seconds' => 10,
            'extend_minutes' => 10,
            'extended_count' => 0,
        ]);

        // live auctions
        $live1 = Auction::query()->create([
            'commodity_id' => $commodities[2]->id,
            'start_at' => $now->copy()->subMinutes(5),
            'end_at' => $now->copy()->addHours(2),
            'status' => 'live',
            'timezone' => 'Asia/Makassar',
            'anti_sniping_seconds' => 10,
            'extend_minutes' => 10,
            'extended_count' => 0,
        ]);

        $live2 = Auction::query()->create([
            'commodity_id' => $commodities[3]->id,
            'start_at' => $now->copy()->subMinutes(2),
            'end_at' => $now->copy()->addSeconds(45),
            'status' => 'live',
            'timezone' => 'Asia/Makassar',
            'anti_sniping_seconds' => 10,
            'extend_minutes' => 10,
            'extended_count' => 0,
        ]);

        $ended = Auction::query()->create([
            'commodity_id' => $commodities[4]->id,
            'start_at' => $now->copy()->subHours(2),
            'end_at' => $now->copy()->subHours(1),
            'status' => 'ended',
            'timezone' => 'Asia/Makassar',
            'anti_sniping_seconds' => 10,
            'extend_minutes' => 10,
            'extended_count' => 0,
        ]);

        // ---------- Bids ----------
        $amount = 100000;
        for ($i = 0; $i < 6; $i++) {
            $buyer = $buyers[$i % count($buyers)];
            Bid::query()->create([
                'auction_id' => $live1->id,
                'buyer_id' => $buyer->id,
                'amount' => $amount,
                'created_at' => $now->copy()->subMinutes(10)->addSeconds($i * 10),
                'updated_at' => $now->copy()->subMinutes(10)->addSeconds($i * 10),
            ]);
            $amount += 25000;
        }

        $amount2 = 200000;
        for ($i = 0; $i < 4; $i++) {
            $buyer = $buyers[($i + 1) % count($buyers)];
            Bid::query()->create([
                'auction_id' => $live2->id,
                'buyer_id' => $buyer->id,
                'amount' => $amount2,
                'created_at' => $now->copy()->subSeconds(40 - ($i * 5)),
                'updated_at' => $now->copy()->subSeconds(40 - ($i * 5)),
            ]);
            $amount2 += 30000;
        }

        // ---------- Auto-create 1 Order by closing live1 + seed logistics, proof, escrow(held), reviews ----------
        try {
            $settlement = app(AuctionSettlementService::class);
            $order = $settlement->closeAuction($live1->id);

            Logistics::query()->updateOrCreate(
                ['order_id' => $order->id],
                [
                    'pickup_time' => $now->copy()->addHours(2),
                    'pickup_location' => 'TPI Buleleng - Gate A',
                    'delivery_method' => 'pickup',
                    'notes' => 'Seed logistics untuk testing web',
                ]
            );

            HandoverProof::query()->create([
                'order_id' => $order->id,
                'type' => 'pickup',
                'media_url' => '/storage/uploads/proof-pickup-dummy.jpg',
                'timestamp' => $now->copy()->addHours(2)->addMinutes(5),
            ]);

            // seed escrow (held)
            EscrowLedger::query()->updateOrCreate(
                ['order_id' => $order->id, 'state' => 'held'],
                [
                    'amount' => (float) $order->final_price,
                    'reference' => 'seed-payment',
                    'note' => 'Seed escrow (held) untuk testing web',
                ]
            );

            // ✅ set order completed supaya review valid
            $order->status = 'completed';
            $order->save();

            // Seed review buyer -> seller
            Review::query()->updateOrCreate(
                ['order_id' => $order->id, 'rater_id' => $order->buyer_id],
                [
                    'ratee_id' => $order->seller_id,
                    'rating' => 5,
                    'comment' => 'Penjual responsif, ikan segar. (seed)',
                ]
            );

            // Seed review seller -> buyer
            Review::query()->updateOrCreate(
                ['order_id' => $order->id, 'rater_id' => $order->seller_id],
                [
                    'ratee_id' => $order->buyer_id,
                    'rating' => 5,
                    'comment' => 'Pembeli cepat konfirmasi, transaksi lancar. (seed)',
                ]
            );

        } catch (\Throwable $e) {
            // ignore
        }
    }
}