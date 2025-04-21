import 'package:riverpodtemp/infrastructure/models/data/user.dart';
import 'package:riverpodtemp/infrastructure/models/models.dart';
import 'package:riverpodtemp/infrastructure/models/response/maksekeskus_response.dart';
import '../../domain/handlers/handlers.dart';

abstract class PaymentsRepositoryFacade {
  Future<ApiResult<PaymentsResponse?>> getPayments();

  Future<ApiResult<TransactionsResponse>> createTransaction({
    required int? orderId,
    required int? paymentId,
  });
  Future<ApiResult<List<UserModel>>> searchUsers({
    required String query,
    required int page,
  });

  Future<ApiResult<String>> sendWallet({required String uuid, required num price});

  Future<ApiResult<MaksekeskusResponse>> paymentMaksekeskusView({num? price});

}
