import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'package:riverpodtemp/application/home/home_provider.dart';
import 'package:riverpodtemp/application/like/like_notifier.dart';
import 'package:riverpodtemp/application/like/like_provider.dart';
import 'package:riverpodtemp/application/product/product_provider.dart';
import 'package:riverpodtemp/application/shop_order/shop_order_provider.dart';
import 'package:riverpodtemp/infrastructure/models/data/local_cart_model.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/app_bars/common_app_bar.dart';
import 'package:riverpodtemp/presentation/components/buttons/pop_button.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import 'package:riverpodtemp/presentation/pages/shop/widgets/shimmer_product_list.dart';
import 'package:riverpodtemp/presentation/pages/shop/widgets/shop_product_item.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';

import '../../../application/main/main_provider.dart';
import '../product/product_page.dart';

@RoutePage()
class LikePage extends ConsumerStatefulWidget {
  const LikePage({super.key});

  @override
  ConsumerState<LikePage> createState() => _LikePageState();
}

class _LikePageState extends ConsumerState<LikePage> {
  late LikeNotifier event;
  final RefreshController _bannerController = RefreshController();
  final RefreshController _likeShopController = RefreshController();
  final ScrollController _controller = ScrollController();

  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(likeProvider.notifier).fetchLikeProducts(context);
    });
    _controller.addListener(listen);
    super.initState();
  }

  @override
  void didChangeDependencies() {
    event = ref.read(likeProvider.notifier);
    super.didChangeDependencies();
  }

  @override
  void dispose() {
    _bannerController.dispose();
    _likeShopController.dispose();
    _controller.removeListener(listen);
    super.dispose();
  }

  void listen() {
    final direction = _controller.position.userScrollDirection;
    if (direction == ScrollDirection.reverse) {
      ref.read(mainProvider.notifier).changeScrolling(true);
    } else if (direction == ScrollDirection.forward) {
      ref.read(mainProvider.notifier).changeScrolling(false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(likeProvider);
    return CustomScaffold(
      body: (colors) => Column(
        children: [
          CommonAppBar(
            child: Text(
              AppHelpers.getTranslation(TrKeys.likedProducts),
              style: AppStyle.interNoSemi(
                size: 18,
                color: colors.textBlack,
              ),
            ),
          ),
          Expanded(
            child: SmartRefresher(
              enablePullDown: true,
              enablePullUp: false,
              physics: const BouncingScrollPhysics(),
              controller: _likeShopController,
              scrollController: _controller,
              onLoading: () {},
              onRefresh: () {
                event.fetchLikeProducts(context);
                ref.read(homeProvider.notifier).fetchBannerPage(
                    context, _likeShopController,
                    isRefresh: true);
              },
              child: SingleChildScrollView(
                padding: EdgeInsets.only(
                  top: 10.h,
                  bottom: MediaQuery.of(context).padding.bottom,
                ),
                child: Column(
                  children: [
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
                                      duration:
                                          const Duration(milliseconds: 375),
                                      child: ScaleAnimation(
                                        scale: 0.5,
                                        child: FadeInAnimation(
                                          child: GestureDetector(
                                            onTap: () {
                                              AppHelpers
                                                  .showCustomModalBottomDragSheet(
                                                paddingTop:
                                                    MediaQuery.of(context)
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
                                            child: LocalStorage.getToken()
                                                    .isNotEmpty
                                                ? ShopProductItem(
                                                    colors: colors,
                                                    product:
                                                        state.products[index],
                                                    count: LocalStorage
                                                            .getCartLocal()
                                                        .firstWhere(
                                                            (element) =>
                                                                element
                                                                    .stockId ==
                                                                (state
                                                                        .products[
                                                                            index]
                                                                        .stocks
                                                                        ?.first
                                                                        .id ??
                                                                    0),
                                                            orElse: () {
                                                      return CartLocalModel(
                                                          quantity: 0,
                                                          stockId: 0);
                                                    }).quantity,
                                                    isAdd: (LocalStorage
                                                            .getCartLocal()
                                                        .map((item) =>
                                                            item.stockId)
                                                        .contains(state
                                                            .products[index]
                                                            .stocks
                                                            ?.first
                                                            .id)),
                                                    addCount: () {
                                                      ref
                                                          .read(
                                                              shopOrderProvider
                                                                  .notifier)
                                                          .addCount(
                                                            product:
                                                                state.products[
                                                                    index],
                                                            context: context,
                                                            localIndex: LocalStorage
                                                                    .getCartLocal()
                                                                .findIndex(state
                                                                    .products[
                                                                        index]
                                                                    .stocks
                                                                    ?.first
                                                                    .id),
                                                          );
                                                    },
                                                    removeCount: () {
                                                      ref
                                                          .read(
                                                              shopOrderProvider
                                                                  .notifier)
                                                          .removeCount(
                                                            context: context,
                                                            localIndex: LocalStorage
                                                                    .getCartLocal()
                                                                .findIndex(state
                                                                    .products[
                                                                        index]
                                                                    .stocks
                                                                    ?.first
                                                                    .id),
                                                          );
                                                    },
                                                    addCart: () {
                                                      if (LocalStorage
                                                              .getToken()
                                                          .isNotEmpty) {
                                                        ref
                                                            .read(
                                                                shopOrderProvider
                                                                    .notifier)
                                                            .addCart(
                                                                context,
                                                                state.products[
                                                                    index]);
                                                        ref
                                                            .read(
                                                                productProvider
                                                                    .notifier)
                                                            .createCart(
                                                                context,
                                                                state
                                                                        .products[
                                                                            index]
                                                                        .shopId ??
                                                                    0, () {
                                                          ref
                                                              .read(
                                                                  shopOrderProvider
                                                                      .notifier)
                                                              .getCart(context,
                                                                  () {});
                                                        },
                                                                product: state
                                                                        .products[
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
                                                        state.products[index],
                                                    count:
                                                        AppHelpers.getCountCart(
                                                            addons: state
                                                                .products[index]
                                                                .stock
                                                                ?.addons,
                                                            productId: state
                                                                .products[index]
                                                                .id,
                                                            stockId: state
                                                                .products[index]
                                                                .stock
                                                                ?.id),
                                                    isAdd: AppHelpers
                                                        .productInclude(
                                                            addons: state
                                                                .products[index]
                                                                .stock
                                                                ?.addons,
                                                            productId: state
                                                                .products[index]
                                                                .id,
                                                            stockId: state
                                                                .products[index]
                                                                .stock
                                                                ?.id),
                                                    addCount: () {
                                                      ref
                                                          .read(
                                                              shopOrderProvider
                                                                  .notifier)
                                                          .addCountLocal(
                                                            context: context,
                                                            product:
                                                                state.products[
                                                                    index],
                                                            stock: state
                                                                .products[index]
                                                                .stock,
                                                          );
                                                    },
                                                    removeCount: () {
                                                      ref
                                                          .read(
                                                              shopOrderProvider
                                                                  .notifier)
                                                          .removeCountLocal(
                                                            context: context,
                                                            product:
                                                                state.products[
                                                                    index],
                                                            stock: state
                                                                .products[index]
                                                                .stock,
                                                          );
                                                    },
                                                    addCart: () {
                                                      ref
                                                          .read(
                                                              shopOrderProvider
                                                                  .notifier)
                                                          .addCountLocal(
                                                            context: context,
                                                            product:
                                                                state.products[
                                                                    index],
                                                            stock: state
                                                                .products[index]
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
                  ],
                ),
              ),
            ),
          )
        ],
      ),
      floatingButtonLocation: FloatingActionButtonLocation.startFloat,
      floatingButton: (colors) => Visibility(
        visible: MediaQuery.of(context).viewInsets.bottom == 0.0,
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.w),
          child: PopButton(colors: colors),
        ),
      ),
    );
  }

  Widget _resultEmpty() {
    return Column(
      children: [
        32.verticalSpace,
        Image.asset("assets/images/notFound.png"),
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
