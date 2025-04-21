import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

// ignore: must_be_immutable
class TitleAndPrice extends StatelessWidget {
  final String title;
  final String? rightTitle;
  final TextStyle textStyle;
  VoidCallback? onRightTap;
  final CustomColorSet colors;

  TitleAndPrice({
    super.key,
    required this.title,
    this.rightTitle,
    this.onRightTap,
    required this.textStyle,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.w),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: AppStyle.interRegular(
              size: 16,
              color: colors.textBlack,
            ),
          ),
          GestureDetector(
            onTap: onRightTap ?? () {},
            child: Row(
              children: [
                Text(
                  rightTitle ?? "",
                  style: textStyle,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
