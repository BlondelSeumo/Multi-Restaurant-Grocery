import 'package:riverpodtemp/infrastructure/models/data/user.dart';

class TransactionsResponseTwo {
  TransactionsResponseTwo({
    String? timestamp,
    bool? status,
    String? message,
    List<TransactionDataTwo>? data,
  }) {
    _timestamp = timestamp;
    _status = status;
    _message = message;
    _data = data;
  }

  TransactionsResponseTwo.fromJson(dynamic json) {
    _timestamp = json['timestamp'];
    _status = json['status'];
    _message = json['message'];
    if (json['data'] != null) {
      _data = [];
      json['data'].forEach((v) {
        _data?.add(TransactionDataTwo.fromJson(v));
      });
    }
  }

  String? _timestamp;
  bool? _status;
  String? _message;
  List<TransactionDataTwo>? _data;

  TransactionsResponseTwo copyWith({
    String? timestamp,
    bool? status,
    String? message,
    List<TransactionDataTwo>? data,
  }) =>
      TransactionsResponseTwo(
        timestamp: timestamp ?? _timestamp,
        status: status ?? _status,
        message: message ?? _message,
        data: data ?? _data,
      );

  String? get timestamp => _timestamp;

  bool? get status => _status;

  String? get message => _message;

  List<TransactionDataTwo>? get data => _data;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['timestamp'] = _timestamp;
    map['status'] = _status;
    map['message'] = _message;
    if (_data != null) {
      map['data'] = _data?.map((v) => v.toJson()).toList();
    }
    return map;
  }
}

class TransactionDataTwo {
  int? id;
  int? payableId;
  double? price;
  String? note;
  String? request;
  DateTime? performTime;
  String? status;
  String? type;
  String? statusDescription;
  DateTime? createdAt;
  DateTime? updatedAt;
  PaymentSystem? paymentSystem;
  UserModel? user;

  TransactionDataTwo({
    this.id,
    this.payableId,
    this.price,
    this.note,
    this.type,
    this.request,
    this.performTime,
    this.status,
    this.statusDescription,
    this.createdAt,
    this.updatedAt,
    this.paymentSystem,
    this.user,
  });

  TransactionDataTwo copyWith({
    int? id,
    int? payableId,
    double? price,
    String? note,
    String? request,
    DateTime? performTime,
    String? status,
    String? type,
    String? statusDescription,
    DateTime? createdAt,
    DateTime? updatedAt,
    PaymentSystem? paymentSystem,
    UserModel? user,
  }) =>
      TransactionDataTwo(
        id: id ?? this.id,
        payableId: payableId ?? this.payableId,
        price: price ?? this.price,
        note: note ?? this.note,
        request: request ?? this.request,
        performTime: performTime ?? this.performTime,
        status: status ?? this.status,
        type: type ?? this.type,
        statusDescription: statusDescription ?? this.statusDescription,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        paymentSystem: paymentSystem ?? this.paymentSystem,
        user: user ?? this.user,
      );

  factory TransactionDataTwo.fromJson(Map<String, dynamic> json) =>
      TransactionDataTwo(
        id: json["id"],
        payableId: json["payable_id"],
        price: json["price"]?.toDouble(),
        note: json["note"],
        request: json["request"],
        performTime: json["perform_time"] == null
            ? null
            : DateTime.parse(json["perform_time"]),
        status: json["status"],
        type: json["type"],
        statusDescription: json["status_description"],
        createdAt: json["created_at"] == null
            ? null
            : DateTime.parse(json["created_at"]).toLocal(),
        updatedAt: json["updated_at"] == null
            ? null
            : DateTime.parse(json["updated_at"]).toLocal(),
        paymentSystem: json["payment_system"] == null
            ? null
            : PaymentSystem.fromJson(json["payment_system"]),
        user: json["user"] == null ? null : UserModel.fromJson(json["user"]),
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "payable_id": payableId,
        "price": price,
        "note": note,
        "type": type,
        "user": user?.toJson(),
        "request": request,
        "perform_time": performTime?.toIso8601String(),
        "status": status,
        "status_description": statusDescription,
        "created_at": createdAt?.toIso8601String(),
        "updated_at": updatedAt?.toIso8601String(),
        "payment_system": paymentSystem?.toJson(),
      };
}

class PaymentSystem {
  int? id;
  String? tag;
  int? input;
  bool? active;
  DateTime? createdAt;
  DateTime? updatedAt;

  PaymentSystem({
    this.id,
    this.tag,
    this.input,
    this.active,
    this.createdAt,
    this.updatedAt,
  });

  PaymentSystem copyWith({
    int? id,
    String? tag,
    int? input,
    bool? active,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) =>
      PaymentSystem(
        id: id ?? this.id,
        tag: tag ?? this.tag,
        input: input ?? this.input,
        active: active ?? this.active,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
      );

  factory PaymentSystem.fromJson(Map<String, dynamic> json) => PaymentSystem(
        id: json["id"],
        tag: json["tag"],
        input: json["input"],
        active: json["active"],
        createdAt: json["created_at"] == null
            ? null
            : DateTime.parse(json["created_at"]),
        updatedAt: json["updated_at"] == null
            ? null
            : DateTime.parse(json["updated_at"]),
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "tag": tag,
        "input": input,
        "active": active,
        "created_at": createdAt?.toIso8601String(),
        "updated_at": updatedAt?.toIso8601String(),
      };
}
