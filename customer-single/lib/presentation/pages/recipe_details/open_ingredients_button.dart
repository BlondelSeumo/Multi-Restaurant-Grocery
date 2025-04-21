import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/pages/recipe_details/widgets/circle_icon_button.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';



class OpenIngredientsButton extends StatelessWidget {
  final bool isVisible;
  final Function() onTap;
  final CustomColorSet colors;

  const OpenIngredientsButton({
    super.key,
    required this.isVisible,
    required this.onTap, required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 50.r,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(100.r),
        color: colors.scaffoldColor,
      ),
      padding: REdgeInsets.symmetric(horizontal: 4),
      child: Row(
        children: [
          CircleIconButton(
            textColor: colors.textBlack,
            onTap: onTap,
            iconData: isVisible
                ? FlutterRemix.arrow_down_s_line
                : FlutterRemix.arrow_up_s_line,
            width: 42,
            iconColor:  colors.textBlack,
            backgroundColor: colors.buttonColor,
          ),
          Expanded(
            child: Center(
              child: Text(
                AppHelpers.getTranslation(TrKeys.ingredients),
                style: GoogleFonts.inter(
                  fontWeight: FontWeight.w500,
                  fontSize: 16.sp,
                  color:  colors.textBlack,
                  letterSpacing: -0.4,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
