import 'dart:convert';

class CartLocalModelList {
  final List<CartLocalModel> list;

  CartLocalModelList({
    required this.list,
  });

  factory CartLocalModelList.fromJson(Map data) {
    List<CartLocalModel> list = [];
    data["list"].forEach((e) {
      list.add(CartLocalModel.fromJson(e));
    });
    return CartLocalModelList(
      list: list,
    );
  }

  Map toJson() {
    return {
      "list": list.map((e) => e.toJson()).toList(),
    };
  }
}

class CartLocalModel {
  int quantity;
  int stockId;
  List<Addon>? addons;

  CartLocalModel({
    required this.quantity,
    required this.stockId,
    this.addons,
  });

  CartLocalModel copyWith({
    int? quantity,
    int? stockId,
    List<Addon>? addons,
  }) =>
      CartLocalModel(
        quantity: quantity ?? this.quantity,
        stockId: stockId ?? this.stockId,
        addons: addons ?? this.addons,
      );

  factory CartLocalModel.fromRawJson(String str) =>
      CartLocalModel.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory CartLocalModel.fromJson(Map<String, dynamic> json) => CartLocalModel(
        quantity: json["quantity"],
        stockId: json["stock_id"],
        addons: json["addons"] == null
            ? []
            : List<Addon>.from(json["addons"]!.map((x) => Addon.fromJson(x))),
      );

  Map<String, dynamic> toJson() => {
        "quantity": quantity,
        "stock_id": stockId,
        "addons": addons == null
            ? []
            : List<dynamic>.from(addons!.map((x) => x.toJson())),
      };
}

class Addon {
  int stockId;
  int quantity;
  int? parentId;

  Addon({
    required this.stockId,
    required this.quantity,
    this.parentId,
  });

  Addon copyWith({
    int? stockId,
    int? quantity,
    int? parentId,
  }) =>
      Addon(
        stockId: stockId ?? this.stockId,
        quantity: quantity ?? this.quantity,
        parentId: parentId ?? this.parentId,
      );

  factory Addon.fromRawJson(String str) => Addon.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Addon.fromJson(Map<String, dynamic> json) => Addon(
        stockId: json["stock_id"],
        quantity: json["quantity"],
        parentId: json["parent_id"],
      );

  Map<String, dynamic> toJson() => {
        "stock_id": stockId,
        "quantity": quantity,
        if(parentId!=null)"parent_id": parentId,
      };
}
