<?php

namespace App\Http\Controllers;

use App\Models\Commodity;
use Illuminate\Http\Request;

class CommodityController extends Controller
{
    /**
     * @OA\Get(
     *   path="/commodities",
     *   tags={"Commodities"},
     *   summary="Public list commodities (published)",
     *   @OA\Response(response=200, description="OK")
     * )
     */
    public function index(Request $request)
    {
        $items = Commodity::query()
            ->with('media')
            ->where('status', 'published')
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json($items);
    }

    /**
     * @OA\Get(
     *   path="/commodities/{id}",
     *   tags={"Commodities"},
     *   summary="Public detail commodity (published)",
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=404, description="Not found")
     * )
     */
    public function show(Commodity $commodity)
    {
        if ($commodity->status !== 'published') {
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json($commodity->load('media'));
    }
}
