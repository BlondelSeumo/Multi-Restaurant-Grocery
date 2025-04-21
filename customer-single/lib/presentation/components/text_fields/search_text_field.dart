import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class SearchTextField extends StatelessWidget {
  final String? hintText;
  final Widget? suffixIcon;
  final TextEditingController? textEditingController;
  final ValueChanged<String>? onChanged;
  final VoidCallback? onTap;
  final Color bgColor;
  final bool isBorder;
  final bool isRead;
  final bool autofocus;
  final CustomColorSet colors;

  const SearchTextField({
    super.key,
    this.hintText,
    this.suffixIcon,
    this.textEditingController,
    this.onChanged,
    this.bgColor = AppStyle.transparent,
    this.isBorder = false,
    this.isRead = false,
    this.autofocus = false,
    this.onTap, required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      readOnly: isRead,
      autofocus: autofocus,
      onTap: onTap,
      style: AppStyle.interRegular(
        size: 16,
        color: colors.textBlack,
      ),
      onChanged: onChanged,
      controller: textEditingController,
      cursorColor: colors.textBlack,
      cursorWidth: 1,
      decoration: InputDecoration(
        hintStyle: AppStyle.interNormal(
          size: 13,
          color: AppStyle.hintColor,
        ),
        hintText: hintText ?? AppHelpers.getTranslation(TrKeys.searchProducts),
        contentPadding: REdgeInsets.symmetric(horizontal: 15, vertical: 14),
        prefixIcon: Icon(
          FlutterRemix.search_2_line,
          size: 20.r,
          color: colors.textBlack,
        ),
        suffixIcon: suffixIcon,
        fillColor: bgColor,
        filled: true,
        focusedBorder: isBorder
            ? OutlineInputBorder(
                borderRadius: BorderRadius.circular(12.r),
                borderSide: BorderSide(color: AppStyle.borderColor),
              )
            : InputBorder.none,
        border: isBorder
            ? OutlineInputBorder(
                borderRadius: BorderRadius.circular(12.r),
                borderSide: BorderSide(color: AppStyle.borderColor),
              )
            : InputBorder.none,
        enabledBorder: isBorder
            ? OutlineInputBorder(
                borderRadius: BorderRadius.circular(12.r),
                borderSide: BorderSide(color: AppStyle.borderColor),
              )
            : InputBorder.none,
      ),
    );
  }
}
