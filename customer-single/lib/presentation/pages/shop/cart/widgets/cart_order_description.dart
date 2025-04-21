import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class ShopOrderDescription extends StatelessWidget {
  final String svgName;
  final String title;
  final String description;
  final num price;
  final double iconSize;
  final bool isDiscount;
  final CustomColorSet colors;

  const ShopOrderDescription({
    super.key,
    required this.price,
    required this.svgName,
    required this.title,
    required this.description,
    this.iconSize = 24,
    this.isDiscount = false,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        SvgPicture.asset(
          svgName,
          width: iconSize.r,
          height: iconSize.r,
        ),
        12.horizontalSpace,
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppStyle.interNormal(
                  size: 16,
                  color: colors.textBlack,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              Text(
                description,
                style: AppStyle.interNormal(
                  size: 12,
                  color: AppStyle.textGrey,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
        const Spacer(),
        Text(
          " ${isDiscount ? "-" : ""} ${AppHelpers.numberFormat(price)}",
          style: AppStyle.interSemi(
            size: 16.sp,
            color: isDiscount ? AppStyle.red : colors.textBlack,
          ),
        ),
      ],
    );
  }
}
