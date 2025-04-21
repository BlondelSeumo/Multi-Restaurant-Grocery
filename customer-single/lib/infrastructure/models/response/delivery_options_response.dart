import 'package:riverpodtemp/infrastructure/models/data/shop_data.dart';

import '../data/links.dart';
import '../data/meta.dart';

class DeliveryOptionsResponse {
  List<DeliveryOptionData>? data;
  Links? links;
  Meta? meta;

  DeliveryOptionsResponse({
    this.data,
    this.links,
    this.meta,
  });

  DeliveryOptionsResponse copyWith({
    List<DeliveryOptionData>? data,
    Links? links,
    Meta? meta,
  }) =>
      DeliveryOptionsResponse(
        data: data ?? this.data,
        links: links ?? this.links,
        meta: meta ?? this.meta,
      );

  factory DeliveryOptionsResponse.fromJson(Map<String, dynamic> json) =>
      DeliveryOptionsResponse(
        data: json["data"] == null
            ? []
            : List<DeliveryOptionData>.from(
                json["data"]!.map((x) => DeliveryOptionData.fromJson(x))),
        links: json["links"] == null ? null : Links.fromJson(json["links"]),
        meta: json["meta"] == null ? null : Meta.fromJson(json["meta"]),
      );

  Map<String, dynamic> toJson() => {
        "data": data == null
            ? []
            : List<dynamic>.from(data!.map((x) => x.toJson())),
        "links": links?.toJson(),
        "meta": meta?.toJson(),
      };
}

class DeliveryOptionData {
  int? id;
  String? title;
  int? shopId;
  num? price;
  num? deliveryFee;
  double? pricePerKm;
  String? type;
  int? timeFrom;
  int? timeTo;
  DateTime? createdAt;
  DateTime? updatedAt;
  ShopData? shop;

  DeliveryOptionData({
    this.id,
    this.title,
    this.shopId,
    this.price,
    this.pricePerKm,
    this.type,
    this.timeFrom,
    this.timeTo,
    this.createdAt,
    this.updatedAt,
    this.shop,
    this.deliveryFee,
  });

  DeliveryOptionData copyWith({
    int? id,
    String? title,
    int? shopId,
    int? price,
    double? pricePerKm,
    num? deliveryFee,
    String? type,
    int? timeFrom,
    int? timeTo,
    DateTime? createdAt,
    DateTime? updatedAt,
    ShopData? shop,
  }) =>
      DeliveryOptionData(
        id: id ?? this.id,
        title: title ?? this.title,
        shopId: shopId ?? this.shopId,
        price: price ?? this.price,
        pricePerKm: pricePerKm ?? this.pricePerKm,
        type: type ?? this.type,
        deliveryFee: deliveryFee ?? this.deliveryFee,
        timeFrom: timeFrom ?? this.timeFrom,
        timeTo: timeTo ?? this.timeTo,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        shop: shop ?? this.shop,
      );

  factory DeliveryOptionData.fromJson(Map<String, dynamic> json) =>
      DeliveryOptionData(
        id: json["id"],
        title: json["title"],
        shopId: json["shop_id"],
        price: json["price"],
        pricePerKm: json["price_per_km"]?.toDouble(),
        type: json["type"],
        deliveryFee: json["delivery_fee"],
        timeFrom: json["time_from"],
        timeTo: json["time_to"],
        createdAt: json["created_at"] == null
            ? null
            : DateTime.parse(json["created_at"]),
        updatedAt: json["updated_at"] == null
            ? null
            : DateTime.parse(json["updated_at"]),
        shop: json["shop"] == null ? null : ShopData.fromJson(json["shop"]),
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "title": title,
        "shop_id": shopId,
        "price": price,
        "price_per_km": pricePerKm,
        "type": type,
        "time_from": timeFrom,
        "time_to": timeTo,
        "delivery_fee": deliveryFee,
        "created_at": createdAt?.toIso8601String(),
        "updated_at": updatedAt?.toIso8601String(),
        "shop": shop?.toJson(),
      };
}
