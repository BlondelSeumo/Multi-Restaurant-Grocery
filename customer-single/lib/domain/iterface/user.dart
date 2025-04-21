import 'package:riverpodtemp/infrastructure/models/data/address_new_data.dart';
import 'package:riverpodtemp/infrastructure/models/data/referral_data.dart';
import 'package:riverpodtemp/infrastructure/models/request/edit_profile.dart';
import 'package:riverpodtemp/infrastructure/models/response/transactions_response_two.dart';
import '../../domain/handlers/handlers.dart';
import '../../infrastructure/models/models.dart';
import '../../infrastructure/models/response/reservation_request.dart';

abstract class UserRepositoryFacade {
  Future<ApiResult<ProfileResponse>> getProfileDetails();

  Future<ApiResult<ReferralModel>> getReferralDetails();

  Future<ApiResult<dynamic>> deleteAccount();

  Future<ApiResult> logoutAccount({required String fcm});

  Future<ApiResult<ProfileResponse>> editProfile({required EditProfile? user});

  Future<ApiResult<ProfileResponse>> updateProfileImage({
    required String firstName,
    required String imageUrl,
  });

  Future<ApiResult<ProfileResponse>> updatePassword({
    required String password,
    required String passwordConfirmation,
  });

  Future<ApiResult<WalletHistoriesResponse>> getWalletHistories(int page);

  Future<ApiResult<TransactionsResponseTwo>> getWalletHistory(int page);

  Future<ApiResult<void>> updateFirebaseToken(String? token);

  Future<ApiResult<Translation>> getTerm();

  Future<ApiResult<Translation>> getPolicy();

  Future<ApiResult<dynamic>> setActiveAddress({required int id});

  Future<ApiResult<dynamic>> deleteAddress({required int id});

  Future<ApiResult<dynamic>> saveLocation({required AddressNewModel? address});

  Future<ApiResult<dynamic>> updateLocation({
    required AddressNewModel? address,
    required int? addressId,
  });
}
