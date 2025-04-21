class TablesResponse {
  TablesResponse({List<ShopSectionData>? data}) {
    _data = data;
  }

  TablesResponse.fromJson(dynamic json) {
    if (json['data'] != null) {
      _data = [];
      json['data'].forEach((v) {
        _data?.add(ShopSectionData.fromJson(v));
      });
    }
  }

  List<ShopSectionData>? _data;

  TablesResponse copyWith({List<ShopSectionData>? data}) =>
      TablesResponse(data: data ?? _data);

  List<ShopSectionData>? get data => _data;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    if (_data != null) {
      map['data'] = _data?.map((v) => v.toMap()).toList();
    }
    return map;
  }
}

class ShopSectionData {
  int? id;
  int? shopSectionId;
  String? name;
  int? tax;
  int? chairCount;
  bool? active;
  String? createdAt;
  String? updatedAt;
  ShopSection? shopSection;

  ShopSectionData({
    this.id,
    this.shopSectionId,
    this.name,
    this.tax,
    this.chairCount,
    this.active,
    this.createdAt,
    this.updatedAt,
    this.shopSection,
  });

  ShopSectionData copyWith({
    int? id,
    int? shopSectionId,
    String? name,
    int? tax,
    int? chairCount,
    bool? active,
    String? createdAt,
    String? updatedAt,
    ShopSection? shopSection,
  }) {
    return ShopSectionData(
      id: id ?? this.id,
      shopSectionId: shopSectionId ?? this.shopSectionId,
      name: name ?? this.name,
      tax: tax ?? this.tax,
      chairCount: chairCount ?? this.chairCount,
      active: active ?? this.active,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      shopSection: shopSection ?? this.shopSection,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'shopSection_id': shopSectionId,
      'name': name,
      'tax': tax,
      'chair_count': chairCount,
      'active': active,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'shop_section': shopSection,
    };
  }

  factory ShopSectionData.fromJson(Map<String, dynamic> map) {
    return ShopSectionData(
      id: map['id'] as int?,
      shopSectionId: map['shop_section_id'] as int?,
      name: map['name'] as String?,
      tax: map['tax'] as int?,
      chairCount: map['chair_count'] as int?,
      active: map['active'] as bool?,
      createdAt: map['created_at'] as String?,
      updatedAt: map['updated_at'] as String?,
      shopSection: map['shop_section'] != null
          ? ShopSection.fromJson(map['shop_section'])
          : null,
    );
  }
}

class ShopSection {
  int? id;
  int? shopId;
  String? area;
  String? img;
  String? createdAt;
  String? updatedAt;
  Translation? translation;

  ShopSection({
    this.id,
    this.shopId,
    this.area,
    this.img,
    this.createdAt,
    this.updatedAt,
    this.translation,
  });

  factory ShopSection.fromJson(Map<String, dynamic> json) {
    return ShopSection(
      id: json['id'],
      shopId: json['shop_id'],
      area: json['area'],
      img: json['img'],
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
      translation: json['translation'] != null
          ? Translation.fromJson(json['translation'])
          : null,
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
      'translation': translation?.toJson(),
    };
  }
}

class Translation {
  int? id;
  String? locale;
  String? title;

  Translation({this.id, this.locale, this.title});

  factory Translation.fromJson(Map<String, dynamic> json) {
    return Translation(
      id: json['id'],
      locale: json['locale'],
      title: json['title'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'locale': locale,
      'title': title,
    };
  }
}

class ShopItem {
  int? id;
  String? name;
  int? shopSectionId;
  int? tax;
  int? chairCount;
  bool? active;
  String? createdAt;
  String? updatedAt;
  ShopSection? shopSection;

  ShopItem({
    this.id,
    this.name,
    this.shopSectionId,
    this.tax,
    this.chairCount,
    this.active,
    this.createdAt,
    this.updatedAt,
    this.shopSection,
  });

  factory ShopItem.fromJson(Map<String, dynamic> json) {
    return ShopItem(
      id: json['id'],
      name: json['name'],
      shopSectionId: json['shop_section_id'],
      tax: json['tax'],
      chairCount: json['chair_count'],
      active: json['active'],
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
      shopSection: json['shop_section'] != null
          ? ShopSection.fromJson(json['shop_section'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'shop_section_id': shopSectionId,
      'tax': tax,
      'chair_count': chairCount,
      'active': active,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'shop_section': shopSection?.toJson(),
    };
  }
}
