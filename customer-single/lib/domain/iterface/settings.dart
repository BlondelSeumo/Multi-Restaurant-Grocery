import 'package:riverpodtemp/infrastructure/models/data/help_data.dart';
import 'package:riverpodtemp/infrastructure/models/data/notification_list_data.dart';
import 'package:riverpodtemp/infrastructure/models/response/admin_response.dart';

import '../../domain/handlers/handlers.dart';
import '../../infrastructure/models/models.dart';
abstract class SettingsRepositoryFacade {
  Future<ApiResult<GlobalSettingsResponse>> getGlobalSettings();

  Future<ApiResult<MobileTranslationsResponse>> getMobileTranslations();

  Future<ApiResult<LanguagesResponse>> getLanguages();

  Future<ApiResult<NotificationsListModel>> getNotificationList();


  Future<ApiResult<dynamic>> updateNotification(List<NotificationData>? notifications);

  Future<ApiResult<HelpModel>> getFaq();

  Future<ApiResult<AdminResponse>> fetchAdminDetail();
}
