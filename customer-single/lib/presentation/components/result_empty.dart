import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:lottie/lottie.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';

class ResultEmpty extends StatelessWidget {
  final String title;

  const ResultEmpty({
    super.key,
    this.title = TrKeys.empty,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        100.verticalSpace,
        Lottie.asset('assets/lottie/girl_empty.json'),
        24.verticalSpace,
        Text(
          AppHelpers.getTranslation(title),
          style: AppStyle.interSemi(size: 18),
        ),
      ],
    );
  }
}
