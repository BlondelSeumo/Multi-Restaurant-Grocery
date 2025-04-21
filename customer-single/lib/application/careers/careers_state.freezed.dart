// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'careers_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

/// @nodoc
mixin _$CareersState {
  dynamic get isLoading => throw _privateConstructorUsedError;
  List<DataModel> get careers => throw _privateConstructorUsedError;
  CareersDataModel? get careersDetail => throw _privateConstructorUsedError;

  /// Create a copy of CareersState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CareersStateCopyWith<CareersState> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CareersStateCopyWith<$Res> {
  factory $CareersStateCopyWith(
          CareersState value, $Res Function(CareersState) then) =
      _$CareersStateCopyWithImpl<$Res, CareersState>;
  @useResult
  $Res call(
      {dynamic isLoading,
      List<DataModel> careers,
      CareersDataModel? careersDetail});
}

/// @nodoc
class _$CareersStateCopyWithImpl<$Res, $Val extends CareersState>
    implements $CareersStateCopyWith<$Res> {
  _$CareersStateCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CareersState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? isLoading = freezed,
    Object? careers = null,
    Object? careersDetail = freezed,
  }) {
    return _then(_value.copyWith(
      isLoading: freezed == isLoading
          ? _value.isLoading
          : isLoading // ignore: cast_nullable_to_non_nullable
              as dynamic,
      careers: null == careers
          ? _value.careers
          : careers // ignore: cast_nullable_to_non_nullable
              as List<DataModel>,
      careersDetail: freezed == careersDetail
          ? _value.careersDetail
          : careersDetail // ignore: cast_nullable_to_non_nullable
              as CareersDataModel?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$CareersStateImplCopyWith<$Res>
    implements $CareersStateCopyWith<$Res> {
  factory _$$CareersStateImplCopyWith(
          _$CareersStateImpl value, $Res Function(_$CareersStateImpl) then) =
      __$$CareersStateImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {dynamic isLoading,
      List<DataModel> careers,
      CareersDataModel? careersDetail});
}

/// @nodoc
class __$$CareersStateImplCopyWithImpl<$Res>
    extends _$CareersStateCopyWithImpl<$Res, _$CareersStateImpl>
    implements _$$CareersStateImplCopyWith<$Res> {
  __$$CareersStateImplCopyWithImpl(
      _$CareersStateImpl _value, $Res Function(_$CareersStateImpl) _then)
      : super(_value, _then);

  /// Create a copy of CareersState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? isLoading = freezed,
    Object? careers = null,
    Object? careersDetail = freezed,
  }) {
    return _then(_$CareersStateImpl(
      isLoading: freezed == isLoading ? _value.isLoading! : isLoading,
      careers: null == careers
          ? _value._careers
          : careers // ignore: cast_nullable_to_non_nullable
              as List<DataModel>,
      careersDetail: freezed == careersDetail
          ? _value.careersDetail
          : careersDetail // ignore: cast_nullable_to_non_nullable
              as CareersDataModel?,
    ));
  }
}

/// @nodoc

class _$CareersStateImpl extends _CareersState {
  const _$CareersStateImpl(
      {this.isLoading = false,
      final List<DataModel> careers = const [],
      this.careersDetail = null})
      : _careers = careers,
        super._();

  @override
  @JsonKey()
  final dynamic isLoading;
  final List<DataModel> _careers;
  @override
  @JsonKey()
  List<DataModel> get careers {
    if (_careers is EqualUnmodifiableListView) return _careers;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_careers);
  }

  @override
  @JsonKey()
  final CareersDataModel? careersDetail;

  @override
  String toString() {
    return 'CareersState(isLoading: $isLoading, careers: $careers, careersDetail: $careersDetail)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CareersStateImpl &&
            const DeepCollectionEquality().equals(other.isLoading, isLoading) &&
            const DeepCollectionEquality().equals(other._careers, _careers) &&
            (identical(other.careersDetail, careersDetail) ||
                other.careersDetail == careersDetail));
  }

  @override
  int get hashCode => Object.hash(
      runtimeType,
      const DeepCollectionEquality().hash(isLoading),
      const DeepCollectionEquality().hash(_careers),
      careersDetail);

  /// Create a copy of CareersState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CareersStateImplCopyWith<_$CareersStateImpl> get copyWith =>
      __$$CareersStateImplCopyWithImpl<_$CareersStateImpl>(this, _$identity);
}

abstract class _CareersState extends CareersState {
  const factory _CareersState(
      {final dynamic isLoading,
      final List<DataModel> careers,
      final CareersDataModel? careersDetail}) = _$CareersStateImpl;
  const _CareersState._() : super._();

  @override
  dynamic get isLoading;
  @override
  List<DataModel> get careers;
  @override
  CareersDataModel? get careersDetail;

  /// Create a copy of CareersState
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CareersStateImplCopyWith<_$CareersStateImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
