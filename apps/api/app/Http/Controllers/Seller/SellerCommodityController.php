<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Http\Requests\Commodity\StoreCommodityRequest;
use App\Http\Requests\Commodity\UpdateCommodityRequest;
use App\Models\Commodity;
use App\Models\CommodityMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Support\PaginatesApi;

class SellerCommodityController extends Controller
{
    /**
     * @OA\Get(
     *   path="/seller/commodities",
     *   tags={"Seller - Commodities"},
     *   summary="List commodities milik seller",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer", example=1), description="Page number (Laravel paginator)"),
     *   @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", example=20), description="Items per page. Max is capped by server."),
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden")
     * )
     */
    use PaginatesApi;
    public function index(Request $request)
    {
        $sellerId = $request->user()->id;

        $items = Commodity::query()
            ->with('media')
            ->where('seller_id', $sellerId)
            ->orderByDesc('id')
            ->paginate($this->perPage($request, 20, 50));

        return response()->json($items);
    }

    /**
     * @OA\Post(
     *   path="/seller/commodities",
     *   tags={"Seller - Commodities"},
     *   summary="Create commodity (seller)",
     *   security={{"sanctum":{}}},
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       required={"name"},
     *       @OA\Property(property="name", type="string", example="Ikan Tuna"),
     *       @OA\Property(property="weight_kg", type="number", example=12.5),
     *       @OA\Property(property="size_grade", type="string", example="L"),
     *       @OA\Property(property="location", type="string", example="TPI Buleleng"),
     *       @OA\Property(property="status", type="string", example="draft"),
     *       @OA\Property(
     *         property="media",
     *         type="array",
     *         @OA\Items(
     *           @OA\Property(property="type", type="string", example="image"),
     *           @OA\Property(property="url", type="string", example="/storage/uploads/a.jpg"),
     *           @OA\Property(property="sort_order", type="integer", example=0)
     *         )
     *       )
     *     )
     *   ),
     *   @OA\Response(response=201, description="Created"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden"),
     *   @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(StoreCommodityRequest $request)
    {
        $sellerId = $request->user()->id;

        $commodity = DB::transaction(function () use ($request, $sellerId) {
            $commodity = Commodity::query()->create([
                'seller_id' => $sellerId,
                'name' => $request->input('name'),
                'weight_kg' => $request->input('weight_kg'),
                'size_grade' => $request->input('size_grade'),
                'location' => $request->input('location'),
                'catch_method' => $request->input('catch_method'),
                'catch_time' => $request->input('catch_time'),
                'description' => $request->input('description'),
                'status' => $request->input('status', 'draft'),
            ]);

            $media = $request->input('media', []);
            foreach ($media as $m) {
                CommodityMedia::query()->create([
                    'commodity_id' => $commodity->id,
                    'type' => $m['type'] ?? 'image',
                    'url' => $m['url'],
                    'sort_order' => $m['sort_order'] ?? 0,
                ]);
            }

            return $commodity->load('media');
        });

        return response()->json($commodity, 201);
    }

    /**
     * @OA\Patch(
     *   path="/seller/commodities/{id}",
     *   tags={"Seller - Commodities"},
     *   summary="Update commodity (seller, milik sendiri)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden"),
     *   @OA\Response(response=404, description="Not found"),
     *   @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(UpdateCommodityRequest $request, Commodity $commodity)
    {
        $this->authorize('update', $commodity);

        $updated = DB::transaction(function () use ($request, $commodity) {
            $commodity->fill($request->validated());
            $commodity->save();

            if ($request->has('media')) {
                $commodity->media()->delete();
                foreach ($request->input('media', []) as $m) {
                    CommodityMedia::query()->create([
                        'commodity_id' => $commodity->id,
                        'type' => $m['type'] ?? 'image',
                        'url' => $m['url'],
                        'sort_order' => $m['sort_order'] ?? 0,
                    ]);
                }
            }

            return $commodity->load('media');
        });

        return response()->json($updated);
    }
}
