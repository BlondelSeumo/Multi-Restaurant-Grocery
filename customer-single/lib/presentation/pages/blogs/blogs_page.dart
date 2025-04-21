import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'package:riverpodtemp/application/blogs/blogs_provider.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/time_service.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/app_bars/common_app_bar.dart';
import 'package:riverpodtemp/presentation/components/buttons/pop_button.dart';
import 'package:riverpodtemp/presentation/components/custom_network_image.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';

@RoutePage()
class BlogsPage extends ConsumerStatefulWidget {
  const BlogsPage({super.key});

  @override
  ConsumerState<BlogsPage> createState() => _BlogsPageState();
}

class _BlogsPageState extends ConsumerState<BlogsPage> {
  late RefreshController refreshController;

  @override
  void initState() {
    refreshController = RefreshController();
    WidgetsBinding.instance.addPostFrameCallback(
      (_) {
        ref.read(blogsProvider.notifier).getBlogs(
              context: context,
              isRefresh: true,
            );
      },
    );
    super.initState();
  }

  @override
  void dispose() {
    refreshController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(blogsProvider);
    final event = ref.read(blogsProvider.notifier);
    return CustomScaffold(
      body: (colors) => Column(
        children: [
          CommonAppBar(
            child: Text(
              AppHelpers.getTranslation(TrKeys.blogs),
              style: AppStyle.interNoSemi(
                color: colors.textBlack,
              ),
            ),
          ),
          Expanded(
            child: SmartRefresher(
              controller: refreshController,
              scrollDirection: Axis.vertical,
              enablePullDown: false,
              enablePullUp: true,
              primary: true,
              onRefresh: () => event.getBlogs(
                context: context,
                controller: refreshController,
                isRefresh: true,
              ),
              onLoading: () async {
                await event.getBlogs(
                  context: context,
                  controller: refreshController,
                );
              },
              child: AnimationLimiter(
                child: ListView.separated(
                  shrinkWrap: true,
                  primary: false,
                  itemCount: state.blog.length,
                  padding: EdgeInsets.symmetric(horizontal: 10.w),
                  itemBuilder: (context, index) {
                    final item = state.blog[index];
                    return AnimationConfiguration.staggeredList(
                      position: index,
                      duration: const Duration(milliseconds: 375),
                      child: SlideAnimation(
                        verticalOffset: 25.0,
                        child: FadeInAnimation(
                          child: GestureDetector(
                            onTap: () {
                              context.pushRoute(
                                BlogsDetailRoute(uuid: item.uuid ?? ''),
                              );
                            },
                            child: Container(
                              decoration: BoxDecoration(
                                color: colors.buttonColor,
                                borderRadius: BorderRadius.circular(10.r),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.only(
                                      topRight: Radius.circular(10.r),
                                      topLeft: Radius.circular(10.r),
                                    ),
                                    child: CustomNetworkImage(
                                      url: item.img,
                                      height: 100.r,
                                      width: 1.sw,
                                      radius: 0.r,
                                    ),
                                  ),
                                  20.verticalSpace,
                                  Padding(
                                    padding:
                                        EdgeInsets.symmetric(horizontal: 14.r),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          item.translation?.title ?? '',
                                          style: AppStyle.interNoSemi(
                                            color: colors.textBlack,
                                            size: 16,
                                          ),
                                        ),
                                        Text(
                                          item.translation?.shortDesc ?? '',
                                          style: AppStyle.interNoSemi(
                                            color: colors.textBlack,
                                            size: 14,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  20.verticalSpace,
                                  Divider(color: colors.divider, height: 2.r),
                                  Padding(
                                    padding: EdgeInsets.all(14.r),
                                    child: Text(
                                      TimeService.dateFormatMMMDDHHMM(
                                        DateTime.tryParse(item.createdAt ?? ''),
                                      ),
                                      style: AppStyle.interNoSemi(
                                        size: 14,
                                        color: colors.hintColor,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                  separatorBuilder: (context, index) => 16.verticalSpace,
                ),
              ),
            ),
          ),
        ],
      ),
      floatingButtonLocation: FloatingActionButtonLocation.startFloat,
      floatingButton: (colors) => Padding(
        padding: EdgeInsets.symmetric(horizontal: 16.w),
        child: PopButton(colors: colors),
      ),
    );
  }
}
