<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Internal\RoomController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::prefix('internal')->group(function (): void {
        Route::get('/rooms', [RoomController::class, 'index'])->middleware('permission:rooms.view');
        Route::post('/rooms', [RoomController::class, 'store'])->middleware('permission:rooms.create');
        Route::get('/rooms/{room}', [RoomController::class, 'show'])->middleware('permission:rooms.view');
        Route::match(['put', 'patch'], '/rooms/{room}', [RoomController::class, 'update'])->middleware('permission:rooms.update');
    });
});
