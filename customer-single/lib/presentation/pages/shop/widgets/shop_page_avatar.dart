import 'dart:ui';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:riverpodtemp/application/shop/shop_provider.dart';
import 'package:riverpodtemp/application/shop_order/shop_order_provider.dart';
import 'package:riverpodtemp/infrastructure/models/data/shop_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/buttons/animation_button_effect.dart';
import 'package:riverpodtemp/presentation/components/buttons/custom_button.dart';
import 'package:riverpodtemp/presentation/components/custom_network_image.dart';
import 'package:riverpodtemp/presentation/components/shop_avarat.dart';
import 'package:riverpodtemp/presentation/pages/shop/group_order/group_order.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

import '../../../../infrastructure/models/data/bonus_data.dart';
import '../../../components/bonus_discount_popular.dart';
import 'bonus_screen.dart';
import 'shop_description_item.dart';

class ShopPageAvatar extends StatelessWidget {
  final ShopData shop;
  final String workTime;
  final bool isLike;
  final VoidCallback onShare;
  final VoidCallback onLike;
  final BonusModel? bonus;
  final CustomColorSet colors;

  const ShopPageAvatar({
    super.key,
    required this.shop,
    required this.onLike,
    required this.workTime,
    required this.isLike,
    required this.onShare,
    required this.bonus,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        shopAppBar(context),
        8.verticalSpace,
        Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                shop.translation?.title ?? "",
                style: AppStyle.interSemi(
                  size: 22,
                  color: colors.textBlack,
                ),
              ),
              Text(
                shop.translation?.description ?? "",
                style: AppStyle.interNormal(
                  size: 13,
                  color: colors.textBlack,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              6.verticalSpace,
              Row(
                children: [
                  SvgPicture.asset("assets/svgs/star.svg"),
                  4.horizontalSpace,
                  Text(
                    (shop.avgRate ?? ""),
                    style: AppStyle.interNormal(
                      size: 12.sp,
                      color: colors.textBlack,
                    ),
                  ),
                  8.horizontalSpace,
                  BonusDiscountPopular(
                    isSingleShop: true,
                    isPopular: shop.isRecommend ?? false,
                    bonus: shop.bonus,
                    isDiscount: shop.isDiscount ?? false,
                    colors: colors,
                  ),
                ],
              ),
              10.verticalSpace,
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  ShopDescriptionItem(
                    title: AppHelpers.getTranslation(TrKeys.workingHours),
                    description: workTime,
                    icon: Icon(
                      FlutterRemix.time_fill,
                      color: colors.textBlack,
                    ),
                    colors: colors,
                  ),
                  ShopDescriptionItem(
                    colors: colors,
                    title: AppHelpers.getTranslation(TrKeys.deliveryTime),
                    description:
                        "${shop.deliveryTime?.from ?? 0} - ${shop.deliveryTime?.to ?? 0} ${shop.deliveryTime?.type ?? "min"}",
                    icon: SvgPicture.asset(
                      "assets/svgs/delivery.svg",
                      colorFilter: ColorFilter.mode(
                        colors.textBlack,
                        BlendMode.srcIn,
                      ),
                    ),
                  ),
                  ShopDescriptionItem(
                    colors: colors,
                    title: AppHelpers.getTranslation(TrKeys.deliveryPrice),
                    description:
                        "${AppHelpers.getTranslation(TrKeys.from)} ${AppHelpers.numberFormat(
                      shop.minPrice ?? 0,
                    )}",
                    icon: SvgPicture.asset(
                      "assets/svgs/ticket.svg",
                      width: 18.r,
                      height: 18.r,
                      colorFilter: ColorFilter.mode(
                        colors.textBlack,
                        BlendMode.srcIn,
                      ),
                    ),
                  ),
                ],
              ),
              AppHelpers.getTranslation(TrKeys.close) == workTime
                  ? Padding(
                      padding: const EdgeInsets.only(top: 10),
                      child: Container(
                        width: MediaQuery.sizeOf(context).width - 32,
                        decoration: BoxDecoration(
                          color: colors.buttonColor,
                          borderRadius: BorderRadius.all(
                            Radius.circular(10.r),
                          ),
                        ),
                        padding: const EdgeInsets.all(6),
                        child: Row(
                          children: [
                            Icon(
                              FlutterRemix.time_fill,
                              color: colors.textBlack,
                            ),
                            8.horizontalSpace,
                            Expanded(
                              child: Text(
                                AppHelpers.getTranslation(
                                  TrKeys.notWorkTodayTime,
                                ),
                                style: AppStyle.interNormal(
                                  size: 14,
                                  color: colors.textBlack,
                                ),
                                textAlign: TextAlign.start,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    )
                  : const SizedBox.shrink(),
              bonus != null ? _bonusButton(context) : const SizedBox.shrink(),
              12.verticalSpace,
              // groupOrderButton(context),
            ],
          ),
        )
      ],
    );
  }

  checkOtherShop(BuildContext context) {
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
                    Expanded(child: Consumer(builder: (contextTwo, ref, child) {
                      return CustomButton(
                          isLoading:
                              ref.watch(shopOrderProvider).isDeleteLoading,
                          title: AppHelpers.getTranslation(TrKeys.continueText),
                          textColor: colors.textBlack,
                          onPressed: () {
                            ref
                                .read(shopOrderProvider.notifier)
                                .deleteCart(context)
                                .then((value) async {
                              if (context.mounted) {
                                ref.read(shopOrderProvider.notifier).createCart(
                                      context,
                                      (shop.id ?? 0),
                                    );
                              }
                            });
                          });
                    })),
                  ],
                )
              ],
            ));
  }

  Widget groupOrderButton(BuildContext context) {
    return Consumer(builder: (context, ref, child) {
      ref.listen(shopOrderProvider, (previous, next) {
        if (next.isOtherShop && next.isOtherShop != previous?.isOtherShop) {
          checkOtherShop(context);
        }
        if (next.isStartGroup && next.isStartGroup != previous?.isStartGroup) {
          AppHelpers.showCustomModalBottomSheet(
            paddingTop: MediaQuery.of(context).padding.top + 160.h,
            context: context,
            modal: const GroupOrderScreen(),
            isDarkMode: false,
            isDrag: true,
            radius: 12,
          );
        }
      });
      bool isStartOrder = (ref.watch(shopOrderProvider).cart?.group ?? false) &&
          (ref.watch(shopOrderProvider).cart?.shopId == shop.id);
      return CustomButton(
        isLoading: ref.watch(shopOrderProvider).isStartGroupLoading ||
            ref.watch(shopOrderProvider).isCheckShopOrder,
        icon: Icon(
          isStartOrder
              ? FlutterRemix.list_settings_line
              : FlutterRemix.group_2_line,
          color: isStartOrder ? colors.textBlack : AppStyle.white,
        ),
        title: isStartOrder
            ? AppHelpers.getTranslation(TrKeys.manageOrder)
            : AppHelpers.getTranslation(TrKeys.startGroupOrder),
        background: isStartOrder ? AppStyle.primary : AppStyle.orderButtonColor,
        textColor: isStartOrder ? colors.textBlack : AppStyle.white,
        radius: 10,
        onPressed: () {
          if (LocalStorage.getToken().isNotEmpty) {
            !isStartOrder
                ? ref.read(shopOrderProvider.notifier).createCart(
                      context,
                      shop.id ?? 0,
                    )
                : AppHelpers.showCustomModalBottomSheet(
                    paddingTop: MediaQuery.of(context).padding.top + 160.h,
                    context: context,
                    modal: const GroupOrderScreen(),
                    isDarkMode: false,
                    isDrag: true,
                    radius: 12,
                  );
          } else {
            context.pushRoute(const LoginRoute());
          }
        },
      );
    });
  }

  Stack shopAppBar(BuildContext context) {
    return Stack(
      children: [
        Container(
          height: 180.h + MediaQuery.of(context).padding.top,
          width: double.infinity,
          color: AppStyle.mainBack,
          child: CustomNetworkImage(
            url: shop.backgroundImg ?? "",
            height: 180.h + MediaQuery.of(context).padding.top,
            width: double.infinity,
            radius: 0,
          ),
        ),
        Padding(
          padding: EdgeInsets.only(
              top: 130.h + MediaQuery.of(context).padding.top,
              left: 16.w,
              right: 16.w),
          child: ShopAvatar(
            radius: 20,
            shopImage: shop.logoImg ?? "",
            size: 70,
            padding: 6,
            bgColor: AppStyle.white.withOpacity(0.65),
          ),
        ),
        Positioned(
          top: MediaQuery.of(context).padding.top,
          right: 16.w,
          child: Row(
            children: [
              Consumer(
                builder: (context, ref, child) {
                  return GestureDetector(
                    onTap: () {
                      context.pushRoute(AllGalleriesRoute(
                          galleriesModel: ref.watch(shopProvider).galleries));
                    },
                    child: ClipRRect(
                      borderRadius: BorderRadius.all(Radius.circular(10.r)),
                      child: BackdropFilter(
                        filter: ImageFilter.blur(sigmaX: 10.0, sigmaY: 10.0),
                        child: Container(
                          padding: EdgeInsets.symmetric(
                              vertical: 10.r, horizontal: 12.r),
                          color: AppStyle.unselectedBottomBarItem
                              .withOpacity(0.29),
                          child: Row(
                            children: [
                              SvgPicture.asset("assets/svgs/menuS.svg"),
                              6.horizontalSpace,
                              Text(AppHelpers.getTranslation(
                                  TrKeys.seeAllPhotos))
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        )
      ],
    );
  }

  AnimationButtonEffect _bonusButton(BuildContext context) {
    return AnimationButtonEffect(
      child: GestureDetector(
          onTap: () {
            AppHelpers.showCustomModalBottomSheet(
              paddingTop: MediaQuery.of(context).padding.top,
              context: context,
              modal: BonusScreen(
                bonus: bonus,
                colors: colors,
              ),
              isDarkMode: false,
              isDrag: true,
              radius: 12,
            );
          },
          child: Container(
            margin: EdgeInsets.only(top: 8.h),
            width: MediaQuery.sizeOf(context).width - 32,
            decoration: BoxDecoration(
                color: AppStyle.bgGrey,
                borderRadius: BorderRadius.all(Radius.circular(10.r))),
            padding: const EdgeInsets.all(6),
            child: Row(
              children: [
                Container(
                  width: 22.w,
                  height: 22.h,
                  decoration: const BoxDecoration(
                      shape: BoxShape.circle, color: AppStyle.blueBonus),
                  child: Icon(
                    FlutterRemix.gift_2_fill,
                    size: 16.r,
                    color: AppStyle.white,
                  ),
                ),
                8.horizontalSpace,
                Expanded(
                  child: Text(
                    bonus != null
                        ? ((bonus?.type ?? "sum") == "sum")
                            ? "${AppHelpers.getTranslation(TrKeys.under)} ${AppHelpers.numberFormat(bonus?.value ?? 0)} + ${bonus?.bonusStock?.product?.translation?.title ?? ""}"
                            : "${AppHelpers.getTranslation(TrKeys.under)} ${bonus?.value ?? 0} + ${bonus?.bonusStock?.product?.translation?.title ?? ""}"
                        : "",
                    style: AppStyle.interNormal(
                      size: 14,
                      color: colors.textBlack,
                    ),
                    textAlign: TextAlign.start,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          )),
    );
  }
}
