// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'order_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

/// @nodoc
mixin _$OrderState {
  bool get isActive => throw _privateConstructorUsedError;
  bool get isOrder => throw _privateConstructorUsedError;
  bool get isLoading => throw _privateConstructorUsedError;
  bool get isMapLoading => throw _privateConstructorUsedError;
  bool get isButtonLoading => throw _privateConstructorUsedError;
  bool get isTodayWorkingDay => throw _privateConstructorUsedError;
  bool get isTomorrowWorkingDay => throw _privateConstructorUsedError;
  num? get walletPrice => throw _privateConstructorUsedError;
  bool get isCheckShopOrder => throw _privateConstructorUsedError;
  bool get isAddLoading => throw _privateConstructorUsedError;
  String? get promoCode => throw _privateConstructorUsedError;
  String? get office => throw _privateConstructorUsedError;
  String? get house => throw _privateConstructorUsedError;
  String? get floor => throw _privateConstructorUsedError;
  String? get note => throw _privateConstructorUsedError;
  TimeOfDay? get selectTime => throw _privateConstructorUsedError;
  DateTime? get selectDate => throw _privateConstructorUsedError;
  TimeOfDay get startTodayTime => throw _privateConstructorUsedError;
  TimeOfDay get endTodayTime => throw _privateConstructorUsedError;
  TimeOfDay get startTomorrowTime => throw _privateConstructorUsedError;
  TimeOfDay get endTomorrowTime => throw _privateConstructorUsedError;
  int get tabIndex => throw _privateConstructorUsedError;
  int get branchIndex => throw _privateConstructorUsedError;
  OrderActiveModel? get orderData => throw _privateConstructorUsedError;
  ShopData? get shopData => throw _privateConstructorUsedError;
  List<BranchModel>? get branches => throw _privateConstructorUsedError;
  GetCalculateModel? get calculateData => throw _privateConstructorUsedError;
  Map<MarkerId, Marker> get markers => throw _privateConstructorUsedError;
  Set<Marker> get shopMarkers => throw _privateConstructorUsedError;
  List<String> get todayTimes => throw _privateConstructorUsedError;
  List<List<String>> get dailyTimes => throw _privateConstructorUsedError;
  DeliveryOptionData? get deliveryOption => throw _privateConstructorUsedError;
  List<DeliveryOptionData> get deliveryOptions =>
      throw _privateConstructorUsedError;
  List<LatLng> get polylineCoordinates => throw _privateConstructorUsedError;

  /// Create a copy of OrderState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $OrderStateCopyWith<OrderState> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $OrderStateCopyWith<$Res> {
  factory $OrderStateCopyWith(
          OrderState value, $Res Function(OrderState) then) =
      _$OrderStateCopyWithImpl<$Res, OrderState>;
  @useResult
  $Res call(
      {bool isActive,
      bool isOrder,
      bool isLoading,
      bool isMapLoading,
      bool isButtonLoading,
      bool isTodayWorkingDay,
      bool isTomorrowWorkingDay,
      num? walletPrice,
      bool isCheckShopOrder,
      bool isAddLoading,
      String? promoCode,
      String? office,
      String? house,
      String? floor,
      String? note,
      TimeOfDay? selectTime,
      DateTime? selectDate,
      TimeOfDay startTodayTime,
      TimeOfDay endTodayTime,
      TimeOfDay startTomorrowTime,
      TimeOfDay endTomorrowTime,
      int tabIndex,
      int branchIndex,
      OrderActiveModel? orderData,
      ShopData? shopData,
      List<BranchModel>? branches,
      GetCalculateModel? calculateData,
      Map<MarkerId, Marker> markers,
      Set<Marker> shopMarkers,
      List<String> todayTimes,
      List<List<String>> dailyTimes,
      DeliveryOptionData? deliveryOption,
      List<DeliveryOptionData> deliveryOptions,
      List<LatLng> polylineCoordinates});
}

/// @nodoc
class _$OrderStateCopyWithImpl<$Res, $Val extends OrderState>
    implements $OrderStateCopyWith<$Res> {
  _$OrderStateCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of OrderState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? isActive = null,
    Object? isOrder = null,
    Object? isLoading = null,
    Object? isMapLoading = null,
    Object? isButtonLoading = null,
    Object? isTodayWorkingDay = null,
    Object? isTomorrowWorkingDay = null,
    Object? walletPrice = freezed,
    Object? isCheckShopOrder = null,
    Object? isAddLoading = null,
    Object? promoCode = freezed,
    Object? office = freezed,
    Object? house = freezed,
    Object? floor = freezed,
    Object? note = freezed,
    Object? selectTime = freezed,
    Object? selectDate = freezed,
    Object? startTodayTime = null,
    Object? endTodayTime = null,
    Object? startTomorrowTime = null,
    Object? endTomorrowTime = null,
    Object? tabIndex = null,
    Object? branchIndex = null,
    Object? orderData = freezed,
    Object? shopData = freezed,
    Object? branches = freezed,
    Object? calculateData = freezed,
    Object? markers = null,
    Object? shopMarkers = null,
    Object? todayTimes = null,
    Object? dailyTimes = null,
    Object? deliveryOption = freezed,
    Object? deliveryOptions = null,
    Object? polylineCoordinates = null,
  }) {
    return _then(_value.copyWith(
      isActive: null == isActive
          ? _value.isActive
          : isActive // ignore: cast_nullable_to_non_nullable
              as bool,
      isOrder: null == isOrder
          ? _value.isOrder
          : isOrder // ignore: cast_nullable_to_non_nullable
              as bool,
      isLoading: null == isLoading
          ? _value.isLoading
          : isLoading // ignore: cast_nullable_to_non_nullable
              as bool,
      isMapLoading: null == isMapLoading
          ? _value.isMapLoading
          : isMapLoading // ignore: cast_nullable_to_non_nullable
              as bool,
      isButtonLoading: null == isButtonLoading
          ? _value.isButtonLoading
          : isButtonLoading // ignore: cast_nullable_to_non_nullable
              as bool,
      isTodayWorkingDay: null == isTodayWorkingDay
          ? _value.isTodayWorkingDay
          : isTodayWorkingDay // ignore: cast_nullable_to_non_nullable
              as bool,
      isTomorrowWorkingDay: null == isTomorrowWorkingDay
          ? _value.isTomorrowWorkingDay
          : isTomorrowWorkingDay // ignore: cast_nullable_to_non_nullable
              as bool,
      walletPrice: freezed == walletPrice
          ? _value.walletPrice
          : walletPrice // ignore: cast_nullable_to_non_nullable
              as num?,
      isCheckShopOrder: null == isCheckShopOrder
          ? _value.isCheckShopOrder
          : isCheckShopOrder // ignore: cast_nullable_to_non_nullable
              as bool,
      isAddLoading: null == isAddLoading
          ? _value.isAddLoading
          : isAddLoading // ignore: cast_nullable_to_non_nullable
              as bool,
      promoCode: freezed == promoCode
          ? _value.promoCode
          : promoCode // ignore: cast_nullable_to_non_nullable
              as String?,
      office: freezed == office
          ? _value.office
          : office // ignore: cast_nullable_to_non_nullable
              as String?,
      house: freezed == house
          ? _value.house
          : house // ignore: cast_nullable_to_non_nullable
              as String?,
      floor: freezed == floor
          ? _value.floor
          : floor // ignore: cast_nullable_to_non_nullable
              as String?,
      note: freezed == note
          ? _value.note
          : note // ignore: cast_nullable_to_non_nullable
              as String?,
      selectTime: freezed == selectTime
          ? _value.selectTime
          : selectTime // ignore: cast_nullable_to_non_nullable
              as TimeOfDay?,
      selectDate: freezed == selectDate
          ? _value.selectDate
          : selectDate // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      startTodayTime: null == startTodayTime
          ? _value.startTodayTime
          : startTodayTime // ignore: cast_nullable_to_non_nullable
              as TimeOfDay,
      endTodayTime: null == endTodayTime
          ? _value.endTodayTime
          : endTodayTime // ignore: cast_nullable_to_non_nullable
              as TimeOfDay,
      startTomorrowTime: null == startTomorrowTime
          ? _value.startTomorrowTime
          : startTomorrowTime // ignore: cast_nullable_to_non_nullable
              as TimeOfDay,
      endTomorrowTime: null == endTomorrowTime
          ? _value.endTomorrowTime
          : endTomorrowTime // ignore: cast_nullable_to_non_nullable
              as TimeOfDay,
      tabIndex: null == tabIndex
          ? _value.tabIndex
          : tabIndex // ignore: cast_nullable_to_non_nullable
              as int,
      branchIndex: null == branchIndex
          ? _value.branchIndex
          : branchIndex // ignore: cast_nullable_to_non_nullable
              as int,
      orderData: freezed == orderData
          ? _value.orderData
          : orderData // ignore: cast_nullable_to_non_nullable
              as OrderActiveModel?,
      shopData: freezed == shopData
          ? _value.shopData
          : shopData // ignore: cast_nullable_to_non_nullable
              as ShopData?,
      branches: freezed == branches
          ? _value.branches
          : branches // ignore: cast_nullable_to_non_nullable
              as List<BranchModel>?,
      calculateData: freezed == calculateData
          ? _value.calculateData
          : calculateData // ignore: cast_nullable_to_non_nullable
              as GetCalculateModel?,
      markers: null == markers
          ? _value.markers
          : markers // ignore: cast_nullable_to_non_nullable
              as Map<MarkerId, Marker>,
      shopMarkers: null == shopMarkers
          ? _value.shopMarkers
          : shopMarkers // ignore: cast_nullable_to_non_nullable
              as Set<Marker>,
      todayTimes: null == todayTimes
          ? _value.todayTimes
          : todayTimes // ignore: cast_nullable_to_non_nullable
              as List<String>,
      dailyTimes: null == dailyTimes
          ? _value.dailyTimes
          : dailyTimes // ignore: cast_nullable_to_non_nullable
              as List<List<String>>,
      deliveryOption: freezed == deliveryOption
          ? _value.deliveryOption
          : deliveryOption // ignore: cast_nullable_to_non_nullable
              as DeliveryOptionData?,
      deliveryOptions: null == deliveryOptions
          ? _value.deliveryOptions
          : deliveryOptions // ignore: cast_nullable_to_non_nullable
              as List<DeliveryOptionData>,
      polylineCoordinates: null == polylineCoordinates
          ? _value.polylineCoordinates
          : polylineCoordinates // ignore: cast_nullable_to_non_nullable
              as List<LatLng>,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$OrderStateImplCopyWith<$Res>
    implements $OrderStateCopyWith<$Res> {
  factory _$$OrderStateImplCopyWith(
          _$OrderStateImpl value, $Res Function(_$OrderStateImpl) then) =
      __$$OrderStateImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {bool isActive,
      bool isOrder,
      bool isLoading,
      bool isMapLoading,
      bool isButtonLoading,
      bool isTodayWorkingDay,
      bool isTomorrowWorkingDay,
      num? walletPrice,
      bool isCheckShopOrder,
      bool isAddLoading,
      String? promoCode,
      String? office,
      String? house,
      String? floor,
      String? note,
      TimeOfDay? selectTime,
      DateTime? selectDate,
      TimeOfDay startTodayTime,
      TimeOfDay endTodayTime,
      TimeOfDay startTomorrowTime,
      TimeOfDay endTomorrowTime,
      int tabIndex,
      int branchIndex,
      OrderActiveModel? orderData,
      ShopData? shopData,
      List<BranchModel>? branches,
      GetCalculateModel? calculateData,
      Map<MarkerId, Marker> markers,
      Set<Marker> shopMarkers,
      List<String> todayTimes,
      List<List<String>> dailyTimes,
      DeliveryOptionData? deliveryOption,
      List<DeliveryOptionData> deliveryOptions,
      List<LatLng> polylineCoordinates});
}

/// @nodoc
class __$$OrderStateImplCopyWithImpl<$Res>
    extends _$OrderStateCopyWithImpl<$Res, _$OrderStateImpl>
    implements _$$OrderStateImplCopyWith<$Res> {
  __$$OrderStateImplCopyWithImpl(
      _$OrderStateImpl _value, $Res Function(_$OrderStateImpl) _then)
      : super(_value, _then);

  /// Create a copy of OrderState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? isActive = null,
    Object? isOrder = null,
    Object? isLoading = null,
    Object? isMapLoading = null,
    Object? isButtonLoading = null,
    Object? isTodayWorkingDay = null,
    Object? isTomorrowWorkingDay = null,
    Object? walletPrice = freezed,
    Object? isCheckShopOrder = null,
    Object? isAddLoading = null,
    Object? promoCode = freezed,
    Object? office = freezed,
    Object? house = freezed,
    Object? floor = freezed,
    Object? note = freezed,
    Object? selectTime = freezed,
    Object? selectDate = freezed,
    Object? startTodayTime = null,
    Object? endTodayTime = null,
    Object? startTomorrowTime = null,
    Object? endTomorrowTime = null,
    Object? tabIndex = null,
    Object? branchIndex = null,
    Object? orderData = freezed,
    Object? shopData = freezed,
    Object? branches = freezed,
    Object? calculateData = freezed,
    Object? markers = null,
    Object? shopMarkers = null,
    Object? todayTimes = null,
    Object? dailyTimes = null,
    Object? deliveryOption = freezed,
    Object? deliveryOptions = null,
    Object? polylineCoordinates = null,
  }) {
    return _then(_$OrderStateImpl(
      isActive: null == isActive
          ? _value.isActive
          : isActive // ignore: cast_nullable_to_non_nullable
              as bool,
      isOrder: null == isOrder
          ? _value.isOrder
          : isOrder // ignore: cast_nullable_to_non_nullable
              as bool,
      isLoading: null == isLoading
          ? _value.isLoading
          : isLoading // ignore: cast_nullable_to_non_nullable
              as bool,
      isMapLoading: null == isMapLoading
          ? _value.isMapLoading
          : isMapLoading // ignore: cast_nullable_to_non_nullable
              as bool,
      isButtonLoading: null == isButtonLoading
          ? _value.isButtonLoading
          : isButtonLoading // ignore: cast_nullable_to_non_nullable
              as bool,
      isTodayWorkingDay: null == isTodayWorkingDay
          ? _value.isTodayWorkingDay
          : isTodayWorkingDay // ignore: cast_nullable_to_non_nullable
              as bool,
      isTomorrowWorkingDay: null == isTomorrowWorkingDay
          ? _value.isTomorrowWorkingDay
          : isTomorrowWorkingDay // ignore: cast_nullable_to_non_nullable
              as bool,
      walletPrice: freezed == walletPrice
          ? _value.walletPrice
          : walletPrice // ignore: cast_nullable_to_non_nullable
              as num?,
      isCheckShopOrder: null == isCheckShopOrder
          ? _value.isCheckShopOrder
          : isCheckShopOrder // ignore: cast_nullable_to_non_nullable
              as bool,
      isAddLoading: null == isAddLoading
          ? _value.isAddLoading
          : isAddLoading // ignore: cast_nullable_to_non_nullable
              as bool,
      promoCode: freezed == promoCode
          ? _value.promoCode
          : promoCode // ignore: cast_nullable_to_non_nullable
              as String?,
      office: freezed == office
          ? _value.office
          : office // ignore: cast_nullable_to_non_nullable
              as String?,
      house: freezed == house
          ? _value.house
          : house // ignore: cast_nullable_to_non_nullable
              as String?,
      floor: freezed == floor
          ? _value.floor
          : floor // ignore: cast_nullable_to_non_nullable
              as String?,
      note: freezed == note
          ? _value.note
          : note // ignore: cast_nullable_to_non_nullable
              as String?,
      selectTime: freezed == selectTime
          ? _value.selectTime
          : selectTime // ignore: cast_nullable_to_non_nullable
              as TimeOfDay?,
      selectDate: freezed == selectDate
          ? _value.selectDate
          : selectDate // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      startTodayTime: null == startTodayTime
          ? _value.startTodayTime
          : startTodayTime // ignore: cast_nullable_to_non_nullable
              as TimeOfDay,
      endTodayTime: null == endTodayTime
          ? _value.endTodayTime
          : endTodayTime // ignore: cast_nullable_to_non_nullable
              as TimeOfDay,
      startTomorrowTime: null == startTomorrowTime
          ? _value.startTomorrowTime
          : startTomorrowTime // ignore: cast_nullable_to_non_nullable
              as TimeOfDay,
      endTomorrowTime: null == endTomorrowTime
          ? _value.endTomorrowTime
          : endTomorrowTime // ignore: cast_nullable_to_non_nullable
              as TimeOfDay,
      tabIndex: null == tabIndex
          ? _value.tabIndex
          : tabIndex // ignore: cast_nullable_to_non_nullable
              as int,
      branchIndex: null == branchIndex
          ? _value.branchIndex
          : branchIndex // ignore: cast_nullable_to_non_nullable
              as int,
      orderData: freezed == orderData
          ? _value.orderData
          : orderData // ignore: cast_nullable_to_non_nullable
              as OrderActiveModel?,
      shopData: freezed == shopData
          ? _value.shopData
          : shopData // ignore: cast_nullable_to_non_nullable
              as ShopData?,
      branches: freezed == branches
          ? _value._branches
          : branches // ignore: cast_nullable_to_non_nullable
              as List<BranchModel>?,
      calculateData: freezed == calculateData
          ? _value.calculateData
          : calculateData // ignore: cast_nullable_to_non_nullable
              as GetCalculateModel?,
      markers: null == markers
          ? _value._markers
          : markers // ignore: cast_nullable_to_non_nullable
              as Map<MarkerId, Marker>,
      shopMarkers: null == shopMarkers
          ? _value._shopMarkers
          : shopMarkers // ignore: cast_nullable_to_non_nullable
              as Set<Marker>,
      todayTimes: null == todayTimes
          ? _value._todayTimes
          : todayTimes // ignore: cast_nullable_to_non_nullable
              as List<String>,
      dailyTimes: null == dailyTimes
          ? _value._dailyTimes
          : dailyTimes // ignore: cast_nullable_to_non_nullable
              as List<List<String>>,
      deliveryOption: freezed == deliveryOption
          ? _value.deliveryOption
          : deliveryOption // ignore: cast_nullable_to_non_nullable
              as DeliveryOptionData?,
      deliveryOptions: null == deliveryOptions
          ? _value._deliveryOptions
          : deliveryOptions // ignore: cast_nullable_to_non_nullable
              as List<DeliveryOptionData>,
      polylineCoordinates: null == polylineCoordinates
          ? _value._polylineCoordinates
          : polylineCoordinates // ignore: cast_nullable_to_non_nullable
              as List<LatLng>,
    ));
  }
}

/// @nodoc

class _$OrderStateImpl extends _OrderState {
  const _$OrderStateImpl(
      {this.isActive = false,
      this.isOrder = false,
      this.isLoading = false,
      this.isMapLoading = false,
      this.isButtonLoading = false,
      this.isTodayWorkingDay = false,
      this.isTomorrowWorkingDay = false,
      this.walletPrice = null,
      this.isCheckShopOrder = false,
      this.isAddLoading = false,
      this.promoCode = null,
      this.office = null,
      this.house = null,
      this.floor = null,
      this.note = null,
      this.selectTime = null,
      this.selectDate = null,
      this.startTodayTime = const TimeOfDay(hour: 0, minute: 0),
      this.endTodayTime = const TimeOfDay(hour: 0, minute: 0),
      this.startTomorrowTime = const TimeOfDay(hour: 0, minute: 0),
      this.endTomorrowTime = const TimeOfDay(hour: 0, minute: 0),
      this.tabIndex = 0,
      this.branchIndex = -1,
      this.orderData = null,
      this.shopData = null,
      final List<BranchModel>? branches = const [],
      this.calculateData = null,
      final Map<MarkerId, Marker> markers = const {},
      final Set<Marker> shopMarkers = const {},
      final List<String> todayTimes = const [],
      final List<List<String>> dailyTimes = const [],
      this.deliveryOption = null,
      final List<DeliveryOptionData> deliveryOptions = const [],
      final List<LatLng> polylineCoordinates = const []})
      : _branches = branches,
        _markers = markers,
        _shopMarkers = shopMarkers,
        _todayTimes = todayTimes,
        _dailyTimes = dailyTimes,
        _deliveryOptions = deliveryOptions,
        _polylineCoordinates = polylineCoordinates,
        super._();

  @override
  @JsonKey()
  final bool isActive;
  @override
  @JsonKey()
  final bool isOrder;
  @override
  @JsonKey()
  final bool isLoading;
  @override
  @JsonKey()
  final bool isMapLoading;
  @override
  @JsonKey()
  final bool isButtonLoading;
  @override
  @JsonKey()
  final bool isTodayWorkingDay;
  @override
  @JsonKey()
  final bool isTomorrowWorkingDay;
  @override
  @JsonKey()
  final num? walletPrice;
  @override
  @JsonKey()
  final bool isCheckShopOrder;
  @override
  @JsonKey()
  final bool isAddLoading;
  @override
  @JsonKey()
  final String? promoCode;
  @override
  @JsonKey()
  final String? office;
  @override
  @JsonKey()
  final String? house;
  @override
  @JsonKey()
  final String? floor;
  @override
  @JsonKey()
  final String? note;
  @override
  @JsonKey()
  final TimeOfDay? selectTime;
  @override
  @JsonKey()
  final DateTime? selectDate;
  @override
  @JsonKey()
  final TimeOfDay startTodayTime;
  @override
  @JsonKey()
  final TimeOfDay endTodayTime;
  @override
  @JsonKey()
  final TimeOfDay startTomorrowTime;
  @override
  @JsonKey()
  final TimeOfDay endTomorrowTime;
  @override
  @JsonKey()
  final int tabIndex;
  @override
  @JsonKey()
  final int branchIndex;
  @override
  @JsonKey()
  final OrderActiveModel? orderData;
  @override
  @JsonKey()
  final ShopData? shopData;
  final List<BranchModel>? _branches;
  @override
  @JsonKey()
  List<BranchModel>? get branches {
    final value = _branches;
    if (value == null) return null;
    if (_branches is EqualUnmodifiableListView) return _branches;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  @JsonKey()
  final GetCalculateModel? calculateData;
  final Map<MarkerId, Marker> _markers;
  @override
  @JsonKey()
  Map<MarkerId, Marker> get markers {
    if (_markers is EqualUnmodifiableMapView) return _markers;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(_markers);
  }

  final Set<Marker> _shopMarkers;
  @override
  @JsonKey()
  Set<Marker> get shopMarkers {
    if (_shopMarkers is EqualUnmodifiableSetView) return _shopMarkers;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableSetView(_shopMarkers);
  }

  final List<String> _todayTimes;
  @override
  @JsonKey()
  List<String> get todayTimes {
    if (_todayTimes is EqualUnmodifiableListView) return _todayTimes;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_todayTimes);
  }

  final List<List<String>> _dailyTimes;
  @override
  @JsonKey()
  List<List<String>> get dailyTimes {
    if (_dailyTimes is EqualUnmodifiableListView) return _dailyTimes;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_dailyTimes);
  }

  @override
  @JsonKey()
  final DeliveryOptionData? deliveryOption;
  final List<DeliveryOptionData> _deliveryOptions;
  @override
  @JsonKey()
  List<DeliveryOptionData> get deliveryOptions {
    if (_deliveryOptions is EqualUnmodifiableListView) return _deliveryOptions;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_deliveryOptions);
  }

  final List<LatLng> _polylineCoordinates;
  @override
  @JsonKey()
  List<LatLng> get polylineCoordinates {
    if (_polylineCoordinates is EqualUnmodifiableListView)
      return _polylineCoordinates;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_polylineCoordinates);
  }

  @override
  String toString() {
    return 'OrderState(isActive: $isActive, isOrder: $isOrder, isLoading: $isLoading, isMapLoading: $isMapLoading, isButtonLoading: $isButtonLoading, isTodayWorkingDay: $isTodayWorkingDay, isTomorrowWorkingDay: $isTomorrowWorkingDay, walletPrice: $walletPrice, isCheckShopOrder: $isCheckShopOrder, isAddLoading: $isAddLoading, promoCode: $promoCode, office: $office, house: $house, floor: $floor, note: $note, selectTime: $selectTime, selectDate: $selectDate, startTodayTime: $startTodayTime, endTodayTime: $endTodayTime, startTomorrowTime: $startTomorrowTime, endTomorrowTime: $endTomorrowTime, tabIndex: $tabIndex, branchIndex: $branchIndex, orderData: $orderData, shopData: $shopData, branches: $branches, calculateData: $calculateData, markers: $markers, shopMarkers: $shopMarkers, todayTimes: $todayTimes, dailyTimes: $dailyTimes, deliveryOption: $deliveryOption, deliveryOptions: $deliveryOptions, polylineCoordinates: $polylineCoordinates)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$OrderStateImpl &&
            (identical(other.isActive, isActive) ||
                other.isActive == isActive) &&
            (identical(other.isOrder, isOrder) || other.isOrder == isOrder) &&
            (identical(other.isLoading, isLoading) ||
                other.isLoading == isLoading) &&
            (identical(other.isMapLoading, isMapLoading) ||
                other.isMapLoading == isMapLoading) &&
            (identical(other.isButtonLoading, isButtonLoading) ||
                other.isButtonLoading == isButtonLoading) &&
            (identical(other.isTodayWorkingDay, isTodayWorkingDay) ||
                other.isTodayWorkingDay == isTodayWorkingDay) &&
            (identical(other.isTomorrowWorkingDay, isTomorrowWorkingDay) ||
                other.isTomorrowWorkingDay == isTomorrowWorkingDay) &&
            (identical(other.walletPrice, walletPrice) ||
                other.walletPrice == walletPrice) &&
            (identical(other.isCheckShopOrder, isCheckShopOrder) ||
                other.isCheckShopOrder == isCheckShopOrder) &&
            (identical(other.isAddLoading, isAddLoading) ||
                other.isAddLoading == isAddLoading) &&
            (identical(other.promoCode, promoCode) ||
                other.promoCode == promoCode) &&
            (identical(other.office, office) || other.office == office) &&
            (identical(other.house, house) || other.house == house) &&
            (identical(other.floor, floor) || other.floor == floor) &&
            (identical(other.note, note) || other.note == note) &&
            (identical(other.selectTime, selectTime) ||
                other.selectTime == selectTime) &&
            (identical(other.selectDate, selectDate) ||
                other.selectDate == selectDate) &&
            (identical(other.startTodayTime, startTodayTime) ||
                other.startTodayTime == startTodayTime) &&
            (identical(other.endTodayTime, endTodayTime) ||
                other.endTodayTime == endTodayTime) &&
            (identical(other.startTomorrowTime, startTomorrowTime) ||
                other.startTomorrowTime == startTomorrowTime) &&
            (identical(other.endTomorrowTime, endTomorrowTime) ||
                other.endTomorrowTime == endTomorrowTime) &&
            (identical(other.tabIndex, tabIndex) ||
                other.tabIndex == tabIndex) &&
            (identical(other.branchIndex, branchIndex) ||
                other.branchIndex == branchIndex) &&
            (identical(other.orderData, orderData) ||
                other.orderData == orderData) &&
            (identical(other.shopData, shopData) ||
                other.shopData == shopData) &&
            const DeepCollectionEquality().equals(other._branches, _branches) &&
            (identical(other.calculateData, calculateData) ||
                other.calculateData == calculateData) &&
            const DeepCollectionEquality().equals(other._markers, _markers) &&
            const DeepCollectionEquality()
                .equals(other._shopMarkers, _shopMarkers) &&
            const DeepCollectionEquality()
                .equals(other._todayTimes, _todayTimes) &&
            const DeepCollectionEquality()
                .equals(other._dailyTimes, _dailyTimes) &&
            (identical(other.deliveryOption, deliveryOption) ||
                other.deliveryOption == deliveryOption) &&
            const DeepCollectionEquality()
                .equals(other._deliveryOptions, _deliveryOptions) &&
            const DeepCollectionEquality()
                .equals(other._polylineCoordinates, _polylineCoordinates));
  }

  @override
  int get hashCode => Object.hashAll([
        runtimeType,
        isActive,
        isOrder,
        isLoading,
        isMapLoading,
        isButtonLoading,
        isTodayWorkingDay,
        isTomorrowWorkingDay,
        walletPrice,
        isCheckShopOrder,
        isAddLoading,
        promoCode,
        office,
        house,
        floor,
        note,
        selectTime,
        selectDate,
        startTodayTime,
        endTodayTime,
        startTomorrowTime,
        endTomorrowTime,
        tabIndex,
        branchIndex,
        orderData,
        shopData,
        const DeepCollectionEquality().hash(_branches),
        calculateData,
        const DeepCollectionEquality().hash(_markers),
        const DeepCollectionEquality().hash(_shopMarkers),
        const DeepCollectionEquality().hash(_todayTimes),
        const DeepCollectionEquality().hash(_dailyTimes),
        deliveryOption,
        const DeepCollectionEquality().hash(_deliveryOptions),
        const DeepCollectionEquality().hash(_polylineCoordinates)
      ]);

  /// Create a copy of OrderState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$OrderStateImplCopyWith<_$OrderStateImpl> get copyWith =>
      __$$OrderStateImplCopyWithImpl<_$OrderStateImpl>(this, _$identity);
}

abstract class _OrderState extends OrderState {
  const factory _OrderState(
      {final bool isActive,
      final bool isOrder,
      final bool isLoading,
      final bool isMapLoading,
      final bool isButtonLoading,
      final bool isTodayWorkingDay,
      final bool isTomorrowWorkingDay,
      final num? walletPrice,
      final bool isCheckShopOrder,
      final bool isAddLoading,
      final String? promoCode,
      final String? office,
      final String? house,
      final String? floor,
      final String? note,
      final TimeOfDay? selectTime,
      final DateTime? selectDate,
      final TimeOfDay startTodayTime,
      final TimeOfDay endTodayTime,
      final TimeOfDay startTomorrowTime,
      final TimeOfDay endTomorrowTime,
      final int tabIndex,
      final int branchIndex,
      final OrderActiveModel? orderData,
      final ShopData? shopData,
      final List<BranchModel>? branches,
      final GetCalculateModel? calculateData,
      final Map<MarkerId, Marker> markers,
      final Set<Marker> shopMarkers,
      final List<String> todayTimes,
      final List<List<String>> dailyTimes,
      final DeliveryOptionData? deliveryOption,
      final List<DeliveryOptionData> deliveryOptions,
      final List<LatLng> polylineCoordinates}) = _$OrderStateImpl;
  const _OrderState._() : super._();

  @override
  bool get isActive;
  @override
  bool get isOrder;
  @override
  bool get isLoading;
  @override
  bool get isMapLoading;
  @override
  bool get isButtonLoading;
  @override
  bool get isTodayWorkingDay;
  @override
  bool get isTomorrowWorkingDay;
  @override
  num? get walletPrice;
  @override
  bool get isCheckShopOrder;
  @override
  bool get isAddLoading;
  @override
  String? get promoCode;
  @override
  String? get office;
  @override
  String? get house;
  @override
  String? get floor;
  @override
  String? get note;
  @override
  TimeOfDay? get selectTime;
  @override
  DateTime? get selectDate;
  @override
  TimeOfDay get startTodayTime;
  @override
  TimeOfDay get endTodayTime;
  @override
  TimeOfDay get startTomorrowTime;
  @override
  TimeOfDay get endTomorrowTime;
  @override
  int get tabIndex;
  @override
  int get branchIndex;
  @override
  OrderActiveModel? get orderData;
  @override
  ShopData? get shopData;
  @override
  List<BranchModel>? get branches;
  @override
  GetCalculateModel? get calculateData;
  @override
  Map<MarkerId, Marker> get markers;
  @override
  Set<Marker> get shopMarkers;
  @override
  List<String> get todayTimes;
  @override
  List<List<String>> get dailyTimes;
  @override
  DeliveryOptionData? get deliveryOption;
  @override
  List<DeliveryOptionData> get deliveryOptions;
  @override
  List<LatLng> get polylineCoordinates;

  /// Create a copy of OrderState
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$OrderStateImplCopyWith<_$OrderStateImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
