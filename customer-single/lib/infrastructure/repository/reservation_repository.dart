import 'package:flutter/cupertino.dart';
import 'package:intl/intl.dart';

import 'package:riverpodtemp/domain/di/injection.dart';
import 'package:riverpodtemp/domain/handlers/api_result.dart';
import 'package:riverpodtemp/domain/handlers/http_service.dart';
import 'package:riverpodtemp/domain/handlers/network_exceptions.dart';
import 'package:riverpodtemp/domain/iterface/reservation.dart';
import 'package:riverpodtemp/infrastructure/models/response/disable_time_response.dart';
import 'package:riverpodtemp/infrastructure/models/response/bookings_respone.dart';
import 'package:riverpodtemp/infrastructure/models/response/reservation_request.dart';
import 'package:riverpodtemp/infrastructure/models/response/table_response.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';

class ReservationRepository implements ReservationRepositoryFacade {
  @override
  Future<ApiResult<ReservationResponse>> getShopSections() async {
    final data = {
      'page': 1,
      'perPage': 100,
      'lang': LocalStorage.getLanguage()?.locale,
      'shop_id': LocalStorage.getShopId(),
    };
    try {
      final client = inject<HttpService>().client(requireAuth: false);
      final response = await client.get(
        '/api/v1/rest/booking/shop-sections',
        queryParameters: data,
      );
      return ApiResult.success(
        data: ReservationResponse.fromJson(response.data),
      );
    } catch (e) {
      debugPrint('getShopSections ==>> $e');
      return ApiResult.failure(
        error: AppHelpers.errorHandler(e),
        statusCode: NetworkExceptions.getDioStatus(e),
      );
    }
  }

  @override
  Future<ApiResult<TablesResponse>> getTables({int? shopSectionId}) async {
    final data = {
      'page': 1,
      'perPage': 100,
      'lang': LocalStorage.getLanguage()?.locale,
      'shop_section_id': shopSectionId,
    };
    try {
      final client = inject<HttpService>().client(requireAuth: false);
      final response = await client.get(
        '/api/v1/rest/booking/tables',
        queryParameters: data,
      );
      return ApiResult.success(
        data: TablesResponse.fromJson(response.data),
      );
    } catch (e) {
      return ApiResult.failure(
        error: AppHelpers.errorHandler(e),
        statusCode: NetworkExceptions.getDioStatus(e),
      );
    }
  }

  @override
  Future<ApiResult<DisableTimeResponse>> getDisableTime({
    DateTime? selectedTime,
    int? id,
  }) async {
    final data = {
      'lang': LocalStorage.getLanguage()?.locale,
      'date_from': DateFormat("yyyy-MM-dd").format(selectedTime ?? DateTime.now()),
      'date_to': DateFormat("yyyy-MM-dd").format(selectedTime ?? DateTime.now()),
    };
    try {
      final client = inject<HttpService>().client(requireAuth: false);
      final response = await client.get(
        '/api/v1/rest/booking/disable-dates/table/$id',
        queryParameters: data,
      );
      return ApiResult.success(
        data: DisableTimeResponse.fromJson(response.data),
      );
    } catch (e) {
      return ApiResult.failure(
        error: AppHelpers.errorHandler(e),
        statusCode: NetworkExceptions.getDioStatus(e),
      );
    }
  }

  @override
  Future<ApiResult<bool>> sendReservationTime({
    int? guest,
    DateTime? startDate,
    int? tableId,
    int? bookingId,
  }) async {
    final data = {
      'guest': guest,
      'start_date': DateFormat("yyyy-MM-dd HH:mm").format(startDate ?? DateTime.now()),
      'table_id': tableId,
      'booking_id': bookingId,
    };
    try {
      final client = inject<HttpService>().client(requireAuth: true);
      await client.post(
        '/api/v1/dashboard/user/my-bookings',
        data: data,
        queryParameters: {
          'lang': LocalStorage.getLanguage()?.locale,
        },
      );
      return ApiResult.success(data: true);
    } catch (e) {
      return ApiResult.failure(
        error: AppHelpers.errorHandler(e),
        statusCode: NetworkExceptions.getDioStatus(e),
      );
    }
  }

  @override
  Future<ApiResult<BookingsResponse>> getBookings({int? shopId}) async {
    final data = {'shop_id': shopId};
    try {
      final client = inject<HttpService>().client(requireAuth: true);
      final response = await client.get(
        '/api/v1/dashboard/user/bookings',
        queryParameters: data,
      );
      return ApiResult.success(
        data: BookingsResponse.fromJson(response.data),
      );
    } catch (e) {
      debugPrint('=======>> booking request : $e');
      return ApiResult.failure(
        error: AppHelpers.errorHandler(e),
        statusCode: NetworkExceptions.getDioStatus(e),
      );
    }
  }
}
