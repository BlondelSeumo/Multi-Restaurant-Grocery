import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:riverpodtemp/application/reservation/reservation_state.dart';
import 'package:riverpodtemp/domain/iterface/reservation.dart';
import 'package:riverpodtemp/infrastructure/models/data/shop_data.dart';
import 'package:riverpodtemp/infrastructure/models/data/time_interval_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_connectivity.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/time_service.dart';

class ReservationNotifier extends StateNotifier<ReservationState> {
  final ReservationRepositoryFacade _repo;

  ReservationNotifier(this._repo) : super(const ReservationState());

  Future<void> getReservations(BuildContext context) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      state = state.copyWith(isLoading: true);
      final response = await _repo.getShopSections();
      response.when(
        success: (data) {
          state = state.copyWith(isLoading: false, sections: data.data ?? []);
        },
        failure: (error, statusCode) {
          state = state.copyWith(isLoading: false);
        },
      );
    } else {
      if (context.mounted) {
        AppHelpers.showNoConnectionSnackBar(context);
      }
    }
  }

  Future<void> getTables({
    required BuildContext context,
    int? shopSectionId,
  }) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      final response = await _repo.getTables(
        shopSectionId: shopSectionId,
      );
      response.when(
        success: (data) {
          state = state.copyWith(data: data.data ?? []);
        },
        failure: (error, statusCode) {},
      );
    } else {
      if (context.mounted) {
        AppHelpers.showNoConnectionSnackBar(context);
      }
    }
  }

  void setShopWorkingDay({List<ShopWorkingDay>? shopWorkingDay}) {
    final ShopWorkingDay? currentData = shopWorkingDay?.firstWhere(
      (element) {
        return AppHelpers.getDayNumber(element.day ?? '') ==
            DateTime.now().weekday;
      },
    );
    final list = getIntervalsFromNow(
      currentData?.from?.replaceAll('-', ':') ?? '',
      currentData?.to?.replaceAll('-', ':') ?? '',
      state.selectedData ?? DateTime.now(),
    );
    // getDisableTimes();
    state = state.copyWith(
      shopWorkingDays: shopWorkingDay,
      timesInterval: list,
    );
  }

  void updateTimes(int? id) {
    final ShopWorkingDay? currentData = state.shopWorkingDays?.firstWhere(
      (element) {
        return AppHelpers.getDayNumber(element.day ?? '') ==
            DateTime.now().weekday;
      },
    );
    final list = getIntervalsFromNow(
      currentData?.from?.replaceAll('-', ':') ?? '',
      currentData?.to?.replaceAll('-', ':') ?? '',
      state.selectedData ?? DateTime.now(),
    );
    getDisableTimes(id: id);
    state = state.copyWith(
      timesInterval: list,
    );
  }

  void setSelectedData(DateTime? dataTime) {
    state = state.copyWith(selectedData: dataTime);
  }

  Future<void> getDisableTimes({int? id}) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      final response = await _repo.getDisableTime(
        selectedTime: state.selectedData ?? DateTime.now(),
        id: id,
      );
      response.when(
        success: (data) {
          if (data.data?.isEmpty ?? true) return;
          List<TimeInterval> times = List.from(state.timesInterval ?? []);
          final list = data.data?.map(
            (e) {
              return TimeInterval(
              start: TimeService.timeFormatResponse(DateTime.parse(e.start ?? '')),
            );
            },
          );
          times.removeWhere(
            (element) {
              return list?.contains(element) ?? false;
            },
          );
          state = state.copyWith(timesInterval: times);
        },
        failure: (error, statusCode) {},
      );
    } else {
      // if (context.mounted) {
      //   AppHelpers.showNoConnectionSnackBar(context);
      // }
    }
  }

  void getTimes({List<ShopWorkingDay>? shopWorkingDay, int? id}) {
    setShopWorkingDay(shopWorkingDay: shopWorkingDay);
    getDisableTimes(id: id);
  }

  void setTime(TimeInterval? timeInterval) {
    state = state.copyWith(selectedTime: timeInterval);
  }

  Future<void> sendReservationTime({
    int? guest,
    int? tableId,
    int? bookingId,
    VoidCallback? onSuccess,
  }) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      state = state.copyWith(isSendLoading: true);
      final response = await _repo.sendReservationTime(
        startDate: (state.selectedData ?? DateTime.now()).copyWith(
          hour: int.parse(state.selectedTime?.start?.substring(0, 2) ?? '0'),
          minute: int.parse(state.selectedTime?.start?.substring(3) ?? '0'),
        ),
        guest: guest,
        tableId: tableId,
        bookingId: bookingId,
      );
      response.when(
        success: (data) {
          onSuccess?.call();
          state = state.copyWith(isSendLoading: false);
        },
        failure: (error, statusCode) {
          state = state.copyWith(isSendLoading: false);
        },
      );
    } else {
      // if (context.mounted) {
      //   AppHelpers.showNoConnectionSnackBar(context);
      // }
    }
  }

  Future<void> fetchBookings({int? shopId}) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      final response = await _repo.getBookings(shopId: shopId);
      response.when(
        success: (data) {
          state = state.copyWith(bookingId: data.data?.firstOrNull?.id);
        },
        failure: (error, statusCode) {},
      );
    } else {
      // if (context.mounted) {
      //   AppHelpers.showNoConnectionSnackBar(context);
      // }
    }
  }
}
