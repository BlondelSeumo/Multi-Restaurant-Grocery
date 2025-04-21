import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:riverpodtemp/infrastructure/models/data/product_data.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

import 'widgets/circle_icon_button.dart';

class IncreaseDecreaseButtons extends StatelessWidget {
  final Function() onDecrease;
  final Function() onIncrease;
  final int? buttonSize;
  final int? cartCount;
  final Unit? unit;
  final CustomColorSet colors;

  const IncreaseDecreaseButtons({
    super.key,
    required this.onDecrease,
    required this.onIncrease,
    this.buttonSize,
    this.cartCount,
    this.unit,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        CircleIconButton(
          onTap: onDecrease,
          iconData: FlutterRemix.subtract_line,
          backgroundColor: AppStyle.textGrey.withOpacity(0.2),
          iconColor: colors.textBlack,
          width: buttonSize,
          textColor: colors.textBlack,
        ),
        8.horizontalSpace,
        RichText(
          text: TextSpan(
            text: '${cartCount ?? 0} ',
            style: GoogleFonts.inter(
              fontWeight: FontWeight.w500,
              fontSize: 14.sp,
              color: AppStyle.textGrey,
              letterSpacing: -0.4,
            ),
            children: <TextSpan>[
              TextSpan(
                text:
                    '${(unit != null ? unit?.translation?.title : '')?.toLowerCase()}',
                style: GoogleFonts.inter(
                  fontWeight: FontWeight.w500,
                  fontSize: 11.sp,
                  color: AppStyle.textGrey,
                  letterSpacing: -0.4,
                ),
              ),
            ],
          ),
        ),
        9.horizontalSpace,
        CircleIconButton(
          textColor: colors.textBlack,
          onTap: onIncrease,
          iconData: FlutterRemix.add_line,
          backgroundColor: AppStyle.textGrey.withOpacity(0.2),
          iconColor: colors.textBlack,
          width: buttonSize,
        ),
      ],
    );
  }
}
