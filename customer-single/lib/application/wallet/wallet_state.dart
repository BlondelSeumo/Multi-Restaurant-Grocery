import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:riverpodtemp/infrastructure/models/data/maksekeskus_data.dart';
import 'package:riverpodtemp/infrastructure/models/data/payment_data.dart';
import 'package:riverpodtemp/infrastructure/models/data/user.dart';
import 'package:riverpodtemp/infrastructure/models/response/transactions_response_two.dart';
part 'wallet_state.freezed.dart';

@freezed
class WalletState with _$WalletState {
  const factory WalletState({
    @Default(false) bool isTransactionLoading,
    @Default(false) bool isButtonLoading,
    @Default(false) bool isSearchingLoading,
    @Default(1) int selectPayment,
    @Default([]) List<PaymentData>? payments,
    @Default(null) String? selectMethodLink,
    @Default([]) List<UserModel>? listOfUser,
    @Default(false) bool isMaksekeskusLoading,
    @Default(null) MaksekeskusData? maksekeskus,
    @Default([]) List<TransactionDataTwo> transactions,
  }) = _WalletState;
}
