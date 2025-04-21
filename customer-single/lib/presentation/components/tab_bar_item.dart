import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class TabBarItem extends StatelessWidget {
  final bool isShopTabBar;
  final String title;
  final int index;
  final int? currentIndex;
  final VoidCallback onTap;
  final CustomColorSet colors;

  const TabBarItem({
    super.key,
    required this.title,
    required this.index,
    this.isShopTabBar = false,
    this.currentIndex,
    required this.onTap,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 500),
        decoration: BoxDecoration(
          color: isShopTabBar
              ? (currentIndex == index ? AppStyle.primary : colors.buttonColor)
              : colors.buttonColor,
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
        padding: EdgeInsets.symmetric(vertical: 10.h, horizontal: 18.w),
        margin: isShopTabBar
            ? EdgeInsets.only(left: index == 0 ? 16.w : 0, right: 9.w)
            : EdgeInsets.only(right: 9.w),
        child: Text(
          title,
          style: AppStyle.interNormal(
            size: 13,
            color: colors.textBlack,
          ),
        ),
      ),
    );
  }
}
