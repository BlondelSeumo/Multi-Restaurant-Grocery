import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'package:riverpodtemp/application/currency/currency_provider.dart';
import 'package:riverpodtemp/application/home/home_notifier.dart';
import 'package:riverpodtemp/application/home/home_provider.dart';
import 'package:riverpodtemp/application/home/home_state.dart';
import 'package:riverpodtemp/application/map/view_map_provider.dart';
import 'package:riverpodtemp/application/product/product_provider.dart';
import 'package:riverpodtemp/application/shop/shop_provider.dart';
import 'package:riverpodtemp/application/shop_order/shop_order_provider.dart';
import 'package:riverpodtemp/infrastructure/models/data/local_cart_model.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import 'package:riverpodtemp/presentation/components/loading.dart';
import 'package:riverpodtemp/presentation/pages/home/app_bar_home.dart';
import 'package:riverpodtemp/presentation/pages/home/category_screen.dart';
import 'package:riverpodtemp/presentation/pages/home/filter_category_product.dart';
import 'package:riverpodtemp/presentation/pages/product/product_page.dart';
import 'package:riverpodtemp/presentation/pages/shop/widgets/shop_product_item.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';
import 'package:upgrader/upgrader.dart';
import '../../components/title_icon.dart';
import 'product_by_category.dart';
import 'shimmer/banner_shimmer.dart';
import 'widgets/add_address.dart';
import 'widgets/banner_item.dart';
import 'widgets/recommended_item.dart';
import 'widgets/shop_bar_item.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({
    super.key,
  });

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  late HomeNotifier event;
  late RefreshController _bannerController;
  late RefreshController _productController;
  late RefreshController _categoryController;
  late RefreshController _storyController;
  late RefreshController _popularController;

  @override
  void initState() {
    _bannerController = RefreshController();
    _productController = RefreshController();
    _categoryController = RefreshController();
    _storyController = RefreshController();
    _popularController = RefreshController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(homeProvider.notifier)
        ..fetchBranches(context, false)
        ..setAddress()
        ..fetchBanner(context)
        ..fetchStore(context)
        ..fetchProductsWithCheckBranch(context)
        // ..fetchProductsPopular(context)
        ..fetchRecipeCategory(context)
        ..fetchCategories(context);
      ref.read(viewMapProvider.notifier).checkAddress();
      ref.read(currencyProvider.notifier).fetchCurrency(context);
      if (LocalStorage.getShopId() != 0) {
        ref
            .read(shopProvider.notifier)
            .fetchShop(context, LocalStorage.getShopId());
      }
      if (LocalStorage.getToken().isNotEmpty) {
        ref
            .read(shopOrderProvider.notifier)
            .getCart(context, () {}, isStart: true);
      }
    });
    super.initState();
  }

  @override
  void didChangeDependencies() {
    event = ref.read(homeProvider.notifier);
    super.didChangeDependencies();
  }

  @override
  void dispose() {
    _bannerController.dispose();
    _categoryController.dispose();
    _productController.dispose();
    _storyController.dispose();
    _popularController.dispose();
    super.dispose();
  }

  void _onLoading(HomeState state) {
    if (state.isSelectCategoryLoading == 0) {
      event.fetchCategoriesPage(context, _productController);
    } else {
      event.fetchFilterProductsPage(context, _productController);
    }
  }

  void _onRefresh(HomeState state) {
    state.isSelectCategoryLoading == 0
        ? (event
          ..fetchBannerPage(context, _productController, isRefresh: true)
          ..fetchProductsPage(context, _productController, isRefresh: true)
          ..fetchCategoriesPage(context, _productController, isRefresh: true)
          ..fetchRecipeCategoryPage(context, _productController,
              isRefresh: true)
          ..fetchStorePage(context, _productController, isRefresh: true)
          ..fetchProductsPopularPage(context, _productController,
              isRefresh: true))
        : event.fetchFilterProductsPage(context, _productController,
            isRefresh: true);
    _productController.resetNoData();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(homeProvider);
    final stateCart = ref.watch(shopOrderProvider).cart?.userCarts?.first;
    final bool isLtr = LocalStorage.getLangLtr();
    ref.listen(viewMapProvider, (previous, next) {
      if (!next.isSetAddress &&
          !(previous?.isSetAddress ?? false == next.isSetAddress)) {
        AppHelpers.showAlertDialog(
          context: context,
          child: (colors) => AddAddress(colors: colors),
        );
      }
    });
    return UpgradeAlert(
      child: Directionality(
        textDirection: isLtr ? TextDirection.ltr : TextDirection.rtl,
        child: CustomScaffold(
          body: (colors) => SmartRefresher(
            enablePullDown: true,
            enablePullUp: true,
            physics: const BouncingScrollPhysics(),
            controller: _productController,
            header: WaterDropMaterialHeader(
              distance: 160.h,
              backgroundColor: AppStyle.white,
              color: AppStyle.textGrey,
            ),
            onLoading: () => _onLoading(state),
            onRefresh: () => _onRefresh(state),
            child: SingleChildScrollView(
              child: Padding(
                padding: EdgeInsets.only(bottom: 32.h),
                child: Column(
                  children: [
                    AppBarHome(
                      colors: colors,
                      state: state,
                      event: event,
                      refreshController: _productController,
                    ),
                    24.verticalSpace,
                    CategoryScreen(
                      colors: colors,
                      state: state,
                      event: event,
                      categoryController: _categoryController,
                      restaurantController: _productController,
                    ),
                    state.isSelectCategoryLoading == -1
                        ? Loading()
                        : state.isSelectCategoryLoading == 0
                            ? _body(stateCart, state, context, colors)
                            : FilterCategoryProduct(
                                colors: colors,
                                stateCart: stateCart,
                                state: state,
                                event: event,
                              ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _body(dynamic stateCart, HomeState state, BuildContext context,
      CustomColorSet colors) {
    return Column(
      children: [
        state.story.isNotEmpty
            ? SizedBox(
                height: 110.h,
                child: SmartRefresher(
                  controller: _storyController,
                  scrollDirection: Axis.horizontal,
                  enablePullDown: false,
                  enablePullUp: true,
                  primary: false,
                  onLoading: () async {
                    await event.fetchStorePage(context, _storyController);
                  },
                  child: AnimationLimiter(
                    child: ListView.builder(
                      shrinkWrap: true,
                      primary: false,
                      scrollDirection: Axis.horizontal,
                      itemCount: state.story.length,
                      padding: EdgeInsets.only(left: 16.w),
                      itemBuilder: (context, index) =>
                          AnimationConfiguration.staggeredList(
                        position: index,
                        duration: const Duration(milliseconds: 375),
                        child: SlideAnimation(
                          verticalOffset: 50.0,
                          child: FadeInAnimation(
                            child: ShopBarItem(
                              index: index,
                              controller: _storyController,
                              story: state.story[index]?.first,
                              colors: colors,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              )
            : const SizedBox.shrink(),
        16.verticalSpace,
        state.isBannerLoading
            ? const BannerShimmer()
            : Container(
                height: state.banners.isNotEmpty ? 200.h : 0,
                margin: EdgeInsets.only(
                    bottom: state.banners.isNotEmpty ? 30.h : 0),
                child: SmartRefresher(
                  scrollDirection: Axis.horizontal,
                  enablePullDown: false,
                  enablePullUp: true,
                  primary: false,
                  controller: _bannerController,
                  onLoading: () async {
                    await event.fetchBannerPage(context, _bannerController);
                  },
                  child: AnimationLimiter(
                    child: ListView.builder(
                      shrinkWrap: true,
                      primary: false,
                      scrollDirection: Axis.horizontal,
                      itemCount: state.banners.length,
                      padding: EdgeInsets.only(left: 16.w),
                      itemBuilder: (context, index) =>
                          AnimationConfiguration.staggeredList(
                        position: index,
                        duration: const Duration(milliseconds: 375),
                        child: SlideAnimation(
                          verticalOffset: 50.0,
                          child: FadeInAnimation(
                            child: BannerItem(
                              banner: state.banners[index],
                              colors: colors,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
        Column(
          children: [
            state.recipesCategory.isNotEmpty
                ? Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TitleAndIcon(
                        title: AppHelpers.getTranslation(TrKeys.recipes),
                        rightTitle: AppHelpers.getTranslation(TrKeys.seeAll),
                        onRightTap: () {
                          context.pushRoute(RecommendedRoute());
                        },
                      ),
                      16.verticalSpace,
                      SizedBox(
                        height: 190.h,
                        child: AnimationLimiter(
                          child: ListView.builder(
                            shrinkWrap: true,
                            primary: false,
                            scrollDirection: Axis.horizontal,
                            itemCount: state.recipesCategory.length,
                            padding: EdgeInsets.only(left: 16.w),
                            itemBuilder: (context, index) =>
                                AnimationConfiguration.staggeredList(
                              position: index,
                              duration: const Duration(milliseconds: 375),
                              child: SlideAnimation(
                                verticalOffset: 50.0,
                                child: FadeInAnimation(
                                  child: GestureDetector(
                                    onTap: () {},
                                    child: RecommendedItem(
                                      colors: colors,
                                      recipeCategory:
                                          state.recipesCategory[index],
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  )
                : const SizedBox.shrink(),
            16.verticalSpace,
            state.productsPopular.isNotEmpty
                ? _popular(context, state, colors)
                : const SizedBox.shrink(),
            ListView.builder(
              padding: EdgeInsets.zero,
              physics: const NeverScrollableScrollPhysics(),
              shrinkWrap: true,
              itemCount: state.allProducts.length,
              itemBuilder: (context, index) {
                return ProductByCategory(
                  colors: colors,
                  categoryId: state.allProducts[index].id ?? 0,
                  title: state.allProducts[index].translation?.title ?? "",
                  listOfProduct: state.allProducts[index].products ?? [],
                );
              },
            ),
          ],
        ),
      ],
    );
  }

  Widget _popular(
      BuildContext context, HomeState state, CustomColorSet colors) {
    return Column(
      children: [
        TitleAndIcon(
          title:
              "${AppHelpers.getTranslation(TrKeys.popular)} ${AppHelpers.getTranslation(TrKeys.products)}",
        ),
        16.verticalSpace,
        SizedBox(
          height: 250.h,
          child: SmartRefresher(
            controller: _popularController,
            scrollDirection: Axis.horizontal,
            enablePullDown: false,
            enablePullUp: true,
            primary: false,
            onLoading: () async {
              await event.fetchProductsPopularPage(context, _popularController);
            },
            child: AnimationLimiter(
              child: ListView.builder(
                shrinkWrap: true,
                primary: false,
                scrollDirection: Axis.horizontal,
                itemCount: state.productsPopular.length,
                padding: EdgeInsets.only(left: 16.w),
                itemBuilder: (context, index) =>
                    AnimationConfiguration.staggeredList(
                  position: index,
                  duration: const Duration(milliseconds: 375),
                  child: SlideAnimation(
                    verticalOffset: 50.0,
                    child: FadeInAnimation(
                      child: GestureDetector(
                        onTap: () {
                          /// opening modal bottom sheet
                          AppHelpers.showCustomModalBottomDragSheet(
                            paddingTop:
                                MediaQuery.of(context).padding.top + 100.h,
                            context: context,
                            modal: (c) => ProductScreen(
                              data: state.productsPopular[index],
                              controller: c,
                            ),
                            isDarkMode: false,
                            isDrag: true,
                            radius: 16,
                          );
                        },
                        child: SizedBox(
                          width: 180.r,
                          child: LocalStorage.getToken().isNotEmpty
                              ? ShopProductItem(
                                  colors: colors,
                                  product: state.productsPopular[index],
                                  count: LocalStorage.getCartLocal().firstWhere(
                                      (element) =>
                                          element.stockId ==
                                          (state.productsPopular[index].stock
                                              ?.id), orElse: () {
                                    return CartLocalModel(
                                        quantity: 0, stockId: 0);
                                  }).quantity,
                                  isAdd: (LocalStorage.getCartLocal()
                                      .map((item) => item.stockId)
                                      .contains(state
                                          .productsPopular[index].stock?.id)),
                                  addCount: () {
                                    ref
                                        .read(shopOrderProvider.notifier)
                                        .addCount(
                                      product: state.productsPopular[index],
                                          context: context,
                                          localIndex:
                                              LocalStorage.getCartLocal()
                                                  .findIndex(state
                                                      .productsPopular[index]
                                                      .stock
                                                      ?.id),
                                        );
                                  },
                                  removeCount: () {
                                    ref
                                        .read(shopOrderProvider.notifier)
                                        .removeCount(
                                          context: context,
                                          localIndex:
                                              LocalStorage.getCartLocal()
                                                  .findIndex(state
                                                      .productsPopular[index]
                                                      .stock
                                                      ?.id),
                                        );
                                  },
                                  addCart: () {
                                    if (LocalStorage.getToken().isNotEmpty) {
                                      ref
                                          .read(shopOrderProvider.notifier)
                                          .addCart(context,
                                              state.productsPopular[index]);
                                      ref
                                          .read(productProvider.notifier)
                                          .createCart(
                                              context,
                                              state.productsPopular[index]
                                                      .shopId ??
                                                  0, () {
                                        ref
                                            .read(shopOrderProvider.notifier)
                                            .getCart(context, () {});
                                      }, product: state.productsPopular[index]);
                                    } else {
                                      context.pushRoute(const LoginRoute());
                                    }
                                  },
                                )
                              : ShopProductItem(
                                  colors: colors,
                                  product: state.productsPopular[index],
                                  count: AppHelpers.getCountCart(
                                      addons: state
                                          .productsPopular[index].stock?.addons,
                                      productId:
                                          state.productsPopular[index].id,
                                      stockId: state
                                          .productsPopular[index].stock?.id),
                                  isAdd: AppHelpers.productInclude(
                                      addons: state
                                          .productsPopular[index].stock?.addons,
                                      productId:
                                          state.productsPopular[index].id,
                                      stockId: state
                                          .productsPopular[index].stock?.id),
                                  addCount: () {
                                    ref
                                        .read(shopOrderProvider.notifier)
                                        .addCountLocal(
                                          context: context,
                                          product: state.productsPopular[index],
                                          stock: state
                                              .productsPopular[index].stock,
                                        );
                                  },
                                  removeCount: () {
                                    ref
                                        .read(shopOrderProvider.notifier)
                                        .removeCountLocal(
                                          context: context,
                                          product: state.productsPopular[index],
                                          stock: state
                                              .productsPopular[index].stock,
                                        );
                                  },
                                  addCart: () {
                                    ref
                                        .read(shopOrderProvider.notifier)
                                        .addCountLocal(
                                          context: context,
                                          product: state.productsPopular[index],
                                          stock: state
                                              .productsPopular[index].stock,
                                        );
                                  },
                                ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
