import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class ShopDescriptionItem extends StatelessWidget {
  final String title;
  final String description;
  final Widget icon;
  final CustomColorSet colors;

  const ShopDescriptionItem({
    super.key,
    required this.title,
    required this.description,
    required this.icon,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 98.h,
      decoration: BoxDecoration(
        color: colors.buttonColor,
        borderRadius: BorderRadius.all(
          Radius.circular(10.r),
        ),
      ),
      padding: EdgeInsets.all(12.r),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          icon,
          4.verticalSpace,
          Text(
            title,
            style: AppStyle.interRegular(
              size: 12,
              color: colors.textBlack,
            ),
          ),
          SizedBox(
            width: (MediaQuery.sizeOf(context).width - 132.h) / 3,
            child: Text(
              description,
              style: AppStyle.interSemi(
                size: 12,
                color: colors.textBlack,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
