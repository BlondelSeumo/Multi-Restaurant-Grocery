<?php

namespace App\Http\Controllers\API\v1\Dashboard\Admin;

use Illuminate\Http\Request;
use App\Models\EmailSubscription;
use App\Http\Resources\EmailSubscriptionResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SubscriptionController extends AdminBaseController
{
	public function emailSubscriptions(Request $request): AnonymousResourceCollection
	{
		$emailSubscriptions = EmailSubscription::with([
			'user' => fn($q) => $q->select([
				'id',
				'uuid',
				'firstname',
				'lastname',
				'email',
			])
		])
			->when($request->input('user_id'), fn($q, $userId) => $q->where('user_id', $userId))
			->when($request->input('deleted_at'), fn($q) => $q->onlyTrashed())
			->orderBy($request->input('column', 'id'), $request->input('sort', 'desc'))
			->paginate($request->input('perPage', 10));

		return EmailSubscriptionResource::collection($emailSubscriptions);
	}
}
