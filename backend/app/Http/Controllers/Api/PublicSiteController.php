<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Repositories\AmenityRepositoryInterface;
use App\Contracts\Repositories\HomestaySettingRepositoryInterface;
use App\Contracts\Repositories\RoomRepositoryInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicSiteController extends Controller
{
    public function __construct(
        private readonly HomestaySettingRepositoryInterface $settings,
        private readonly RoomRepositoryInterface $rooms,
        private readonly AmenityRepositoryInterface $amenities,
    ) {}

    public function landing(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'check_in' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:today', 'required_with:check_out'],
            'check_out' => ['nullable', 'date_format:Y-m-d', 'after:check_in', 'required_with:check_in'],
            'guests' => ['nullable', 'integer', 'min:1', 'max:20'],
        ]);

        $settings = $this->settings->current();
        $rooms = $this->rooms->availableForPublic(
            $filters['check_in'] ?? null,
            $filters['check_out'] ?? null,
            (int) ($filters['guests'] ?? 1),
        );

        return response()->json(['data' => [
            'property' => [
                'name' => $settings->name,
                'address' => $settings->address,
                'maps_url' => $settings->maps_url,
                'phone' => $settings->phone,
                'email' => $settings->email,
                'logo_url' => $settings->logo_url,
                'check_in_time' => $settings->check_in_time ? substr($settings->check_in_time, 0, 5) : null,
                'check_out_time' => $settings->check_out_time ? substr($settings->check_out_time, 0, 5) : null,
                'currency' => $settings->currency,
            ],
            'hero_media' => [
                'type' => $settings->hero_media_type ?? 'image',
                'images' => collect($settings->hero_images ?? [])->map(fn (array $image): array => [
                    'id' => $image['id'],
                    'url' => $image['url'],
                ])->values(),
                'video_url' => $settings->hero_video_url,
                'cycle_seconds' => (int) ($settings->hero_cycle_seconds ?? 6),
            ],
            'final_cta_media' => [
                'image_url' => $settings->final_cta_image_url,
            ],
            'amenities' => $this->amenities->activeForPublic()->map(fn ($amenity): array => [
                'id' => $amenity->id,
                'name' => $amenity->name,
                'name_en' => $amenity->name_en,
                'slug' => $amenity->slug,
                'description' => $amenity->description,
                'description_en' => $amenity->description_en,
            ])->values(),
            'rooms' => $rooms->map(fn ($room): array => [
                'id' => $room->id,
                'name' => $room->name,
                'slug' => $room->slug,
                'description' => $room->description,
                'description_en' => $room->description_en,
                'price_per_night' => $room->price_per_night,
                'capacity' => $room->capacity,
                'bed_count' => $room->bed_count,
                'images' => $room->images->map(fn ($image): array => ['id' => $image->id, 'url' => $image->url])->values(),
                'amenities' => $room->amenities->map(fn ($amenity): array => [
                    'id' => $amenity->id,
                    'name' => $amenity->name,
                    'name_en' => $amenity->name_en,
                    'slug' => $amenity->slug,
                ])->values(),
            ])->values(),
            'filters' => [
                'check_in' => $filters['check_in'] ?? null,
                'check_out' => $filters['check_out'] ?? null,
                'guests' => (int) ($filters['guests'] ?? 1),
            ],
        ]]);
    }

    public function room(Request $request, int $room): JsonResponse
    {
        $filters = $request->validate([
            'check_in' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:today', 'required_with:check_out'],
            'check_out' => ['nullable', 'date_format:Y-m-d', 'after:check_in', 'required_with:check_in'],
            'guests' => ['nullable', 'integer', 'min:1', 'max:20'],
        ]);

        $settings = $this->settings->current();
        $publicRoom = $this->rooms->findActiveForPublic($room);

        abort_if($publicRoom === null, 404);

        $checkIn = $filters['check_in'] ?? null;
        $checkOut = $filters['check_out'] ?? null;
        $guests = (int) ($filters['guests'] ?? 1);
        $available = $this->rooms->isAvailableForPublic($publicRoom, $checkIn, $checkOut, $guests);

        return response()->json(['data' => [
            'property' => [
                'name' => $settings->name,
                'address' => $settings->address,
                'phone' => $settings->phone,
                'email' => $settings->email,
                'logo_url' => $settings->logo_url,
                'check_in_time' => $settings->check_in_time ? substr($settings->check_in_time, 0, 5) : null,
                'check_out_time' => $settings->check_out_time ? substr($settings->check_out_time, 0, 5) : null,
                'currency' => $settings->currency,
            ],
            'room' => [
                'id' => $publicRoom->id,
                'name' => $publicRoom->name,
                'slug' => $publicRoom->slug,
                'description' => $publicRoom->description,
                'description_en' => $publicRoom->description_en,
                'price_per_night' => $publicRoom->price_per_night,
                'capacity' => $publicRoom->capacity,
                'bed_count' => $publicRoom->bed_count,
                'images' => $publicRoom->images->map(fn ($image): array => [
                    'id' => $image->id,
                    'url' => $image->url,
                ])->values(),
                'amenities' => $publicRoom->amenities->map(fn ($amenity): array => [
                    'id' => $amenity->id,
                    'name' => $amenity->name,
                    'name_en' => $amenity->name_en,
                    'slug' => $amenity->slug,
                    'description' => $amenity->description,
                    'description_en' => $amenity->description_en,
                ])->values(),
            ],
            'filters' => [
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'guests' => $guests,
            ],
            'availability' => [
                'checked' => $checkIn !== null && $checkOut !== null,
                'is_available' => $available,
                'reason' => $available ? null : ($publicRoom->capacity < $guests ? 'capacity' : 'dates'),
            ],
        ]]);
    }
}
