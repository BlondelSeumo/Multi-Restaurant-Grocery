import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'package:riverpodtemp/application/careers/careers_state.dart';
import 'package:riverpodtemp/domain/iterface/careers.dart';
import 'package:riverpodtemp/infrastructure/models/data/careers_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';

class CareersNotifier extends StateNotifier<CareersState> {
  final CareersRepositoryFacade _repo;

  int page = 0;

  CareersNotifier(this._repo) : super(CareersState());

  Future<void> getCareers({
    required BuildContext context,
    RefreshController? controller,
    bool isRefresh = false,
  }) async {
    if (isRefresh) {
      page = 0;
      state = state.copyWith(isLoading: true);
    }

    final response = await _repo.getCareers(++page);
    response.when(
      success: (data) {
        if (isRefresh) {
          state = state.copyWith(isLoading: false, careers: data.data ?? []);
        } else {
          if (data.data?.isNotEmpty ?? false) {
            List<DataModel> list = List.from(state.careers);
            list.addAll(data.data ?? []);
            state = state.copyWith(careers: list, isLoading: false);
            controller?.loadComplete();
          } else {
            page--;
            controller?.loadNoData();
          }
        }
      },
      failure: (error, statusCode) {
        if (!isRefresh) {
          page--;
          controller?.loadFailed();
        } else {
          controller?.refreshFailed();
        }
        AppHelpers.showCheckTopSnackBar(
          context,
          AppHelpers.getTranslation(error.toString()),
        );
      },
    );
  }

  Future<void> careerDetail({required int? id}) async {
    state = state.copyWith(isLoading: true);
    final response = await _repo.getCareersDetails(id);
    response.when(
      success: (data) {
        state = state.copyWith(careersDetail: data.data, isLoading: false);
      },
      failure: (error, statusCode) {
        state = state.copyWith(isLoading: false);
      },
    );
  }
}
