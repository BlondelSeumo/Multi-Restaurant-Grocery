import 'package:riverpodtemp/domain/handlers/api_result.dart';
import 'package:riverpodtemp/infrastructure/models/response/disable_time_response.dart';
import 'package:riverpodtemp/infrastructure/models/response/bookings_respone.dart';
import 'package:riverpodtemp/infrastructure/models/response/reservation_request.dart';
import 'package:riverpodtemp/infrastructure/models/response/table_response.dart';

abstract class ReservationRepositoryFacade {
  Future<ApiResult<ReservationResponse>> getShopSections();

  Future<ApiResult<TablesResponse>> getTables({int? shopSectionId});

  Future<ApiResult<DisableTimeResponse>> getDisableTime({
    DateTime? selectedTime,
    int? id,
  });

  Future<ApiResult<bool>> sendReservationTime({
    int? guest,
    DateTime? startDate,
    int? tableId,
    int? bookingId,
  });

  Future<ApiResult<BookingsResponse>> getBookings({int? shopId});
}
