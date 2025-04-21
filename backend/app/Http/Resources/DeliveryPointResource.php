<?php
declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\DeliveryPoint;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeliveryPointResource extends JsonResource
{
    /**
     * Transform the resource collection into an array.
     *
     * @param  Request $request
     * @return array
     */
    public function toArray($request): array
    {
        /** @var DeliveryPoint|JsonResource $this */
        return [
            'id'            => $this->when($this->id,            $this->id),
            'active'        => $this->when($this->active,        $this->active),
            'price'         => $this->when($this->price,         $this->price),
            'address'       => $this->when($this->address,       $this->address),
            'location'      => $this->when($this->location,      $this->location),
            'img'           => $this->when($this->img,           $this->img),
            'r_count'       => $this->when($this->r_count,       $this->r_count),
            'r_avg'         => $this->when($this->r_avg,         $this->r_avg),
            'r_sum'         => $this->when($this->r_sum,         $this->r_sum),
            'created_at'    => $this->when($this->created_at, $this->created_at?->format('Y-m-d H:i:s') . 'Z'),
            'updated_at'    => $this->when($this->updated_at, $this->updated_at?->format('Y-m-d H:i:s') . 'Z'),

            'translation'   => TranslationResource::make($this->whenLoaded('translation')),
            'translations'  => TranslationResource::collection($this->whenLoaded('translations')),
            'working_days'  => DeliveryPointWorkingDayResource::collection($this->whenLoaded('workingDays')),
            'closed_date'   => DeliveryPointClosedDateResource::collection($this->whenLoaded('closedDates')),
        ];
    }
}
