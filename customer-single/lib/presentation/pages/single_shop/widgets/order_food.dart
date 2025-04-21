import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/infrastructure/models/data/shop_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/buttons/custom_button.dart';
import 'package:riverpodtemp/presentation/components/custom_tab_bar.dart';
import 'package:riverpodtemp/presentation/components/title_icon.dart';
import 'package:riverpodtemp/presentation/theme/theme_wrapper.dart';
import '../../../theme/app_style.dart';

class OrderFoodScreen extends StatefulWidget {
  final ShopData? shop;
  final VoidCallback startOrder;

  const OrderFoodScreen({
    super.key,
    this.shop,
    required this.startOrder,
  });

  @override
  State<OrderFoodScreen> createState() => _OrderFoodScreenState();
}

class _OrderFoodScreenState extends State<OrderFoodScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _tabs = [
    Tab(text: AppHelpers.getTranslation(TrKeys.delivery)),
    Tab(text: AppHelpers.getTranslation(TrKeys.pickup)),
  ];

  @override
  void initState() {
    _tabController = TabController(length: 2, vsync: this);
    super.initState();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ThemeWrapper(
      builder: (colors, controller) => Container(
        padding: EdgeInsets.symmetric(vertical: 20.r, horizontal: 15.r),
        decoration: BoxDecoration(
          color: colors.buttonColor,
          borderRadius: BorderRadius.circular(10.r),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            4.verticalSpace,
            TitleAndIcon(
              title: AppHelpers.getTranslation(TrKeys.orderFood),
              titleSize: 16,
            ),
            16.verticalSpace,
            CustomTabBar(
              tabController: _tabController,
              tabs: _tabs,
              colors: colors,
            ),
            18.verticalSpace,
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  "${AppHelpers.numberFormat(widget.shop?.minPrice ?? 0)}+ ",
                  style: AppStyle.interNoSemi(
                    size: 14,
                    color: colors.textBlack,
                  ),
                ),
                Text(
                  AppHelpers.getTranslation(TrKeys.deliveryFee),
                  style: AppStyle.interNormal(
                    color: AppStyle.textGrey,
                    size: 14,
                  ),
                ),
                14.horizontalSpace,
                Container(
                  height: 10.r,
                  width: 10.r,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppStyle.outlineButtonBorder,
                  ),
                ),
                14.horizontalSpace,
                Text(
                  "${widget.shop?.deliveryTime?.to} - ${widget.shop?.deliveryTime?.from} ",
                  style: AppStyle.interNoSemi(
                    size: 14,
                    color: colors.textBlack,
                  ),
                ),
                Text(
                  "${widget.shop?.deliveryTime?.type}",
                  style:
                      AppStyle.interNormal(color: AppStyle.unselectedBottomItem, size: 14),
                ),
              ],
            ),
            18.verticalSpace,
            CustomButton(
                title: AppHelpers.getTranslation(TrKeys.startOrder),
                onPressed: () => widget.startOrder())
          ],
        ),
      ),
    );
  }
}
