import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpodtemp/application/reservation/reservation_notifier.dart';
import 'package:riverpodtemp/application/reservation/reservation_state.dart';
import 'package:riverpodtemp/domain/di/dependency_manager.dart';

final reservationProvider =
    StateNotifierProvider.autoDispose<ReservationNotifier, ReservationState>(
  (ref) => ReservationNotifier(reservationRepository),
);
