import 'package:riverpodtemp/infrastructure/models/data/user.dart';
import 'package:riverpodtemp/infrastructure/models/response/transactions_response_two.dart';

class TransactionDataNew {
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
  TransactionDataNew({
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

  TransactionDataNew copyWith({
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
      TransactionDataNew(
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

  factory TransactionDataNew.fromJson(Map<String, dynamic> json) => TransactionDataNew(
    id: json["id"],
    payableId: json["payable_id"],
    price: json["price"]?.toDouble(),
    note: json["note"],
    request: json["request"],
    performTime: json["perform_time"] == null ? null : DateTime.parse(json["perform_time"]),
    status: json["status"],
    type: json["type"],
    statusDescription: json["status_description"],
    createdAt: json["created_at"] == null ? null : DateTime.parse(json["created_at"]).toLocal(),
    updatedAt: json["updated_at"] == null ? null : DateTime.parse(json["updated_at"]).toLocal(),
    paymentSystem: json["payment_system"] == null ? null : PaymentSystem.fromJson(json["payment_system"]),
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