import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/infrastructure/models/data/user.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/app_bars/app_bar_bottom_sheet.dart';
import 'package:riverpodtemp/presentation/components/buttons/custom_button.dart';
import 'package:riverpodtemp/presentation/components/keyboard_dismisser.dart';
import 'package:riverpodtemp/presentation/components/text_fields/outline_bordered_text_field.dart';
import 'package:riverpodtemp/presentation/pages/auth/confirmation/register_confirmation_page.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme_wrapper.dart';
import '../../../../application/reser_password/reset_password_provider.dart';

@RoutePage()
class ResetPasswordPage extends ConsumerWidget {
  const ResetPasswordPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifier = ref.read(resetPasswordProvider.notifier);
    final state = ref.watch(resetPasswordProvider);
    final bool isDarkMode = LocalStorage.getAppThemeMode();
    final bool isLtr = LocalStorage.getLangLtr();
    ref.listen(resetPasswordProvider, (previous, next) {
      if (previous!.isSuccess != next.isSuccess && next.isSuccess) {
        Navigator.pop(context);
        AppHelpers.showCustomModalBottomSheet(
          context: context,
          modal: RegisterConfirmationPage(
            verificationId: next.verificationId,
            userModel: UserModel(email: state.email),
            isResetPassword: true,
          ),
          isDarkMode: isDarkMode,
        );
      }
    });
    return ThemeWrapper(
      builder: (colors, controller) {
        return Directionality(
          textDirection: isLtr ? TextDirection.ltr : TextDirection.rtl,
          child: AbsorbPointer(
            absorbing: state.isLoading,
            child: KeyboardDismisser(
              child: Container(
                padding: MediaQuery.of(context).viewInsets,
                decoration: BoxDecoration(
                  color: colors.scaffoldColor,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(16.r),
                    topRight: Radius.circular(16.r),
                  ),
                ),
                width: double.infinity,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: SingleChildScrollView(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Column(
                          children: [
                            AppBarBottomSheet(
                              colors: colors,
                              title: AppHelpers.getTranslation(
                                TrKeys.resetPassword,
                              ),
                            ),
                            Text(
                              AppHelpers.getTranslation(
                                  TrKeys.resetPasswordText),
                              style: AppStyle.interRegular(
                                size: 14.sp,
                                color: colors.textBlack,
                              ),
                            ),
                            40.verticalSpace,
                            OutlinedBorderTextField(
                              label: AppHelpers.getTranslation(
                                      TrKeys.emailOrPhoneNumber)
                                  .toUpperCase(),
                              onChanged: notifier.setEmail,
                            ),
                          ],
                        ),
                        Padding(
                          padding: EdgeInsets.only(
                            bottom: MediaQuery.of(context).padding.bottom,
                            top: 120.h,
                          ),
                          child: CustomButton(
                            isLoading: state.isLoading,
                            title: AppHelpers.getTranslation(TrKeys.send),
                            onPressed: () {
                              notifier.checkEmail()
                                  ? notifier.sendCode(context)
                                  : notifier.sendCodeToNumber(context);
                            },
                            background: AppStyle.primary,
                            textColor: colors.textBlack,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
