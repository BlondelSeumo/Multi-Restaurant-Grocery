import 'package:flutter/material.dart';
import 'package:riverpodtemp/domain/di/injection.dart';
import 'package:riverpodtemp/domain/handlers/http_service.dart';
import 'package:riverpodtemp/domain/iterface/payments.dart';
import 'package:riverpodtemp/infrastructure/models/data/user.dart';
import 'package:riverpodtemp/infrastructure/models/models.dart';
import 'package:riverpodtemp/infrastructure/models/response/maksekeskus_response.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import '../../../domain/handlers/handlers.dart';

class PaymentsRepository implements PaymentsRepositoryFacade {
  @override
  Future<ApiResult<PaymentsResponse>> getPayments() async {
    final data = {
      'lang': LocalStorage.getLanguage()?.locale ?? 'en',
      'sort': 'asc',
      "column": "input"
    };
    try {
      final client = inject<HttpService>().client(requireAuth: false);
      final response =
          await client.get('/api/v1/rest/payments', queryParameters: data);
      return ApiResult.success(
        data: PaymentsResponse.fromJson(response.data),
      );
    } catch (e) {
      debugPrint('==> get payments failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e),
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }

  @override
  Future<ApiResult<TransactionsResponse>> createTransaction({
    required int? orderId,
    required int? paymentId,
  }) async {
    final data = {'payment_sys_id': paymentId};
    try {
      final client = inject<HttpService>().client(requireAuth: true);
      final response = await client.post(
        '/api/v1/payments/order/$orderId/transactions',
        data: data,
      );
      return ApiResult.success(
        data: TransactionsResponse.fromJson(response.data),
      );
    } catch (e) {
      debugPrint('==> create transaction failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e),
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }

  @override
  Future<ApiResult<List<UserModel>>> searchUsers({
    required String query,
    required int page,
  }) async {
    try {
      final data = {
        'page': page,
        'search': query,
      };
      final client = inject<HttpService>().client(requireAuth: true);
      final response = await client.get(
        '/api/v1/dashboard/user/search-sending',
        data: data,
      );
      return ApiResult.success(
        data: (response.data['data'] as List)
            .map((e) => UserModel.fromJson(e))
            .toList(),
      );
    } catch (e) {
      return ApiResult.failure(
        error: AppHelpers.errorHandler(e),
        statusCode: NetworkExceptions.getDioStatus(e),
      );
    }
  }

  @override
  Future<ApiResult<String>> sendWallet({
    required String uuid,
    required num price,
  }) async {
    try {
      final data = {
        'uuid': uuid,
        'price': price,
        "currency_id": LocalStorage.getSelectedCurrency().id
      };

      final client = inject<HttpService>().client(requireAuth: true);
      await client.post(
        '/api/v1/dashboard/user/wallet/send',
        data: data,
      );
      return ApiResult.success(data: '');
    } catch (e) {
      return ApiResult.failure(
        error: AppHelpers.errorHandler(e),
        statusCode: NetworkExceptions.getDioStatus(e),
      );
    }
  }

  @override
  Future<ApiResult<MaksekeskusResponse>> paymentMaksekeskusView(
      {num? price}) async {
    try {
      final data = {
        'wallet_id': LocalStorage.getWalletData()?.currency?.id,
        'total_price': price ?? 0,
        "currency_id": LocalStorage.getSelectedCurrency().id
      };
      debugPrint('==> payment maksekeskus request: $data');
      final client = inject<HttpService>().client(requireAuth: true);
      final res = await client
          .post('/api/v1/dashboard/user/maksekeskus-process', data: data);

      return ApiResult.success(
          data: MaksekeskusResponse.fromJson(res.data["data"]));
    } catch (e) {
      debugPrint('==> payment maksekeskus  failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e),
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }
}
