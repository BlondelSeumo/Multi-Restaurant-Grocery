import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:riverpodtemp/infrastructure/models/data/payment_data.dart';
part 'payment_state.freezed.dart';

@freezed
class PaymentState with _$PaymentState {
  const factory PaymentState({
    @Default(null) PaymentData? selectPaymentData,
    @Default(false) bool isPaymentsLoading,
    @Default(null) PaymentData? wallet,
    @Default(null) String? cashChange,
    @Default([]) List payments,
    @Default([]) List onlinePayments,
    @Default(0) int currentIndex,
  }) = _PaymentState;

  const PaymentState._();
}
