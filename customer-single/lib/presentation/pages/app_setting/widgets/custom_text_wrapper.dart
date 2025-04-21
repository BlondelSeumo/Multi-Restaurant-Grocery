import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/presentation/pages/app_setting/widgets/main_widget.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class CustomTextWrapper extends StatelessWidget {
  final String title;
  final Widget child;
  final CustomColorSet colors;

  const CustomTextWrapper({
    super.key,
    required this.title,
    required this.child,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          AppHelpers.getTranslation(title),
          style: AppStyle.interNormal(
            size: 20,
            color: colors.textBlack,
          ),
        ),
        16.verticalSpace,
        MainWidget(child: child),
      ],
    );
  }
}
