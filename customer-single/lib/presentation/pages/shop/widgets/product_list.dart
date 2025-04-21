import 'package:auto_route/auto_route.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:lottie/lottie.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'package:riverpodtemp/application/product/product_provider.dart';
import 'package:riverpodtemp/application/shop_order/shop_order_provider.dart';
import 'package:riverpodtemp/infrastructure/models/models.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/title_icon.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';

import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

import '../../../../application/shop/shop_provider.dart';
import '../../../../infrastructure/models/data/local_cart_model.dart';
import '../../product/product_page.dart';
import 'shimmer_product_list.dart';
import 'shop_product_item.dart';

class ProductsList extends ConsumerStatefulWidget {
  final CategoryData? categoryData;
  final CustomColorSet colors;
  final int shopId;
  final int? index;

  const ProductsList({
    super.key,
    required this.colors,
    this.categoryData,
    this.index,
    required this.shopId,
  });

  @override
  ConsumerState<ProductsList> createState() => _ProductsListState();
}

class _ProductsListState extends ConsumerState<ProductsList> {
  late RefreshController refreshController = RefreshController();

  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      widget.index == null
          ? ref.read(shopProvider.notifier).fetchProductsByCategory(
              context, widget.shopId, widget.categoryData!.id ?? 0)
          : widget.index == 0
              ? ref
                  .read(shopProvider.notifier)
                  .fetchProducts(context, widget.shopId)
              : ref
                  .read(shopProvider.notifier)
                  .fetchProductsPopular(context, widget.shopId);
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
    final state = ref.watch(shopProvider);
    return SmartRefresher(
      controller: refreshController,
      enablePullUp: state.products.isNotEmpty,
      enablePullDown: false,
      onRefresh: () {
        refreshController.refreshCompleted();
      },
      onLoading: () {
        widget.index == 0
            ? ref.read(shopProvider.notifier).fetchProductsPage(
                  context,
                  widget.shopId,
                )
            : widget.index == 1
                ? ref.read(shopProvider.notifier).fetchProductsPopularPage(
                      context,
                      widget.shopId,
                    )
                : ref.read(shopProvider.notifier).fetchProductsByCategoryPage(
                    context, widget.shopId, widget.categoryData?.id ?? 0);
        refreshController.loadComplete();
      },
      child: SingleChildScrollView(
        physics: const NeverScrollableScrollPhysics(),
        child: Column(
          children: [
            TitleAndIcon(
                title: widget.index == null
                    ? widget.categoryData?.translation?.title ?? ""
                    : widget.index == 0
                        ? AppHelpers.getTranslation(TrKeys.all)
                        : AppHelpers.getTranslation(TrKeys.popular)),
            12.verticalSpace,
            state.isProductLoading
                ? const ShimmerProductList()
                : state.products.isEmpty
                    ? _resultEmpty()
                    : AnimationLimiter(
                        child: GridView.builder(
                          padding: EdgeInsets.only(
                              right: 12.w, left: 12.w, bottom: 96.h),
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate:
                              SliverGridDelegateWithFixedCrossAxisCount(
                                  childAspectRatio: 0.66.r,
                                  crossAxisCount: 2,
                                  mainAxisExtent: 250.r),
                          itemCount: state.products.length,
                          itemBuilder: (context, index) {
                            return AnimationConfiguration.staggeredGrid(
                              columnCount: state.products.length,
                              position: index,
                              duration: const Duration(milliseconds: 375),
                              child: ScaleAnimation(
                                scale: 0.5,
                                child: FadeInAnimation(
                                  child: GestureDetector(
                                      onTap: () {
                                        AppHelpers
                                            .showCustomModalBottomDragSheet(
                                          paddingTop: MediaQuery.of(context)
                                                  .padding
                                                  .top +
                                              100.h,
                                          context: context,
                                          modal: (c) => ProductScreen(
                                            data: state.products[index],
                                            controller: c,
                                          ),
                                          isDarkMode: false,
                                          isDrag: true,
                                          radius: 16,
                                        );
                                      },
                                      child: LocalStorage.getToken().isNotEmpty
                                          ? ShopProductItem(
                                              colors: widget.colors,
                                              product: state.products[index],
                                              count: LocalStorage.getCartLocal()
                                                  .firstWhere(
                                                      (element) =>
                                                          element.stockId ==
                                                          (state.products[index]
                                                                  .stock?.id ??
                                                              0), orElse: () {
                                                return CartLocalModel(
                                                    quantity: 0, stockId: 0);
                                              }).quantity,
                                              isAdd: (LocalStorage
                                                      .getCartLocal()
                                                  .map((item) => item.stockId)
                                                  .contains(state
                                                      .products[index]
                                                      .stock
                                                      ?.id)),
                                              addCount: () {
                                                ref
                                                    .read(shopOrderProvider
                                                        .notifier)
                                                    .addCount(
                                                        context: context,
                                                        product: state.products[index],
                                                        localIndex: LocalStorage
                                                                .getCartLocal()
                                                            .findIndex(state
                                                                .products[index]
                                                                .stocks
                                                                ?.first
                                                                .id));
                                              },
                                              removeCount: () {
                                                ref
                                                    .read(shopOrderProvider
                                                        .notifier)
                                                    .removeCount(
                                                        context: context,
                                                        localIndex: LocalStorage
                                                                .getCartLocal()
                                                            .findIndex(state
                                                                .products[index]
                                                                .stocks
                                                                ?.first
                                                                .id));
                                              },
                                              addCart: () {
                                                if (LocalStorage.getToken()
                                                    .isNotEmpty) {
                                                  ref
                                                      .read(shopOrderProvider
                                                          .notifier)
                                                      .addCart(
                                                          context,
                                                          state
                                                              .products[index]);
                                                  ref
                                                      .read(productProvider
                                                          .notifier)
                                                      .createCart(
                                                          context,
                                                          state.products[index]
                                                                  .shopId ??
                                                              0, () {
                                                    ref
                                                        .read(shopOrderProvider
                                                            .notifier)
                                                        .getCart(
                                                            context, () {});
                                                  },
                                                          product: state
                                                              .products[index]);
                                                } else {
                                                  context.pushRoute(
                                                      const LoginRoute());
                                                }
                                              },
                                            )
                                          : ShopProductItem(
                                              colors: widget.colors,
                                              product: state.products[index],
                                              count: AppHelpers.getCountCart(
                                                  addons: state.products[index]
                                                      .stock?.addons,
                                                  productId:
                                                      state.products[index].id,
                                                  stockId: state.products[index]
                                                      .stock?.id),
                                              isAdd: AppHelpers.productInclude(
                                                  addons: state.products[index]
                                                      .stock?.addons,
                                                  productId:
                                                      state.products[index].id,
                                                  stockId: state.products[index]
                                                      .stock?.id),
                                              addCount: () {
                                                ref
                                                    .read(shopOrderProvider
                                                        .notifier)
                                                    .addCountLocal(
                                                      context: context,
                                                      product:
                                                          state.products[index],
                                                      stock: state
                                                          .products[index]
                                                          .stock,
                                                    );
                                              },
                                              removeCount: () {
                                                ref
                                                    .read(shopOrderProvider
                                                        .notifier)
                                                    .removeCountLocal(
                                                      context: context,
                                                      product:
                                                          state.products[index],
                                                      stock: state
                                                          .products[index]
                                                          .stock,
                                                    );
                                              },
                                              addCart: () {
                                                ref
                                                    .read(shopOrderProvider
                                                        .notifier)
                                                    .addCountLocal(
                                                      context: context,
                                                      product:
                                                          state.products[index],
                                                      stock: state
                                                          .products[index]
                                                          .stock,
                                                    );
                                              },
                                            )),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
            state.isProductPageLoading
                ? const CupertinoActivityIndicator()
                : const SizedBox.shrink()
          ],
        ),
      ),
    );
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
}
