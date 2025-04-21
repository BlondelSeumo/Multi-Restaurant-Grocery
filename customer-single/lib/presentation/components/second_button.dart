import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/presentation/components/loading.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'button_effect.dart';

class SecondButton extends StatelessWidget {
  final String title;
  final double radius;
  final Color bgColor;
  final Color? border;
  final bool isLoading;
  final Color titleColor;
  final double titleSize;
  final VoidCallback onTap;

  const SecondButton({
    super.key,
    required this.title,
    this.radius = 24,
    required this.bgColor,
    required this.titleColor,
    required this.onTap,
    this.titleSize = 14,
    this.isLoading = false,
    this.border,
  });

  @override
  Widget build(BuildContext context) {
    return ButtonEffectAnimation(
      onTap: isLoading ? null : onTap,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(radius.r),
          color: bgColor,
          border: border != null ? Border.all(color: border!) : null,
        ),
        padding: EdgeInsets.symmetric(vertical: 10.r, horizontal: 18.r),
        child: isLoading
            ? const Loading()
            : Text(
                AppHelpers.getTranslation(title),
                style: AppStyle.interSemi(color: titleColor, size: titleSize),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
              ),
      ),
    );
  }
}
