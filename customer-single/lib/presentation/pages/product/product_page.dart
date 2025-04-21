// ignore_for_file: unused_result

import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:like_button/like_button.dart';
import 'package:riverpodtemp/application/like/like_notifier.dart';
import 'package:riverpodtemp/application/like/like_provider.dart';
import 'package:riverpodtemp/application/product/product_notifier.dart';
import 'package:riverpodtemp/application/product/product_provider.dart';
import 'package:riverpodtemp/application/product/product_state.dart';
import 'package:riverpodtemp/application/shop/shop_provider.dart';
import 'package:riverpodtemp/application/shop_order/shop_order_notifier.dart';
import 'package:riverpodtemp/application/shop_order/shop_order_provider.dart';
import 'package:riverpodtemp/infrastructure/models/data/product_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/buttons/animation_button_effect.dart';
import 'package:riverpodtemp/presentation/components/buttons/custom_button.dart';
import 'package:riverpodtemp/presentation/components/custom_network_image.dart';
import 'package:riverpodtemp/presentation/components/loading.dart';
import 'package:riverpodtemp/presentation/components/title_icon.dart';
import 'package:riverpodtemp/presentation/pages/product/widgets/images_list_one.dart';
import 'package:riverpodtemp/presentation/pages/product/widgets/w_ingredient.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme_wrapper.dart';
import '../../../infrastructure/models/data/review_data.dart';
import '../shop/widgets/bonus_screen.dart';
import 'widgets/p_main_button.dart';
import 'widgets/w_product_extras.dart';

class ProductScreen extends ConsumerStatefulWidget {
  final ProductData? data;
  final String? productId;
  final ScrollController? controller;

  const ProductScreen({
    this.productId,
    this.data,
    this.controller,
    super.key,
  });

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _ProductScreenState();
}

class _ProductScreenState extends ConsumerState<ProductScreen> {
  late bool isLtr;
  late ProductNotifier event;
  late LikeNotifier eventLike;
  late ShopOrderNotifier eventOrderShop;
  late PageController controller;

  @override
  void deactivate() {
    controller.dispose();
    super.deactivate();
  }

  @override
  void initState() {
    controller = PageController();
    ref.refresh(productProvider);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.productId != null) {
        ref.read(productProvider.notifier).getProductDetailsById(
            context,
            widget.productId ?? "",
            ref.watch(shopProvider).shopData?.type,
            ref.watch(shopProvider).shopData?.id);
      } else {
        ref.read(productProvider.notifier).getProductDetails(
            context,
            widget.data!,
            ref.watch(shopProvider).shopData?.type,
            ref.watch(shopProvider).shopData?.id);
      }
    });
    super.initState();
  }

  @override
  void didChangeDependencies() {
    isLtr = LocalStorage.getLangLtr();
    event = ref.read(productProvider.notifier);
    eventLike = ref.read(likeProvider.notifier);
    eventOrderShop = ref.read(shopOrderProvider.notifier);
    super.didChangeDependencies();
  }

  void checkShopOrder({
    required ProductNotifier event,
    required ProductState state,
    required ShopOrderNotifier eventOrderShop,
  }) {
    AppHelpers.showAlertDialog(
      context: context,
      child: (colors) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            AppHelpers.getTranslation(TrKeys.allPreviouslyAdded),
            style: AppStyle.interNormal(
              color: colors.textBlack,
            ),
            textAlign: TextAlign.center,
          ),
          16.verticalSpace,
          Row(
            children: [
              Expanded(
                child: CustomButton(
                    title: AppHelpers.getTranslation(TrKeys.cancel),
                    background: AppStyle.transparent,
                    borderColor: AppStyle.borderColor,
                    textColor: AppStyle.red,
                    onPressed: () {
                      Navigator.pop(context);
                    }),
              ),
              10.horizontalSpace,
              Expanded(
                child: Consumer(
                  builder: (contextTwo, ref, child) {
                    return CustomButton(
                      isLoading: ref.watch(shopOrderProvider).isDeleteLoading,
                      title: AppHelpers.getTranslation(TrKeys.continueText),
                      textColor: colors.textBlack,
                      onPressed: () {
                        eventOrderShop.deleteCart(context).then(
                          (value) async {
                            if (mounted) {
                              event.createCart(
                                context,
                                ref.watch(shopOrderProvider).cart?.shopId ??
                                    (state.productData!.shopId ?? 0),
                                () {
                                  eventOrderShop.getCart(context, () {});
                                  Navigator.pop(context);
                                },
                              );
                            }
                          },
                        );
                      },
                    );
                  },
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(productProvider);
    final stateOrderShop = ref.watch(shopOrderProvider);
    ref.listen(productProvider, (previous, next) {
      if (next.isCheckShopOrder &&
          (next.isCheckShopOrder != (previous?.isCheckShopOrder ?? false))) {
        checkShopOrder(
            event: event, state: state, eventOrderShop: eventOrderShop);
      }
    });
    return ThemeWrapper(
      builder: (colors, ct) => Directionality(
        textDirection: isLtr ? TextDirection.ltr : TextDirection.rtl,
        child: Container(
          decoration: BoxDecoration(
            color: colors.scaffoldColor,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(16.r),
              topRight: Radius.circular(16.r),
            ),
          ),
          width: double.infinity,
          child: state.isLoading
              ? Loading()
              : SingleChildScrollView(
                  controller: widget.controller,
                  child: Column(
                    children: [
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16.w),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
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
                            14.verticalSpace,
                            Row(
                              children: [
                                Expanded(
                                  child: TitleAndIcon(
                                    title:
                                        state.productData?.translation?.title ??
                                            "",
                                    paddingHorizontalSize: 0,
                                  ),
                                ),
                                8.horizontalSpace,
                                Container(
                                  // width: 44.w,
                                  height: 40.w,
                                  decoration: BoxDecoration(
                                    border: Border.all(color: colors.textBlack),
                                    borderRadius: BorderRadius.circular(8.r),
                                  ),
                                  padding:
                                      EdgeInsets.only(left: 6.r, right: 4.r),
                                  child: LikeButton(
                                    isLiked: state.isLike,
                                    padding: EdgeInsets.zero,
                                    likeBuilder: (isLike) {
                                      return Icon(
                                        !isLike
                                            ? FlutterRemix.heart_3_line
                                            : FlutterRemix.heart_3_fill,
                                        color: isLike
                                            ? AppStyle.red
                                            : colors.textBlack,
                                        size: 26.r,
                                      );
                                    },
                                    onTap: (s) {
                                      return Future(() {
                                        event.onLike();
                                        if (context.mounted) {
                                          eventLike.fetchLikeProducts(context);
                                        }
                                        return !s;
                                      });
                                    },
                                  ),
                                ),
                                8.horizontalSpace,
                                GestureDetector(
                                  onTap: () => event.shareProduct(),
                                  child: Container(
                                    width: 40.w,
                                    height: 40.w,
                                    decoration: BoxDecoration(
                                      color: AppStyle.transparent,
                                      border:
                                          Border.all(color: colors.textBlack),
                                      borderRadius: BorderRadius.circular(8.r),
                                    ),
                                    child: Center(
                                      child: Icon(
                                        FlutterRemix.share_line,
                                        color: colors.textBlack,
                                      ),
                                    ),
                                  ),
                                )
                              ],
                            ),
                            20.verticalSpace,
                            // CustomNetworkImage(
                            //     url: state.productData?.img ?? "",
                            //     height: 200.h,
                            //     width: double.infinity,
                            //     radius: 10.r),
                            Stack(
                              children: [
                                SizedBox(
                                  height: 200.r,
                                  child: PageView.builder(
                                    itemCount:
                                        state.productData?.galleries?.length ??
                                            0,
                                    controller: controller,
                                    onPageChanged: (index) {
                                      event.changeImage(
                                        state.productData?.galleries?[index] ??
                                            Galleries(),
                                      );
                                    },
                                    itemBuilder: (context, index) {
                                      return CustomNetworkImage(
                                        url: state.selectImage?.path ??
                                            state.activeImageUrl,
                                        height: 200,
                                        fit: BoxFit.cover,
                                        width: double.infinity,
                                        radius: 10,
                                      );
                                    },
                                  ),
                                ),
                                if ((state.productData?.galleries?.length ??
                                        0) >
                                    1)
                                  Positioned(
                                    bottom: 8.r,
                                    child: ImagesOneList(
                                      colors: colors,
                                      list: state.productData?.galleries,
                                      selectImageId: state.selectImage?.id,
                                    ),
                                  ),
                              ],
                            ),
                            state.selectedStock?.bonus != null
                                ? Padding(
                                    padding: EdgeInsets.only(top: 12.h),
                                    child: Row(
                                      children: [
                                        AnimationButtonEffect(
                                          child: InkWell(
                                            onTap: () {
                                              AppHelpers
                                                  .showCustomModalBottomSheet(
                                                context: context,
                                                modal: BonusScreen(
                                                  bonus: state
                                                      .selectedStock?.bonus,
                                                  colors: colors,
                                                ),
                                                isDarkMode: false,
                                                isDrag: true,
                                                radius: 12,
                                              );
                                            },
                                            child: Container(
                                              width: 22.w,
                                              height: 22.h,
                                              margin: EdgeInsets.all(8.r),
                                              decoration: const BoxDecoration(
                                                  shape: BoxShape.circle,
                                                  color: AppStyle.blueBonus),
                                              child: Icon(
                                                FlutterRemix.gift_2_fill,
                                                size: 16.r,
                                                color: AppStyle.white,
                                              ),
                                            ),
                                          ),
                                        ),
                                        4.horizontalSpace,
                                        Text(
                                          ((state.selectedStock?.bonus?.type ??
                                                      "sum") ==
                                                  "sum")
                                              ? "${AppHelpers.getTranslation(TrKeys.under)} ${AppHelpers.numberFormat(state.selectedStock?.bonus?.value ?? 0)} + ${state.selectedStock?.bonus?.bonusStock?.product?.translation?.title ?? ""}"
                                              : "${AppHelpers.getTranslation(TrKeys.under)} ${state.selectedStock?.bonus?.value ?? 0} + ${state.selectedStock?.bonus?.bonusStock?.product?.translation?.title ?? ""}",
                                          style: AppStyle.interRegular(
                                            size: 14,
                                            color: colors.textBlack,
                                          ),
                                        ),
                                      ],
                                    ),
                                  )
                                : const SizedBox.shrink(),
                            15.verticalSpace,
                            SizedBox(
                              width: MediaQuery.sizeOf(context).width,
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(
                                    child: Text(
                                      state.productData?.translation
                                              ?.description ??
                                          "",
                                      style: AppStyle.interRegular(
                                        size: 14.sp,
                                        color: AppStyle.textGrey,
                                      ),
                                    ),
                                  ),
                                  Column(
                                    children: [
                                      Text(
                                        AppHelpers.numberFormat(
                                          (state.selectedStock?.price ?? 0) +
                                              (state.selectedStock?.tax ?? 0),
                                        ),
                                        style: AppStyle.interRegular(
                                          size: 14.sp,
                                          color: colors.textBlack,
                                          textDecoration:
                                              state.selectedStock?.discount ==
                                                      null
                                                  ? TextDecoration.none
                                                  : TextDecoration.lineThrough,
                                        ),
                                      ),
                                      state.selectedStock?.discount == null
                                          ? const SizedBox.shrink()
                                          : Container(
                                              margin: EdgeInsets.only(top: 8.r),
                                              decoration: BoxDecoration(
                                                color: AppStyle.redBg,
                                                borderRadius:
                                                    BorderRadius.circular(
                                                  30.r,
                                                ),
                                              ),
                                              padding: EdgeInsets.all(4.r),
                                              child: Row(
                                                children: [
                                                  SvgPicture.asset(
                                                      "assets/svgs/discount.svg"),
                                                  8.horizontalSpace,
                                                  Text(
                                                    AppHelpers.numberFormat(
                                                      state.selectedStock
                                                              ?.totalPrice ??
                                                          0,
                                                    ),
                                                    style: AppStyle.interNoSemi(
                                                      size: 12,
                                                      color: AppStyle.red,
                                                    ),
                                                  )
                                                ],
                                              ),
                                            ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            24.verticalSpace,
                            WProductExtras(colors: colors),
                            24.verticalSpace,
                            WIngredientScreen(
                              list: state.selectedStock?.addons ?? [],
                              onChange: (int value) {
                                event.updateIngredient(context, value);
                              },
                              add: (int value) {
                                event.addIngredient(context, value);
                              },
                              remove: (int value) {
                                event.removeIngredient(context, value);
                              },
                              colors: colors,
                            ),
                          ],
                        ),
                      ),
                      20.verticalSpace,
                      ProductMainButton(
                        state: state,
                        event: event,
                        stateOrderShop: stateOrderShop,
                        eventOrderShop: eventOrderShop,
                        colors: colors,
                      )
                    ],
                  ),
                ),
        ),
      ),
    );
  }
}
