<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use Illuminate\Http\Request;
use App\Support\PaginatesApi;

class AuctionController extends Controller
{
    /**
     * @OA\Get(
     *   path="/auctions",
     *   tags={"Auctions"},
     *   summary="Public list auctions (filter by status)",
     *   @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string", enum={"scheduled","live","ended"})),
     *   @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer", example=1), description="Page number (Laravel paginator)"),
     *   @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", example=20), description="Items per page. Max is capped by server."),
     *   @OA\Response(response=200, description="OK")
     * )
     */
    use PaginatesApi;
    public function index(Request $request)
    {
        $status = $request->query('status');
        $now = now('UTC');

        $q = Auction::query()->with('commodity.media');

        // Keep list filters aligned with bidding rules:
        // live/scheduled should exclude manually ended/cancelled auctions.
        if ($status === 'scheduled') {
            $q->where('start_at', '>', $now)
                ->whereNotIn('status', ['ended', 'cancelled']);
        } elseif ($status === 'live') {
            $q->where('start_at', '<=', $now)
                ->where('end_at', '>', $now)
                ->whereNotIn('status', ['ended', 'cancelled']);
        } elseif ($status === 'ended') {
            $q->where(function ($sub) use ($now) {
                $sub->where('end_at', '<=', $now)
                    ->orWhereIn('status', ['ended', 'cancelled']);
            });
        }

        $items = $q->orderByDesc('id')->paginate($this->perPage($request, 20, 50));

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
