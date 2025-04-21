import 'package:riverpodtemp/infrastructure/models/response/Galleries_response.dart';

class ReservationResponse {
  ReservationResponse({List<MainClass>? data}) {
    _data = data;
  }

  ReservationResponse.fromJson(dynamic json) {
    if (json['data'] != null) {
      _data = [];
      json['data'].forEach((v) {
        _data?.add(MainClass.fromJson(v));
      });
    }
  }

  List<MainClass>? _data;

  ReservationResponse copyWith({List<MainClass>? data}) =>
      ReservationResponse(data: data ?? _data);

  List<MainClass>? get data => _data;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    if (_data != null) {
      map['data'] = _data?.map((v) => v.toJson()).toList();
    }
    return map;
  }
}

class MainClass {
  int? id;
  int? shopId;
  String? area;
  String? img;
  String? createdAt;
  String? updatedAt;
  Shop? shop;
  Translation? translation;
  List<Translation>? translations;
  List<String>? locales;
  Gallery? gallery;

  MainClass({
    this.id,
    this.shopId,
    this.area,
    this.img,
    this.createdAt,
    this.updatedAt,
    this.shop,
    this.translation,
    this.translations,
    this.locales,
    this.gallery,
  });

  factory MainClass.fromJson(Map<String, dynamic> json) {
    return MainClass(
      id: json['id'],
      shopId: json['shop_id'],
      area: json['area'],
      img: json['img'],
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
      shop: json['shop'] != null ? Shop.fromJson(json['shop']) : null,
      translation: json['translation'] != null
          ? Translation.fromJson(json['translation'])
          : null,
      translations: json['translations'] != null
          ? (json['translations'] as List)
              .map((item) => Translation.fromJson(item))
              .toList()
          : null,
      locales:
          json['locales'] != null ? List<String>.from(json['locales']) : null,
      gallery:
          json['gallery'] != null ? Gallery.fromJson(json['gallery']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'shop_id': shopId,
      'area': area,
      'img': img,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'shop': shop?.toJson(),
      'translation': translation?.toJson(),
      'translations': translations?.map((item) => item.toJson()).toList(),
      'locales': locales,
      'gallery': gallery?.toJson(),
    };
  }
}

class Shop {
  num? id;
  String? uuid;
  num? userId;
  num? parentId;
  num? price;
  num? pricePerKm;
  num? tax;
  num? percentage;
  String? phone;
  num? showType;
  bool? open;
  num? visibility;
  String? backgroundImg;
  String? logoImg;
  num? minAmount;
  String? status;
  String? type;
  num? avgRate;
  DeliveryTime? deliveryTime;
  String? orderPayment;
  String? createdAt;
  String? updatedAt;
  Location? location;
  num? productsCount;
  Translation? translation;
  List<dynamic>? locales;

  Shop({
    this.id,
    this.uuid,
    this.userId,
    this.parentId,
    this.price,
    this.pricePerKm,
    this.tax,
    this.percentage,
    this.phone,
    this.showType,
    this.open,
    this.visibility,
    this.backgroundImg,
    this.logoImg,
    this.minAmount,
    this.status,
    this.type,
    this.avgRate,
    this.deliveryTime,
    this.orderPayment,
    this.createdAt,
    this.updatedAt,
    this.location,
    this.productsCount,
    this.translation,
    this.locales,
  });

  factory Shop.fromJson(Map<String, dynamic> json) {
    return Shop(
      id: json['id'],
      uuid: json['uuid'],
      userId: json['user_id'],
      parentId: json['parent_id'],
      price: json['price'],
      pricePerKm: json['price_per_km'],
      tax: json['tax'],
      percentage: json['percentage'],
      phone: json['phone'],
      showType: json['show_type'],
      open: json['open'],
      visibility: json['visibility'],
      backgroundImg: json['background_img'],
      logoImg: json['logo_img'],
      minAmount: json['min_amount'],
      status: json['status'],
      type: json['type'],
      avgRate: json['avg_rate'],
      deliveryTime: json['delivery_time'] != null
          ? DeliveryTime.fromJson(json['delivery_time'])
          : null,
      orderPayment: json['order_payment'],
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
      location:
          json['location'] != null ? Location.fromJson(json['location']) : null,
      productsCount: json['products_count'],
      translation: json['translation'] != null
          ? Translation.fromJson(json['translation'])
          : null,
      locales: json['locales'] ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'uuid': uuid,
      'user_id': userId,
      'parent_id': parentId,
      'price': price,
      'price_per_km': pricePerKm,
      'tax': tax,
      'percentage': percentage,
      'phone': phone,
      'show_type': showType,
      'open': open,
      'visibility': visibility,
      'background_img': backgroundImg,
      'logo_img': logoImg,
      'min_amount': minAmount,
      'status': status,
      'type': type,
      'avg_rate': avgRate,
      'delivery_time': deliveryTime?.toJson(),
      'order_payment': orderPayment,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'location': location?.toJson(),
      'products_count': productsCount,
      'translation': translation?.toJson(),
      'locales': locales,
    };
  }
}

class DeliveryTime {
  String? to;
  String? from;
  String? type;

  DeliveryTime({this.to, this.from, this.type});

  factory DeliveryTime.fromJson(Map<String, dynamic> json) {
    return DeliveryTime(
      to: json['to'],
      from: json['from'],
      type: json['type'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'to': to,
      'from': from,
      'type': type,
    };
  }
}

class Location {
  double? latitude;
  double? longitude;

  Location({this.latitude, this.longitude});

  factory Location.fromJson(Map<String, dynamic> json) {
    return Location(
      latitude: double.tryParse(json['latitude']?.toString()??''),
      longitude: double.tryParse(json['longitude']?.toString()??''),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'latitude': latitude,
      'longitude': longitude,
    };
  }
}

class Translation {
  int? id;
  String? locale;
  String? title;
  String? description;
  String? address;

  Translation(
      {this.id, this.locale, this.title, this.description, this.address});

  factory Translation.fromJson(Map<String, dynamic> json) {
    return Translation(
      id: json['id'],
      locale: json['locale'],
      title: json['title'],
      description: json['description'],
      address: json['address'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'locale': locale,
      'title': title,
      'description': description,
      'address': address,
    };
  }
}

// class Gallery {
//   int? id;
//   String? title;
//   String? type;
//   String? loadableType;
//   int? loadableId;
//   String? path;
//   String? basePath;
//
//   Gallery({
//     this.id,
//     this.title,
//     this.type,
//     this.loadableType,
//     this.loadableId,
//     this.path,
//     this.basePath,
//   });
//
//   factory Gallery.fromJson(Map<String, dynamic> json) {
//     return Gallery(
//         id: json['id'],
//         title: json
