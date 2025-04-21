import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/infrastructure/models/data/careers_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/time_service.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class CareersItemWidget extends StatelessWidget {
  const CareersItemWidget({
    super.key,
    required this.item,
    required this.colors,
  });

  final CustomColorSet colors;
  final DataModel item;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        context.pushRoute(
          CareersDetailRoute(id: item.id),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: colors.buttonColor,
          borderRadius: BorderRadius.circular(10.r),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            12.verticalSpace,
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 14.r),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.translation?.title ?? '',
                    style: AppStyle.interNoSemi(
                      color: colors.textBlack,
                      size: 16,
                    ),
                  ),
                  Text(
                    AppHelpers.getTranslation(TrKeys.role),
                    style: AppStyle.interNoSemi(
                      color: colors.textBlack,
                      size: 14,
                    ),
                  ),
                  12.verticalSpace,
                  Text(
                    item.category?.translation?.title ?? '',
                    style: AppStyle.interNoSemi(
                      color: colors.textBlack,
                      size: 16,
                    ),
                  ),
                  Text(
                    AppHelpers.getTranslation(TrKeys.category),
                    style: AppStyle.interNoSemi(
                      color: colors.textBlack,
                      size: 14,
                    ),
                  ),
                  12.verticalSpace,
                  Text(
                    item.translation?.address ?? '',
                    style: AppStyle.interNoSemi(
                      color: colors.textBlack,
                      size: 16,
                    ),
                  ),
                  Text(
                    AppHelpers.getTranslation(
                      TrKeys.location,
                    ),
                    style: AppStyle.interNoSemi(
                      color: colors.textBlack,
                      size: 14,
                    ),
                  ),
                ],
              ),
            ),
            10.verticalSpace,
            Divider(color: colors.divider, height: 2.r),
            Padding(
              padding: EdgeInsets.all(14.r),
              child: Text(
                TimeService.dateFormatMMMDDHHMM(
                  DateTime.tryParse(item.createdAt ?? ''),
                ),
                style: AppStyle.interNoSemi(
                  size: 14,
                  color: colors.hintColor,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
