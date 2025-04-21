  import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:riverpodtemp/infrastructure/models/data/referral_data.dart';
import 'package:riverpodtemp/infrastructure/models/models.dart';

import '../../infrastructure/models/response/reservation_request.dart';

part 'profile_state.freezed.dart';

@freezed
class ProfileState with _$ProfileState {
  const factory ProfileState({
    @Default(false) bool isLoading,
    @Default(true) bool isReferralLoading,
    @Default(false) bool isSaveLoading,
    @Default(false) bool isLoadingUserAddress,
    @Default(true) bool isLoadingHistory,
    @Default(0) int typeIndex,
    @Default("") String bgImage,
    @Default("") String logoImage,
    @Default(null) AddressData? addressModel,
    @Default(null) ProfileData? userData,
    @Default(null) ReferralModel? referralData,
    @Default([]) List<WalletData>? walletHistory,
    @Default(null) Translation? policy,
    @Default(0) int selectAddress,
    @Default(null) Translation? term,
    @Default(false) bool isTermLoading,
    @Default(false) bool isPolicyLoading,
  }) = _ProfileState;

  const ProfileState._();
}
