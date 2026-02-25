<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\User;

class UserRatingController extends Controller
{
    /**
     * @OA\Get(
     *   path="/users/{id}/rating-summary",
     *   tags={"Reviews"},
     *   summary="Get rating summary for a user (public)",
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=404, description="Not found")
     * )
     */
    public function summary(User $user)
    {
        $count = Review::query()->where('ratee_id', $user->id)->count();
        $avg = (float) Review::query()->where('ratee_id', $user->id)->avg('rating');

        return response()->json([
            'user_id' => $user->id,
            'count' => $count,
            'average' => round($avg, 2),
        ]);
    }
}