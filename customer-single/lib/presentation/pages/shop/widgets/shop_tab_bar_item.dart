import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class ShopTabBarItem extends StatelessWidget {
  final String title;
  final bool isActive;
  final CustomColorSet colors;

  const ShopTabBarItem({
    super.key,
    required this.title,
    required this.isActive,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      decoration: BoxDecoration(
        color: isActive ? AppStyle.primary : AppStyle.white,
        borderRadius: BorderRadius.all(Radius.circular(10.r)),
        boxShadow: [
          BoxShadow(
            color: AppStyle.white.withOpacity(0.07),
            spreadRadius: 0,
            blurRadius: 2,
            offset: const Offset(0, 1), // changes position of shadow
          ),
        ],
      ),
      padding: EdgeInsets.symmetric(vertical: 8.h, horizontal: 18.w),
      margin: EdgeInsets.only(right: 9.w, top: 24.h),
      child: Text(
        title,
        style: AppStyle.interNormal(
          size: 13,
          color: colors.textBlack,
        ),
      ),
    );
  }
}
