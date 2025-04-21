import '../data/maksekeskus_data.dart';

class MaksekeskusResponse {
  DateTime? timestamp;
  bool? status;
  String? message;
  MaksekeskusData? data;

  MaksekeskusResponse({
    this.timestamp,
    this.status,
    this.message,
    this.data,
  });

  MaksekeskusResponse copyWith({
    DateTime? timestamp,
    bool? status,
    String? message,
    MaksekeskusData? data,
  }) =>
      MaksekeskusResponse(
        timestamp: timestamp ?? this.timestamp,
        status: status ?? this.status,
        message: message ?? this.message,
        data: data ?? this.data,
      );

  factory MaksekeskusResponse.fromJson(Map<String, dynamic> json) =>
      MaksekeskusResponse(
        timestamp: json["timestamp"] == null
            ? null
            : DateTime.parse(json["timestamp"]),
        status: json["status"],
        message: json["message"],
        data: json["data"] == null
            ? null
            : MaksekeskusData.fromJson(json["data"]),
      );

  Map<String, dynamic> toJson() => {
        "timestamp": timestamp?.toIso8601String(),
        "status": status,
        "message": message,
        "data": data?.toJson(),
      };
}


