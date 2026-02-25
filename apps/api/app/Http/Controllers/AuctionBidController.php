<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auction\PlaceBidRequest;
use App\Models\Auction;
use App\Services\AuctionBidService;
use Illuminate\Http\Request;

class AuctionBidController extends Controller
{
    /**
     * @OA\Post(
     *   path="/auctions/{id}/bids",
     *   tags={"Bids"},
     *   summary="Place a bid (buyer only, auction must be live)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\RequestBody(required=true, @OA\JsonContent(
     *     required={"amount"},
     *     @OA\Property(property="amount", type="number", example=150000)
     *   )),
     *   @OA\Response(response=201, description="Created"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden"),
     *   @OA\Response(response=404, description="Not found"),
     *   @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(PlaceBidRequest $request, Auction $auction, AuctionBidService $service)
    {
        $user = $request->user();

        // role check: buyer only
        if (($user->role ?? '') !== 'buyer') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $result = $service->placeBid(
            $auction->id,
            $user->id,
            (float) $request->input('amount')
        );

        return response()->json([
            'bid' => $result['bid'],
            'auction' => $result['auction'],
            'extended' => $result['extended'],
        ], 201);
    }

    /**
     * @OA\Get(
     *   path="/auctions/{id}/bids",
     *   tags={"Bids"},
     *   summary="List bids for an auction (public)",
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK")
     * )
     */
    public function index(Request $request, Auction $auction)
    {
        $items = $auction->bids()
            ->with('buyer:id,name,email')
            ->orderByDesc('id')
            ->paginate(50);

        return response()->json($items);
    }
}