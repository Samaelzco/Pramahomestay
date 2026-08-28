<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Internal\AccessController;
use App\Http\Controllers\Api\Internal\AmenityController;
use App\Http\Controllers\Api\Internal\AuditLogController;
use App\Http\Controllers\Api\Internal\BookingController;
use App\Http\Controllers\Api\Internal\DashboardController;
use App\Http\Controllers\Api\Internal\GuestController;
use App\Http\Controllers\Api\Internal\HomestaySettingController;
use App\Http\Controllers\Api\Internal\PaymentController;
use App\Http\Controllers\Api\Internal\ReportController;
use App\Http\Controllers\Api\Internal\RoomController;
use App\Http\Controllers\Api\Internal\UserController;
use App\Http\Controllers\Api\PublicSiteController;
use App\Http\Controllers\Api\PublicBookingController;
use App\Http\Controllers\Api\PublicPaymentController;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:login');

Route::get('/public/landing', [PublicSiteController::class, 'landing'])
    ->middleware('throttle:120,1');

Route::post('/public/bookings', [PublicBookingController::class, 'store'])
    ->middleware('throttle:public-bookings');

Route::get('/public/payments/{token}', [PublicPaymentController::class, 'show'])
    ->middleware('throttle:public-payments');
Route::post('/public/payments/{token}/proof', [PublicPaymentController::class, 'store'])
    ->middleware('throttle:public-payments');

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/user', fn (Request $request) => new UserResource($request->user()));
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::prefix('internal')->group(function (): void {
        Route::get('/amenities', [AmenityController::class, 'index'])->middleware('permission:amenities.view');
        Route::post('/amenities', [AmenityController::class, 'store'])->middleware('permission:amenities.create');
        Route::get('/amenities/{amenity}', [AmenityController::class, 'show'])->middleware('permission:amenities.view');
        Route::match(['put', 'patch'], '/amenities/{amenity}', [AmenityController::class, 'update'])->middleware('permission:amenities.update');
        Route::patch('/amenities/{amenity}/activation', [AmenityController::class, 'activation'])->middleware('permission:amenities.update');
        Route::delete('/amenities/{amenity}', [AmenityController::class, 'destroy'])->middleware('permission:amenities.update');
        Route::get('/settings', [HomestaySettingController::class, 'show'])->middleware('permission:settings.view');
        Route::match(['put', 'patch'], '/settings', [HomestaySettingController::class, 'update'])->middleware('permission:settings.update');
        Route::get('/audit-logs', [AuditLogController::class, 'index'])->middleware('permission:audit_logs.view');
        Route::get('/audit-logs/{auditLog}', [AuditLogController::class, 'show'])->middleware('permission:audit_logs.view');
        Route::get('/access/roles', [AccessController::class, 'index'])->middleware('permission:roles.view');
        Route::post('/access/roles', [AccessController::class, 'store'])->middleware('permission:roles.update');
        Route::get('/access/roles/{role}', [AccessController::class, 'show'])->middleware('permission:roles.view');
        Route::patch('/access/roles/{role}', [AccessController::class, 'update'])->middleware('permission:roles.update');
        Route::put('/access/roles/{role}', [AccessController::class, 'update'])->middleware('permission:roles.update');
        Route::delete('/access/roles/{role}', [AccessController::class, 'destroy'])->middleware('permission:roles.update');
        Route::get('/users', [UserController::class, 'index'])->middleware('permission:users.view');
        Route::post('/users', [UserController::class, 'store'])->middleware('permission:users.create');
        Route::get('/users/{user}', [UserController::class, 'show'])->middleware('permission:users.view');
        Route::match(['put', 'patch'], '/users/{user}', [UserController::class, 'update'])->middleware('permission:users.update');
        Route::patch('/users/{user}/activation', [UserController::class, 'activation'])->middleware('permission:users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->middleware('permission:users.update');
        Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('permission:dashboard.view');
        Route::get('/reports', [ReportController::class, 'index'])->middleware('permission:reports.view');
        Route::get('/reports/export', [ReportController::class, 'export'])->middleware('permission:reports.export');
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
