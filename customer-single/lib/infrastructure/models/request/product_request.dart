import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';

class ProductRequest {
  final int? shopId;
  final int page;
  final int? categoryId;
  final bool? deals;
  final List<double>? price;
  final String? orderBy;

  ProductRequest({
    this.deals,
    this.price,
    this.orderBy,
    required this.shopId,
    required this.page,
    this.categoryId,
  });

  Map<String, dynamic> toJsonNew() {
    final map = <String, dynamic>{};
    map["lang"] = LocalStorage.getLanguage()?.locale ?? "en";
    if (LocalStorage.getSelectedCurrency().id != null) {
      map["currency_id"] = LocalStorage.getSelectedCurrency().id;
    }
    map["productPerPage"] = 4;
    if(LocalStorage.getShopId() != 0){
      map["shop_id"] = LocalStorage.getShopId();
    }

    map["status"] = "published";
    if (deals != null && (deals ?? false)) {
      map["deals"] = deals;
    }
    if (price != null) {
      for (int i = 0; i < price!.length; i++) {
        map["prices[$i]"] = price?[i];
      }
    }
    if (orderBy != null && (orderBy?.isNotEmpty ?? false)) {
      map["order_by"] = AppHelpers.getOrderByString(orderBy!);
    }
    // map["address"] = {
    //   "latitude":
    //   LocalStorage.getAddressSelected()?.location?.latitude ??
    //       AppConstants.demoLatitude,
    //   "longitude":
    //   LocalStorage.getAddressSelected()?.location?.longitude ??
    //       AppConstants.demoLongitude
    // };
    return map;
  }

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map["lang"] = LocalStorage.getLanguage()?.locale ?? "en";
    if (LocalStorage.getSelectedCurrency().id != null) {
      map["currency_id"] = LocalStorage.getSelectedCurrency().id;
    }
    map["page"] = page;
    if(LocalStorage.getShopId() != 0){
      map["shop_id"] = LocalStorage.getShopId();
    }

    map["perPage"] = 6;
    map["status"] = "published";
    if (deals != null && (deals ?? false)) {
      map["deals"] = deals;
    }
    if (price != null) {
      for (int i = 0; i < price!.length; i++) {
        map["prices[$i]"] = price?[i];
      }
    }
    if (orderBy != null && (orderBy?.isNotEmpty ?? false)) {
      map["order_by"] = AppHelpers.getOrderByString(orderBy!);
    }
    // map["address"] = {
    //   "latitude":
    //   LocalStorage.getAddressSelected()?.location?.latitude ??
    //       AppConstants.demoLatitude,
    //   "longitude":
    //   LocalStorage.getAddressSelected()?.location?.longitude ??
    //       AppConstants.demoLongitude
    // };
    return map;
  }

  Map<String, dynamic> toJsonPopular() {
    final map = <String, dynamic>{};
    map["lang"] = LocalStorage.getLanguage()?.locale ?? "en";
    if (LocalStorage.getSelectedCurrency().id != null) {
      map["currency_id"] = LocalStorage.getSelectedCurrency().id;
    }
    map["page"] = page;
    map["status"] = "published";
    map["perPage"] = 6;
    if (LocalStorage.getShopId() != 0) {
      map["shop_id"] = LocalStorage.getShopId();
    }

    // map["address"] = {
    //   "latitude":
    //   LocalStorage.getAddressSelected()?.location?.latitude ??
    //       AppConstants.demoLatitude,
    //   "longitude":
    //   LocalStorage.getAddressSelected()?.location?.longitude ??
    //       AppConstants.demoLongitude
    // };
    return map;
  }

  Map<String, dynamic> toJsonByCategory() {
    final map = <String, dynamic>{};
    map["lang"] = LocalStorage.getLanguage()?.locale ?? "en";
    if (LocalStorage.getSelectedCurrency().id != null) {
      map["currency_id"] = LocalStorage.getSelectedCurrency().id;
    }
    map["page"] = page;
    map["category_id"] = categoryId;
    map["perPage"] = 6;
    map["status"] = "published";
    if(LocalStorage.getShopId() != 0){
      map["shop_id"] = LocalStorage.getShopId();
    }

    // map["address"] = {
    //   "latitude":
    //   LocalStorage.getAddressSelected()?.location?.latitude ??
    //       AppConstants.demoLatitude,
    //   "longitude":
    //   LocalStorage.getAddressSelected()?.location?.longitude ??
    //       AppConstants.demoLongitude
    // };
    return map;
  }
}
