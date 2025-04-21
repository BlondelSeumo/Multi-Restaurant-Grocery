import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

import 'animation_button_effect.dart';

class PopButton extends StatelessWidget {
  final CustomColorSet colors;

  const PopButton({super.key, required this.colors});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.pop(context);
      },
      child: AnimationButtonEffect(
        child: Container(
          decoration: BoxDecoration(
            color: colors.textBlack,
            borderRadius: BorderRadius.all(
              Radius.circular(10.r),
            ),
          ),
          padding: EdgeInsets.all(14.h),
          child: Icon(
            Icons.keyboard_arrow_left,
            color: colors.textWhite,
          ),
        ),
      ),
    );
  }
}
