import 'package:riverpodtemp/infrastructure/models/data/order_active_model.dart';
import 'package:riverpodtemp/infrastructure/models/data/refund_data.dart';
import 'package:riverpodtemp/infrastructure/models/models.dart';
import 'package:riverpodtemp/infrastructure/services/enums.dart';

import '../../domain/handlers/handlers.dart';
import '../../infrastructure/models/data/get_calculate_data.dart';

abstract class OrdersRepositoryFacade {
  Future<ApiResult<GetCalculateModel>> getCalculate({
    required int cartId,
    required LocationModel? location,
    int? deliveryOptionId,
    required DeliveryTypeEnum type,
    String? coupon,
  });

  Future<ApiResult<OrderActiveModel>> createOrder(OrderBodyData orderBody);

  Future<ApiResult<String>> tipProcess(
    int? orderId,
    String paymentName,
    int? paymentId,
    num? tips,
  );

  Future<ApiResult<OrderPaginateResponse>> getCompletedOrders(int page);

  Future<ApiResult<OrderPaginateResponse>> getActiveOrders(int page);

  Future<ApiResult<OrderPaginateResponse>> getHistoryOrders(int page);

  Future<ApiResult<RefundOrdersModel>> getRefundOrders(int page);

  Future<ApiResult<OrderActiveModel>> getSingleOrder(num orderId);

  Future<ApiResult> createAutoOrder(String from, String to, int orderId);

  Future<ApiResult> deleteAutoOrder(int orderId);

  Future<ApiResult<void>> cancelOrder(num orderId);

  Future<ApiResult<void>> refundOrder(num orderId, String title);

  Future<ApiResult<void>> addReview(
    num orderId, {
    required double rating,
    required String comment,
  });

  Future<ApiResult<String>> process({
    OrderBodyData? orderBody,
    required String name,
    int? walletId,
    int? orderId,
    num? price,
    int? parcelId,
  });

  // Future<ApiResult<String>> walletProcess(num orderId, String name);

  Future<ApiResult<CouponResponse>> checkCoupon({
    required String coupon,
    required int shopId,
  });

  Future<ApiResult<CashbackResponse>> checkCashback({required double amount});

  Future<ApiResult<String>> walletProcess({
    OrderBodyData? orderBody,
    required String name,
    int? walletId,
    num? price,
    int? parcelId,
  });
}
