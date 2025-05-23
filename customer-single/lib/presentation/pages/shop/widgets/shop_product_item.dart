import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/infrastructure/models/data/product_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/presentation/components/buttons/animation_button_effect.dart';
import 'package:riverpodtemp/presentation/components/custom_network_image.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

import 'bonus_screen.dart';

class ShopProductItem extends StatelessWidget {
  final ProductData? product;
  final VoidCallback addCart;
  final VoidCallback? addCount;
  final VoidCallback? removeCount;
  final bool isAdd;
  final CustomColorSet colors;

  final int count;

  const ShopProductItem({
    super.key,
    required this.product,
    required this.addCart,
    this.isAdd = false,
    this.count = 0,
    this.addCount,
    this.removeCount,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    final stock = (product?.stocks?.isNotEmpty ?? false)
        ? product?.stocks?.first
        : product?.stock;
    return Container(
      margin: EdgeInsets.all(4.r),
      decoration: BoxDecoration(
        color: colors.buttonColor,
        borderRadius: BorderRadius.all(
          Radius.circular(10.r),
        ),
      ),
      child: Padding(
        padding: EdgeInsets.all(14.r),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                CustomNetworkImage(
                  url: product?.img ?? "",
                  height: 100.h,
                  width: double.infinity,
                  radius: 10,
                ),
                (stock?.discount != null
                            ? ((stock?.price ?? 0) + (stock?.tax ?? 0))
                            : null) ==
                        null
                    ? const SizedBox.shrink()
                    : Text(
                        AppHelpers.numberFormat(
                          (stock?.discount != null
                                  ? ((stock?.price ?? 0) + (stock?.tax ?? 0))
                                  : null) ??
                              (stock?.totalPrice ?? 0),
                        ),
                        style: AppStyle.interNoSemi(
                            size: 14,
                            color: AppStyle.red,
                            decoration: (stock?.discount != null
                                        ? ((stock?.price ?? 0) +
                                            (stock?.tax ?? 0))
                                        : null) ==
                                    null
                                ? TextDecoration.none
                                : TextDecoration.lineThrough),
                      ),
              ],
            ),
            8.verticalSpace,
            Row(
              children: [
                Expanded(
                  child: Text(
                    product?.translation?.title ?? "",
                    style: AppStyle.interNoSemi(
                      size: 14,
                      color: colors.textBlack,
                    ),
                    maxLines: 1,
                  ),
                ),
                // const Spacer(),
                (stock?.bonus != null)
                    ? AnimationButtonEffect(
                        child: InkWell(
                          onTap: () {
                            AppHelpers.showCustomModalBottomSheet(
                              paddingTop: MediaQuery.of(context).padding.top,
                              context: context,
                              modal: BonusScreen(
                                bonus: stock?.bonus,
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
                            margin: EdgeInsets.only(
                              top: 8.r,
                              left: 8.r,
                              right: 4.r,
                              bottom: 4.r,
                            ),
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppStyle.blueBonus,
                            ),
                            child: Icon(
                              FlutterRemix.gift_2_fill,
                              size: 16.r,
                              color: colors.textWhite,
                            ),
                          ),
                        ),
                      )
                    : const SizedBox.shrink()
              ],
            ),
            isAdd
                ? Row(
                    children: [
                      Text(
                        AppHelpers.numberFormat((stock?.totalPrice ?? 0)),
                        style: AppStyle.interNoSemi(
                            size: 16,
                            color: colors.textBlack,
                            decoration: TextDecoration.none),
                      ),
                    ],
                  )
                : Text(
                    product?.translation?.description ?? "",
                    style: AppStyle.interRegular(
                      size: 12,
                      color: AppStyle.textGrey,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
            8.verticalSpace,
            isAdd
                ? Row(
                    children: [
                      Expanded(
                        child: InkWell(
                          onTap: removeCount,
                          child: AnimationButtonEffect(
                            child: Container(
                              padding: EdgeInsets.symmetric(
                                vertical: 12.r,
                              ),
                              decoration: BoxDecoration(
                                color: colors.scaffoldColor,
                                borderRadius: BorderRadius.circular(16.r),
                              ),
                              child: Center(
                                child: Text(
                                  "-",
                                  style: AppStyle.interNoSemi(
                                    size: 16,
                                    color: colors.textBlack,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      12.horizontalSpace,
                      Text(
                        count.toString(),
                        style: AppStyle.interNoSemi(
                          size: 16,
                          color: colors.textBlack,
                        ),
                      ),
                      12.horizontalSpace,
                      Expanded(
                        child: InkWell(
                          onTap: addCount,
                          child: AnimationButtonEffect(
                            child: Container(
                              padding: EdgeInsets.symmetric(
                                vertical: 12.r,
                              ),
                              decoration: BoxDecoration(
                                color: colors.scaffoldColor,
                                borderRadius: BorderRadius.circular(16.r),
                              ),
                              child: Center(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      "+",
                                      style: AppStyle.interNoSemi(
                                        size: 16,
                                        color: colors.textBlack,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      )
                    ],
                  )
                : InkWell(
                    onTap: addCart,
                    child: AnimationButtonEffect(
                      child: Container(
                        padding: EdgeInsets.symmetric(
                          vertical: 14.r,
                          horizontal: 8.r,
                        ),
                        decoration: BoxDecoration(
                          color: colors.scaffoldColor,
                          borderRadius: BorderRadius.circular(16.r),
                        ),
                        child: Center(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              (stock?.discount != null
                                          ? ((stock?.price ?? 0) +
                                              (stock?.tax ?? 0))
                                          : null) ==
                                      null
                                  ? Text(
                                      AppHelpers.numberFormat(
                                        (stock?.discount != null
                                                ? ((stock?.price ?? 0) +
                                                    (stock?.tax ?? 0))
                                                : null) ??
                                            (stock?.totalPrice ?? 0),
                                      ),
                                      style: AppStyle.interNoSemi(
                                          size: 16,
                                          color: colors.textBlack,
                                          decoration: (stock?.discount != null
                                                      ? ((stock?.price ?? 0) +
                                                          (stock?.tax ?? 0))
                                                      : null) ==
                                                  null
                                              ? TextDecoration.none
                                              : TextDecoration.lineThrough),
                                    )
                                  : Text(
                                      AppHelpers.numberFormat(
                                          stock?.totalPrice ?? 0),
                                      style: AppStyle.interNoSemi(
                                        size: 16,
                                        color: colors.textBlack,
                                      ),
                                    ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
          ],
        ),
      ),
    );
  }
}
