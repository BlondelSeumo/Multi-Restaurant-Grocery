import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/presentation/theme/theme_wrapper.dart';

class MainWidget extends StatelessWidget {
  final Function()? onTap;
  final EdgeInsets? padding;
  final double radius;

  const MainWidget({
    super.key,
    this.onTap,
    this.padding,
    this.radius = 12,
    required this.child,
  });

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return ThemeWrapper(
      builder: (colors, controller) => InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(radius.r),
        child: Container(
          padding: padding ?? EdgeInsets.all(12.r),
          decoration: BoxDecoration(
            color: colors.buttonColor,
            borderRadius: BorderRadius.circular(radius.r),
          ),
          child: child,
        ),
      ),
    );
  }
}
