import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'package:riverpodtemp/application/careers/careers_provider.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/app_bars/common_app_bar.dart';
import 'package:riverpodtemp/presentation/components/buttons/pop_button.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import 'package:riverpodtemp/presentation/pages/careers/widgets/careers_item_widget.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';

@RoutePage()
class CareersPage extends ConsumerStatefulWidget {
  const CareersPage({super.key});

  @override
  ConsumerState<CareersPage> createState() => _BlogsPageState();
}

class _BlogsPageState extends ConsumerState<CareersPage> {
  late RefreshController refreshController;

  @override
  void initState() {
    refreshController = RefreshController();
    WidgetsBinding.instance.addPostFrameCallback(
      (_) {
        ref.read(careersProvider.notifier).getCareers(
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
    final state = ref.watch(careersProvider);
    final event = ref.read(careersProvider.notifier);
    return CustomScaffold(
      body: (colors) {
        return Column(
          children: [
            CommonAppBar(
              child: Text(
                AppHelpers.getTranslation(TrKeys.careers),
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
                onRefresh: () => event.getCareers(
                  context: context,
                  controller: refreshController,
                  isRefresh: true,
                ),
                onLoading: () async {
                  await event.getCareers(
                    context: context,
                    controller: refreshController,
                  );
                },
                child: AnimationLimiter(
                  child: ListView.separated(
                    shrinkWrap: true,
                    primary: false,
                    itemCount: state.careers.length,
                    padding: EdgeInsets.symmetric(horizontal: 10.w),
                    itemBuilder: (context, index) {
                      final item = state.careers[index];
                      return AnimationConfiguration.staggeredList(
                        position: index,
                        duration: const Duration(milliseconds: 375),
                        child: SlideAnimation(
                          verticalOffset: 25.0,
                          child: FadeInAnimation(
                            child:
                                CareersItemWidget(item: item, colors: colors),
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
        );
      },
      floatingButtonLocation: FloatingActionButtonLocation.startFloat,
      floatingButton: (colors) => Padding(
        padding: EdgeInsets.symmetric(horizontal: 16.w),
        child: PopButton(colors: colors),
      ),
    );
  }
}

