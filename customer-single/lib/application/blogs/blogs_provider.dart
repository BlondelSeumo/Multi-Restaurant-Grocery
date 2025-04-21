import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpodtemp/application/blogs/blogs_notifier.dart';
import 'package:riverpodtemp/application/blogs/blogs_state.dart';
import 'package:riverpodtemp/domain/di/dependency_manager.dart';

final blogsProvider = StateNotifierProvider<BlogsNotifier, BlogsState>(
  (ref) => BlogsNotifier(blogsRepository),
);
