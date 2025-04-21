import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/infrastructure/formatter/input_formatter.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class CurrencyTextField extends StatelessWidget {
  final TextEditingController? controller;
  final Function(String? value)? onChange;
  final CustomColorSet colors;

  const CurrencyTextField({
    super.key,
    this.controller,
    this.onChange,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      cursorColor: colors.textBlack,
      style: AppStyle.interNormal(
        color: colors.textBlack,
      ),
      onChanged: onChange,
      inputFormatters: [
        InputFormatterCurrency(),
      ],
      decoration: InputDecoration(
        hintText: '0.00',
        hintStyle: AppStyle.interNormal(
          color: colors.textBlack.withOpacity(0.5),
        ),
        contentPadding: EdgeInsets.symmetric(horizontal: 16),
        border: OutlineInputBorder(
          borderSide: BorderSide(color: AppStyle.reviewText),
          borderRadius: BorderRadius.circular(12.r),
        ),
        focusedBorder: OutlineInputBorder(
          borderSide: BorderSide(color: AppStyle.reviewText),
          borderRadius: BorderRadius.circular(12.r),
        ),
        enabledBorder: OutlineInputBorder(
          borderSide: BorderSide(color: AppStyle.reviewText),
          borderRadius: BorderRadius.circular(12.r),
        ),
        suffixIcon: Padding(
          padding: EdgeInsets.only(top: 10.r, left: 12.r, right: 12.r),
          child: Text(
            LocalStorage.getSelectedCurrency().symbol ?? '',
            style: AppStyle.interNormal(
              color: colors.textBlack,
            ),
          ),
        ),
      ),
    );
  }
}
