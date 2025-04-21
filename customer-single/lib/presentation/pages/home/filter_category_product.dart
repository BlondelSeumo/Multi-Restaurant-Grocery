import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:lottie/lottie.dart';
import 'package:riverpodtemp/application/home/home_notifier.dart';
import 'package:riverpodtemp/application/home/home_state.dart';
import 'package:riverpodtemp/application/product/product_provider.dart';
import 'package:riverpodtemp/application/shop_order/shop_order_provider.dart';
import 'package:riverpodtemp/infrastructure/models/data/local_cart_model.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/title_icon.dart';
import 'package:riverpodtemp/presentation/pages/product/product_page.dart';
import 'package:riverpodtemp/presentation/pages/shop/widgets/shop_product_item.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';

import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class FilterCategoryProduct extends StatelessWidget {
  final HomeState state;

  // ignore: prefer_typing_uninitialized_variables
  final stateCart;
  final HomeNotifier event;
  final CustomColorSet colors;

  const FilterCategoryProduct({
    super.key,
    required this.state,
    required this.event,
    this.stateCart,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TitleAndIcon(
          title: AppHelpers.getTranslation(TrKeys.products),
          rightTitle:
              "${AppHelpers.getTranslation(TrKeys.found)} ${state.filterProducts.length.toString()} ${AppHelpers.getTranslation(TrKeys.results)}",
        ),
        state.filterProducts.isEmpty
            ? _resultEmpty()
            : AnimationLimiter(
                child: GridView.builder(
                  padding: EdgeInsets.only(
                      right: 12.w, left: 12.w, bottom: 96.h, top: 16.r),
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      childAspectRatio: 0.66.r,
                      crossAxisCount: 2,
                      mainAxisExtent: 250.r),
                  itemCount: state.filterProducts.length,
                  itemBuilder: (context, index) {
                    return AnimationConfiguration.staggeredGrid(
                      columnCount: state.filterProducts.length,
                      position: index,
                      duration: const Duration(milliseconds: 375),
                      child: ScaleAnimation(
                        scale: 0.5,
                        child: FadeInAnimation(
                          child: GestureDetector(
                            onTap: () {
                              AppHelpers.showCustomModalBottomDragSheet(
                                paddingTop:
                                    MediaQuery.of(context).padding.top + 100.h,
                                context: context,
                                modal: (c) => ProductScreen(
                                  data: state.filterProducts[index],
                                  controller: c,
                                ),
                                isDarkMode: false,
                                isDrag: true,
                                radius: 16,
                              );
                            },
                            child: Consumer(builder: (context, ref, child) {
                              return LocalStorage.getToken().isNotEmpty
                                  ? ShopProductItem(
                                      colors: colors,
                                      product: state.filterProducts[index],
                                      count: LocalStorage.getCartLocal()
                                          .firstWhere(
                                        (element) =>
                                            element.stockId ==
                                            (state.filterProducts[index].stock
                                                ?.id),
                                        orElse: () {
                                          return CartLocalModel(
                                            quantity: 0,
                                            stockId: 0,
                                          );
                                        },
                                      ).quantity,
                                      isAdd: (LocalStorage.getCartLocal()
                                          .map((item) => item.stockId)
                                          .contains(state.filterProducts[index]
                                              .stock?.id)),
                                      addCount: () {
                                        ref
                                            .read(shopOrderProvider.notifier)
                                            .addCount(
                                              context: context,
                                              product: state.filterProducts[index],
                                              localIndex:
                                                  LocalStorage.getCartLocal()
                                                      .findIndex(state
                                                          .filterProducts[index]
                                                          .stock
                                                          ?.id),
                                            );
                                      },
                                      removeCount: () {
                                        ref
                                            .read(shopOrderProvider.notifier)
                                            .removeCount(
                                                context: context,
                                                localIndex: LocalStorage
                                                        .getCartLocal()
                                                    .findIndex(state
                                                        .filterProducts[index]
                                                        .stock
                                                        ?.id));
                                      },
                                      addCart: () {
                                        if (LocalStorage.getToken()
                                            .isNotEmpty) {
                                          ref
                                              .read(shopOrderProvider.notifier)
                                              .addCart(context,
                                                  state.filterProducts[index]);
                                          ref
                                              .read(productProvider.notifier)
                                              .createCart(
                                                  context,
                                                  state.filterProducts[index]
                                                          .shopId ??
                                                      0, () {
                                            ref
                                                .read(
                                                    shopOrderProvider.notifier)
                                                .getCart(context, () {});
                                          },
                                                  product: state
                                                      .filterProducts[index]);
                                        } else {
                                          context.pushRoute(const LoginRoute());
                                        }
                                      },
                                    )
                                  : ShopProductItem(
                                      colors: colors,
                                      product: state.filterProducts[index],
                                      count: AppHelpers.getCountCart(
                                          addons: state.filterProducts[index]
                                              .stock?.addons,
                                          productId:
                                              state.filterProducts[index].id,
                                          stockId: state
                                              .filterProducts[index].stock?.id),
                                      isAdd: AppHelpers.productInclude(
                                        productId:
                                            state.filterProducts[index].id,
                                        stockId: state
                                            .filterProducts[index].stock?.id,
                                        addons: state.filterProducts[index]
                                            .stock?.addons,
                                      ),
                                      addCount: () {
                                        ref
                                            .read(shopOrderProvider.notifier)
                                            .addCountLocal(
                                              context: context,
                                              product:
                                                  state.filterProducts[index],
                                              stock: state
                                                  .filterProducts[index].stock,
                                            );
                                      },
                                      removeCount: () {
                                        ref
                                            .read(shopOrderProvider.notifier)
                                            .removeCountLocal(
                                              context: context,
                                              product:
                                                  state.filterProducts[index],
                                              stock: state
                                                  .filterProducts[index].stock,
                                            );
                                      },
                                      addCart: () {
                                        ref
                                            .read(shopOrderProvider.notifier)
                                            .addCountLocal(
                                              context: context,
                                              product:
                                                  state.filterProducts[index],
                                              stock: state
                                                  .filterProducts[index].stock,
                                            );
                                      },
                                    );
                            }),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
      ],
    );
  }
}

Widget _resultEmpty() {
  return Column(
    children: [
      Lottie.asset("assets/lottie/empty-box.json"),
      Text(
        AppHelpers.getTranslation(TrKeys.nothingFound),
        style: AppStyle.interSemi(size: 18.sp),
      ),
      Padding(
        padding: EdgeInsets.symmetric(horizontal: 32.w),
        child: Text(
          AppHelpers.getTranslation(TrKeys.trySearchingAgain),
          style: AppStyle.interRegular(size: 14.sp),
          textAlign: TextAlign.center,
        ),
      ),
    ],
  );
}
