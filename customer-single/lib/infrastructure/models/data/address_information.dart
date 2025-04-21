class AddressInformation {
  AddressInformation({
    String? address,
    String? office,
    String? house,
    String? floor,
  }) {
    _office = office;
    _house = house;
    _floor = floor;
    _address = address;
  }

  AddressInformation.fromJson(Map? json) {
    _office = json?['office'] as String?;
    _house = json?['house'] as String?;
    _floor = json?['floor'] as String?;
    _address = json?['address'] as String?;
  }

  String? _office;
  String? _house;
  String? _floor;
  String? _address;

  AddressInformation copyWith({
    String? office,
    String? house,
    String? floor,
    String? address,
  }) =>
      AddressInformation(
        office: office ?? _office,
        house: house ?? _house,
        floor: floor ?? _floor,
        address: address ?? _address,
      );

  String? get office => _office;

  String? get house => _house;

  String? get floor => _floor;

  String? get address => _address;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    map['office'] = _office;
    map['house'] = _house;
    map['floor'] = _floor;
    map['address'] = _address;
    return map;
  }
}
