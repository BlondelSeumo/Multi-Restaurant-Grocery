import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:riverpodtemp/infrastructure/models/data/blog_data.dart';

part 'blogs_state.freezed.dart';

@freezed
class BlogsState with _$BlogsState {
  const factory BlogsState({
    @Default(false) isLoading,
    @Default([]) List<BlogData> blog,
    @Default(null) BlogData? blogDetail,
  }) = _BlogsState;

  const BlogsState._();
}
