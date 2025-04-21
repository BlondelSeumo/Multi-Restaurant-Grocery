import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import 'package:riverpodtemp/infrastructure/models/data/shop_data.dart';
import 'package:riverpodtemp/infrastructure/services/time_service.dart';
import 'package:riverpodtemp/presentation/components/custom_network_image.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

import '../../../../infrastructure/services/app_helpers.dart';
import '../../../../infrastructure/services/tr_keys.dart';
import '../../../theme/app_style.dart';

class BranchItem extends StatelessWidget {
  final ShopData? shop;
  final CustomColorSet colors;

  const BranchItem({
    super.key,
    required this.shop,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(bottom: 10.r),
      padding: EdgeInsets.all(16.r),
      decoration: BoxDecoration(
        color: colors.buttonColor,
        borderRadius: BorderRadius.circular(10.r),
        boxShadow: [
          BoxShadow(
            offset: const Offset(0, 4),
            blurRadius: 8,
            color: AppStyle.textGrey.withOpacity(0.2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CustomNetworkImage(
            url: shop?.backgroundImg ?? "",
            height: 156.h,
            width: double.infinity,
            radius: 10,
          ),
          16.verticalSpace,
          Text(
            shop?.translation?.title ?? '',
            style: AppStyle.interNoSemi(
              size: 20,
              color: colors.textBlack,
            ),
          ),
          16.verticalSpace,
          Text(
            shop?.translation?.description ?? '',
            style: AppStyle.interNoSemi(size: 14, color: AppStyle.textGrey),
          ),
          18.verticalSpace,
          Container(
            padding: EdgeInsets.all(12.r),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10.r),
              border: Border.all(color: AppStyle.borderColor),
            ),
            child: Row(
              children: [
                Icon(
                  FlutterRemix.time_line,
                  color: colors.textBlack,
                ),
                6.horizontalSpace,
                Text(
                  "${AppHelpers.getTranslation(TrKeys.workingTime)}: ",
                  style: TextStyle(
                    color: colors.textBlack,
                  ),
                ),
                Text(
                  "${TimeService.timeFormatTime(shop?.shopWorkingDays?.firstWhere((element) {
                    return element.day?.toLowerCase() ==
                       TimeService.dateFormatEE(DateTime.now()).toLowerCase();
                  }).from)} — ${TimeService.timeFormatTime(shop?.shopWorkingDays?.firstWhere((element) {
                    return element.day?.toLowerCase() ==
                        TimeService.dateFormatEE(DateTime.now()).toLowerCase();
                  }).to)}",
                  style:
                      AppStyle.interNoSemi(size: 16, color: colors.textBlack),
                )
              ],
            ),
          ),
          18.verticalSpace,
          Container(
            padding: EdgeInsets.all(12.r),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10.r),
              border: Border.all(color: AppStyle.borderColor),
            ),
            child: Row(
              children: [
                Icon(
                  FlutterRemix.phone_line,
                  color: colors.textBlack,
                ),
                6.horizontalSpace,
                Text(
                  "${AppHelpers.getTranslation(TrKeys.phoneNumber)}: ",
                  style: TextStyle(
                    color: colors.textBlack,
                  ),
                ),
                Text(
                  (shop?.phone == "null"
                      ? AppHelpers.getTranslation(TrKeys.noPhone)
                      : shop?.phone ??
                          AppHelpers.getTranslation(TrKeys.noPhone)),
                  style: AppStyle.interNoSemi(
                    size: 16,
                    color: colors.textBlack,
                  ),
                )
              ],
            ),
          )
        ],
      ),
    );
  }
}
