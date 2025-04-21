import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'package:riverpodtemp/application/home/home_provider.dart';
import 'package:riverpodtemp/application/shop_order/shop_order_provider.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/presentation/components/app_bars/common_app_bar.dart';
import 'package:riverpodtemp/presentation/components/buttons/pop_button.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import 'package:riverpodtemp/presentation/pages/product/product_page.dart';
import 'package:riverpodtemp/presentation/pages/shop/widgets/shimmer_product_list.dart';
import 'package:riverpodtemp/presentation/pages/shop/widgets/shop_product_item.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import '../../../../application/product/product_provider.dart';
import '../../../../infrastructure/models/data/local_cart_model.dart';
import '../../../../infrastructure/services/local_storage.dart';
import '../../../routes/app_router.dart';

@RoutePage()
class ProductListPage extends ConsumerStatefulWidget {
  final String title;
  final int categoryId;

  const ProductListPage(
      {super.key, required this.title, required this.categoryId});

  @override
  ConsumerState<ProductListPage> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends ConsumerState<ProductListPage> {
  final bool isLtr = LocalStorage.getLangLtr();
  final RefreshController _controller = RefreshController();

  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(homeProvider.notifier)
          .fetchFilterProducts(context, categoryId: widget.categoryId);
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(homeProvider);
    ref.watch(shopOrderProvider);
    return Directionality(
      textDirection: isLtr ? TextDirection.ltr : TextDirection.rtl,
      child: CustomScaffold(
        body: (colors) => Column(
          children: [
            CommonAppBar(
              child: Text(
                widget.title,
                style: AppStyle.interNoSemi(size: 18.sp),
                maxLines: 2,
              ),
            ),
            Expanded(
              child: state.filterProducts.isEmpty
                  ? const ShimmerProductList()
                  : AnimationLimiter(
                      child: SmartRefresher(
                        controller: _controller,
                        enablePullDown: true,
                        enablePullUp: true,
                        onLoading: () {
                          ref
                              .read(homeProvider.notifier)
                              .fetchFilterProductsPage(context, _controller,
                                  categoryId: widget.categoryId);
                        },
                        onRefresh: () {
                          ref
                              .read(homeProvider.notifier)
                              .fetchFilterProductsPage(context, _controller,
                                  categoryId: widget.categoryId,
                                  isRefresh: true);
                        },
                        child: GridView.builder(
                          padding: EdgeInsets.only(
                              right: 12.w, left: 12.w, bottom: 96.h, top: 24.r),
                          shrinkWrap: true,
                          gridDelegate:
                              SliverGridDelegateWithFixedCrossAxisCount(
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
                                            MediaQuery.of(context).padding.top +
                                                100.h,
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
                                    child: LocalStorage.getToken().isNotEmpty
                                        ? ShopProductItem(
                                            colors: colors,
                                            product:
                                                state.filterProducts[index],
                                            count: LocalStorage.getCartLocal()
                                                .firstWhere(
                                                    (element) =>
                                                        element.stockId ==
                                                        (state
                                                            .filterProducts[
                                                                index]
                                                            .stock
                                                            ?.id), orElse: () {
                                              return CartLocalModel(
                                                  quantity: 0, stockId: 0);
                                            }).quantity,
                                            isAdd: (LocalStorage.getCartLocal()
                                                .map((item) => item.stockId)
                                                .contains(state
                                                    .filterProducts[index]
                                                    .stock
                                                    ?.id)),
                                            addCount: () {
                                              ref
                                                  .read(shopOrderProvider
                                                      .notifier)
                                                  .addCount(
                                                    context: context,
                                                    product: state.filterProducts[index],
                                                    localIndex: LocalStorage
                                                            .getCartLocal()
                                                        .findIndex(state
                                                            .filterProducts[
                                                                index]
                                                            .stock
                                                            ?.id),
                                                  );
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
                                                              .filterProducts[
                                                                  index]
                                                              .stock
                                                              ?.id));
                                            },
                                            addCart: () {

                                              if (LocalStorage.getToken()
                                                  .isNotEmpty) {
                                                ref
                                                    .read(shopOrderProvider
                                                        .notifier)
                                                    .addCart(
                                                        context,
                                                        state.filterProducts[
                                                            index]);
                                                ref
                                                    .read(productProvider
                                                        .notifier)
                                                    .createCart(
                                                        context,
                                                        state
                                                                .filterProducts[
                                                                    index]
                                                                .shopId ??
                                                            0, () {
                                                  ref
                                                      .read(shopOrderProvider
                                                          .notifier)
                                                      .getCart(context, () {});
                                                },
                                                        product: state
                                                                .filterProducts[
                                                            index]);
                                              } else {
                                                context.pushRoute(
                                                    const LoginRoute());
                                              }
                                            },
                                          )
                                        : ShopProductItem(
                                            colors: colors,
                                            product:
                                                state.filterProducts[index],
                                            count: AppHelpers.getCountCart(
                                                addons: state
                                                    .filterProducts[index]
                                                    .stock
                                                    ?.addons,
                                                productId: state
                                                    .filterProducts[index].id,
                                                stockId: state
                                                    .filterProducts[index]
                                                    .stock
                                                    ?.id),
                                            isAdd: AppHelpers.productInclude(
                                                addons: state
                                                    .filterProducts[index]
                                                    .stock
                                                    ?.addons,
                                                productId: state
                                                    .filterProducts[index].id,
                                                stockId: state
                                                    .filterProducts[index]
                                                    .stock
                                                    ?.id),
                                            addCount: () {
                                              ref
                                                  .read(shopOrderProvider
                                                      .notifier)
                                                  .addCountLocal(
                                                    context: context,
                                                    product: state
                                                        .filterProducts[index],
                                                    stock: state
                                                        .filterProducts[index]
                                                        .stock,
                                                  );
                                            },
                                            removeCount: () {
                                              ref
                                                  .read(shopOrderProvider
                                                      .notifier)
                                                  .removeCountLocal(
                                                    context: context,
                                                    product: state
                                                        .filterProducts[index],
                                                    stock: state
                                                        .filterProducts[index]
                                                        .stock,
                                                  );
                                            },
                                            addCart: () {
                                              ref
                                                  .read(shopOrderProvider
                                                      .notifier)
                                                  .addCountLocal(
                                                    context: context,
                                                    product: state
                                                        .filterProducts[index],
                                                    stock: state
                                                        .filterProducts[index]
                                                        .stock,
                                                  );
                                            },
                                          ),
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ),
            )
          ],
        ),
        floatingButtonLocation: FloatingActionButtonLocation.startFloat,
        floatingButton: (colors) => Padding(
          padding: EdgeInsets.only(left: 16.w),
          child: PopButton(colors: colors),
        ),
      ),
    );
  }
}
