import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'package:riverpodtemp/application/like/like_notifier.dart';
import 'package:riverpodtemp/application/main/main_provider.dart';
import 'package:riverpodtemp/application/shop/shop_notifier.dart';
import 'package:riverpodtemp/application/shop/shop_provider.dart';
import 'package:riverpodtemp/infrastructure/models/data/shop_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/time_service.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/app_bars/common_app_bar.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import 'package:riverpodtemp/presentation/components/loading.dart';
import 'package:riverpodtemp/presentation/pages/shop/widgets/shop_page_avatar.dart';
import 'package:riverpodtemp/presentation/pages/single_shop/widgets/info_screen.dart';
import 'package:riverpodtemp/presentation/pages/single_shop/widgets/review_screen.dart';

import '../../../application/like/like_provider.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'widgets/order_food.dart';

@RoutePage()
class SingleShopPage extends ConsumerStatefulWidget {
  const SingleShopPage({super.key});

  @override
  ConsumerState<SingleShopPage> createState() => _SingleShopPageState();
}

class _SingleShopPageState extends ConsumerState<SingleShopPage> {
  late ShopNotifier event;
  late LikeNotifier eventLike;
  final RefreshController _refreshController = RefreshController();

  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(shopProvider.notifier)
          .fetchShop(context, LocalStorage.getShopId());
    });
    super.initState();
  }

  @override
  void didChangeDependencies() {
    event = ref.read(shopProvider.notifier);
    eventLike = ref.read(likeProvider.notifier);
    super.didChangeDependencies();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(shopProvider);
    return CustomScaffold(
      body: (colors) => Column(
        children: [
          CommonAppBar(
            child: Text(
              AppHelpers.getTranslation(TrKeys.shopInfo),
              style: AppStyle.interNoSemi(
                size: 18,
                color: colors.textBlack,
              ),
            ),
          ),
          state.isLoading
              ? Padding(
                  padding: EdgeInsets.only(top: 64.r),
                  child: Loading(),
                )
              : Expanded(
                  child: SmartRefresher(
                    controller: _refreshController,
                    enablePullDown: true,
                    enablePullUp: true,
                    onRefresh: () {
                      event.fetchShop(
                        context,
                        LocalStorage.getShopId(),
                        isRefresh: true,
                        refreshController: _refreshController,
                      );
                    },
                    onLoading: () {
                      event.fetchShop(
                        context,
                        LocalStorage.getShopId(),
                        refreshController: _refreshController,
                      );
                    },
                    child: SingleChildScrollView(
                      child: Padding(
                        padding: EdgeInsets.only(bottom: 48.r),
                        child: Column(
                          children: [
                            4.verticalSpace,
                            ShopPageAvatar(
                              colors: colors,
                              workTime: state.endTodayTime.hour >
                                      TimeOfDay.now().hour
                                  ? "${TimeService.timeFormatTime('${state.startTodayTime.hour.toString().padLeft(2, '0')}-${state.startTodayTime.minute.toString().padLeft(2, '0')}')} - ${TimeService.timeFormatTime('${state.endTodayTime.hour.toString().padLeft(2, '0')}-${state.endTodayTime.minute.toString().padLeft(2, '0')}')}"
                                  : AppHelpers.getTranslation(TrKeys.close),
                              onLike: () {
                                event.onLike();
                                eventLike.fetchLikeProducts(context);
                              },
                              isLike: state.isLike,
                              shop: state.shopData ?? ShopData(),
                              onShare: event.onShare,
                              bonus: state.shopData?.bonus,
                            ),
                            10.verticalSpace,
                            InfoScreen(
                              shop: state.shopData,
                              endTodayTime: state.endTodayTime,
                              startTodayTime: state.startTodayTime,
                              shopMarker: state.shopMarkers,
                              colors: colors,
                            ),
                            20.verticalSpace,
                            OrderFoodScreen(
                              shop: state.shopData,
                              startOrder: () {
                                ref.read(mainProvider.notifier).selectIndex(0);
                              },
                            ),
                            20.verticalSpace,
                            ReviewScreen(
                              shop: state.shopData,
                              review: state.reviews,
                              reviewCount: state.reviewCount,
                              colors: colors,
                            )
                          ],
                        ),
                      ),
                    ),
                  ),
                )
        ],
      ),
    );
  }
}
