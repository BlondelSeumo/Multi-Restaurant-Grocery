import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class SocialButton extends StatelessWidget {
  final IconData iconData;
  final Function() onPressed;
  final String title;
  final CustomColorSet colors;

  const SocialButton({
    super.key,
    required this.iconData,
    required this.onPressed,
    required this.title,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        margin: EdgeInsets.all(5),
        width: double.infinity,
        padding: EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: colors.scaffoldColor,
          borderRadius: BorderRadius.circular(10.r),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Flexible(
              child: Text(
                title,
                style: AppStyle.interNormal(
                  size: 13,
                  color: colors.textBlack,
                ),
                maxLines: 1,
              ),
            ),
            6.horizontalSpace,
            Container(
              padding: EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppStyle.white,
                borderRadius: BorderRadius.circular(16.r),
              ),
              child: Icon(
                iconData,
                color: AppStyle.textGrey,
                size: 16.r,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
