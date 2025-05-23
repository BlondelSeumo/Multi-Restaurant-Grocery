import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/infrastructure/models/models.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

import 'shop_tab_bar_item.dart';

Widget makeTabBarHeader({
  TabController? tabController,
  ValueChanged<int>? onTab,
  int index = 0,
  required bool isPopularProduct,
  required List<CategoryData>? list,
  required CustomColorSet colors,
}) {
  return Container(
    color: AppStyle.white,
    height: 110.h,
    width: double.infinity,
    child: Container(
      decoration: BoxDecoration(
          color: AppStyle.bgGrey,
          borderRadius: BorderRadius.only(
              topLeft: Radius.circular(16.w), topRight: Radius.circular(16.w))),
      child: TabBar(
        indicatorSize: TabBarIndicatorSize.tab,
        onTap: onTab,
        padding: EdgeInsets.only(left: 24.r),
        labelPadding: EdgeInsets.zero,
        isScrollable: true,
        indicatorPadding: EdgeInsets.zero,
        indicatorColor: AppStyle.transparent,
        labelColor: AppStyle.primary,
        unselectedLabelColor: AppStyle.white,
        controller: tabController,
        tabs: isPopularProduct
            ? [
                ShopTabBarItem(
                  title: AppHelpers.getTranslation(TrKeys.popular),
                  isActive: index == 0,
                  colors: colors,
                ),
                ShopTabBarItem(
                  title: AppHelpers.getTranslation(TrKeys.all),
                  isActive: index == 1,
                  colors: colors,
                ),
                ...list!.map(
                  (e) => ShopTabBarItem(
                    title: e.translation?.title ?? "",
                    isActive: index == (list.indexOf(e) + 2),
                    colors: colors,
                  ),
                )
              ]
            : [
                ShopTabBarItem(
                  title: AppHelpers.getTranslation(TrKeys.all),
                  isActive: index == 0,
                  colors: colors,
                ),
                ...list!.map(
                  (e) => ShopTabBarItem(
                    title: e.translation?.title ?? "",
                    isActive: index == (list.indexOf(e) + 1),
                    colors: colors,
                  ),
                )
              ],
      ),
    ),
  );
}
