import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'package:riverpodtemp/application/blogs/blogs_state.dart';
import 'package:riverpodtemp/domain/iterface/blogs.dart';
import 'package:riverpodtemp/infrastructure/models/data/blog_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';

class BlogsNotifier extends StateNotifier<BlogsState> {
  final BlogsRepositoryFacade _repo;

  int page = 0;

  BlogsNotifier(this._repo) : super(BlogsState());

  Future<void> getBlogs({
    required BuildContext context,
    RefreshController? controller,
    bool isRefresh = false,
  }) async {
    if (isRefresh) {
      page = 0;
      state = state.copyWith(isLoading: true, blog: []);
    }

    final response = await _repo.getBlogs(++page, 'blog');
    response.when(
      success: (data) {
        if (isRefresh) {
          state = state.copyWith(blog: data.data ?? [], isLoading: false);
        } else {
          if (data.data?.isNotEmpty ?? false) {
            List<BlogData> list = List.from(state.blog);
            list.addAll(data.data ?? []);
            state = state.copyWith(blog: list);
            controller?.loadComplete();
          } else {
            page--;
            controller?.loadNoData();
          }
        }
      },
      failure: (error, statusCode) {
        if (!isRefresh) {
          page--;
          controller?.loadFailed();
        } else {
          controller?.refreshFailed();
        }
        AppHelpers.showCheckTopSnackBar(
          context,
          AppHelpers.getTranslation(error.toString()),
        );
      },
    );
  }

  Future<void> blogDetail({required String uuid}) async {
    state = state.copyWith(isLoading: true);
    final response = await _repo.getBlogDetails(uuid);
    response.when(
      success: (data) {
        state = state.copyWith(blogDetail: data.data, isLoading: false);
      },
      failure: (error, statusCode) {
        state = state.copyWith(isLoading: false);
      },
    );
  }
}
