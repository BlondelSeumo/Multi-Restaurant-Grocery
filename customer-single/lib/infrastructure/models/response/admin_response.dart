class AdminResponse {
  AdminData? data;

  AdminResponse.fromJson(dynamic json) {
    data = json['data'] != null ? AdminData.fromMap(json['data']) : null;
  }
}

class AdminData {
  num? id;
  String? firstname;
  String? lastname;
  bool? emptyP;
  bool? active;
  String? role;

  AdminData({
    this.id,
    this.firstname,
    this.lastname,
    this.emptyP,
    this.active,
    this.role,
  });

  AdminData copyWith({
    num? id,
    String? firstname,
    String? lastname,
    bool? emptyP,
    bool? active,
    String? role,
  }) {
    return AdminData(
      id: id ?? this.id,
      firstname: firstname ?? this.firstname,
      lastname: lastname ?? this.lastname,
      emptyP: emptyP ?? this.emptyP,
      active: active ?? this.active,
      role: role ?? this.role,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'firstname': firstname,
      'lastname': lastname,
      'empty_p': emptyP,
      'active': active,
      'role': role,
    };
  }

  factory AdminData.fromMap(Map<String, dynamic> map) {
    return AdminData(
      id: map['id'] as num,
      firstname: map['firstname'] as String?,
      lastname: map['lastname'] as String?,
      emptyP: map['empty_p'] as bool?,
      active: map['active'] as bool?,
      role: map['role'] as String,
    );
  }
}
