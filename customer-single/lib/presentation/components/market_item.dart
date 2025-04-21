import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:riverpodtemp/infrastructure/models/data/shop_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/bonus_discount_popular.dart';
import 'package:riverpodtemp/presentation/components/custom_network_image.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';
import '../routes/app_router.dart';
import 'blur_wrap.dart';
import 'shop_avarat.dart';

class MarketItem extends StatelessWidget {
  final ShopData shop;
  final bool isSimpleShop;
  final bool isShop;
  final CustomColorSet colors;

  const MarketItem({
    super.key,
    this.isSimpleShop = false,
    required this.shop,
    this.isShop = false,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        context.pushRoute(ShopRoute(shopId: (shop.id ?? 0), shop: shop));
      },
      child: isShop
          ? _shopItem()
          : Container(
              margin: isSimpleShop
                  ? EdgeInsets.symmetric(horizontal: 16.w, vertical: 6.h)
                  : EdgeInsets.only(right: 8.r),
              width: 268.w,
              height: 260.h,
              // foregroundDecoration: BoxDecoration(
              //   color: !(shop.open ?? true) ? AppStyle.white.withOpacity(0.5) : AppStyle.transparent
              // ),
              decoration: BoxDecoration(
                color: colors.buttonColor,
                borderRadius: BorderRadius.all(
                  Radius.circular(10.r),
                ),
                border: Border.all(color: AppStyle.borderColor),
              ),
              child: Stack(
                children: [
                  Column(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      SizedBox(
                        width: double.infinity,
                        height: 118.h,
                        child: ClipRRect(
                          borderRadius: BorderRadius.only(
                              topLeft: Radius.circular(10.r),
                              topRight: Radius.circular(10.r)),
                          child: CustomNetworkImage(
                            url: shop.backgroundImg ?? '',
                            height: 118.h,
                            width: double.infinity,
                            radius: 0,
                          ),
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: EdgeInsets.symmetric(horizontal: 16.w),
                            child: Text(
                              shop.translation?.title ?? "",
                              style: AppStyle.interSemi(
                                size: 16,
                                color: colors.textBlack,
                              ),
                            ),
                          ),
                          Padding(
                            padding: EdgeInsets.symmetric(horizontal: 16.w),
                            child: Text(
                              shop.bonus != null
                                  ? ((shop.bonus?.type ?? "sum") == "sum")
                                      ? "${AppHelpers.getTranslation(TrKeys.under)} ${AppHelpers.numberFormat(shop.bonus?.value ?? 0)} + ${shop.bonus?.bonusStock?.product?.translation?.title ?? ""}"
                                      : "${AppHelpers.getTranslation(TrKeys.under)} ${shop.bonus?.value ?? 0} + ${shop.bonus?.bonusStock?.product?.translation?.title ?? ""}"
                                  : shop.translation?.description ?? "",
                              style: AppStyle.interNormal(
                                size: 12,
                                color: colors.textBlack,
                              ),
                              maxLines: 2,
                            ),
                          ),
                          8.verticalSpace,
                          Divider(
                            color: colors.textBlack.withOpacity(0.3),
                          ),
                          Padding(
                            padding: EdgeInsets.only(
                                top: 8.h,
                                right: 16.w,
                                left: 16.w,
                                bottom: 14.h),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                SvgPicture.asset("assets/svgs/delivery.svg"),
                                10.horizontalSpace,
                                Text(
                                  "${shop.deliveryTime?.from ?? 0} - ${shop.deliveryTime?.to ?? 0} ${shop.deliveryTime?.type ?? "min"}",
                                  style: AppStyle.interNormal(
                                    size: 14,
                                    color: colors.textBlack,
                                  ),
                                ),
                                10.horizontalSpace,
                                Container(
                                  width: 5.w,
                                  height: 5.h,
                                  decoration: const BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: AppStyle.separatorDot),
                                ),
                                10.horizontalSpace,
                                SvgPicture.asset("assets/svgs/star.svg"),
                                10.horizontalSpace,
                                Text(
                                  (shop.avgRate ?? ""),
                                  style: AppStyle.interNormal(
                                    size: 14,
                                    color: colors.textBlack,
                                  ),
                                ),
                              ],
                            ),
                          )
                        ],
                      ),
                    ],
                  ),
                  Positioned(
                    top: 86.h,
                    right: 0,
                    left: 0,
                    child: Padding(
                      padding: EdgeInsets.symmetric(horizontal: 18.w),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          ShopAvatar(
                            shopImage: shop.logoImg ?? "",
                            size: isSimpleShop ? 50 : 44,
                            padding: 4.r,
                          ),
                          Padding(
                            padding:
                                EdgeInsets.only(bottom: isSimpleShop ? 6.h : 0),
                            child: BonusDiscountPopular(
                              isPopular: shop.isRecommend ?? false,
                              bonus: shop.bonus,
                              isDiscount: shop.isDiscount ?? false,
                              colors: colors,
                            ),
                          )
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Container _shopItem() {
    return Container(
      margin: EdgeInsets.only(right: 8.r),
      width: 160.w,
      height: 130.h,
      decoration: BoxDecoration(
          color: AppStyle.white,
          borderRadius: BorderRadius.all(Radius.circular(10.r))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            children: [
              SizedBox(
                width: double.infinity,
                height: 84.h,
                child: ClipRRect(
                  borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(10.r),
                      topRight: Radius.circular(10.r)),
                  child: CustomNetworkImage(
                    url: shop.backgroundImg ?? "",
                    height: 84.h,
                    width: double.infinity,
                    radius: 0,
                  ),
                ),
              ),
              Positioned(
                bottom: 4.h,
                right: 4.w,
                child: BlurWrap(
                  radius: BorderRadius.circular(100.r),
                  child: Container(
                    padding:
                        EdgeInsets.symmetric(vertical: 4.r, horizontal: 6.r),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          FlutterRemix.car_fill,
                          color: AppStyle.white,
                          size: 16.r,
                        ),
                        8.horizontalSpace,
                        Text(
                          "${shop.deliveryTime?.from ?? 0} - ${shop.deliveryTime?.to ?? 0} ${(shop.deliveryTime?.type ?? "min").substring(0, 1)}",
                          style: AppStyle.interNormal(
                            size: 12,
                            color: AppStyle.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              )
            ],
          ),
          Padding(
            padding: EdgeInsets.symmetric(vertical: 6.h, horizontal: 10.w),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  shop.translation?.title ?? "",
                  style: AppStyle.interSemi(
                    size: 16,
                    color: colors.textBlack,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  shop.bonus != null
                      ? ((shop.bonus?.type ?? "sum") == "sum")
                          ? "${AppHelpers.getTranslation(TrKeys.under)} ${AppHelpers.numberFormat(shop.bonus?.value ?? 0)} + ${shop.bonus?.bonusStock?.product?.translation?.title ?? ""}"
                          : "${AppHelpers.getTranslation(TrKeys.under)} ${shop.bonus?.value ?? 0} + ${shop.bonus?.bonusStock?.product?.translation?.title ?? ""}"
                      : shop.translation?.description ?? "",
                  style: AppStyle.interNormal(
                    size: 12,
                    color: colors.textBlack,
                  ),
                  maxLines: 1,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
