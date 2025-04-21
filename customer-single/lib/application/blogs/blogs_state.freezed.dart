// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'blogs_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

/// @nodoc
mixin _$BlogsState {
  dynamic get isLoading => throw _privateConstructorUsedError;
  List<BlogData> get blog => throw _privateConstructorUsedError;
  BlogData? get blogDetail => throw _privateConstructorUsedError;

  /// Create a copy of BlogsState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $BlogsStateCopyWith<BlogsState> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $BlogsStateCopyWith<$Res> {
  factory $BlogsStateCopyWith(
          BlogsState value, $Res Function(BlogsState) then) =
      _$BlogsStateCopyWithImpl<$Res, BlogsState>;
  @useResult
  $Res call({dynamic isLoading, List<BlogData> blog, BlogData? blogDetail});
}

/// @nodoc
class _$BlogsStateCopyWithImpl<$Res, $Val extends BlogsState>
    implements $BlogsStateCopyWith<$Res> {
  _$BlogsStateCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of BlogsState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? isLoading = freezed,
    Object? blog = null,
    Object? blogDetail = freezed,
  }) {
    return _then(_value.copyWith(
      isLoading: freezed == isLoading
          ? _value.isLoading
          : isLoading // ignore: cast_nullable_to_non_nullable
              as dynamic,
      blog: null == blog
          ? _value.blog
          : blog // ignore: cast_nullable_to_non_nullable
              as List<BlogData>,
      blogDetail: freezed == blogDetail
          ? _value.blogDetail
          : blogDetail // ignore: cast_nullable_to_non_nullable
              as BlogData?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$BlogsStateImplCopyWith<$Res>
    implements $BlogsStateCopyWith<$Res> {
  factory _$$BlogsStateImplCopyWith(
          _$BlogsStateImpl value, $Res Function(_$BlogsStateImpl) then) =
      __$$BlogsStateImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({dynamic isLoading, List<BlogData> blog, BlogData? blogDetail});
}

/// @nodoc
class __$$BlogsStateImplCopyWithImpl<$Res>
    extends _$BlogsStateCopyWithImpl<$Res, _$BlogsStateImpl>
    implements _$$BlogsStateImplCopyWith<$Res> {
  __$$BlogsStateImplCopyWithImpl(
      _$BlogsStateImpl _value, $Res Function(_$BlogsStateImpl) _then)
      : super(_value, _then);

  /// Create a copy of BlogsState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? isLoading = freezed,
    Object? blog = null,
    Object? blogDetail = freezed,
  }) {
    return _then(_$BlogsStateImpl(
      isLoading: freezed == isLoading ? _value.isLoading! : isLoading,
      blog: null == blog
          ? _value._blog
          : blog // ignore: cast_nullable_to_non_nullable
              as List<BlogData>,
      blogDetail: freezed == blogDetail
          ? _value.blogDetail
          : blogDetail // ignore: cast_nullable_to_non_nullable
              as BlogData?,
    ));
  }
}

/// @nodoc

class _$BlogsStateImpl extends _BlogsState {
  const _$BlogsStateImpl(
      {this.isLoading = false,
      final List<BlogData> blog = const [],
      this.blogDetail = null})
      : _blog = blog,
        super._();

  @override
  @JsonKey()
  final dynamic isLoading;
  final List<BlogData> _blog;
  @override
  @JsonKey()
  List<BlogData> get blog {
    if (_blog is EqualUnmodifiableListView) return _blog;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_blog);
  }

  @override
  @JsonKey()
  final BlogData? blogDetail;

  @override
  String toString() {
    return 'BlogsState(isLoading: $isLoading, blog: $blog, blogDetail: $blogDetail)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$BlogsStateImpl &&
            const DeepCollectionEquality().equals(other.isLoading, isLoading) &&
            const DeepCollectionEquality().equals(other._blog, _blog) &&
            (identical(other.blogDetail, blogDetail) ||
                other.blogDetail == blogDetail));
  }

  @override
  int get hashCode => Object.hash(
      runtimeType,
      const DeepCollectionEquality().hash(isLoading),
      const DeepCollectionEquality().hash(_blog),
      blogDetail);

  /// Create a copy of BlogsState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$BlogsStateImplCopyWith<_$BlogsStateImpl> get copyWith =>
      __$$BlogsStateImplCopyWithImpl<_$BlogsStateImpl>(this, _$identity);
}

abstract class _BlogsState extends BlogsState {
  const factory _BlogsState(
      {final dynamic isLoading,
      final List<BlogData> blog,
      final BlogData? blogDetail}) = _$BlogsStateImpl;
  const _BlogsState._() : super._();

  @override
  dynamic get isLoading;
  @override
  List<BlogData> get blog;
  @override
  BlogData? get blogDetail;

  /// Create a copy of BlogsState
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$BlogsStateImplCopyWith<_$BlogsStateImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
