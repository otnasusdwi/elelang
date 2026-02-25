<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\AdminAuctionController;
use App\Http\Controllers\Admin\AdminAuctionSettlementController;
use App\Http\Controllers\AuctionBidController;
use App\Http\Controllers\AuctionController;
use App\Http\Controllers\CommodityController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderLogisticsController;
use App\Http\Controllers\Seller\SellerCommodityController;
use Illuminate\Support\Facades\Route;

Route::get('/commodities', [CommodityController::class, 'index']);
Route::get('/commodities/{commodity}', [CommodityController::class, 'show']);
Route::get('/auctions', [AuctionController::class, 'index']);
Route::get('/auctions/{auction}', [AuctionController::class, 'show']);
Route::get('/auctions/{auction}/bids', [AuctionBidController::class, 'index']);

Route::get('/health', fn() => ['status' => 'ok']);

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::post('/media', [MediaController::class, 'store']);
    Route::post('/auctions/{auction}/bids', [AuctionBidController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);
    Route::patch('/orders/{order}/logistics', [OrderLogisticsController::class, 'update']);
    Route::post('/orders/{order}/handover-proofs', [OrderLogisticsController::class, 'addProof']);
});

Route::prefix('seller')
    ->middleware(['auth:sanctum', 'role:seller'])
    ->group(function () {
        Route::get('/commodities', [SellerCommodityController::class, 'index']);
        Route::post('/commodities', [SellerCommodityController::class, 'store']);
        Route::patch('/commodities/{commodity}', [SellerCommodityController::class, 'update']);
    });

Route::prefix('admin')
    ->middleware(['auth:sanctum', 'role:admin'])
    ->group(function () {
        Route::post('/auctions', [AdminAuctionController::class, 'store']);
        Route::patch('/auctions/{auction}', [AdminAuctionController::class, 'update']);
        Route::post('/auctions/{auction}/close', [AdminAuctionSettlementController::class, 'close']);
    });
