import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpodtemp/application/app_widget/app_provider.dart';

import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class ForgotTextButton extends ConsumerWidget {
  final String title;
  final Function() onPressed;
  final double? fontSize;
  final Color? fontColor;
  final double? letterSpacing;
  final CustomColorSet colors;

  const ForgotTextButton({
    required this.colors,
    super.key,
    required this.title,
    required this.onPressed,
    this.fontSize,
    this.fontColor = AppStyle.black,
    this.letterSpacing = -14 * 0.02,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(appProvider);
    return TextButton(
      style: ButtonStyle(
        overlayColor: MaterialStateColor.resolveWith(
          (states) => state.isDarkMode
              ? AppStyle.mainBackDark
              : AppStyle.dontHaveAccBtnBack,
        ),
      ),
      onPressed: onPressed,
      child: Text(
        title,
        style: AppStyle.interNormal(
          textDecoration: TextDecoration.underline,
          size: 12,
          color: colors.textBlack,
        ),
      ),
    );
  }
}
