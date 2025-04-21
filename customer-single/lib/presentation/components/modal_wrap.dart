import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/app_constants.dart';
import 'package:riverpodtemp/presentation/components/blur_wrap.dart';
import 'package:riverpodtemp/presentation/components/keyboard_dismisser.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';

class ModalWrap extends StatelessWidget {
  final Widget child;
  final Color? color;

  const ModalWrap({
    super.key,
    required this.child,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return BlurWrap(
      radius: BorderRadius.only(
        topLeft: Radius.circular(AppConstants.radius.r),
        topRight: Radius.circular(AppConstants.radius.r),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(AppConstants.radius.r),
            topRight: Radius.circular(AppConstants.radius.r),
          ),
          color: color ?? AppStyle.white,
        ),
        padding: MediaQuery.viewInsetsOf(context),
        child: KeyboardDismisser(
          child: child,
        ),
      ),
    );
  }
}
