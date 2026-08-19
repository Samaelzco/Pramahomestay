<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Internal\BookingController;
use App\Http\Controllers\Api\Internal\DashboardController;
use App\Http\Controllers\Api\Internal\GuestController;
use App\Http\Controllers\Api\Internal\PaymentController;
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
        Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('permission:dashboard.view');
        Route::get('/guests', [GuestController::class, 'index'])->middleware('permission:guests.view');
        Route::post('/guests', [GuestController::class, 'store'])->middleware('permission:guests.create');
        Route::get('/guests/{guest}', [GuestController::class, 'show'])->middleware('permission:guests.view');
        Route::match(['put', 'patch'], '/guests/{guest}', [GuestController::class, 'update'])->middleware('permission:guests.update');
        Route::patch('/guests/{guest}/activation', [GuestController::class, 'activation'])->middleware('permission:guests.update');
        Route::delete('/guests/{guest}', [GuestController::class, 'destroy'])->middleware('permission:guests.update');
        Route::get('/payments', [PaymentController::class, 'index'])->middleware('permission:payments.view');
        Route::post('/payments', [PaymentController::class, 'store'])->middleware('permission:payments.create');
        Route::get('/payments/{payment}', [PaymentController::class, 'show'])->middleware('permission:payments.view');
        Route::match(['put', 'patch'], '/payments/{payment}', [PaymentController::class, 'update'])->middleware('permission:payments.update');
        Route::patch('/payments/{payment}/refund', [PaymentController::class, 'refund'])->middleware('permission:payments.update');

        Route::get('/bookings', [BookingController::class, 'index'])->middleware('permission:bookings.view');
        Route::post('/bookings', [BookingController::class, 'store'])->middleware('permission:bookings.create');
        Route::get('/bookings/{booking}', [BookingController::class, 'show'])->middleware('permission:bookings.view');
        Route::match(['put', 'patch'], '/bookings/{booking}', [BookingController::class, 'update'])->middleware('permission:bookings.update');
        Route::patch('/bookings/{booking}/cancel', [BookingController::class, 'cancel'])->middleware('permission:bookings.update');
        Route::delete('/bookings/{booking}', [BookingController::class, 'destroy'])->middleware('permission:bookings.update');

        Route::get('/rooms', [RoomController::class, 'index'])->middleware('permission:rooms.view');
        Route::post('/rooms', [RoomController::class, 'store'])->middleware('permission:rooms.create');
        Route::get('/rooms/{room}', [RoomController::class, 'show'])->middleware('permission:rooms.view');
        Route::match(['put', 'patch'], '/rooms/{room}', [RoomController::class, 'update'])->middleware('permission:rooms.update');
        Route::patch('/rooms/{room}/activation', [RoomController::class, 'activation'])->middleware('permission:rooms.update');
        Route::delete('/rooms/{room}', [RoomController::class, 'destroy'])->middleware('permission:rooms.update');
    });
});
