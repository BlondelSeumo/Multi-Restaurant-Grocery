import 'dart:async';
import 'dart:ui';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:lottie/lottie.dart';
import 'package:riverpodtemp/application/shop/shop_provider.dart';
import 'package:riverpodtemp/application/shop_order/shop_order_notifier.dart';
import 'package:riverpodtemp/application/shop_order/shop_order_state.dart';
import 'package:riverpodtemp/infrastructure/models/data/cart_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/buttons/custom_button.dart';
import 'package:riverpodtemp/presentation/components/loading.dart';
import 'package:riverpodtemp/presentation/components/title_icon.dart';
import 'package:riverpodtemp/presentation/pages/shop/group_order/widgets/check_status_dialog.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';
import '../../../../../application/shop_order/shop_order_provider.dart';
import 'widgets/cart_clear_dialog.dart';
import 'widgets/cart_order_description.dart';
import 'widgets/cart_order_item.dart';

class CartOrderPage extends ConsumerStatefulWidget {
  final bool isGroupOrder;
  final ScrollController controller;
  final CustomColorSet colors;

  const CartOrderPage({
    super.key,
    required this.colors,
    this.isGroupOrder = false,
    required this.controller,
  });

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _ShopOrderState();
}

class _ShopOrderState extends ConsumerState<CartOrderPage> {
  Timer? timer;

  @override
  void initState() {
    super.initState();
    ref
        .read(shopOrderProvider.notifier)
        .getCart(context, () {}, isShowLoading: false, isStart: true);
    if (widget.isGroupOrder) {
      timer = Timer.periodic(const Duration(seconds: 5), (Timer t) {
        ref
            .read(shopOrderProvider.notifier)
            .getCart(context, () {}, isShowLoading: false);
      });
    }
  }

  @override
  void deactivate() {
    timer?.cancel();
    super.deactivate();
  }

  @override
  Widget build(BuildContext context) {
    final bool isLtr = LocalStorage.getLangLtr();
    final event = ref.read(shopOrderProvider.notifier);
    final state = ref.watch(shopOrderProvider);
    return Directionality(
      textDirection: isLtr ? TextDirection.ltr : TextDirection.rtl,
      child: ClipRRect(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(12.r),
          topRight: Radius.circular(12.r),
        ),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10.0, sigmaY: 10.0),
          child: Container(
            decoration: BoxDecoration(
              boxShadow: [
                BoxShadow(
                  color: AppStyle.white.withOpacity(0.25),
                  spreadRadius: 0,
                  blurRadius: 40,
                  offset: const Offset(0, -2), // changes position of shadow
                ),
              ],
              color: widget.colors.scaffoldColor,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(12.r),
                topRight: Radius.circular(12.r),
              ),
            ),
            width: double.infinity,
            child: state.cart == null ||
                    (state.cart?.userCarts?.isEmpty ?? true) ||
                    ((state.cart?.userCarts?.isEmpty ?? true)
                        ? true
                        : (state.cart?.userCarts?.first.cartDetails?.isEmpty ??
                            true)) ||
                    LocalStorage.getCartLocal().isEmpty
                ? _resultEmpty()
                : Stack(
                    children: [
                      ListView(
                        controller: widget.controller,
                        shrinkWrap: true,
                        children: [
                          8.verticalSpace,
                          Center(
                            child: Container(
                              height: 4.h,
                              width: 48.w,
                              decoration: BoxDecoration(
                                color: AppStyle.dragElement,
                                borderRadius: BorderRadius.all(
                                  Radius.circular(40.r),
                                ),
                              ),
                            ),
                          ),
                          18.verticalSpace,
                          if (state.cart?.group ?? false)
                            _groupOrderList(state, event)
                          else
                            Column(
                              children: [
                                TitleAndIcon(
                                  title: AppHelpers.getTranslation(
                                    TrKeys.yourOrder,
                                  ),
                                  rightTitleColor: AppStyle.red,
                                  rightTitle: AppHelpers.getTranslation(
                                    TrKeys.clearAll,
                                  ),
                                  onRightTap: () {
                                    AppHelpers.showAlertDialog(
                                      context: context,
                                      child: (colors) => CartClearDialog(
                                        cancel: () {
                                          Navigator.pop(context);
                                        },
                                        clear: () {
                                          ref
                                              .read(shopOrderProvider.notifier)
                                              .deleteCart(context);
                                        },
                                        colors: colors,
                                      ),
                                      radius: 10,
                                    );
                                  },
                                ),
                                24.verticalSpace,
                                ListView.builder(
                                  padding:
                                      EdgeInsets.symmetric(horizontal: 16.w),
                                  physics: const NeverScrollableScrollPhysics(),
                                  shrinkWrap: true,
                                  itemCount: state.cart?.userCarts?.first
                                          .cartDetails?.length ??
                                      0,
                                  itemBuilder: (context, index) {
                                    return CartOrderItem(
                                      add: () => event.addCount(
                                        context: context,
                                        localIndex: LocalStorage.getCartLocal()
                                            .searchIndex(
                                          state.cart?.userCarts?.first
                                                  .cartDetails?[index] ??
                                              CartDetail(),
                                        ),
                                      ),
                                      remove: () => event.removeCount(
                                        context: context,
                                        localIndex: LocalStorage.getCartLocal()
                                            .searchIndex(
                                          state.cart?.userCarts?.first
                                                  .cartDetails?[index] ??
                                              CartDetail(),
                                        ),
                                      ),
                                      cart: state.cart?.userCarts?.first
                                          .cartDetails?[index],
                                      colors: widget.colors,
                                    );
                                  },
                                ),
                              ],
                            ),
                          bottomWidget(state, context, event, widget.colors)
                        ],
                      ),
                      if (state.isLoading || state.isAddAndRemoveLoading)
                        Container(
                          width: double.infinity,
                          height: double.infinity,
                          color: AppStyle.white.withOpacity(0.4),
                          child: Loading(),
                        ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }

  ListView _groupOrderList(ShopOrderState state, ShopOrderNotifier event) {
    return ListView.builder(
      padding: EdgeInsets.only(bottom: 8.h),
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: state.cart?.userCarts?.length,
      itemBuilder: (context, index) {
        return Column(
          children: [
            const Divider(),
            Theme(
              data: Theme.of(context)
                  .copyWith(dividerColor: AppStyle.transparent),
              child: ExpansionTile(
                title: TitleAndIcon(
                  title: state.cart?.userCarts?[index].name ?? "",
                ),
                children: [
                  ListView.builder(
                      padding: EdgeInsets.symmetric(horizontal: 16.w),
                      physics: const NeverScrollableScrollPhysics(),
                      shrinkWrap: true,
                      itemCount:
                          state.cart?.userCarts?[index].cartDetails?.length ??
                              0,
                      itemBuilder: (context, indexCart) {
                        return CartOrderItem(
                          colors: widget.colors,
                          isOwn: index == 0,
                          add: () => event.addCount(
                              context: context,
                              localIndex: LocalStorage.getCartLocal().findIndex(
                                  state.cart?.userCarts?[index]
                                      .cartDetails?[indexCart].stock?.id)),
                          remove: () => event.removeCount(
                              context: context,
                              localIndex: LocalStorage.getCartLocal().findIndex(
                                  state.cart?.userCarts?[index]
                                      .cartDetails?[indexCart].stock?.id)),
                          cart: state
                              .cart?.userCarts?[index].cartDetails?[indexCart],
                        );
                      })
                ],
              ),
            ),
          ],
        );
      },
    );
  }

  Container bottomWidget(
    ShopOrderState state,
    BuildContext context,
    ShopOrderNotifier event,
    CustomColorSet colors,
  ) {
    double totalDiscount = 0;
    if (state.cart?.userCarts?.isNotEmpty ?? false) {
      state.cart?.userCarts?.first.cartDetails?.forEach(
        (element) {
          totalDiscount += element.discount ?? 0;
        },
      );
    }
    return Container(
      color: colors.scaffoldColor,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.only(
              right: 16.w,
              top: 30.h,
              left: 16.w,
            ),
            child: Column(
              children: [
                ShopOrderDescription(
                  price: ref.watch(shopProvider).shopData?.minPrice ?? 0,
                  svgName: "assets/svgs/delivery.svg",
                  title: AppHelpers.getTranslation(TrKeys.deliveryPrice),
                  description: AppHelpers.getTranslation(TrKeys.startPrice),
                  colors: colors,
                ),
                16.verticalSpace,
                Divider(
                  color: AppStyle.textGrey.withOpacity(0.1),
                ),
                (totalDiscount) != 0
                    ? Column(
                        children: [
                          ShopOrderDescription(
                            price: totalDiscount,
                            svgName: "assets/svgs/discount.svg",
                            title: AppHelpers.getTranslation(TrKeys.discount),
                            isDiscount: true,
                            description: AppHelpers.getTranslation(
                                TrKeys.youGotDiscount),
                            colors: colors,
                          ),
                          16.verticalSpace,
                          Divider(
                            color: AppStyle.textGrey.withOpacity(0.1),
                          ),
                        ],
                      )
                    : const SizedBox.shrink(),
              ],
            ),
          ),
          16.verticalSpace,
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: 16.w,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  AppHelpers.getTranslation(TrKeys.total),
                  style: AppStyle.interNormal(
                    size: 14,
                    color: colors.textBlack,
                  ),
                ),
                Text(
                  AppHelpers.numberFormat(state.cart?.totalPrice ?? 0),
                  style: AppStyle.interSemi(
                    size: 20,
                    color: colors.textBlack,
                  ),
                ),
              ],
            ),
          ),
          16.verticalSpace,
          Padding(
            padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).padding.bottom + 24.h,
                right: 16.w,
                left: 16.w),
            child: CustomButton(
              isLoading: state.isAddAndRemoveLoading,
              title: AppHelpers.getTranslation(TrKeys.order),
              textColor: colors.textBlack,
              onPressed: () {
                if (state.cart?.group ?? false) {
                  bool check = true;
                  for (UserCart cart in state.cart!.userCarts!) {
                    if (cart.status ?? true) {
                      check = true;
                      break;
                    }
                  }
                  if (check) {
                    AppHelpers.showAlertDialog(
                      context: context,
                      child: (colors) => CheckStatusDialog(
                        cancel: () {
                          Navigator.pop(context);
                        },
                        onTap: () {
                          Navigator.pop(context);
                          context.pushRoute(const OrderRoute());
                        },
                        colors: colors,
                      ),
                    );
                  } else {
                    Navigator.pop(context);
                    context.pushRoute(const OrderRoute());
                  }
                } else {
                  Navigator.pop(context);
                  context.pushRoute(const OrderRoute());
                }
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _resultEmpty() {
    return Column(
      children: [
        100.verticalSpace,
        Lottie.asset('assets/lottie/girl_empty.json'),
        24.verticalSpace,
        Text(
          AppHelpers.getTranslation(TrKeys.cartIsEmpty),
          style: AppStyle.interSemi(size: 18.sp),
        ),
      ],
    );
  }
}
