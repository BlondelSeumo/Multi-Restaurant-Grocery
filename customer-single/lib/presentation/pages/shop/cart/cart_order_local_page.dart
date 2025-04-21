import 'dart:async';
import 'dart:ui';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:lottie/lottie.dart';
import 'package:riverpodtemp/application/shop_order/shop_order_notifier.dart';
import 'package:riverpodtemp/application/shop_order/shop_order_state.dart';
import 'package:riverpodtemp/infrastructure/models/data/cart_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/buttons/custom_button.dart';
import 'package:riverpodtemp/presentation/components/loading.dart';
import 'package:riverpodtemp/presentation/components/title_icon.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';
import 'package:riverpodtemp/presentation/theme/theme_wrapper.dart';
import '../../../../../application/shop_order/shop_order_provider.dart';
import 'widgets/cart_clear_dialog.dart';
import 'widgets/cart_order_description.dart';
import 'widgets/cart_order_item.dart';

class CartOrderLocalPage extends ConsumerStatefulWidget {
  final bool isGroupOrder;
  final ScrollController controller;
  final CustomColorSet colors;

  const CartOrderLocalPage({
    super.key,
    required this.colors,
    this.isGroupOrder = false,
    required this.controller,
  });

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _ShopOrderState();
}

class _ShopOrderState extends ConsumerState<CartOrderLocalPage> {
  Timer? timer;

  @override
  void initState() {
    super.initState();
    ref.read(shopOrderProvider.notifier).getCartLocal(context: context);
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
            topLeft: Radius.circular(12.r), topRight: Radius.circular(12.r)),
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
            child: LocalStorage.getCartList().isEmpty
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
                                  borderRadius:
                                      BorderRadius.all(Radius.circular(40.r))),
                            ),
                          ),
                          18.verticalSpace,
                          Column(
                            children: [
                              TitleAndIcon(
                                title:
                                    AppHelpers.getTranslation(TrKeys.yourOrder),
                                rightTitleColor: AppStyle.red,
                                rightTitle:
                                    AppHelpers.getTranslation(TrKeys.clearAll),
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
                                  itemCount:
                                      state.cartLocal?.data?.products?.length ??
                                          0,
                                  itemBuilder: (context, index) {
                                    final product =
                                        state.cartLocal?.data?.products?[index];
                                    return CartOrderItem(
                                      colors: widget.colors,
                                      add: () => event.addCountLocal(
                                        context: context,
                                        product: product?.stock?.product,
                                        stock: product?.stock
                                            ?.copyWith(addons: product.addons),
                                      ),
                                      remove: () {
                                        event.removeCountLocal(
                                          context: context,
                                          product: product?.stock?.product,
                                          stock: product?.stock?.copyWith(
                                              addons: product.addons),
                                        );
                                      },
                                      cart: CartDetail(
                                          quantity:
                                              product?.countableQuantity ??
                                                  product?.quantity,
                                          discount: product?.discount,
                                          bonus:
                                              product?.stock?.bonus != null ||
                                                  (product?.bonus ?? false),
                                          price: product?.totalPrice,
                                          stock: product?.stock?.copyWith(
                                              addons: product.addons),
                                          addons: product?.addons),
                                    );
                                  }),
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

  Container bottomWidget(
    ShopOrderState state,
    BuildContext context,
    ShopOrderNotifier event,
    CustomColorSet colors,
  ) {
    return Container(
      color: colors.scaffoldColor,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.r),
            child: Column(
              children: [
                Divider(
                  color: AppStyle.textGrey.withOpacity(0.1),
                ),
                (state.cartLocal?.data?.totalDiscount ?? 0) != 0
                    ? Column(
                        children: [
                          ShopOrderDescription(
                            price: state.cartLocal?.data?.totalDiscount ?? 0,
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
            padding: EdgeInsets.symmetric(horizontal: 16.w),
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
                  AppHelpers.numberFormat(
                    (state.cartLocal?.data?.totalPrice ?? 0) -
                        (state.cartLocal?.data?.totalTax ?? 0),
                  ),
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
                Navigator.pop(context);
                context.replaceRoute(const LoginRoute());
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _resultEmpty() {
    return ThemeWrapper(
      builder: (colors, controller) => Column(
        children: [
          100.verticalSpace,
          Lottie.asset('assets/lottie/girl_empty.json'),
          24.verticalSpace,
          Text(
            AppHelpers.getTranslation(TrKeys.cartIsEmpty),
            style: AppStyle.interSemi(
              size: 18.sp,
              color: colors.textBlack,
            ),
          ),
        ],
      ),
    );
  }
}
