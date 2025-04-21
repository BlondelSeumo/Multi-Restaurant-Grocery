import 'package:riverpodtemp/app_constants.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';

class BannersRequest {
  final int page;


  BannersRequest({
    required this.page
  });

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map["page"] = page;
    if (LocalStorage.getShopId() != 0){
      map["shop_id"] = LocalStorage.getShopId();
    }
    map["perPage"] = 5;
    map["lang"] = LocalStorage.getLanguage()?.locale ?? "en";
    map["address"] = {
      "latitude" : LocalStorage.getAddressSelected()?.location?.firstOrNull ?? AppConstants.demoLatitude,
      "longitude" : LocalStorage.getAddressSelected()?.location?.lastOrNull ?? AppConstants.demoLongitude
    };
    return map;
  }
}
