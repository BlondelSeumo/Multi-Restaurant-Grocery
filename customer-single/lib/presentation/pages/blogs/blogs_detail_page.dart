import 'package:auto_route/annotations.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_widget_from_html/flutter_widget_from_html.dart';
import 'package:riverpodtemp/application/blogs/blogs_provider.dart';
import 'package:riverpodtemp/infrastructure/services/time_service.dart';
import 'package:riverpodtemp/presentation/components/app_bars/common_app_bar.dart';
import 'package:riverpodtemp/presentation/components/buttons/pop_button.dart';
import 'package:riverpodtemp/presentation/components/custom_network_image.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import 'package:riverpodtemp/presentation/components/loading.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';

@RoutePage()
class BlogsDetailPage extends ConsumerStatefulWidget {
  final String uuid;

  const BlogsDetailPage({super.key, required this.uuid});

  @override
  ConsumerState<BlogsDetailPage> createState() => _BlogsDetailPageState();
}

class _BlogsDetailPageState extends ConsumerState<BlogsDetailPage> {
  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback(
      (_) {
        ref.read(blogsProvider.notifier).blogDetail(uuid: widget.uuid);
      },
    );
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(blogsProvider);
    return CustomScaffold(
      body: (colors) => state.isLoading
          ? Center(child: Loading())
          : Padding(
              padding: EdgeInsets.symmetric(horizontal: 12.r),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CommonAppBar(
                    child: Text(
                      state.blogDetail?.translation?.title ?? '',
                      style: AppStyle.interNoSemi(
                        color: colors.textBlack,
                      ),
                    ),
                  ),
                  10.verticalSpace,
                  CustomNetworkImage(
                    url: state.blogDetail?.img,
                    height: 150.r,
                    width: 1.sw,
                    radius: 10.r,
                  ),
                  10.verticalSpace,
                  Text(
                    TimeService.dateFormatMMMDDHHMM(
                      DateTime.tryParse(state.blogDetail?.createdAt ?? ''),
                    ),
                    style: AppStyle.interNoSemi(
                      size: 14,
                      color: colors.hintColor,
                    ),
                  ),
                  10.verticalSpace,
                  HtmlWidget(
                    state.blogDetail?.translation?.description ?? '',
                    textStyle: AppStyle.interNormal(
                      color: colors.textBlack,
                      size: 14,
                    ),
                  ),
                ],
              ),
            ),
      floatingButtonLocation: FloatingActionButtonLocation.startFloat,
      floatingButton: (colors) => Padding(
        padding: EdgeInsets.symmetric(horizontal: 16.w),
        child: PopButton(colors: colors),
      ),
    );
  }
}
