import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/app_constants.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme_wrapper.dart';

class CustomTextField extends StatelessWidget {
  final bool readOnly;
  final TextEditingController? controller;
  final Function(String value) onChange;
  final Function()? onClose;
  final BorderRadius borderRadius;
  final String? hintText;
  final void Function()? onTap;
  final FocusNode? focusNode;
  final String? Function(String?)? validator;
  final Widget? icon;

  const CustomTextField({
    super.key,
    this.controller,
    this.readOnly = false,
    required this.onChange,
    this.onClose,
    this.onTap,
    this.hintText,
    this.focusNode,
    this.icon,
    this.borderRadius =
        const BorderRadius.all(Radius.circular(AppConstants.radius)),
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return ThemeWrapper(
      builder: (colors, ct) => TextFormField(
        focusNode: focusNode,
        onTap: onTap,
        readOnly: readOnly,
        controller: controller,
        validator: validator,
        cursorColor: colors.textBlack,
        style: AppStyle.interNormal(
          color: colors.textBlack,
        ),
        onChanged: onChange,
        decoration: InputDecoration(
          contentPadding: EdgeInsets.only(right: 6.r),
          hintStyle: AppStyle.interNormal(
            color: AppStyle.reviewText,
          ),
          hintText: hintText,
          suffixIcon: !readOnly && onClose != null
              ? GestureDetector(
                  onTap: onClose,
                  child: Icon(
                    Icons.clear,
                    color: colors.textBlack,
                  ),
                )
              : null,
          prefixIcon: GestureDetector(
            onTap: () {},
            child: icon ??
                Icon(
                  Icons.search,
                  color: colors.textBlack,
                ),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: borderRadius,
            borderSide: BorderSide(
              color: AppStyle.reviewText,
            ),
          ),
          disabledBorder: OutlineInputBorder(
            borderRadius: borderRadius,
            borderSide: BorderSide(
              color: AppStyle.reviewText,
            ),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: borderRadius,
            borderSide: BorderSide(
              color: AppStyle.reviewText,
            ),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: borderRadius,
            borderSide: BorderSide(
              color: AppStyle.reviewText,
            ),
          )
        ),
      ),
    );
  }
}
