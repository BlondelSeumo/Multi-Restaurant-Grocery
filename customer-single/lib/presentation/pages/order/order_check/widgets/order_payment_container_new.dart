import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class OrderPaymentContainerNew extends StatelessWidget {
  final Widget icon;
  final String title;
  final bool isActive;
  final bool isOrder;
  final num? price;
  final VoidCallback onTap;
  final CustomColorSet colors;

  const OrderPaymentContainerNew({
    super.key,
    required this.icon,
    required this.title,
    this.isActive = false,
    this.isOrder = false,
    required this.onTap,
    required this.colors,
    this.price,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      overlayColor: WidgetStatePropertyAll(colors.transparent),
      onTap: isOrder ? null : onTap,
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: 8.r,horizontal: 12.r),
        child: Row(
          children: [
            icon,
            8.horizontalSpace,
            Expanded(
              child: Text(
                AppHelpers.getTranslation(title),
                style: AppStyle.interNormal(
                  size: 14,
                  color: colors.textBlack,
                ),
              ),
            ),
            if (price != null)
              Text(
                AppHelpers.numberFormat(price),
                style: AppStyle.interNormal(
                  size: 14,
                  color: colors.textBlack,
                ),
              ),
            if (!isOrder)
              DecoratedBox(
                decoration: BoxDecoration(
                  color: AppStyle.bgGrey,
                  borderRadius: BorderRadius.circular(10.r),
                ),
                child: Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: 10.r,
                    vertical: 6.r,
                  ),
                  child: Text(
                    AppHelpers.getTranslation(title == TrKeys.enterPromoCode
                        ? TrKeys.enter
                        : TrKeys.edit),
                  ),
                ),
              )
          ],
        ),
      ),
    );
  }
}
