import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_widget_from_html/flutter_widget_from_html.dart';
import 'package:riverpodtemp/infrastructure/models/data/careers_detail_data.dart';
import 'package:riverpodtemp/infrastructure/services/time_service.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class CareersDetailBody extends StatelessWidget {
  const CareersDetailBody({
    super.key,
    required this.model,
    required this.colors,
  });

  final CustomColorSet colors;
  final CareersDataModel? model;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 12.r),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          50.verticalSpace,
          Text(
            model?.translation?.title ?? '',
            style: AppStyle.interNoSemi(
              color: colors.textBlack,
            ),
          ),
          10.verticalSpace,
          HtmlWidget(
            model?.translation?.address ?? '',
            textStyle: AppStyle.interNormal(
              color: colors.textBlack,
              size: 14,
            ),
          ),
          10.verticalSpace,
          Text(
            TimeService.dateFormatMMMDDHHMM(
              DateTime.tryParse(model?.createdAt ?? ''),
            ),
            style: AppStyle.interNoSemi(
              size: 14,
              color: colors.hintColor,
            ),
          ),
          10.verticalSpace,
          HtmlWidget(
            model?.translation?.description ?? '',
            textStyle: AppStyle.interNormal(
              color: colors.textBlack,
              size: 14,
            ),
          ),
        ],
      ),
    );
  }
}