import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpodtemp/domain/iterface/settings.dart';
import 'package:riverpodtemp/infrastructure/services/app_connectivity.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';

import '../../infrastructure/services/app_helpers.dart';
import 'splash_state.dart';

class SplashNotifier extends StateNotifier<SplashState> {
  final SettingsRepositoryFacade _settingsRepository;

  SplashNotifier(this._settingsRepository,)
      : super(const SplashState());

  Future<void> getToken(BuildContext context, {
    VoidCallback? goMain,
    VoidCallback? goLogin,
  }) async {
    final connect = await AppConnectivity.connectivity();
    if (connect) {
      final response = await _settingsRepository.getGlobalSettings();
      response.when(
        success: (data) {
          LocalStorage.setSettingsList(data.data ?? []);
          LocalStorage.setSettingsFetched(true);
        },
        failure: (failure,status) {
          debugPrint('==> error with settings fetched');
          AppHelpers.showCheckTopSnackBar(
            context,
            AppHelpers.getTranslation(failure.toString()),
          );
        },
      );
      if (LocalStorage.getToken().isEmpty) {
        goLogin?.call();
      } else {
        goMain?.call();
      }
    }}

    Future<void> getTranslations(BuildContext context) async {
      final connect = await AppConnectivity.connectivity();
      if (connect) {
        final response = await _settingsRepository.getMobileTranslations();
        response.when(
          success: (data) {
            LocalStorage.setTranslations(data.data);
          },
          failure: (failure,status) {
            debugPrint('==> error with fetching translations $failure');
            AppHelpers.showCheckTopSnackBar(
              context,
              AppHelpers.getTranslation(failure.toString()),
            );
          },
        );
      } else {
        if (!context.mounted) return;
        context.replaceRoute(const NoConnectionRoute());
      }
    }
  }
