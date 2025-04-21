import 'package:riverpodtemp/infrastructure/services/local_storage.dart';

import '../../../app_constants.dart';

class StoryRequest {
  final int page;


  StoryRequest({
    required this.page
  });

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map["page"] = page;
    map["perPage"] = 5;
    map["lang"] = LocalStorage.getLanguage()?.locale ?? "en";
    map["address"] = {
      "latitude" : LocalStorage.getAddressSelected()?.location?.firstOrNull ?? AppConstants.demoLatitude,
      "longitude" : LocalStorage.getAddressSelected()?.location?.lastOrNull ?? AppConstants.demoLongitude
    };
    return map;
  }
}
