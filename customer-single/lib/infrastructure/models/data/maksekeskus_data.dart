class MaksekeskusData {
  List<Method>? methods;
  int? paymentId;
  String? modelType;
  int? modelId;
  int? totalPrice;
  String? currency;
  int? cartId;
  int? userId;
  String? status;
  int? currencyId;
  int? rate;
  String? deliveryType;
  String? deliveryDate;
  int? addressId;
  int? deliveryPointId;

  MaksekeskusData({
    this.methods,
    this.paymentId,
    this.modelType,
    this.modelId,
    this.totalPrice,
    this.currency,
    this.cartId,
    this.userId,
    this.status,
    this.currencyId,
    this.rate,
    this.deliveryType,
    this.deliveryDate,
    this.addressId,
    this.deliveryPointId,
  });

  MaksekeskusData copyWith({
    List<Method>? methods,
    int? paymentId,
    String? modelType,
    int? modelId,
    int? totalPrice,
    String? currency,
    int? cartId,
    int? userId,
    String? status,
    int? currencyId,
    int? rate,
    String? deliveryType,
    String? deliveryDate,
    int? addressId,
    int? deliveryPointId,
  }) =>
      MaksekeskusData(
        methods: methods ?? this.methods,
        paymentId: paymentId ?? this.paymentId,
        modelType: modelType ?? this.modelType,
        modelId: modelId ?? this.modelId,
        totalPrice: totalPrice ?? this.totalPrice,
        currency: currency ?? this.currency,
        cartId: cartId ?? this.cartId,
        userId: userId ?? this.userId,
        status: status ?? this.status,
        currencyId: currencyId ?? this.currencyId,
        rate: rate ?? this.rate,
        deliveryType: deliveryType ?? this.deliveryType,
        deliveryDate: deliveryDate ?? this.deliveryDate,
        addressId: addressId ?? this.addressId,
        deliveryPointId: deliveryPointId ?? this.deliveryPointId,
      );

  factory MaksekeskusData.fromJson(Map<String, dynamic> json) => MaksekeskusData(
    methods: json["methods"] == null
        ? []
        : List<Method>.from(
        json["methods"]!.map((x) => Method.fromJson(x))),
    paymentId: json["payment_id"],
    modelType: json["model_type"],
    modelId: json["model_id"],
    totalPrice: json["total_price"],
    currency: json["currency"],
    cartId: json["cart_id"],
    userId: json["user_id"],
    status: json["status"],
    currencyId: json["currency_id"],
    rate: json["rate"],
    deliveryType: json["delivery_type"],
    deliveryDate: json["delivery_date"],
    addressId: json["address_id"],
    deliveryPointId: json["delivery_point_id"],
  );

  Map<String, dynamic> toJson() => {
    "methods": methods == null
        ? []
        : List<dynamic>.from(methods!.map((x) => x.toJson())),
    "payment_id": paymentId,
    "model_type": modelType,
    "model_id": modelId,
    "total_price": totalPrice,
    "currency": currency,
    "cart_id": cartId,
    "user_id": userId,
    "status": status,
    "currency_id": currencyId,
    "rate": rate,
    "delivery_type": deliveryType,
    "delivery_date": deliveryDate,
    "address_id": addressId,
    "delivery_point_id": deliveryPointId,
  };
}

class Method {
  String? channel;
  List<String>? countries;
  String? country;
  String? displayName;
  String? logoUrl;
  int? maxAmount;
  String? name;
  String? url;

  Method({
    this.channel,
    this.countries,
    this.country,
    this.displayName,
    this.logoUrl,
    this.maxAmount,
    this.name,
    this.url,
  });

  Method copyWith({
    String? channel,
    List<String>? countries,
    String? country,
    String? displayName,
    String? logoUrl,
    int? maxAmount,
    String? name,
    String? url,
  }) =>
      Method(
        channel: channel ?? this.channel,
        countries: countries ?? this.countries,
        country: country ?? this.country,
        displayName: displayName ?? this.displayName,
        logoUrl: logoUrl ?? this.logoUrl,
        maxAmount: maxAmount ?? this.maxAmount,
        name: name ?? this.name,
        url: url ?? this.url,
      );

  factory Method.fromJson(Map<String, dynamic> json) => Method(
    channel: json["channel"],
    countries: json["countries"] == null
        ? []
        : List<String>.from(json["countries"]!.map((x) => x)),
    country: json["country"],
    displayName: json["display_name"],
    logoUrl: json["logo_url"],
    maxAmount: json["max_amount"],
    name: json["name"],
    url: json["url"],
  );

  Map<String, dynamic> toJson() => {
    "channel": channel,
    "countries": countries == null
        ? []
        : List<dynamic>.from(countries!.map((x) => x)),
    "country": country,
    "display_name": displayName,
    "logo_url": logoUrl,
    "max_amount": maxAmount,
    "name": name,
    "url": url,
  };
}

