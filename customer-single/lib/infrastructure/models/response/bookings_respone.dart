class BookingsResponse {
  BookingsResponse({List<ShopResponse>? data}) {
    _data = data;
  }

  BookingsResponse.fromJson(dynamic json) {
    if (json['data'] != null) {
      _data = [];
      json['data'].forEach((v) {
        _data?.add(ShopResponse.fromJson(v));
      });
    }
  }

  List<ShopResponse>? _data;

  BookingsResponse copyWith({List<ShopResponse>? data}) =>
      BookingsResponse(data: data ?? _data);

  List<ShopResponse>? get data => _data;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    if (_data != null) {
      map['data'] = _data?.map((v) => v.toJson()).toList();
    }
    return map;
  }
}

class ShopResponse {
  int? id;
  int? maxTime;
  String? createdAt;
  String? updatedAt;
  Shop? shop;

  ShopResponse(
      {this.id, this.maxTime, this.createdAt, this.updatedAt, this.shop});

  factory ShopResponse.fromJson(Map<String, dynamic> json) {
    return ShopResponse(
      id: json['id'],
      maxTime: json['max_time'],
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
      shop: json['shop'] != null ? Shop.fromJson(json['shop']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'max_time': maxTime,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'shop': shop?.toJson(),
    };
  }
}

class Shop {
  int? id;
  String? uuid;
  double? tax;
  bool? open;
  int? visibility;
  String? logoImg;
  double? avgRate;
  int? productsCount;
  Translation? translation;
  List<dynamic>? locales;

  Shop({
    this.id,
    this.uuid,
    this.tax,
    this.open,
    this.visibility,
    this.logoImg,
    this.avgRate,
    this.productsCount,
    this.translation,
    this.locales,
  });

  factory Shop.fromJson(Map<String, dynamic> json) {
    return Shop(
      id: json['id'],
      uuid: json['uuid'],
      tax: json['tax']?.toDouble(),
      open: json['open'],
      visibility: json['visibility'],
      logoImg: json['logo_img'],
      avgRate: json['avg_rate']?.toDouble(),
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
      'tax': tax,
      'open': open,
      'visibility': visibility,
      'logo_img': logoImg,
      'avg_rate': avgRate,
      'products_count': productsCount,
      'translation': translation?.toJson(),
      'locales': locales,
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
