import 'package:flutter/material.dart';
import 'package:riverpodtemp/domain/di/injection.dart';
import 'package:riverpodtemp/domain/handlers/api_result.dart';
import 'package:riverpodtemp/domain/handlers/network_exceptions.dart';
import 'package:riverpodtemp/domain/iterface/careers.dart';
import 'package:riverpodtemp/infrastructure/models/response/careers_detail_response.dart';
import 'package:riverpodtemp/infrastructure/models/response/careers_response.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';

import '../../domain/handlers/http_service.dart';

class CareersRepository implements CareersRepositoryFacade {
  @override
  Future<ApiResult<CareersPaginateResponse>> getCareers(
    int page,
  ) async {
    final data = {
      'lang': LocalStorage.getLanguage()?.locale ?? 'en',
      'page': page,
      'active': 1,
      'perPage': 15,
    };
    try {
      final client = inject<HttpService>().client(requireAuth: false);
      final response = await client.get(
        '/api/v1/rest/careers/paginate',
        queryParameters: data,
      );
      return ApiResult.success(
        data: CareersPaginateResponse.fromJson(response.data),
      );
    } catch (e) {
      debugPrint('==> get blogs paginate failure: $e');
      return ApiResult.failure(
        error: AppHelpers.errorHandler(e),
        statusCode: NetworkExceptions.getDioStatus(e),
      );
    }
  }

  @override
  Future<ApiResult<CareersDetailPaginateResponse>> getCareersDetails(
    int? id,
  ) async {
    final data = {'lang': LocalStorage.getLanguage()?.locale};
    try {
      final client = inject<HttpService>().client(requireAuth: false);
      final response = await client.get(
        '/api/v1/rest/careers/$id',
        queryParameters: data,
      );
      return ApiResult.success(
        data: CareersDetailPaginateResponse.fromJson(response.data),
      );
    } catch (e) {
      debugPrint('==> get blogs details failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e),
          statusCode: NetworkExceptions.getDioStatus(e));
    }
  }
}
