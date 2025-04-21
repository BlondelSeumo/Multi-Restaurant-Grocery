import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class CustomTabBar extends StatelessWidget {
  final bool isScrollable;
  final TabController tabController;
  final List<Widget> tabs;
  final CustomColorSet colors;

  const CustomTabBar({
    super.key,
    required this.tabController,
    required this.tabs,
    this.isScrollable = false,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(6.r),
      height: 50.h,
      decoration: BoxDecoration(
        color: AppStyle.transparent,
        borderRadius: BorderRadius.circular(10.r),
        border: Border.all(color: AppStyle.tabBarBorderColor),
      ),
      alignment: Alignment.center,
      child: TabBar(
        isScrollable: isScrollable,
        controller: tabController,
        indicator: BoxDecoration(
          borderRadius: BorderRadius.circular(10.r),
          color: colors.textBlack,
        ),
        labelColor: colors.textWhite,
        unselectedLabelColor: colors.textBlack,
        unselectedLabelStyle: AppStyle.interRegular(
          size: 14.sp,
        ),
        labelStyle: AppStyle.interSemi(
          size: 14.sp,
        ),
        tabs: tabs,
      ),
    );
  }
}
