import 'package:riverpodtemp/infrastructure/models/data/addons_data.dart';

import '../models.dart';

class LocalCartResponse {
  DateTime? timestamp;
  bool? status;
  String? message;
  LocalCartData? data;

  LocalCartResponse({
    this.timestamp,
    this.status,
    this.message,
    this.data,
  });

  LocalCartResponse copyWith({
    DateTime? timestamp,
    bool? status,
    String? message,
    LocalCartData? data,
  }) =>
      LocalCartResponse(
        timestamp: timestamp ?? this.timestamp,
        status: status ?? this.status,
        message: message ?? this.message,
        data: data ?? this.data,
      );

  factory LocalCartResponse.fromJson(Map<String, dynamic> json) =>
      LocalCartResponse(
        timestamp: json["timestamp"] == null
            ? null
            : DateTime.parse(json["timestamp"]),
        status: json["status"],
        message: json["message"],
        data:
            json["data"] == null ? null : LocalCartData.fromJson(json["data"]),
      );

  Map<String, dynamic> toJson() => {
        "timestamp": timestamp?.toIso8601String(),
        "status": status,
        "message": message,
        "data": data?.toJson(),
      };
}

class LocalCartData {
  bool? status;
  String? code;
  LocalCart? data;

  LocalCartData({
    this.status,
    this.code,
    this.data,
  });

  LocalCartData copyWith({
    bool? status,
    String? code,
    LocalCart? data,
  }) =>
      LocalCartData(
        status: status ?? this.status,
        code: code ?? this.code,
        data: data ?? this.data,
      );

  factory LocalCartData.fromJson(Map<String, dynamic> json) => LocalCartData(
        status: json["status"],
        code: json["code"],
        data: json["data"] == null ? null : LocalCart.fromJson(json["data"]),
      );

  Map<String, dynamic> toJson() => {
        "status": status,
        "code": code,
        "data": data?.toJson(),
      };
}

class LocalCart {
  List<CalculateStocks>? products;
  num? totalTax;
  num? price;
  num? totalShopTax;
  num? totalPrice;
  num? totalDiscount;
  num? deliveryFee;
  num? rate;
  num? couponPrice;
  ShopData? shop;
  num? km;
  num? serviceFee;

  LocalCart({
    this.products,
    this.totalTax,
    this.price,
    this.totalShopTax,
    this.totalPrice,
    this.totalDiscount,
    this.deliveryFee,
    this.rate,
    this.couponPrice,
    this.shop,
    this.km,
    this.serviceFee,
  });

  LocalCart copyWith({
    List<CalculateStocks>? products,
    num? totalTax,
    num? price,
    num? totalShopTax,
    num? totalPrice,
    num? totalDiscount,
    num? deliveryFee,
    num? rate,
    num? couponPrice,
    ShopData? shop,
    num? km,
    num? serviceFee,
  }) =>
      LocalCart(
        products: products ?? this.products,
        totalTax: totalTax ?? this.totalTax,
        price: price ?? this.price,
        totalShopTax: totalShopTax ?? this.totalShopTax,
        totalPrice: totalPrice ?? this.totalPrice,
        totalDiscount: totalDiscount ?? this.totalDiscount,
        deliveryFee: deliveryFee ?? this.deliveryFee,
        rate: rate ?? this.rate,
        couponPrice: couponPrice ?? this.couponPrice,
        shop: shop ?? this.shop,
        km: km ?? this.km,
        serviceFee: serviceFee ?? this.serviceFee,
      );

  factory LocalCart.fromJson(Map<String, dynamic> json) => LocalCart(
        products: json["stocks"] == null
            ? []
            : List<CalculateStocks>.from(
                json["stocks"]!.map((x) => CalculateStocks.fromJson(x))),
        totalTax: json["total_tax"],
        price: json["price"],
        totalShopTax: json["total_shop_tax"],
        totalPrice: json["total_price"],
        totalDiscount: json["total_discount"],
        deliveryFee: json["delivery_fee"],
        rate: json["rate"],
        couponPrice: json["coupon_price"],
        shop: json["shop"] == null ? null : ShopData.fromJson(json["shop"]),
        km: json["km"]?.toDouble(),
        serviceFee: json["service_fee"],
      );

  Map<String, dynamic> toJson() => {
        "stocks": products == null
            ? []
            : List<CalculateStocks>.from(products!.map((x) => x.toJson())),
        "total_tax": totalTax,
        "price": price,
        "total_shop_tax": totalShopTax,
        "total_price": totalPrice,
        "total_discount": totalDiscount,
        "delivery_fee": deliveryFee,
        "rate": rate,
        "coupon_price": couponPrice,
        "shop": shop?.toJson(),
        "km": km,
        "service_fee": serviceFee,
      };
}

class CalculateStocks {
  CalculateStocks({
    int? id,
    int? countableId,
    num? price,
    int? countableQuantity,
    int? quantity,
    int? minQuantity,
    num? discount,
    num? tax,
    num? totalPrice,
    List<Addons>? addons,
    bool? bonus,
    Stocks? stock,
  }) {
    _id = id;
    _bonus = bonus;
    _countableId = countableId;
    _price = price;
    _countableQuantity = countableQuantity;
    _quantity = quantity;
    _minQuantity = minQuantity;
    _discount = discount;
    _tax = tax;
    _totalPrice = totalPrice;
    _addons = addons;
    _stock = stock;
  }

  CalculateStocks.fromJson(dynamic json) {
    _id = json?['id'];
    _countableId = json?['countable_id'];
    _price = json?['price'];
    _bonus = json?['bonus'];
    _countableQuantity = json?["countable_quantity"];
    _quantity = json?["quantity"];
    _minQuantity = json?['min_quantity'];
    _discount = json?['discount'];
    _tax = json?['tax'];
    _totalPrice = json?['total_price'];

    if (json?['addons'] != null) {
      _addons = [];
      json?['addons'].forEach((v) {
        if (v["countable"] != null ||
            v["product"] != null ||
            v["stock"] != null) {
          _addons?.add(Addons.fromJson(v));
        }
      });
    }
    _stock = json?['stock'] != null ? Stocks.fromJson(json['stock']) : null;
  }

  int? _id;
  int? _countableId;
  num? _price;
  bool? _bonus;
  int? _countableQuantity;
  int? _quantity;
  int? _minQuantity;
  num? _discount;
  num? _tax;
  num? _totalPrice;
  Stocks? _stock;
  List<Addons>? _addons;

  CalculateStocks copyWith({
    int? id,
    int? countableId,
    num? price,
    bool? bonus,
    int? countableQuantity,
    int? minQuantity,
    int? quantity,
    num? discount,
    num? tax,
    num? totalPrice,
    List<Addons>? addons,
    Stocks? stock,
  }) =>
      CalculateStocks(
          id: id ?? _id,
          countableId: countableId ?? _countableId,
          price: price ?? _price,
          bonus: bonus ?? _bonus,
          quantity: quantity ?? _quantity,
          countableQuantity: countableQuantity ?? _countableQuantity,
          minQuantity: minQuantity ?? _minQuantity,
          discount: discount ?? _discount,
          tax: tax ?? _tax,
          totalPrice: totalPrice ?? _totalPrice,
          stock: stock ?? _stock,
          addons: addons ?? _addons);

  int? get id => _id;

  int? get countableId => _countableId;

  num? get price => _price;

  bool? get bonus => _bonus;

  int? get countableQuantity => _countableQuantity;
  int? get quantity => _quantity;

  int? get minQuantity => _minQuantity;

  num? get discount => _discount;

  num? get tax => _tax;

  num? get totalPrice => _totalPrice;

  List<Addons>? get addons => _addons;

  Stocks? get stock => _stock;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['id'] = _id;
    map['countable_id'] = _countableId;
    map['price'] = _price;
    map['bonus'] = _bonus;
    map['countable_quantity'] = _countableQuantity;
    map['quantity'] = _quantity;
    map['discount'] = _discount;
    map['tax'] = _tax;
    map['total_price'] = _totalPrice;
    if (_stock != null) {
      map['stock'] = _stock?.toJson();
    }
    return map;
  }
}
