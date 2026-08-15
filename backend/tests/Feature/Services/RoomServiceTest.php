<?php

namespace Tests\Feature\Services;

use App\Contracts\Services\RoomServiceInterface;
use App\Enums\RoomStatus;
use App\Enums\RoomType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoomServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_manages_rooms_through_the_service_and_repository_layers(): void
    {
        $service = $this->app->make(RoomServiceInterface::class);

        $room = $service->create($this->attributes());

        $this->assertSame('unit-301', $room->slug);
        $this->assertSame(RoomType::Studio, $room->type);
        $this->assertSame(RoomStatus::Ready, $room->status);
        $this->assertCount(1, $service->paginate(['status' => 'ready']));
        $this->assertTrue($service->findOrFail($room->id)->is($room));
        $this->assertTrue($service->findByName('Unit 301')?->is($room));

        $updated = $service->update($room, [
            ...$this->attributes(),
            'name' => 'Garden Suite',
            'status' => 'maintenance',
        ]);

        $this->assertSame('garden-suite', $updated->slug);
        $this->assertSame(RoomStatus::Maintenance, $updated->status);
    }

    /** @return array<string, mixed> */
    private function attributes(): array
    {
        return [
            'name' => 'Unit 301',
            'type' => 'studio',
            'status' => 'ready',
            'description' => 'Kamar dengan cahaya alami.',
            'price_per_night' => 700000,
            'capacity' => 2,
            'bed_count' => 1,
            'size_sqm' => 30,
            'image_url' => null,
            'amenities' => ['Wi-Fi', 'AC'],
            'is_active' => true,
        ];
    }
}
