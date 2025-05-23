// ignore_for_file: unused_result

import 'package:auto_route/auto_route.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/application/shop/shop_notifier.dart';
import 'package:riverpodtemp/infrastructure/models/data/shop_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/buttons/pop_button.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import 'package:riverpodtemp/presentation/components/loading.dart';
import 'package:riverpodtemp/application/like/like_notifier.dart';
import 'package:riverpodtemp/application/like/like_provider.dart';
import 'package:riverpodtemp/presentation/pages/product/product_page.dart';
import 'package:riverpodtemp/presentation/pages/shop/shop_products_screen.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import '../../../../application/shop/shop_provider.dart';
import '../../../application/shop_order/shop_order_provider.dart';
import '../../../infrastructure/services/local_storage.dart';
import '../../components/buttons/animation_button_effect.dart';
import 'cart/cart_order_local_page.dart';
import 'cart/cart_order_page.dart';
import 'widgets/shop_page_avatar.dart';

@RoutePage()
class ShopPage extends ConsumerStatefulWidget {
  final ShopData? shop;
  final int shopId;
  final String? productId;

  const ShopPage({
    super.key,
    required this.shopId,
    this.productId,
    this.shop,
  });

  @override
  ConsumerState<ShopPage> createState() => _ShopPageState();
}

class _ShopPageState extends ConsumerState<ShopPage>
    with TickerProviderStateMixin {
  late ShopNotifier event;
  late LikeNotifier eventLike;

  @override
  void initState() {
    super.initState();
    ref.refresh(shopProvider);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.shop == null) {
        ref.read(shopProvider.notifier).fetchShop(context, widget.shopId);
      } else {
        ref.read(shopProvider.notifier).setShop(widget.shop!);
      }
      ref.read(shopProvider.notifier)
        ..checkProductsPopular(context, widget.shopId)
        ..fetchCategory(context, widget.shopId)
        ..changeIndex(0);
      if (LocalStorage.getToken().isNotEmpty) {
        ref.read(shopOrderProvider.notifier).getCart(context, () {});
      }

      if (widget.productId != null) {
        AppHelpers.showCustomModalBottomDragSheet(
          paddingTop: MediaQuery.of(context).padding.top + 100.h,
          context: context,
          modal: (c) => ProductScreen(
            productId: widget.productId,
            controller: c,
          ),
          isDarkMode: false,
          isDrag: true,
          radius: 16,
        );
      }
    });
  }

  @override
  void didChangeDependencies() {
    event = ref.read(shopProvider.notifier);
    eventLike = ref.read(likeProvider.notifier);

    super.didChangeDependencies();
  }

  @override
  Widget build(BuildContext context) {
    final bool isLtr = LocalStorage.getLangLtr();
    final state = ref.watch(shopProvider);
    return Directionality(
      textDirection: isLtr ? TextDirection.ltr : TextDirection.rtl,
      child: CustomScaffold(
        resizeToAvoidBottomInset: false,
        body: (colors) => state.isLoading
            ? Loading()
            : NestedScrollView(
                headerSliverBuilder:
                    (BuildContext context, bool innerBoxIsScrolled) {
                  return [
                    SliverAppBar(
                      backgroundColor: AppStyle.white,
                      automaticallyImplyLeading: false,
                      toolbarHeight: (480.r +
                          MediaQuery.of(context).padding.top +
                          (state.shopData?.bonus == null ? 0 : 46.r) +
                          (state.endTodayTime.hour > TimeOfDay.now().hour
                              ? 0
                              : 70.r)),
                      elevation: 0.0,
                      flexibleSpace: FlexibleSpaceBar(
                        background: ShopPageAvatar(
                          workTime: state.endTodayTime.hour >
                                  TimeOfDay.now().hour
                              ? "${state.startTodayTime.hour.toString().padLeft(2, '0')}:${state.startTodayTime.minute.toString().padLeft(2, '0')} - ${state.endTodayTime.hour.toString().padLeft(2, '0')}:${state.endTodayTime.minute.toString().padLeft(2, '0')}"
                              : AppHelpers.getTranslation(TrKeys.close),
                          onLike: () {
                            event.onLike();
                            eventLike.fetchLikeProducts(context);
                          },
                          isLike: state.isLike,
                          shop: state.shopData ?? ShopData(),
                          onShare: event.onShare,
                          bonus: state.shopData?.bonus,
                          colors: colors,
                        ),
                      ),
                    ),
                  ];
                },
                body: state.isCategoryLoading || state.isPopularLoading
                    ? Loading()
                    : ShopProductsScreen(
                        colors: colors,
                        isPopularProduct: state.isPopularProduct,
                        listCategory: state.category,
                        currentIndex: state.currentIndex,
                        shopId: widget.shopId,
                      ),
              ),
        floatingButtonLocation: FloatingActionButtonLocation.centerDocked,
        floatingButton: (colors) => Padding(
          padding: EdgeInsets.all(16.h),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: <Widget>[
              PopButton(colors: colors),
              LocalStorage.getToken().isNotEmpty
                  ? GestureDetector(
                      onTap: () {
                        AppHelpers.showCustomModalBottomDragSheet(
                          paddingTop:
                              MediaQuery.of(context).padding.top + 100.h,
                          context: context,
                          modal: (c) => LocalStorage.getToken().isNotEmpty
                              ? CartOrderPage(
                                  colors: colors,
                                  controller: c,
                                  isGroupOrder: false,
                                )
                              : CartOrderLocalPage(
                                  colors: colors,
                                  controller: c,
                                  isGroupOrder: false,
                                ),
                          isDarkMode: false,
                          isDrag: true,
                          radius: 12,
                        );
                      },
                      child: AnimationButtonEffect(
                        child: Container(
                          decoration: BoxDecoration(
                            color: AppStyle.primary,
                            borderRadius: BorderRadius.all(
                              Radius.circular(10.r),
                            ),
                          ),
                          padding: EdgeInsets.symmetric(
                              vertical: 8.h, horizontal: 10.w),
                          child: Row(
                            children: [
                              Icon(
                                FlutterRemix.shopping_bag_3_line,
                                color: colors.textBlack,
                              ),
                              12.horizontalSpace,
                              Container(
                                padding: EdgeInsets.symmetric(
                                    vertical: 8.h, horizontal: 14.w),
                                decoration: BoxDecoration(
                                  color: colors.textBlack,
                                  borderRadius: BorderRadius.all(
                                    Radius.circular(18.r),
                                  ),
                                ),
                                child: Consumer(
                                  builder: (context, ref, child) {
                                    return ref
                                            .watch(shopOrderProvider)
                                            .isLoading
                                        ? CupertinoActivityIndicator(
                                            color: AppStyle.white,
                                            radius: 10.r,
                                          )
                                        : Text(
                                            AppHelpers.numberFormat(ref
                                                    .watch(shopOrderProvider)
                                                    .cart
                                                    ?.totalPrice ??
                                                0),
                                            style: AppStyle.interSemi(
                                              size: 16,
                                              color: AppStyle.white,
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
                  : const SizedBox.shrink(),
            ],
          ),
        ),
      ),
    );
  }
}
