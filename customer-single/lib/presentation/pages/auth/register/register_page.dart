import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/app_constants.dart';
import 'package:riverpodtemp/application/register/register_provider.dart';
import 'package:riverpodtemp/infrastructure/models/data/user.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/enums.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/app_bars/app_bar_bottom_sheet.dart';
import 'package:riverpodtemp/presentation/components/buttons/custom_button.dart';
import 'package:riverpodtemp/presentation/components/buttons/social_button.dart';
import 'package:riverpodtemp/presentation/components/keyboard_dismisser.dart';
import 'package:riverpodtemp/presentation/components/text_fields/outline_bordered_text_field.dart';
import 'package:riverpodtemp/presentation/components/text_fields/phone_text_field.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme_wrapper.dart';
import '../confirmation/register_confirmation_page.dart';

@RoutePage()
class RegisterPage extends ConsumerWidget {
  final bool isOnlyEmail;

  RegisterPage({
    super.key,
    required this.isOnlyEmail,
  });

  final phoneNumKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final event = ref.read(registerProvider.notifier);
    final state = ref.watch(registerProvider);
    final bool isDarkMode = LocalStorage.getAppThemeMode();
    final bool isLtr = LocalStorage.getLangLtr();
    return ThemeWrapper(
      builder: (colors, controller) {
        return Directionality(
          textDirection: isLtr ? TextDirection.ltr : TextDirection.rtl,
          child: KeyboardDismisser(
            child: Container(
              margin: MediaQuery.of(context).viewInsets,
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
                            title: AppHelpers.getTranslation(TrKeys.register),
                          ),
                          if (isOnlyEmail &&
                              AppConstants.signUpType == SignUpType.phone)
                            Form(
                              key: phoneNumKey,
                              child: PhoneTextField(
                                colors: colors,
                                onChange: (value) {
                                  event.setEmail(value.completeNumber);
                                },
                              ),
                            ),
                          if (isOnlyEmail &&
                              AppConstants.signUpType == SignUpType.email)
                            OutlinedBorderTextField(
                              label: AppHelpers.getTranslation(
                                TrKeys.email,
                              ).toUpperCase(),
                              onChanged: event.setEmail,
                              isError: state.isEmailInvalid,
                              descriptionText: state.isEmailInvalid
                                  ? AppHelpers.getTranslation(
                                      TrKeys.emailIsNotValid)
                                  : null,
                            ),
                          if (isOnlyEmail &&
                              AppConstants.signUpType == SignUpType.both)
                            OutlinedBorderTextField(
                              label: AppHelpers.getTranslation(
                                TrKeys.emailOrPhoneNumber,
                              ).toUpperCase(),
                              onChanged: event.setEmail,
                              isError: state.isEmailInvalid,
                              descriptionText: state.isEmailInvalid
                                  ? AppHelpers.getTranslation(
                                      TrKeys.emailIsNotValid)
                                  : null,
                            ),
                          if (!isOnlyEmail)
                            Column(
                              children: [
                                if (state.verificationId.isNotEmpty)
                                  Column(
                                    children: [
                                      20.verticalSpace,
                                      OutlinedBorderTextField(
                                        label: AppHelpers.getTranslation(
                                          state.verificationId.isEmpty
                                              ? TrKeys.phoneNumber
                                              : TrKeys.email,
                                        ).toUpperCase(),
                                        onChanged: state.verificationId.isEmpty
                                            ? event.setPhone
                                            : event.setEmail,
                                      ),
                                    ],
                                  ),
                                30.verticalSpace,
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    SizedBox(
                                      width: (MediaQuery.sizeOf(context).width -
                                              40) /
                                          2,
                                      child: OutlinedBorderTextField(
                                        label: AppHelpers.getTranslation(
                                                TrKeys.firstname)
                                            .toUpperCase(),
                                        onChanged: (name) =>
                                            event.setFirstName(name),
                                      ),
                                    ),
                                    SizedBox(
                                      width: (MediaQuery.sizeOf(context).width -
                                              40) /
                                          2,
                                      child: OutlinedBorderTextField(
                                        label: AppHelpers.getTranslation(
                                          TrKeys.surname,
                                        ).toUpperCase(),
                                        onChanged: (name) =>
                                            event.setLatName(name),
                                      ),
                                    ),
                                  ],
                                ),
                                30.verticalSpace,
                                OutlinedBorderTextField(
                                  label:
                                      AppHelpers.getTranslation(TrKeys.password)
                                          .toUpperCase(),
                                  obscure: state.showPassword,
                                  suffixIcon: IconButton(
                                    splashRadius: 25,
                                    icon: Icon(
                                      state.showPassword
                                          ? FlutterRemix.eye_line
                                          : FlutterRemix.eye_close_line,
                                      color: isDarkMode
                                          ? colors.textBlack
                                          : AppStyle.hintColor,
                                      size: 20.r,
                                    ),
                                    onPressed: () => event.toggleShowPassword(),
                                  ),
                                  onChanged: (name) => event.setPassword(name),
                                  isError: state.isPasswordInvalid,
                                  descriptionText: state.isPasswordInvalid
                                      ? AppHelpers.getTranslation(
                                          TrKeys
                                              .passwordShouldContainMinimum8Characters,
                                        )
                                      : null,
                                ),
                                34.verticalSpace,
                                OutlinedBorderTextField(
                                  label:
                                      AppHelpers.getTranslation(TrKeys.password)
                                          .toUpperCase(),
                                  obscure: state.showConfirmPassword,
                                  suffixIcon: IconButton(
                                    splashRadius: 25,
                                    icon: Icon(
                                      state.showConfirmPassword
                                          ? FlutterRemix.eye_line
                                          : FlutterRemix.eye_close_line,
                                      color: isDarkMode
                                          ? colors.textBlack
                                          : AppStyle.hintColor,
                                      size: 20.r,
                                    ),
                                    onPressed: () =>
                                        event.toggleShowConfirmPassword(),
                                  ),
                                  onChanged: (name) =>
                                      event.setConfirmPassword(name),
                                  isError: state.isConfirmPasswordInvalid,
                                  descriptionText: state
                                          .isConfirmPasswordInvalid
                                      ? AppHelpers.getTranslation(
                                          TrKeys.confirmPasswordIsNotTheSame)
                                      : null,
                                ),
                                30.verticalSpace,
                                OutlinedBorderTextField(
                                  label:
                                      AppHelpers.getTranslation(TrKeys.referral)
                                          .toUpperCase(),
                                  onChanged: event.setReferral,
                                ),
                              ],
                            ),
                        ],
                      ),
                      Padding(
                        padding: EdgeInsets.only(top: 30.h),
                        child: CustomButton(
                          isLoading: state.isLoading,
                          textColor: colors.textBlack,
                          title: AppHelpers.getTranslation(TrKeys.register),
                          onPressed: () {
                            if (isOnlyEmail) {
                              if (event.checkEmail()) {
                                event.sendCode(
                                  context,
                                  () async {
                                    AppHelpers.showCustomModalBottomSheet(
                                      context: context,
                                      modal: RegisterConfirmationPage(
                                        verificationId: "",
                                        userModel: UserModel(
                                          firstname: state.firstName,
                                          lastname: state.lastName,
                                          phone: state.phone,
                                          email: state.email,
                                          password: state.password,
                                          confirmPassword:
                                              state.confirmPassword,
                                        ),
                                      ),
                                      isDarkMode: isDarkMode,
                                    );
                                  },
                                );
                              } else {
                                if (AppConstants.signUpType ==
                                    SignUpType.phone) {
                                  if (!(phoneNumKey.currentState?.validate() ??
                                      false)) {
                                    return;
                                  }
                                }
                                event.sendCodeToNumber(
                                  context,
                                  (s) {
                                    Navigator.pop(context);
                                    AppHelpers.showCustomModalBottomSheet(
                                      context: context,
                                      modal: RegisterConfirmationPage(
                                        verificationId: s,
                                        userModel: UserModel(
                                          firstname: state.firstName,
                                          lastname: state.lastName,
                                          phone: state.phone,
                                          email: state.email,
                                          password: state.password,
                                          confirmPassword:
                                              state.confirmPassword,
                                        ),
                                      ),
                                      isDarkMode: false,
                                    );
                                  },
                                );
                              }
                            } else {
                              if (state.verificationId.isEmpty) {
                                event.register(context);
                              } else {
                                event.registerWithPhone(context);
                              }
                            }
                            // isOnlyEmail
                            //     ? (event.checkEmail()
                            //         ? event.sendCode(context, () {
                            //             Navigator.pop(context);
                            //             AppHelpers.showCustomModalBottomSheet(
                            //               context: context,
                            //               modal: RegisterConfirmationPage(
                            //                   verificationId: "",
                            //                   userModel: UserModel(
                            //                       firstname: state.firstName,
                            //                       lastname: state.lastName,
                            //                       phone: state.phone,
                            //                       email: state.email,
                            //                       password: state.password,
                            //                       confirmPassword:
                            //                           state.confirmPassword)),
                            //               isDarkMode: isDarkMode,
                            //             );
                            //           })
                            //         : event.sendCodeToNumber(context, (s) {
                            //             Navigator.pop(context);
                            //             AppHelpers.showCustomModalBottomSheet(
                            //               context: context,
                            //               modal: RegisterConfirmationPage(
                            //                   verificationId: s,
                            //                   userModel: UserModel(
                            //                       firstname: state.firstName,
                            //                       lastname: state.lastName,
                            //                       phone: state.phone,
                            //                       email: state.email,
                            //                       password: state.password,
                            //                       confirmPassword:
                            //                           state.confirmPassword)),
                            //               isDarkMode: isDarkMode,
                            //             );
                            //           }))
                            //     : state.verificationId.isEmpty
                            //         ? event.register(context)
                            //         : event.registerWithPhone(context);
                          },
                        ),
                      ),
                      if (isOnlyEmail)
                        Column(
                          children: [
                            32.verticalSpace,
                            Row(
                              children: [
                                Expanded(
                                    child: Divider(color: colors.divider)),
                                Padding(
                                  padding: EdgeInsets.only(
                                    right: 12.r,
                                    left: 12.r,
                                  ),
                                  child: Text(
                                    AppHelpers.getTranslation(
                                      TrKeys.or,
                                    ),
                                    style: AppStyle.interNormal(
                                      size: 12,
                                      color: AppStyle.textGrey,
                                    ),
                                  ),
                                ),
                                Expanded(
                                  child: Divider(
                                    color: colors.divider,
                                  ),
                                ),
                              ],
                            ),
                            22.verticalSpace,
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: AppHelpers.getSocialButtons().map(
                                    (e) {
                                  return Flexible(
                                    child: SocialButton(
                                      colors: colors,
                                      iconData: e.iconData,
                                      onPressed: () {
                                        if (SocialType.facebook == e.type) {
                                          event.loginWithFacebook(context);
                                        } else if (SocialType.google == e.type) {
                                          event.loginWithGoogle(context);
                                        } else {
                                          event.loginWithApple(context);
                                        }
                                      },
                                      title: e.title,
                                    ),
                                  );
                                },
                              ).toList(),
                            ),
                            21.verticalSpace,
                          ],
                        )
                      else
                        32.verticalSpace,
                    ],
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
