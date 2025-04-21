import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/application/order/order_provider.dart';
import 'package:riverpodtemp/application/shop_order/shop_order_provider.dart';
import 'package:riverpodtemp/infrastructure/models/data/cart_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/enums.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tpying_delay.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/title_icon.dart';
import 'package:riverpodtemp/presentation/pages/shop/cart/widgets/cart_clear_dialog.dart';
import 'package:riverpodtemp/presentation/pages/shop/cart/widgets/cart_order_item.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class OrderCarts extends ConsumerStatefulWidget {
  final int tabBarIndex;
  final CustomColorSet colors;

  const OrderCarts({
    super.key,
    required this.colors,
    required this.tabBarIndex,
  });

  @override
  ConsumerState<OrderCarts> createState() => _OrderCartsState();
}

class _OrderCartsState extends ConsumerState<OrderCarts> {
  final _delayed = Delayed(milliseconds: 1200);

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer(builder: (context, ref, child) {
      final stateCart = ref.watch(shopOrderProvider).cart;
      final state = ref.watch(orderProvider);
      return (stateCart?.group ?? false)
          ? ref.watch(orderProvider).orderData == null
              ? ListView.builder(
                  padding: EdgeInsets.only(bottom: 8.h),
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: stateCart?.userCarts?.length ?? 0,
                  itemBuilder: (context, index) {
                    return Column(
                      children: [
                        const Divider(),
                        Theme(
                          data: Theme.of(context)
                              .copyWith(dividerColor: AppStyle.transparent),
                          child: ExpansionTile(
                            title: TitleAndIcon(
                              title:
                                  " ${stateCart?.userCarts?[index].name ?? ""} ${index == 0 ? "(${AppHelpers.getTranslation(TrKeys.owner)})" : ""}",
                            ),
                            children: [
                              ListView.builder(
                                  padding:
                                      EdgeInsets.symmetric(horizontal: 16.w),
                                  physics: const NeverScrollableScrollPhysics(),
                                  shrinkWrap: true,
                                  itemCount: stateCart?.userCarts?[index]
                                          .cartDetails?.length ??
                                      0,
                                  itemBuilder: (context, indexCart) {
                                    return CartOrderItem(
                                      colors: widget.colors,
                                      isOwn: index == 0,
                                      add: () {
                                        ref
                                            .read(shopOrderProvider.notifier)
                                            .addCount(
                                              context: context,
                                              localIndex: LocalStorage
                                                      .getCartLocal()
                                                  .findIndex(stateCart
                                                      ?.userCarts?[index]
                                                      .cartDetails?[indexCart]
                                                      .stock
                                                      ?.id),
                                            )
                                            .then((value) {
                                          _delayed.run(() {
                                            ref
                                                .read(orderProvider.notifier)
                                                .getCalculate(
                                                    isLoading: false,
                                                    context: context,
                                                    cartId: stateCart?.id ?? 0,
                                                    type:
                                                        widget.tabBarIndex == 0
                                                            ? DeliveryTypeEnum
                                                                .delivery
                                                            : DeliveryTypeEnum
                                                                .pickup);
                                          });
                                        });
                                      },
                                      remove: () {
                                        ref
                                            .read(shopOrderProvider.notifier)
                                            .removeCount(
                                              context: context,
                                              localIndex: LocalStorage
                                                      .getCartLocal()
                                                  .findIndex(stateCart
                                                      ?.userCarts?[index]
                                                      .cartDetails?[indexCart]
                                                      .stock
                                                      ?.id),
                                            )
                                            .then((value) {
                                          _delayed.run(() {
                                            ref
                                                .read(orderProvider.notifier)
                                                .getCalculate(
                                                  isLoading: false,
                                                  context: context,
                                                  cartId: stateCart?.id ?? 0,
                                                  type: widget.tabBarIndex == 0
                                                      ? DeliveryTypeEnum
                                                          .delivery
                                                      : DeliveryTypeEnum.pickup,
                                                );
                                          });
                                        });
                                      },
                                      cart: stateCart?.userCarts?[index]
                                          .cartDetails?[indexCart],
                                    );
                                  })
                            ],
                          ),
                        ),
                      ],
                    );
                  })
              : ListView.builder(
                  padding:
                      EdgeInsets.symmetric(horizontal: 16.w, vertical: 14.h),
                  physics: const NeverScrollableScrollPhysics(),
                  shrinkWrap: true,
                  itemCount: state.orderData?.details?.length ?? 0,
                  itemBuilder: (context, index) {
                    return CartOrderItem(
                      colors: widget.colors,
                      isActive: false,
                      add: () {},
                      remove: () {},
                      cartTwo: state.orderData?.details?[index],
                      cart: null,
                    );
                  })
          : ref.watch(orderProvider).orderData == null
              ? Column(
                  children: [
                    24.verticalSpace,
                    TitleAndIcon(
                      title: state.orderData != null
                          ? AppHelpers.getTranslation(TrKeys.compositionOrder)
                          : AppHelpers.getTranslation(TrKeys.yourOrder),
                      rightTitleColor: AppStyle.red,
                      rightTitle: state.orderData == null
                          ? AppHelpers.getTranslation(TrKeys.clear)
                          : null,
                      onRightTap: state.orderData == null
                          ? () {
                              AppHelpers.showAlertDialog(
                                context: context,
                                child: (colors) => CartClearDialog(
                                  isLoading: ref
                                      .watch(shopOrderProvider)
                                      .isDeleteLoading,
                                  cancel: () {
                                    Navigator.pop(context);
                                  },
                                  clear: () {
                                    ref
                                        .read(shopOrderProvider.notifier)
                                        .deleteCart(context);
                                    context.maybePop();
                                  },
                                  colors: colors,
                                ),
                                radius: 10,
                              );
                            }
                          : null,
                    ),
                    ListView.builder(
                        padding: EdgeInsets.symmetric(
                            horizontal: 16.w, vertical: 14.h),
                        physics: const NeverScrollableScrollPhysics(),
                        shrinkWrap: true,
                        itemCount:
                            stateCart?.userCarts?.first.cartDetails?.length ??
                                0,
                        itemBuilder: (context, index) {
                          return CartOrderItem(
                            colors: widget.colors,
                            add: () {
                              ref
                                  .read(shopOrderProvider.notifier)
                                  .addCount(
                                    context: context,
                                    localIndex: LocalStorage.getCartLocal()
                                        .searchIndex(stateCart?.userCarts?.first
                                                .cartDetails?[index] ??
                                            CartDetail()),
                                  )
                                  .then((value) {
                                _delayed.run(() {
                                  ref.read(orderProvider.notifier).getCalculate(
                                      isLoading: false,
                                      context: context,
                                      cartId: stateCart?.id ?? 0,
                                      type: widget.tabBarIndex == 0
                                          ? DeliveryTypeEnum.delivery
                                          : DeliveryTypeEnum.pickup);
                                });
                              });
                            },
                            remove: () {
                              ref
                                  .read(shopOrderProvider.notifier)
                                  .removeCount(
                                    context: context,
                                    localIndex:
                                        LocalStorage.getCartLocal().searchIndex(
                                      stateCart?.userCarts?.first
                                              .cartDetails?[index] ??
                                          CartDetail(),
                                    ),
                                  )
                                  .then((value) {
                                _delayed.run(() {
                                  ref.read(orderProvider.notifier).getCalculate(
                                        isLoading: false,
                                        context: context,
                                        cartId: stateCart?.id ?? 0,
                                        type: widget.tabBarIndex == 0
                                            ? DeliveryTypeEnum.delivery
                                            : DeliveryTypeEnum.pickup,
                                      );
                                });
                              });
                            },
                            cart:
                                stateCart?.userCarts?.first.cartDetails?[index],
                          );
                        }),
                  ],
                )
              : ListView.builder(
                  padding:
                      EdgeInsets.symmetric(horizontal: 16.w, vertical: 14.h),
                  physics: const NeverScrollableScrollPhysics(),
                  shrinkWrap: true,
                  itemCount:
                      ref.watch(orderProvider).orderData?.details?.length ?? 0,
                  itemBuilder: (context, index) {
                    return CartOrderItem(
                      colors: widget.colors,
                      isActive: false,
                      add: () {},
                      remove: () {},
                      cartTwo:
                          ref.watch(orderProvider).orderData?.details?[index],
                      cart: null,
                    );
                  });
    });
  }
}
