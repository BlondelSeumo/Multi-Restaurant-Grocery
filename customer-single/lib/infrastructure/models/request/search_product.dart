

import 'package:riverpodtemp/infrastructure/services/local_storage.dart';

class SearchProductModel {
  final String text;
  final int page;
  final int? categoryId;
  SearchProductModel({
    required this.text,
    required this.page,
    required this.categoryId,
  });

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map["search"] = text;
    map["perPage"] = 10;
    map["page"] = page;
    map["status"] = "published";
    if(LocalStorage.getShopId() != 0){
      map["shop_id"] = LocalStorage.getShopId();
    }
    map["lang"] = LocalStorage.getLanguage()?.locale ?? "en";
    if(categoryId != null) map["category_id"] = categoryId;
    return map;
  }
}
