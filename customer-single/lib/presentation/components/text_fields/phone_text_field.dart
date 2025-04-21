import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl_phone_field/intl_phone_field.dart';
import 'package:intl_phone_field/phone_number.dart';
import 'package:riverpodtemp/app_constants.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class PhoneTextField extends StatelessWidget {
  final Function(PhoneNumber value) onChange;
  final bool showFlag;
  final CustomColorSet colors;

  const PhoneTextField({
    super.key,
    required this.onChange,
    this.showFlag = AppConstants.showFlag, required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    final bool isLtr = LocalStorage.getLangLtr();
    return Directionality(
      textDirection: isLtr ? TextDirection.ltr : TextDirection.rtl,
      child: IntlPhoneField(
        onChanged: onChange,
        disableLengthCheck: !AppConstants.isNumberLengthAlwaysSame,
        validator: (value) {
          if (AppConstants.isNumberLengthAlwaysSame &&
              (value?.isValidNumber() ?? true)) {
            return AppHelpers.getTranslation(
              TrKeys.phoneNumberIsNotValid,
            );
          }
          return null;
        },
        dropdownTextStyle: AppStyle.interNormal(color: colors.textBlack),
        keyboardType: TextInputType.phone,
        initialCountryCode: AppConstants.countryCodeISO,
        invalidNumberMessage: AppHelpers.getTranslation(
          TrKeys.phoneNumberIsNotValid,
        ),
        inputFormatters: [FilteringTextInputFormatter.digitsOnly],
        showCountryFlag: showFlag,
        showDropdownIcon: AppConstants.showArrowIcon,
        style: AppStyle.interNormal(
          color: colors.textBlack,
        ),
        autovalidateMode: AppConstants.isNumberLengthAlwaysSame
            ? AutovalidateMode.onUserInteraction
            : AutovalidateMode.disabled,
        textAlignVertical: TextAlignVertical.center,
        decoration: InputDecoration(
          counterText: '',
          enabledBorder: UnderlineInputBorder(
            borderSide: BorderSide.merge(
              BorderSide(color: AppStyle.differBorderColor),
              BorderSide(color: AppStyle.differBorderColor),
            ),
          ),
          errorBorder: UnderlineInputBorder(
            borderSide: BorderSide.merge(
              BorderSide(color: AppStyle.differBorderColor),
              BorderSide(color: AppStyle.differBorderColor),
            ),
          ),
          border: UnderlineInputBorder(
            borderSide: BorderSide.merge(
              BorderSide(
                color: AppStyle.differBorderColor,
              ),
              BorderSide(
                color: AppStyle.differBorderColor,
              ),
            ),
          ),
          focusedErrorBorder: UnderlineInputBorder(
            borderSide: BorderSide.merge(
              BorderSide(
                color: AppStyle.differBorderColor,
              ),
              BorderSide(
                color: AppStyle.differBorderColor,
              ),
            ),
          ),
          disabledBorder: UnderlineInputBorder(
            borderSide: BorderSide.merge(
              BorderSide(
                color: AppStyle.differBorderColor,
              ),
              BorderSide(
                color: AppStyle.differBorderColor,
              ),
            ),
          ),
          focusedBorder: UnderlineInputBorder(
            borderSide: BorderSide.merge(
              BorderSide(
                color: AppStyle.differBorderColor,
              ),
              BorderSide(
                color: AppStyle.differBorderColor,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
