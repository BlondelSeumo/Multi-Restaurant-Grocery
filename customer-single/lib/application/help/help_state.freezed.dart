// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'help_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

/// @nodoc
mixin _$HelpState {
  bool get isLoading => throw _privateConstructorUsedError;
  HelpModel? get data => throw _privateConstructorUsedError;
  AdminData? get adminData => throw _privateConstructorUsedError;

  /// Create a copy of HelpState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $HelpStateCopyWith<HelpState> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $HelpStateCopyWith<$Res> {
  factory $HelpStateCopyWith(HelpState value, $Res Function(HelpState) then) =
      _$HelpStateCopyWithImpl<$Res, HelpState>;
  @useResult
  $Res call({bool isLoading, HelpModel? data, AdminData? adminData});
}

/// @nodoc
class _$HelpStateCopyWithImpl<$Res, $Val extends HelpState>
    implements $HelpStateCopyWith<$Res> {
  _$HelpStateCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of HelpState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? isLoading = null,
    Object? data = freezed,
    Object? adminData = freezed,
  }) {
    return _then(_value.copyWith(
      isLoading: null == isLoading
          ? _value.isLoading
          : isLoading // ignore: cast_nullable_to_non_nullable
              as bool,
      data: freezed == data
          ? _value.data
          : data // ignore: cast_nullable_to_non_nullable
              as HelpModel?,
      adminData: freezed == adminData
          ? _value.adminData
          : adminData // ignore: cast_nullable_to_non_nullable
              as AdminData?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$HelpStateImplCopyWith<$Res>
    implements $HelpStateCopyWith<$Res> {
  factory _$$HelpStateImplCopyWith(
          _$HelpStateImpl value, $Res Function(_$HelpStateImpl) then) =
      __$$HelpStateImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({bool isLoading, HelpModel? data, AdminData? adminData});
}

/// @nodoc
class __$$HelpStateImplCopyWithImpl<$Res>
    extends _$HelpStateCopyWithImpl<$Res, _$HelpStateImpl>
    implements _$$HelpStateImplCopyWith<$Res> {
  __$$HelpStateImplCopyWithImpl(
      _$HelpStateImpl _value, $Res Function(_$HelpStateImpl) _then)
      : super(_value, _then);

  /// Create a copy of HelpState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? isLoading = null,
    Object? data = freezed,
    Object? adminData = freezed,
  }) {
    return _then(_$HelpStateImpl(
      isLoading: null == isLoading
          ? _value.isLoading
          : isLoading // ignore: cast_nullable_to_non_nullable
              as bool,
      data: freezed == data
          ? _value.data
          : data // ignore: cast_nullable_to_non_nullable
              as HelpModel?,
      adminData: freezed == adminData
          ? _value.adminData
          : adminData // ignore: cast_nullable_to_non_nullable
              as AdminData?,
    ));
  }
}

/// @nodoc

class _$HelpStateImpl extends _HelpState {
  const _$HelpStateImpl(
      {this.isLoading = false, this.data = null, this.adminData = null})
      : super._();

  @override
  @JsonKey()
  final bool isLoading;
  @override
  @JsonKey()
  final HelpModel? data;
  @override
  @JsonKey()
  final AdminData? adminData;

  @override
  String toString() {
    return 'HelpState(isLoading: $isLoading, data: $data, adminData: $adminData)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$HelpStateImpl &&
            (identical(other.isLoading, isLoading) ||
                other.isLoading == isLoading) &&
            (identical(other.data, data) || other.data == data) &&
            (identical(other.adminData, adminData) ||
                other.adminData == adminData));
  }

  @override
  int get hashCode => Object.hash(runtimeType, isLoading, data, adminData);

  /// Create a copy of HelpState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$HelpStateImplCopyWith<_$HelpStateImpl> get copyWith =>
      __$$HelpStateImplCopyWithImpl<_$HelpStateImpl>(this, _$identity);
}

abstract class _HelpState extends HelpState {
  const factory _HelpState(
      {final bool isLoading,
      final HelpModel? data,
      final AdminData? adminData}) = _$HelpStateImpl;
  const _HelpState._() : super._();

  @override
  bool get isLoading;
  @override
  HelpModel? get data;
  @override
  AdminData? get adminData;

  /// Create a copy of HelpState
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$HelpStateImplCopyWith<_$HelpStateImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
