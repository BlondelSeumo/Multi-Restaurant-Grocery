
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/infrastructure/services/enums.dart';
import 'package:riverpodtemp/presentation/components/text_fields/currency_input.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class CashItem extends StatelessWidget {
  const CashItem({
    super.key,
    required this.isActive,
    required this.colors,
    required this.type,
    required this.onTap,
    this.textEditingController,
    required this.title,
    required this.subTitle,
    this.onChange,
  });

  final bool isActive;
  final Cash type;
  final String title;
  final String subTitle;
  final VoidCallback onTap;
  final Function(String? value)? onChange;
  final TextEditingController? textEditingController;
  final CustomColorSet colors;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 500),
            width: 18.w,
            height: 18.h,
            decoration: BoxDecoration(
              color: isActive ? colors.primary : AppStyle.transparent,
              shape: BoxShape.circle,
              border: isActive
                  ? null
                  : Border.all(
                color: colors.textBlack,
                width: 2.r,
              ),
            ),
            child: isActive
                ? Center(
              child: Icon(
                Icons.done,
                color: colors.textBlack,
                size: 12.r,
              ),
            )
                : null,
          ),
          10.horizontalSpace,
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppStyle.interNormal(
                    color: !isActive ? colors.textBlack : colors.primary,
                  ),
                ),
                Text(
                  subTitle,
                  style: AppStyle.interNormal(
                    color: colors.textColor,
                  ),
                ),
                10.verticalSpace,
                if (type == Cash.yes && isActive)
                  CurrencyTextField(
                    onChange: onChange,
                    controller: textEditingController,
                    colors: colors,
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}