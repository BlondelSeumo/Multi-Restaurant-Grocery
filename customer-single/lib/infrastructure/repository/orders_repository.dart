import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:payfast/payfast.dart';
import 'package:riverpodtemp/app_constants.dart';
import 'package:riverpodtemp/domain/di/injection.dart';
import 'package:riverpodtemp/domain/handlers/http_service.dart';
import 'package:riverpodtemp/domain/iterface/orders.dart';
import 'package:riverpodtemp/infrastructure/models/data/order_active_model.dart';
import 'package:riverpodtemp/infrastructure/models/data/refund_data.dart';
import 'package:riverpodtemp/infrastructure/models/models.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/enums.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import '../../../domain/handlers/handlers.dart';
import '../models/data/get_calculate_data.dart';

class OrdersRepository implements OrdersRepositoryFacade {
  @override
  Future<ApiResult<String>> tipProcess(
    int? orderId,
    String paymentName,
    int? paymentId,
    num? tips,
  ) async {
    try {
      final client = inject<HttpService>().client(requireAuth: true);
      if (paymentName.toLowerCase() == 'wallet') {
        var res = await client.post(
          '/api/v1/payments/order/$orderId/transactions',
          data: {
            "tips": tips,
            "payment_sys_id": paymentId,
          },
        );
        return ApiResult.success(data: res.data["data"].toString());
      } else {
        var res = await client.get(
          '/api/v1/dashboard/user/order-${paymentName.toLowerCase()}-process',
          queryParameters: {
            "order_id": orderId,
            "tips": tips,
          },
        );
        return ApiResult.success(data: res.data["data"]["data"]["url"]);
      }
    } catch (e) {
      debugPrint('==> tip order failure: $e');
      return ApiResult.failure(
          error: (e.runtimeType == DioException)
              ? ((e as DioException).response?.data["message"] == "Bad request."
                  ? (e.response?.data["params"] as Map).values.first[0]
                  : e.response?.data["message"])
              : "",
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }

  @override
  Future<ApiResult> createAutoOrder(String from, String to, int orderId) async {
    try {
      final client = inject<HttpService>().client(requireAuth: true);
      await client.post(
        '/api/v1/dashboard/user/orders/$orderId/repeat',
        data: {"from": from, "to": to},
      );
      return const ApiResult.success(
        data: {},
      );
    } catch (e) {
      return ApiResult.failure(
          error: (e.runtimeType == DioException)
              ? ((e as DioException).response?.data["message"] == "Bad request."
                  ? (e.response?.data["params"] as Map).values.first[0]
                  : e.response?.data["message"])
              : "",
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }

  @override
  Future<ApiResult> deleteAutoOrder(int orderId) async {
    try {
      final client = inject<HttpService>().client(requireAuth: true);
      await client.delete(
        '/api/v1/dashboard/user/orders/$orderId/delete-repeat',
      );
      return const ApiResult.success(
        data: {},
      );
    } catch (e) {
      return ApiResult.failure(
          error: (e.runtimeType == DioException)
              ? ((e as DioException).response?.data["message"] == "Bad request."
                  ? (e.response?.data["params"] as Map).values.first[0]
                  : e.response?.data["message"])
              : "",
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }

  @override
  Future<ApiResult<String>> process({
    OrderBodyData? orderBody,
    required String name,
    int? walletId,
    int? orderId,
    num? price,
    int? parcelId,
  }) async {
    try {
      debugPrint(
        '==> order process request: ${jsonEncode(orderBody?.toJson())}',
      );
      final client = inject<HttpService>().client(requireAuth: true);
      final data = {
        if (walletId != null) 'wallet_id': walletId,
        if (walletId != null) 'total_price': price,
        if (parcelId != null) 'parcel_id': parcelId,
        if (orderId != null) 'order_id': orderId,
        "currency_id": LocalStorage.getSelectedCurrency().id
      };
      var res = await client.get(
        '/api/v1/dashboard/user/order-$name-process',
        data: orderBody != null ? orderBody.toJson(paymentTag: name) : data,
      );
      if (name == "pay-fast") {
        final data = res.data["data"]["data"];
        var payfast = Payfast(
          passphrase: AppConstants.passphrase,
          paymentType: PaymentType.simplePayment,
          production: data["sandbox"] != 1,
          merchantDetails: MerchantDetails(
            merchantId: AppConstants.merchantId,
            merchantKey: AppConstants.merchantKey,
            notifyUrl: data["notify_url"],
            cancelUrl: data["cancel_url"],
            returnUrl: data["return_url"],
            paymentId: res.data["data"]["id"].toString(),
          ),
        );
        payfast.createSimplePayment(
          amount: data["amount"].toString(),
          itemName: data["item_name"],
        );
        return ApiResult.success(data: payfast.generateURL());
      }
      return ApiResult.success(data: res.data["data"]["data"]["url"]);
    } catch (e, s) {
      debugPrint('==> order process failure: $e, $s');
      return ApiResult.failure(
        error: AppHelpers.errorHandler(e),
        statusCode: NetworkExceptions.getDioStatus(e),
      );
    }
  }

  @override
  Future<ApiResult<OrderActiveModel>> createOrder(
      OrderBodyData orderBody) async {
    try {
      final client = inject<HttpService>().client(requireAuth: true);
      final response = await client.post(
        '/api/v1/dashboard/user/orders',
        data: orderBody.toJson(),
      );
      return ApiResult.success(
        data: OrderActiveModel.fromJson(response.data),
      );
    } catch (e) {
      debugPrint('==> order create failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e),
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }

  @override
  Future<ApiResult<OrderPaginateResponse>> getCompletedOrders(int page) async {
    final data = {
      if (LocalStorage.getSelectedCurrency().id != null)
        'currency_id': LocalStorage.getSelectedCurrency().id,
      'lang': LocalStorage.getLanguage()?.locale ?? 'en',
      'page': page,
      'status': 'completed',
    };
    try {
      final client = inject<HttpService>().client(requireAuth: true);
      final response = await client.get(
        '/api/v1/dashboard/user/orders/paginate',
        queryParameters: data,
      );
      return ApiResult.success(
        data: OrderPaginateResponse.fromJson(response.data),
      );
    } catch (e) {
      debugPrint('==> get completed orders failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e),
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }

  @override
  Future<ApiResult<OrderPaginateResponse>> getActiveOrders(int page) async {
    final data = {
      if (LocalStorage.getSelectedCurrency().id != null)
        'currency_id': LocalStorage.getSelectedCurrency().id,
      'lang': LocalStorage.getLanguage()?.locale ?? 'en',
      'page': page,
      'statuses[0]': "new",
      "statuses[1]": "accepted",
      "statuses[2]": "ready",
      "statuses[3]": "on_a_way",
      "order_statuses": true,
      "perPage": 10
    };
    try {
      final client = inject<HttpService>().client(requireAuth: true);
      final response = await client.get(
        '/api/v1/dashboard/user/orders/paginate',
        queryParameters: data,
      );
      return ApiResult.success(
        data: OrderPaginateResponse.fromJson(response.data),
      );
    } catch (e) {
      debugPrint('==> get open orders failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e),
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }

  @override
  Future<ApiResult<OrderPaginateResponse>> getHistoryOrders(int page) async {
    final data = {
      if (LocalStorage.getSelectedCurrency().id != null)
        'currency_id': LocalStorage.getSelectedCurrency().id,
      'lang': LocalStorage.getLanguage()?.locale ?? 'en',
      'statuses[0]': "delivered",
      "statuses[1]": "canceled",
      "order_statuses": true,
      "perPage": 10,
      "page": page
    };
    try {
      final client = inject<HttpService>().client(requireAuth: true);
      final response = await client.get(
        '/api/v1/dashboard/user/orders/paginate',
        queryParameters: data,
      );
      return ApiResult.success(
        data: OrderPaginateResponse.fromJson(response.data),
      );
    } catch (e) {
      debugPrint('==> get canceled orders failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e),
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }

  @override
  Future<ApiResult<OrderActiveModel>> getSingleOrder(num orderId) async {
    final data = {
      if (LocalStorage.getSelectedCurrency().id != null)
        'currency_id': LocalStorage.getSelectedCurrency().id,
      'lang': LocalStorage.getLanguage()?.locale
    };
    try {
      final client = inject<HttpService>().client(requireAuth: true);
      final response = await client.get(
        '/api/v1/dashboard/user/orders/$orderId',
        queryParameters: data,
      );
      return ApiResult.success(
        data: OrderActiveModel.fromJson(response.data),
      );
    } catch (e) {
      debugPrint('==> get single order failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e),
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }

  @override
  Future<ApiResult<void>> addReview(
    num orderId, {
    required double rating,
    required String comment,
  }) async {
    final data = {'rating': rating, if (comment != "") 'comment': comment};
    try {
      final client = inject<HttpService>().client(requireAuth: true);
      await client.post(
        '/api/v1/dashboard/user/orders/review/$orderId',
        data: data,
      );
      return const ApiResult.success(data: null);
    } catch (e) {
      debugPrint('==> add order review failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e),
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }

  @override
  Future<ApiResult<CouponResponse>> checkCoupon({
    required String coupon,
    required int shopId,
  }) async {
    final data = {
      'coupon': coupon.toLowerCase(),
      'shop_id': shopId,
    };
    try {
      final client = inject<HttpService>().client(requireAuth: true);
      final response = await client.post(
        '/api/v1/rest/coupons/check',
        data: data,
      );
      return ApiResult.success(data: CouponResponse.fromJson(response.data));
    } catch (e) {
      debugPrint('==> check coupon failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e),
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }

  @override
  Future<ApiResult<CashbackResponse>> checkCashback({
    required double amount,
  }) async {
    final data = {'amount': amount};
    try {
      final client = inject<HttpService>().client(requireAuth: false);
      final response = await client.post(
        '/api/v1/rest/cashback/check',
        data: data,
      );
      return ApiResult.success(data: CashbackResponse.fromJson(response.data));
    } catch (e) {
      debugPrint('==> check cashback failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e),
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }

  @override
  Future<ApiResult<GetCalculateModel>> getCalculate({
    required int cartId,
    required LocationModel? location,
    int? deliveryOptionId,
    required DeliveryTypeEnum type,
    String? coupon,
  }) async {
    final data = {
      'address[latitude]': location?.latitude ?? AppConstants.demoLatitude,
      'address[longitude]': location?.longitude ?? AppConstants.demoLongitude,
      if (LocalStorage.getSelectedCurrency().id != null)
        'currency_id': LocalStorage.getSelectedCurrency().id,
      "type": type == DeliveryTypeEnum.pickup ? "pickup" : "delivery",
      "coupon": coupon,
      if (type == DeliveryTypeEnum.delivery)
        "delivery_option_id": deliveryOptionId
    };
    try {
      final client = inject<HttpService>().client(requireAuth: true);
      final response = await client.post(
        '/api/v1/dashboard/user/cart/calculate/$cartId',
        queryParameters: data,
      );
      return ApiResult.success(
          data: GetCalculateModel.fromJson(response.data["data"]));
    } catch (e) {
      debugPrint('==> check cashback failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e),
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }

  @override
  Future<ApiResult<void>> cancelOrder(num orderId) async {
    try {
      final client = inject<HttpService>().client(requireAuth: true);
      await client.post(
        '/api/v1/dashboard/user/orders/$orderId/status/change?status=canceled',
      );
      return const ApiResult.success(
        data: null,
      );
    } catch (e) {
      debugPrint('==> get cancel order failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e),
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }

  @override
  Future<ApiResult<void>> refundOrder(num orderId, String title) async {
    try {
      final data = {
        "order_id": orderId,
        "cause": title,
      };
      final client = inject<HttpService>().client(requireAuth: true);
      await client.post('/api/v1/dashboard/user/order-refunds', data: data);
      return const ApiResult.success(
        data: null,
      );
    } catch (e) {
      debugPrint('==> get cancel order failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e),
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }

  @override
  Future<ApiResult<RefundOrdersModel>> getRefundOrders(int page) async {
    final data = {
      if (LocalStorage.getSelectedCurrency().id != null)
        'currency_id': LocalStorage.getSelectedCurrency().id,
      'lang': LocalStorage.getLanguage()?.locale,
      "perPage": 10,
      "page": page
    };
    try {
      final client = inject<HttpService>().client(requireAuth: true);
      final response = await client.get(
        '/api/v1/dashboard/user/order-refunds/paginate',
        queryParameters: data,
      );
      return ApiResult.success(
        data: RefundOrdersModel.fromJson(response.data),
      );
    } catch (e) {
      debugPrint('==> get canceled orders failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e),
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }

  @override
  Future<ApiResult<String>> walletProcess({
    OrderBodyData? orderBody,
    required String name,
    int? walletId,
    num? price,
    int? parcelId,
    int? orderId,
  }) async {
    try {
      debugPrint(
        '==> order process request: ${jsonEncode(orderBody?.toJson(paymentTag: ''))}',
      );
      final client = inject<HttpService>().client(requireAuth: true);
      final data = {
        if (walletId != null) 'wallet_id': walletId,
        if (walletId != null) 'total_price': price,
        if (parcelId != null) 'parcel_id': parcelId,
        "currency_id": LocalStorage.getSelectedCurrency().id,
      };
      var res = await client.post(
        '/api/v1/dashboard/user/order-$name-process',
        data: orderBody != null ? orderBody.toJson(paymentTag: name) : data,
      );
      if (name == "pay-fast") {
        final data = res.data["data"]["data"];
        var payfast = Payfast(
          passphrase: AppConstants.passphrase,
          paymentType: PaymentType.simplePayment,
          production: data["sandbox"] != 1,
          merchantDetails: MerchantDetails(
            merchantId: AppConstants.merchantId,
            merchantKey: AppConstants.merchantKey,
            notifyUrl: data["notify_url"],
            cancelUrl: data["cancel_url"],
            returnUrl: data["return_url"],
            paymentId: res.data["data"]["id"].toString(),
          ),
        );
        payfast.createSimplePayment(
          amount: data["amount"].toString(),
          itemName: data["item_name"],
        );
        return ApiResult.success(data: payfast.generateURL());
      }
      return ApiResult.success(data: res.data["data"]["data"]["url"]);
    } catch (e, s) {
      debugPrint('==> order process failure: $e, $s');
      return ApiResult.failure(
        error: AppHelpers.errorHandler(e),
        statusCode: NetworkExceptions.getDioStatus(e),
      );
    }
  }
}
