import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';

import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme_wrapper.dart';

// ignore: must_be_immutable
class TitleAndIcon extends StatelessWidget {
  final String title;
  final double titleSize;
  final String? rightTitle;
  final bool isIcon;
  final Color? rightTitleColor;
  final double paddingHorizontalSize;
  VoidCallback? onRightTap;

  TitleAndIcon({
    super.key,
    this.isIcon = false,
    required this.title,
    this.rightTitle,
    this.rightTitleColor,
    this.onRightTap,
    this.titleSize = 20,
    this.paddingHorizontalSize = 16,
  });

  @override
  Widget build(BuildContext context) {
    final bool isLtr = LocalStorage.getLangLtr();
    return ThemeWrapper(
      builder: (colors, controller) => Directionality(
        textDirection: isLtr ? TextDirection.ltr : TextDirection.rtl,
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: paddingHorizontalSize.r),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: AppStyle.interNoSemi(
                    size: titleSize.sp,
                    color: colors.textBlack,
                  ),
                ),
              ),
              GestureDetector(
                onTap: onRightTap ?? () {},
                child: Row(
                  children: [
                    Text(
                      rightTitle ?? "",
                      style: AppStyle.interRegular(
                        size: 14,
                        color: rightTitleColor ?? colors.textBlack,
                      ),
                    ),
                    isIcon
                        ? Icon(
                            isLtr
                                ? Icons.keyboard_arrow_right
                                : Icons.keyboard_arrow_left,
                            color: colors.textBlack,
                          )
                        : const SizedBox.shrink()
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
