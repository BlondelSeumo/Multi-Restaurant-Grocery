class Location {
  String? latitude;
  String? longitude;

  Location({this.latitude, this.longitude});

  factory Location.fromJson(Map<String, dynamic> json) => Location(
    latitude: json['latitude'],
    longitude: json['longitude'],
  );

  Map<String, dynamic> toJson() => {
    'latitude': latitude,
    'longitude': longitude,
  };
}

class Translation {
  int? id;
  String? locale;
  String? title;
  String? description;
  String? address;

  Translation({this.id, this.locale, this.title, this.description, this.address});

  factory Translation.fromJson(Map<String, dynamic> json) => Translation(
    id: json['id'],
    locale: json['locale'],
    title: json['title'],
    description: json['description'],
    address: json['address'],
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'locale': locale,
    'title': title,
    'description': description,
    'address': address,
  };
}

class Category {
  int? id;
  String? uuid;
  String? keywords;
  String? type;
  int? input;
  String? img;
  bool? active;
  String? status;
  String? createdAt;
  String? updatedAt;
  Translation? translation;

  Category({
    this.id,
    this.uuid,
    this.keywords,
    this.type,
    this.input,
    this.img,
    this.active,
    this.status,
    this.createdAt,
    this.updatedAt,
    this.translation,
  });

  factory Category.fromJson(Map<String, dynamic> json) => Category(
    id: json['id'],
    uuid: json['uuid'],
    keywords: json['keywords'],
    type: json['type'],
    input: json['input'],
    img: json['img'],
    active: json['active'],
    status: json['status'],
    createdAt: json['created_at'],
    updatedAt: json['updated_at'],
    translation:
    json['translation'] != null ? Translation.fromJson(json['translation']) : null,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'uuid': uuid,
    'keywords': keywords,
    'type': type,
    'input': input,
    'img': img,
    'active': active,
    'status': status,
    'created_at': createdAt,
    'updated_at': updatedAt,
    'translation': translation?.toJson(),
  };
}

class DataModel {
  int? id;
  int? categoryId;
  Location? location;
  bool? active;
  String? createdAt;
  String? updatedAt;
  Category? category;
  Translation? translation;
  List<Translation>? translations;
  List<String>? locales;

  DataModel({
    this.id,
    this.categoryId,
    this.location,
    this.active,
    this.createdAt,
    this.updatedAt,
    this.category,
    this.translation,
    this.translations,
    this.locales,
  });

  factory DataModel.fromJson(Map<String, dynamic> json) => DataModel(
    id: json['id'],
    categoryId: json['category_id'],
    location: json['location'] != null ? Location.fromJson(json['location']) : null,
    active: json['active'],
    createdAt: json['created_at'],
    updatedAt: json['updated_at'],
    category: json['category'] != null ? Category.fromJson(json['category']) : null,
    translation:
    json['translation'] != null ? Translation.fromJson(json['translation']) : null,
    translations: json['translations'] != null
        ? (json['translations'] as List)
        .map((item) => Translation.fromJson(item))
        .toList()
        : null,
    locales: json['locales'] != null ? List<String>.from(json['locales']) : null,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'category_id': categoryId,
    'location': location?.toJson(),
    'active': active,
    'created_at': createdAt,
    'updated_at': updatedAt,
    'category': category?.toJson(),
    'translation': translation?.toJson(),
    'translations': translations?.map((e) => e.toJson()).toList(),
    'locales': locales,
  };
}