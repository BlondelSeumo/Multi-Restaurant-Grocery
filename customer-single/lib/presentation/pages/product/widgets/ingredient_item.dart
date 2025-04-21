import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/application/product/product_provider.dart';
import 'package:riverpodtemp/infrastructure/models/data/addons_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/vibration.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

import '../../../components/custom_checkbox.dart';

class IngredientItem extends ConsumerWidget {
  final VoidCallback onTap;
  final VoidCallback add;
  final VoidCallback remove;
  final Addons addon;
  final CustomColorSet colors;

  const IngredientItem({
    required this.colors,
    required this.add,
    required this.remove,
    super.key,
    required this.onTap,
    required this.addon,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productState = ref.read(productProvider);
    return GestureDetector(
      onTap: () {
        onTap();
        Vibrate.feedback(FeedbackType.selection);
      },
      child: Container(
        width: double.infinity,
        margin: EdgeInsets.symmetric(vertical: 10.r),
        decoration: BoxDecoration(
          color: colors.scaffoldColor,
          borderRadius: BorderRadius.all(
            Radius.circular(10.r),
          ),
        ),
        child: Padding(
          padding: EdgeInsets.symmetric(
            horizontal: 10.r,
            vertical: 12.r,
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              CustomCheckbox(
                isActive: addon.active ?? false,
                onTap: onTap,
                colors: colors,
              ),
              10.horizontalSpace,
              Expanded(
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        addon.product?.translation?.title ?? "",
                        style: AppStyle.interNormal(
                          size: 16,
                          color: colors.textBlack,
                        ),
                      ),
                    ),
                    4.horizontalSpace,
                    Text(
                      "+${AppHelpers.numberFormat(addon.product?.stock?.totalPrice ?? 0)}",
                      style: AppStyle.interNoSemi(
                        size: 14,
                        color: colors.textBlack,
                      ),
                    )
                  ],
                ),
              ),
              ((addon.active ?? false) || !productState.isLoading)
                  ? Row(
                      children: [
                        IconButton(
                          onPressed: remove,
                          icon: Icon(
                            Icons.remove,
                            color: (addon.quantity ?? 1) == 1
                                ? AppStyle.outlineButtonBorder
                                : colors.textBlack,
                          ),
                        ),
                        Text(
                          "${addon.quantity ?? 1}",
                          style: AppStyle.interNormal(
                            size: 16.sp,
                            color: colors.textBlack,
                          ),
                        ),
                        IconButton(
                          onPressed: add,
                          icon: Icon(
                            Icons.add,
                            color: colors.textBlack,
                          ),
                        ),
                      ],
                    )
                  : const SizedBox.shrink()
            ],
          ),
        ),
      ),
    );
  }
}
