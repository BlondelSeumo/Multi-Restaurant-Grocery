import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class OrderPaymentContainer extends StatelessWidget {
  final Widget icon;
  final String title;
  final bool isActive;
  final VoidCallback onTap;
  final CustomColorSet colors;

  const OrderPaymentContainer({
    super.key,
    required this.icon,
    required this.title,
    this.isActive = false,
    required this.onTap,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: (MediaQuery.sizeOf(context).width - 42) / 2,
        height: 120.h,
        decoration: BoxDecoration(
          color: colors.scaffoldColor,
          borderRadius: BorderRadius.all(
            Radius.circular(10.r),
          ),
        ),
        padding: EdgeInsets.symmetric(horizontal: 16.w),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              decoration: BoxDecoration(
                color:  colors.buttonColor,
                borderRadius: BorderRadius.all(
                  Radius.circular(8.r),
                ),
              ),
              padding: EdgeInsets.all(8.r),
              child: icon,
            ),
            8.verticalSpace,
            Text(
              title,
              style: AppStyle.interSemi(
                size: 13,
                color: colors.textBlack,
              ),
              textAlign: TextAlign.center,
            )
          ],
        ),
      ),
    );
  }
}
