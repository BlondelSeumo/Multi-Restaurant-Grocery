// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'reservation_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

/// @nodoc
mixin _$ReservationState {
  bool get isLoading => throw _privateConstructorUsedError;
  bool get isSendLoading => throw _privateConstructorUsedError;
  List<MainClass> get sections => throw _privateConstructorUsedError;
  List<ShopSectionData> get data => throw _privateConstructorUsedError;
  List<ShopWorkingDay>? get shopWorkingDays =>
      throw _privateConstructorUsedError;
  List<TimeInterval>? get timesInterval => throw _privateConstructorUsedError;
  DateTime? get selectedData => throw _privateConstructorUsedError;
  TimeInterval? get selectedTime => throw _privateConstructorUsedError;
  int? get bookingId => throw _privateConstructorUsedError;

  /// Create a copy of ReservationState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ReservationStateCopyWith<ReservationState> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ReservationStateCopyWith<$Res> {
  factory $ReservationStateCopyWith(
          ReservationState value, $Res Function(ReservationState) then) =
      _$ReservationStateCopyWithImpl<$Res, ReservationState>;
  @useResult
  $Res call(
      {bool isLoading,
      bool isSendLoading,
      List<MainClass> sections,
      List<ShopSectionData> data,
      List<ShopWorkingDay>? shopWorkingDays,
      List<TimeInterval>? timesInterval,
      DateTime? selectedData,
      TimeInterval? selectedTime,
      int? bookingId});
}

/// @nodoc
class _$ReservationStateCopyWithImpl<$Res, $Val extends ReservationState>
    implements $ReservationStateCopyWith<$Res> {
  _$ReservationStateCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ReservationState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? isLoading = null,
    Object? isSendLoading = null,
    Object? sections = null,
    Object? data = null,
    Object? shopWorkingDays = freezed,
    Object? timesInterval = freezed,
    Object? selectedData = freezed,
    Object? selectedTime = freezed,
    Object? bookingId = freezed,
  }) {
    return _then(_value.copyWith(
      isLoading: null == isLoading
          ? _value.isLoading
          : isLoading // ignore: cast_nullable_to_non_nullable
              as bool,
      isSendLoading: null == isSendLoading
          ? _value.isSendLoading
          : isSendLoading // ignore: cast_nullable_to_non_nullable
              as bool,
      sections: null == sections
          ? _value.sections
          : sections // ignore: cast_nullable_to_non_nullable
              as List<MainClass>,
      data: null == data
          ? _value.data
          : data // ignore: cast_nullable_to_non_nullable
              as List<ShopSectionData>,
      shopWorkingDays: freezed == shopWorkingDays
          ? _value.shopWorkingDays
          : shopWorkingDays // ignore: cast_nullable_to_non_nullable
              as List<ShopWorkingDay>?,
      timesInterval: freezed == timesInterval
          ? _value.timesInterval
          : timesInterval // ignore: cast_nullable_to_non_nullable
              as List<TimeInterval>?,
      selectedData: freezed == selectedData
          ? _value.selectedData
          : selectedData // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      selectedTime: freezed == selectedTime
          ? _value.selectedTime
          : selectedTime // ignore: cast_nullable_to_non_nullable
              as TimeInterval?,
      bookingId: freezed == bookingId
          ? _value.bookingId
          : bookingId // ignore: cast_nullable_to_non_nullable
              as int?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ReservationStateImplCopyWith<$Res>
    implements $ReservationStateCopyWith<$Res> {
  factory _$$ReservationStateImplCopyWith(_$ReservationStateImpl value,
          $Res Function(_$ReservationStateImpl) then) =
      __$$ReservationStateImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {bool isLoading,
      bool isSendLoading,
      List<MainClass> sections,
      List<ShopSectionData> data,
      List<ShopWorkingDay>? shopWorkingDays,
      List<TimeInterval>? timesInterval,
      DateTime? selectedData,
      TimeInterval? selectedTime,
      int? bookingId});
}

/// @nodoc
class __$$ReservationStateImplCopyWithImpl<$Res>
    extends _$ReservationStateCopyWithImpl<$Res, _$ReservationStateImpl>
    implements _$$ReservationStateImplCopyWith<$Res> {
  __$$ReservationStateImplCopyWithImpl(_$ReservationStateImpl _value,
      $Res Function(_$ReservationStateImpl) _then)
      : super(_value, _then);

  /// Create a copy of ReservationState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? isLoading = null,
    Object? isSendLoading = null,
    Object? sections = null,
    Object? data = null,
    Object? shopWorkingDays = freezed,
    Object? timesInterval = freezed,
    Object? selectedData = freezed,
    Object? selectedTime = freezed,
    Object? bookingId = freezed,
  }) {
    return _then(_$ReservationStateImpl(
      isLoading: null == isLoading
          ? _value.isLoading
          : isLoading // ignore: cast_nullable_to_non_nullable
              as bool,
      isSendLoading: null == isSendLoading
          ? _value.isSendLoading
          : isSendLoading // ignore: cast_nullable_to_non_nullable
              as bool,
      sections: null == sections
          ? _value._sections
          : sections // ignore: cast_nullable_to_non_nullable
              as List<MainClass>,
      data: null == data
          ? _value._data
          : data // ignore: cast_nullable_to_non_nullable
              as List<ShopSectionData>,
      shopWorkingDays: freezed == shopWorkingDays
          ? _value._shopWorkingDays
          : shopWorkingDays // ignore: cast_nullable_to_non_nullable
              as List<ShopWorkingDay>?,
      timesInterval: freezed == timesInterval
          ? _value._timesInterval
          : timesInterval // ignore: cast_nullable_to_non_nullable
              as List<TimeInterval>?,
      selectedData: freezed == selectedData
          ? _value.selectedData
          : selectedData // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      selectedTime: freezed == selectedTime
          ? _value.selectedTime
          : selectedTime // ignore: cast_nullable_to_non_nullable
              as TimeInterval?,
      bookingId: freezed == bookingId
          ? _value.bookingId
          : bookingId // ignore: cast_nullable_to_non_nullable
              as int?,
    ));
  }
}

/// @nodoc

class _$ReservationStateImpl extends _ReservationState {
  const _$ReservationStateImpl(
      {this.isLoading = false,
      this.isSendLoading = false,
      final List<MainClass> sections = const [],
      final List<ShopSectionData> data = const [],
      final List<ShopWorkingDay>? shopWorkingDays = null,
      final List<TimeInterval>? timesInterval = null,
      this.selectedData = null,
      this.selectedTime = null,
      this.bookingId = null})
      : _sections = sections,
        _data = data,
        _shopWorkingDays = shopWorkingDays,
        _timesInterval = timesInterval,
        super._();

  @override
  @JsonKey()
  final bool isLoading;
  @override
  @JsonKey()
  final bool isSendLoading;
  final List<MainClass> _sections;
  @override
  @JsonKey()
  List<MainClass> get sections {
    if (_sections is EqualUnmodifiableListView) return _sections;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_sections);
  }

  final List<ShopSectionData> _data;
  @override
  @JsonKey()
  List<ShopSectionData> get data {
    if (_data is EqualUnmodifiableListView) return _data;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_data);
  }

  final List<ShopWorkingDay>? _shopWorkingDays;
  @override
  @JsonKey()
  List<ShopWorkingDay>? get shopWorkingDays {
    final value = _shopWorkingDays;
    if (value == null) return null;
    if (_shopWorkingDays is EqualUnmodifiableListView) return _shopWorkingDays;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  final List<TimeInterval>? _timesInterval;
  @override
  @JsonKey()
  List<TimeInterval>? get timesInterval {
    final value = _timesInterval;
    if (value == null) return null;
    if (_timesInterval is EqualUnmodifiableListView) return _timesInterval;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  @JsonKey()
  final DateTime? selectedData;
  @override
  @JsonKey()
  final TimeInterval? selectedTime;
  @override
  @JsonKey()
  final int? bookingId;

  @override
  String toString() {
    return 'ReservationState(isLoading: $isLoading, isSendLoading: $isSendLoading, sections: $sections, data: $data, shopWorkingDays: $shopWorkingDays, timesInterval: $timesInterval, selectedData: $selectedData, selectedTime: $selectedTime, bookingId: $bookingId)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ReservationStateImpl &&
            (identical(other.isLoading, isLoading) ||
                other.isLoading == isLoading) &&
            (identical(other.isSendLoading, isSendLoading) ||
                other.isSendLoading == isSendLoading) &&
            const DeepCollectionEquality().equals(other._sections, _sections) &&
            const DeepCollectionEquality().equals(other._data, _data) &&
            const DeepCollectionEquality()
                .equals(other._shopWorkingDays, _shopWorkingDays) &&
            const DeepCollectionEquality()
                .equals(other._timesInterval, _timesInterval) &&
            (identical(other.selectedData, selectedData) ||
                other.selectedData == selectedData) &&
            (identical(other.selectedTime, selectedTime) ||
                other.selectedTime == selectedTime) &&
            (identical(other.bookingId, bookingId) ||
                other.bookingId == bookingId));
  }

  @override
  int get hashCode => Object.hash(
      runtimeType,
      isLoading,
      isSendLoading,
      const DeepCollectionEquality().hash(_sections),
      const DeepCollectionEquality().hash(_data),
      const DeepCollectionEquality().hash(_shopWorkingDays),
      const DeepCollectionEquality().hash(_timesInterval),
      selectedData,
      selectedTime,
      bookingId);

  /// Create a copy of ReservationState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ReservationStateImplCopyWith<_$ReservationStateImpl> get copyWith =>
      __$$ReservationStateImplCopyWithImpl<_$ReservationStateImpl>(
          this, _$identity);
}

abstract class _ReservationState extends ReservationState {
  const factory _ReservationState(
      {final bool isLoading,
      final bool isSendLoading,
      final List<MainClass> sections,
      final List<ShopSectionData> data,
      final List<ShopWorkingDay>? shopWorkingDays,
      final List<TimeInterval>? timesInterval,
      final DateTime? selectedData,
      final TimeInterval? selectedTime,
      final int? bookingId}) = _$ReservationStateImpl;
  const _ReservationState._() : super._();

  @override
  bool get isLoading;
  @override
  bool get isSendLoading;
  @override
  List<MainClass> get sections;
  @override
  List<ShopSectionData> get data;
  @override
  List<ShopWorkingDay>? get shopWorkingDays;
  @override
  List<TimeInterval>? get timesInterval;
  @override
  DateTime? get selectedData;
  @override
  TimeInterval? get selectedTime;
  @override
  int? get bookingId;

  /// Create a copy of ReservationState
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ReservationStateImplCopyWith<_$ReservationStateImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
