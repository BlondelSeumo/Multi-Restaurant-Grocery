// ignore_for_file: unused_result

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'package:riverpodtemp/application/order/order_provider.dart';
import 'package:riverpodtemp/application/order/order_state.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/enums.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/presentation/components/app_bars/common_app_bar.dart';
import 'package:riverpodtemp/presentation/components/blur_wrap.dart';
import 'package:riverpodtemp/presentation/components/buttons/pop_button.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import 'package:riverpodtemp/presentation/components/keyboard_dismisser.dart';
import 'package:riverpodtemp/presentation/components/loading.dart';
import 'package:riverpodtemp/presentation/components/shop_avarat.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';
import '../../../../application/payment_methods/payment_provider.dart';
import '../../../../application/shop_order/shop_order_provider.dart';
import '../order_check/order_check.dart';
import '../order_type/widgets/order_map.dart';
import '../order_type/order_type.dart';
import '../order_check/widgets/rating_page.dart';
import 'widgets/order_carts.dart';
import 'widgets/order_status.dart';

@RoutePage()
class OrderPage extends ConsumerStatefulWidget {
  const OrderPage({
    super.key,
  });

  @override
  ConsumerState<OrderPage> createState() => _OrderPageState();
}

class _OrderPageState extends ConsumerState<OrderPage>
    with SingleTickerProviderStateMixin {
  late RefreshController refreshController;
  late TabController _tabController;
  int tabIndex = 0;

  @override
  void initState() {
    _tabController = TabController(length: 2, vsync: this);
    refreshController = RefreshController();
    _tabController.addListener(() {
      ref.read(orderProvider.notifier).changeTabIndex(_tabController.index);
      if (_tabController.index == 1) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          ref.read(orderProvider.notifier).getCalculate(
                isLoading: false,
                context: context,
                cartId: ref.read(shopOrderProvider).cart?.id ?? 0,
                type: DeliveryTypeEnum.pickup,
              );
        });
      } else {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          ref.read(orderProvider.notifier).getCalculate(
                isLoading: false,
                context: context,
                cartId: ref.read(shopOrderProvider).cart?.id ?? 0,
                type: DeliveryTypeEnum.delivery,
              );
        });
      }
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(orderProvider.notifier)
        ..resetState()
        ..fetchShop(context, (ref.watch(shopOrderProvider).cart?.shopId ?? 0))
        ..getCalculate(
          context: context,
          cartId: ref.watch(shopOrderProvider).cart?.id ?? 0,
          type: DeliveryTypeEnum.delivery,
        );
      ref.refresh(paymentProvider);
      ref.read(paymentProvider.notifier).fetchPayments(context);
    });
    super.initState();
  }

  @override
  void dispose() {
    refreshController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = LocalStorage.getAppThemeMode();
    final isLtr = LocalStorage.getLangLtr();
    final state = ref.watch(orderProvider);
    final event = ref.read(orderProvider.notifier);
    final stateLoading = ref.watch(shopOrderProvider).isAddAndRemoveLoading;
    ref.listen(orderProvider, (previous, next) {
      if (AppHelpers.getOrderStatus(next.orderData?.status ?? "") ==
              OrderStatus.delivered &&
          (previous?.orderData?.status != next.orderData?.status) &&
          next.orderData?.deliveryMan != null) {
        AppHelpers.showCustomModalBottomSheet(
          context: context,
          modal: const RatingPage(),
          isDarkMode: isDarkMode,
        );
      }
    });
    return Directionality(
      textDirection: isLtr ? TextDirection.ltr : TextDirection.rtl,
      child: KeyboardDismisser(
        child: CustomScaffold(
          body: (colors) => state.isLoading
              ? Loading()
              : Stack(
                  children: [
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _appBar(context, state, colors),
                        Expanded(
                          child: SmartRefresher(
                            enablePullDown: state.orderData != null,
                            enablePullUp: false,
                            controller: state.orderData == null
                                ? RefreshController()
                                : refreshController,
                            onRefresh: () {
                              event.showOrder(
                                  context, state.orderData?.id ?? 0, true);
                              refreshController.refreshCompleted();
                            },
                            child: SingleChildScrollView(
                              child: Column(
                                children: [
                                  16.verticalSpace,
                                  state.orderData != null
                                      ? OrderMap(
                                          colors: colors,
                                          isLoading: state.isMapLoading,
                                          polylineCoordinates:
                                              state.polylineCoordinates,
                                          markers: Set<Marker>.of(
                                              state.markers.values),
                                          latLng: LatLng(
                                              state.orderData?.shop?.location
                                                      ?.latitude ??
                                                  0,
                                              state.orderData?.shop?.location
                                                      ?.longitude ??
                                                  0),
                                        )
                                      : OrderType(
                                          colors: colors,
                                          shopId: state.shopData?.id ?? 0,
                                          tabController: _tabController,
                                          onChange: (s) =>
                                              event.changeActive(s),
                                          getLocation: () {
                                            event.getCalculate(
                                              isLoading: false,
                                              context: context,
                                              cartId: ref
                                                      .read(shopOrderProvider)
                                                      .cart
                                                      ?.id ??
                                                  0,
                                              type: _tabController.index == 0
                                                  ? DeliveryTypeEnum.delivery
                                                  : DeliveryTypeEnum.pickup,
                                            );
                                          },
                                        ),
                                  OrderCarts(
                                    colors: colors,
                                    tabBarIndex: _tabController.index,
                                  ),
                                  OrderCheck(
                                    orderStatus: AppHelpers.getOrderStatus(
                                        state.orderData?.status ?? ""),
                                    isOrder: state.orderData != null,
                                    isActive: state.isActive,
                                    colors: colors,
                                  ),
                                  42.verticalSpace
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (stateLoading)
                      BlurWrap(
                        radius: BorderRadius.zero,
                        blur: 1,
                        child: Container(
                            width: MediaQuery.sizeOf(context).width,
                            height: MediaQuery.sizeOf(context).height,
                            color: AppStyle.white.withOpacity(0.2),
                            child: Loading()),
                      ),
                  ],
                ),
          floatingButtonLocation: FloatingActionButtonLocation.startFloat,
          floatingButton: (colors) => Padding(
            padding: EdgeInsets.only(left: 16.w),
            child: PopButton(colors: colors),
          ),
        ),
      ),
    );
  }

  CommonAppBar _appBar(
    BuildContext context,
    OrderState state,
    CustomColorSet colors,
  ) {
    return CommonAppBar(
      height: state.orderData != null ? 170 : 70,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              ShopAvatar(
                shopImage: state.orderData == null
                    ? (state.shopData?.logoImg ?? "")
                    : (state.orderData?.shop?.logoImg ?? ""),
                size: 40,
                padding: 4,
                radius: 8,
                bgColor: colors.textBlack.withOpacity(0.06),
              ),
              10.horizontalSpace,
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  Text(
                    state.orderData == null
                        ? (state.shopData?.translation?.title ?? "")
                        : (state.orderData?.shop?.translation?.title ?? ""),
                    style: AppStyle.interSemi(
                      size: 16,
                      color: colors.textBlack,
                    ),
                  ),
                  SizedBox(
                    width: MediaQuery.sizeOf(context).width - 86.h,
                    child: Text(
                      state.orderData == null
                          ? (state.shopData?.translation?.description ?? "")
                          : (state.orderData?.shop?.translation?.description ??
                              ""),
                      style: AppStyle.interNormal(
                        size: 12,
                        color: colors.textBlack,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ],
          ),
          state.orderData != null
              ? OrderStatusScreen(
                  status:
                      AppHelpers.getOrderStatus(state.orderData?.status ?? ""),
                  colors: colors,
                )
              : const SizedBox.shrink()
        ],
      ),
    );
  }
}
