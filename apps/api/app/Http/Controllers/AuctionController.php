<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AuctionController extends Controller
{
    /**
     * @OA\Get(
     *   path="/auctions",
     *   tags={"Auctions"},
     *   summary="Public list auctions (filter by status)",
     *   @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string", enum={"scheduled","live","ended"})),
     *   @OA\Response(response=200, description="OK")
     * )
     */
    public function index(Request $request)
    {
        $status = $request->query('status');
        $now = Carbon::now();

        $q = Auction::query()->with('commodity.media');

        // status computed based on time for MVP
        if ($status === 'scheduled') {
            $q->where('start_at', '>', $now);
        } elseif ($status === 'live') {
            $q->where('start_at', '<=', $now)->where('end_at', '>', $now);
        } elseif ($status === 'ended') {
            $q->where('end_at', '<=', $now);
        }

        $items = $q->orderByDesc('id')->paginate(20);

        return response()->json($items);
    }

    /**
     * @OA\Get(
     *   path="/auctions/{id}",
     *   tags={"Auctions"},
     *   summary="Public auction detail",
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=404, description="Not found")
     * )
     */
    public function show(Auction $auction)
    {
        return response()->json($auction->load('commodity.media'));
    }
}