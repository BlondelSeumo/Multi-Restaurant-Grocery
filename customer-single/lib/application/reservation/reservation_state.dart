import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:riverpodtemp/infrastructure/models/data/shop_data.dart';
import 'package:riverpodtemp/infrastructure/models/data/time_interval_data.dart';
import 'package:riverpodtemp/infrastructure/models/response/reservation_request.dart';
import 'package:riverpodtemp/infrastructure/models/response/table_response.dart';

part 'reservation_state.freezed.dart';

@freezed
class ReservationState with _$ReservationState {
  const factory ReservationState({
    @Default(false) bool isLoading,
    @Default(false) bool isSendLoading,
    @Default([]) List<MainClass> sections,
    @Default([]) List<ShopSectionData> data,
    @Default(null) List<ShopWorkingDay>? shopWorkingDays,
    @Default(null) List<TimeInterval>? timesInterval,
    @Default(null) DateTime? selectedData,
    @Default(null) TimeInterval? selectedTime,
    @Default(null) int? bookingId,
  }) = _ReservationState;

  const ReservationState._();
}