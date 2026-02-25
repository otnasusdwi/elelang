<?php

namespace App\Http\Controllers;

use App\Http\Requests\Review\SubmitReviewRequest;
use App\Models\Order;
use App\Models\Review;
use App\Support\PaginatesApi;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    use PaginatesApi;

    /**
     * @OA\Post(
     *   path="/orders/{id}/review",
     *   tags={"Reviews"},
     *   summary="Submit review for an order (buyer/seller)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\RequestBody(required=true, @OA\JsonContent(
     *     required={"rating"},
     *     @OA\Property(property="rating", type="integer", example=5),
     *     @OA\Property(property="comment", type="string", example="Transaksi lancar")
     *   )),
     *   @OA\Response(response=201, description="Created"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden"),
     *   @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(SubmitReviewRequest $request, Order $order)
    {
        $user = $request->user();
        $role = $user->role ?? '';

        // hanya buyer/seller yang terlibat
        $isBuyer = $role === 'buyer' && $order->buyer_id === $user->id;
        $isSeller = $role === 'seller' && $order->seller_id === $user->id;

        if (!$isBuyer && !$isSeller) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // review hanya setelah order completed
        if ($order->status !== 'completed') {
            return response()->json(['message' => 'Order belum completed'], 422);
        }

        // tentukan target (ratee)
        $rateeId = $isBuyer ? $order->seller_id : $order->buyer_id;

        $review = Review::query()->updateOrCreate(
            ['order_id' => $order->id, 'rater_id' => $user->id],
            [
                'ratee_id' => $rateeId,
                'rating' => (int) $request->input('rating'),
                'comment' => $request->input('comment'),
            ]
        );

        return response()->json($review, 201);
    }

    /**
     * @OA\Get(
     *   path="/my/reviews",
     *   tags={"Reviews"},
     *   summary="List reviews created by me",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer", example=1), description="Page number (Laravel paginator)"),
     *   @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", example=20), description="Items per page. Max is capped by server."),
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function myReviews(Request $request)
    {
        $user = $request->user();

        $items = Review::query()
            ->with(['order', 'ratee:id,name,email'])
            ->where('rater_id', $user->id)
            ->orderByDesc('id')
            ->paginate($this->perPage($request, 20, 50));

        return response()->json($items);
    }
}
