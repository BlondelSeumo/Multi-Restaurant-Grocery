import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/app_assets.dart';
import 'package:riverpodtemp/presentation/components/button_effect.dart';
import 'package:riverpodtemp/presentation/components/second_button.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class WalletItem extends StatelessWidget {
  final VoidCallback onTap;
  final CustomColorSet colors;
  final bool isActive;
  final num? totalPrice;

  const WalletItem({
    super.key,
    required this.onTap,
    required this.colors,
    required this.isActive,
    this.totalPrice,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: REdgeInsets.only(top: 4),
      child: ButtonEffectAnimation(
        onTap: onTap,
        child: Container(
          width: double.infinity,
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            border: Border.all(
              color: isActive ? colors.primary : colors.borderColor,
              width: .6.r,
            ),
            borderRadius: BorderRadius.circular(12.r),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Image.asset(
                    Assets.imagesWallet,
                    height: 24.r,
                    width: 24.r,
                  ),
                  8.horizontalSpace,
                  Text(
                    AppHelpers.numberFormat(
                      isActive
                          ? totalPrice
                          : LocalStorage.getWalletData()?.price,
                    ),
                    style: AppStyle.interNoSemi(
                      size: 18,
                      color: colors.textBlack,
                    ),
                  ),
                ],
              ),
              6.verticalSpace,
              Text(
                AppHelpers.getTranslation(
                    isActive ? TrKeys.hasPaidWallet : TrKeys.yourBalance),
                style: AppStyle.interRegular(
                  size: 14,
                  color: colors.textBlack,
                ),
              ),
              6.verticalSpace,
              ((totalPrice ?? 0) > (LocalStorage.getWalletData()?.price ?? 0) ) || (LocalStorage.getWalletData()?.price ?? 0) <= 0
                  ? Text(
                AppHelpers.getTranslation(TrKeys.youDontHaveBalance),
                style: AppStyle.interRegular(
                  size: 14,
                  color: colors.red,
                ),
              )
                  : Row(
                children: [
                  Expanded(
                    child: Text(
                      AppHelpers.getTranslation(
                          isActive ? TrKeys.applied : TrKeys.doYouWant),
                      style: AppStyle.interRegular(
                        size: 14,
                        color: colors.textBlack,
                      ),
                    ),
                  ),
                  SecondButton(
                    title: isActive ? TrKeys.remove : TrKeys.use,
                    bgColor:
                    isActive ? colors.transparent : colors.primary,
                    border: isActive ? colors.red : colors.primary,
                    titleColor: isActive ? colors.red : colors.textBlack,
                    onTap: onTap,
                  )
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
