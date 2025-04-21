import 'package:riverpodtemp/domain/handlers/api_result.dart';
import 'package:riverpodtemp/infrastructure/models/response/careers_detail_response.dart';
import 'package:riverpodtemp/infrastructure/models/response/careers_response.dart';

abstract class CareersRepositoryFacade {
  Future<ApiResult<CareersPaginateResponse>> getCareers(int page);

  Future<ApiResult<CareersDetailPaginateResponse>> getCareersDetails(int? id);
}
