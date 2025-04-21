import 'package:riverpodtemp/infrastructure/models/data/addons_data.dart';

class LocalCartModel {
  final int? productId;
  final int? stockId;
  final String? image;
  final int count;
  final List<Addons>? addons;

  LocalCartModel({
    required this.productId,
    required this.stockId,
    required this.count,
    this.image,
    this.addons,
  });

  factory LocalCartModel.fromJson(Map data) {
    return LocalCartModel(
      productId: data["productId"],
      stockId: data["stockId"],
      count: data["count"],
      image: data["image"],
      addons: data["addons"] != null ? List<Addons>.from(data["addons"]!.map((x) => Addons.fromJson(x))) : null,
    );
  }

  Map toJson() {
    return {
      "productId": productId,
      "stockId": stockId,
      "count": count,
      "image": image,
      "addons": addons == null
          ? []
          : List<dynamic>.from(addons!.map((x) => x.toJson())),
    };
  }
}


