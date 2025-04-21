import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/infrastructure/models/data/shop_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/buttons/animation_button_effect.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';
import 'package:url_launcher/url_launcher.dart';
import 'all_hours_screen.dart';

class ShopTitleScreen extends StatelessWidget {
  final TimeOfDay endTodayTime;
  final TimeOfDay startTodayTime;
  final ShopData? shop;
  final CustomColorSet colors;

  const ShopTitleScreen({
    super.key,
    required this.endTodayTime,
    required this.startTodayTime,
    required this.shop,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(16.r),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    endTodayTime.hour > TimeOfDay.now().hour
                        ? AppHelpers.getTranslation(TrKeys.workingNow)
                        : AppHelpers.getTranslation(TrKeys.closedNow),
                    style: AppStyle.interSemi(size: 14, color: AppStyle.red),
                  ),
                  6.horizontalSpace,
                  Container(
                    width: 4.r,
                    height: 4.r,
                    decoration: const BoxDecoration(
                        shape: BoxShape.circle, color: AppStyle.textGrey),
                  ),
                  6.horizontalSpace,
                  Text(
                    "${startTodayTime.hour.toString().padLeft(2, '0')}:${startTodayTime.minute.toString().padLeft(2, '0')} - ${endTodayTime.hour.toString().padLeft(2, '0')}:${endTodayTime.minute.toString().padLeft(2, '0')}",
                    style: AppStyle.interNormal(
                        size: 14, color: AppStyle.textGrey),
                  ),
                ],
              ),
              8.verticalSpace,
              AnimationButtonEffect(
                child: InkWell(
                  onTap: () {
                    AppHelpers.showCustomModalBottomSheet(
                        context: context,
                        modal: AllHoursScreen(
                          shopWorkingDays: shop?.shopWorkingDays,
                          colors: colors,
                        ),
                        isDarkMode: false);
                  },
                  child: Padding(
                    padding: EdgeInsets.all(4.r),
                    child: Text(
                      AppHelpers.getTranslation(TrKeys.seeAllHour),
                      style:
                          AppStyle.interNoSemi(size: 15, color: AppStyle.blue),
                    ),
                  ),
                ),
              )
            ],
          ),
          const Spacer(),
          Column(
            children: [
              InkWell(
                onTap: () async {
                  final Uri launchUri = Uri(
                    scheme: 'tel',
                    path: shop?.phone ?? "",
                  );
                  await launchUrl(launchUri);
                },
                child: AnimationButtonEffect(
                  child: Container(
                    padding: EdgeInsets.all(6.r),
                    decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppStyle.switchBg.withOpacity(0.5)),
                    child: const Icon(FlutterRemix.customer_service_2_line),
                  ),
                ),
              ),
              6.verticalSpace,
              Text(
                AppHelpers.getTranslation(TrKeys.call),
                style: AppStyle.interNormal(size: 14, color: AppStyle.textGrey),
              ),
            ],
          )
        ],
      ),
    );
  }
}
