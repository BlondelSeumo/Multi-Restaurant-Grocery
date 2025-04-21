import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/infrastructure/services/vibration.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class SizeItem extends StatelessWidget {
  final VoidCallback onTap;
  final bool isActive;
  final String title;
  final CustomColorSet colors;

  const SizeItem({
    super.key,
    required this.onTap,
    required this.isActive,
    required this.title,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(top: 16.h),
      child: GestureDetector(
        onTap: () {
          onTap();
          Vibrate.feedback(FeedbackType.selection);
        },
        child: Container(
          width: double.infinity,
          decoration: BoxDecoration(
            color: colors.buttonColor,
            borderRadius: BorderRadius.all(
              Radius.circular(10.r),
            ),
          ),
          child: Padding(
            padding: EdgeInsets.symmetric(vertical: 12.r,horizontal: 10),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                AnimatedContainer(
                  duration: const Duration(milliseconds: 500),
                  width: 18.w,
                  height: 18.h,
                  decoration: BoxDecoration(
                    color: isActive ? AppStyle.primary : AppStyle.transparent,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isActive ? colors.textBlack : AppStyle.textGrey,
                      width: isActive ? 4.r : 2.r,
                    ),
                  ),
                ),
                16.horizontalSpace,
                Text(
                  title,
                  style: AppStyle.interNormal(
                    size: 16,
                    color: colors.textBlack,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
