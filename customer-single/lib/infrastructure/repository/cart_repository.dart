import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:riverpodtemp/domain/handlers/api_result.dart';
import 'package:riverpodtemp/domain/iterface/cart.dart';
import 'package:riverpodtemp/infrastructure/models/data/cart_data.dart';
import 'package:riverpodtemp/infrastructure/models/request/cart_request.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';

import '../../domain/di/injection.dart';
import '../../domain/handlers/http_service.dart';
import '../../domain/handlers/network_exceptions.dart';
import '../models/response/local_cart_response.dart';
import '../services/local_storage.dart';

class CartRepository implements CartRepositoryFacade {
  @override
  Future<ApiResult<CartModel>> createCart({required CartRequest cart}) async {
    try {
      final client = inject<HttpService>().client(requireAuth: true);
      final response = await client.post(
        '/api/v1/dashboard/user/cart/open',
        data: cart.toJson(),
      );
      return ApiResult.success(
        data: CartModel.fromJson(response.data),
      );
    } catch (e) {
      debugPrint('==> get open createAndCart failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e),
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }

  @override
  Future<ApiResult<CartModel>> insertCart({required CartRequest cart}) async {
    try {
      final client = inject<HttpService>().client(requireAuth: true);
      final response = await client.post(
        '/api/v1/dashboard/user/cart/insert-product',
        data: cart.toJsonInsert(),
      );
      return ApiResult.success(
        data: CartModel.fromJson(response.data),
      );
    } catch (e) {
      debugPrint('==> get insert failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e),
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }

  @override
  Future<ApiResult<CartModel>> createAndCart(
      {required CartRequest cart}) async {
    try {
      final client = inject<HttpService>().client(requireAuth: true);
      debugPrint('==> get open Add Cart failure: ${cart.toJson()}');
      final response = await client.post(
        '/api/v1/dashboard/user/cart',
        data: cart.toJson(),
      );
      return ApiResult.success(
        data: CartModel.fromJson(response.data),
      );
    } catch (e) {
      debugPrint('==> get open Add Cart failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e),
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }

  @override
  Future<ApiResult<CartModel>> getCart() async {
    final data = {
      if (LocalStorage.getSelectedCurrency().id != null)
        'currency_id': LocalStorage.getSelectedCurrency().id,
      'lang': LocalStorage.getLanguage()?.locale ?? "en",
    };
    try {
      final client = inject<HttpService>().client(requireAuth: true);
      final response = await client.get(
        '/api/v1/dashboard/user/cart',
        queryParameters: data,
      );
      return ApiResult.success(
        data: CartModel.fromJson(response.data),
      );
    } catch (e) {
      debugPrint('==> get open getCart failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e),
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }

  @override
  Future<ApiResult<CartModel>> deleteCart({required int cartId}) async {
    final data = {
      'ids[0]': cartId,
    };

    try {
      final client = inject<HttpService>().client(requireAuth: true);
      await client.delete(
        '/api/v1/dashboard/user/cart/delete',
        queryParameters: data,
      );
      return ApiResult.success(
        data: CartModel(),
      );
    } catch (e) {
      debugPrint('==> get open deleteCart failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e),
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }

  @override
  Future<ApiResult<dynamic>> deleteUser(
      {required int cartId, required String userId}) async {
    final data = {'cart_id': cartId, "ids[0]": userId};
    try {
      final client = inject<HttpService>().client(requireAuth: true);
      await client.delete(
        '/api/v1/dashboard/user/cart/member/delete',
        queryParameters: data,
      );
      return const ApiResult.success(
        data: null,
      );
    } catch (e) {
      debugPrint('==> get open deleteCart failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e),
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }

  @override
  Future<ApiResult<dynamic>> startGroupOrder({required int cartId}) async {
    try {
      final client = inject<HttpService>().client(requireAuth: true);
      await client.post(
        '/api/v1/dashboard/user/cart/set-group/$cartId',
      );
      return const ApiResult.success(
        data: null,
      );
    } catch (e) {
      debugPrint('==> get open deleteCart failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e),
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }

  @override
  Future<ApiResult<CartModel>> removeProductCart(
      {required int cartDetailId, List<int>? listOfId}) async {
    final data = {
      for (int i = 0; i < (listOfId?.length ?? 0); i++)
        'ids[${i + 1}]': listOfId?[i],
      'ids[0]': cartDetailId,
    };
    try {
      final client = inject<HttpService>().client(requireAuth: true);
      await client.delete(
        '/api/v1/dashboard/user/cart/product/delete',
        queryParameters: data,
      );
      return ApiResult.success(
        data: CartModel(),
      );
    } catch (e) {
      debugPrint('==> get open removeProductCart failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e),
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }

  @override
  Future<ApiResult<LocalCartResponse>> productCalculateCart(
      {String type = TrKeys.pickup}) async {
    final listCart = LocalStorage.getCartList();
    final data = {
      'lang': LocalStorage.getLanguage()?.locale ?? 'en',
      "rate": LocalStorage.getSelectedCurrency().rate ?? 1,
      "type": type,
      "shop_id": LocalStorage.getShopId(),
      "products": [
        for (var element in listCart)
          if (element.count != 0)
            {
              "stock_id": element.stockId,
              "quantity": element.count,
              if (element.addons != null)
                "addons": [
                  for (int i = 0; i < (element.addons?.length ?? 0); i++)
                    {
                      "stock_id": element.addons?[i].stockId,
                      "quantity": element.addons?[i].quantity,
                    }
                ]
            },
      ]
    };

    try {
      final client = inject<HttpService>().client(requireAuth: true);

      final response = await client.get('/api/v1/rest/order/products/calculate',
          queryParameters: data);

      return ApiResult.success(data: LocalCartResponse.fromJson(response.data));
    } catch (e) {
      if ((e.runtimeType == DioException) &&
          ((e as DioException).response?.data["statusCode"] == "ERROR_400")) {
        if ((e.response?.data["params"] as Map)
            .keys
            .first
            .toString()
            .contains("products.")) {
          String message = (e.response?.data["params"] as Map)
              .keys
              .first
              .toString()
              .replaceAll("products.", "");
          int index =
              int.tryParse(message.substring(0, message.indexOf("."))) ?? -1;
          if (index == -1) {
            return ApiResult.failure(
                error: AppHelpers.errorHandler(e),
                statusCode: NetworkExceptions.getDioStatus(e));
          }
          final listCart = LocalStorage.getCartList();
          listCart.removeAt(index);
          LocalStorage.setTotalCartList(list: listCart);
          return productCalculateCart();
        }
      }
      debugPrint('==> get product calculate failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e),
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }
}
