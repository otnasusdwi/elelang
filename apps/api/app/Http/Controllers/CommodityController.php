<?php

namespace App\Http\Controllers;

use App\Models\Commodity;
use Illuminate\Http\Request;
use App\Support\PaginatesApi;

class CommodityController extends Controller
{
    /**
     * @OA\Get(
     *   path="/commodities",
     *   tags={"Commodities"},
     *   summary="Public list commodities (published)",
     *   @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer", example=1), description="Page number (Laravel paginator)"),
     *   @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", example=20), description="Items per page. Max is capped by server."),
     *   @OA\Response(response=200, description="OK")
     * )
     */
    use PaginatesApi;

    public function index(Request $request)
    {
        $items = Commodity::query()
            ->with('media')
            ->where('status', 'published')
            ->orderByDesc('id')
            ->paginate($this->perPage($request, 20, 50));

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
