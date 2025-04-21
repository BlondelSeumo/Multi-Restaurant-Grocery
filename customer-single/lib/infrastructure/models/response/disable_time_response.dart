
import 'package:riverpodtemp/infrastructure/models/data/time_interval_data.dart';

class DisableTimeResponse {
  DisableTimeResponse({List<TimeInterval>? data}) {
    _data = data;
  }

  DisableTimeResponse.fromJson(dynamic json) {
    if (json != null) {
      _data = [];
      json.forEach((v) {
        _data?.add(TimeInterval.fromMap(v));
      });
    }
  }

  List<TimeInterval>? _data;

  DisableTimeResponse copyWith({List<TimeInterval>? data}) =>
      DisableTimeResponse(data: data ?? _data);

  List<TimeInterval>? get data => _data;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    if (_data != null) {
      map['data'] = _data?.map((v) => v.toMap()).toList();
    }
    return map;
  }
}

class DisableData {
  String? startData;
  String? endData;

  DisableData({this.startData, this.endData});

  Map<String, dynamic> toMap() {
    return {
      'start_data': startData,
      'end_data': endData,
    };
  }

  factory DisableData.fromMap(Map<String, dynamic> map) {
    return DisableData(
      startData: map['start_data'] as String,
      endData: map['end_data'] as String,
    );
  }
}
