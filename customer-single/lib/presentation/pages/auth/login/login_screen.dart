import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/app_constants.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/enums.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/app_bars/app_bar_bottom_sheet.dart';
import 'package:riverpodtemp/presentation/components/buttons/custom_button.dart';
import 'package:riverpodtemp/presentation/components/buttons/forgot_text_button.dart';
import 'package:riverpodtemp/presentation/components/buttons/social_button.dart';
import 'package:riverpodtemp/presentation/components/keyboard_dismisser.dart';
import 'package:riverpodtemp/presentation/components/text_fields/outline_bordered_text_field.dart';
import 'package:riverpodtemp/presentation/components/text_fields/phone_text_field.dart';
import 'package:riverpodtemp/presentation/pages/auth/reset/reset_password_page.dart';
import 'package:riverpodtemp/presentation/theme/theme_wrapper.dart';

import '../../../theme/app_style.dart';
import '../../../../application/login/login_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  late TextEditingController loginController;
  late TextEditingController passwordController;

  @override
  void initState() {
    loginController = TextEditingController();
    passwordController = TextEditingController();
    super.initState();
  }

  @override
  void dispose() {
    loginController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final event = ref.read(loginProvider.notifier);
    final state = ref.watch(loginProvider);
    final bool isDarkMode = LocalStorage.getAppThemeMode();
    final bool isLtr = LocalStorage.getLangLtr();
    return ThemeWrapper(
      builder: (colors, controller) => Directionality(
        textDirection: isLtr ? TextDirection.ltr : TextDirection.rtl,
        child: KeyboardDismisser(
          child: Container(
            margin: MediaQuery.of(context).viewInsets,
            decoration: BoxDecoration(
              color: colors.buttonColor,
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
                  mainAxisSize: MainAxisSize.max,
                  children: [
                    Column(
                      children: [
                        AppBarBottomSheet(
                          colors: colors,
                          title: AppHelpers.getTranslation(TrKeys.login),
                        ),
                        if (AppConstants.signUpType == SignUpType.phone)
                          PhoneTextField(
                            onChange: (value) {
                              event.setEmail(value.completeNumber);
                            },
                            colors: colors,
                          ),
                        if (AppConstants.signUpType == SignUpType.both)
                          OutlinedBorderTextField(
                            textController: loginController,
                            label: AppHelpers.getTranslation(
                                    TrKeys.emailOrPhoneNumber)
                                .toUpperCase(),
                            onChanged: event.setEmail,
                            isError: state.isEmailNotValid,
                            descriptionText: state.isEmailNotValid
                                ? AppHelpers.getTranslation(
                                    TrKeys.emailIsNotValid)
                                : null,
                          ),
                        if (AppConstants.signUpType == SignUpType.email)
                          OutlinedBorderTextField(
                            textController: loginController,
                            textCapitalization: TextCapitalization.none,
                            label: AppHelpers.getTranslation(TrKeys.email),
                            onChanged: event.setEmail,
                            isError: state.isEmailNotValid,
                            validation: (s) {
                              if (s?.isEmpty ?? true) {
                                return AppHelpers.getTranslation(
                                  TrKeys.emailIsNotValid,
                                );
                              }
                              return null;
                            },
                            descriptionText: state.isEmailNotValid
                                ? AppHelpers.getTranslation(
                                    TrKeys.emailIsNotValid,
                                  )
                                : null,
                          ),
                        34.verticalSpace,
                        OutlinedBorderTextField(
                          textController: passwordController,
                          label: AppHelpers.getTranslation(TrKeys.password)
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
                            onPressed: () =>
                                event.setShowPassword(!state.showPassword),
                          ),
                          onChanged: event.setPassword,
                          isError: state.isPasswordNotValid,
                          descriptionText: state.isPasswordNotValid
                              ? AppHelpers.getTranslation(TrKeys
                                  .passwordShouldContainMinimum8Characters)
                              : null,
                        ),
                        30.verticalSpace,
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                SizedBox(
                                  height: 20.h,
                                  width: 20.w,
                                  child: Checkbox(
                                    side: BorderSide(
                                      color: colors.textBlack,
                                      width: 2.r,
                                    ),
                                    activeColor: colors.textBlack,
                                    value: state.isKeepLogin,
                                    onChanged: (value) =>
                                        event.setKeepLogin(value!),
                                  ),
                                ),
                                8.horizontalSpace,
                                Text(
                                  AppHelpers.getTranslation(TrKeys.keepLogged),
                                  style: AppStyle.interNormal(
                                    size: 12.sp,
                                    color: colors.textBlack,
                                  ),
                                ),
                              ],
                            ),
                            ForgotTextButton(
                              title: AppHelpers.getTranslation(
                                TrKeys.forgotPassword,
                              ),
                              onPressed: () {
                                Navigator.pop(context);
                                AppHelpers.showCustomModalBottomSheet(
                                  context: context,
                                  modal: const ResetPasswordPage(),
                                  isDarkMode: isDarkMode,
                                );
                              },
                              colors: colors,
                            ),
                          ],
                        ),
                      ],
                    ),
                    12.verticalSpace,
                    Column(
                      children: [
                        CustomButton(
                          textColor: colors.textBlack,
                          isLoading: state.isLoading,
                          title: 'Login',
                          onPressed: () {
                            event.login(context);
                            // context.replaceRoute(const MainRoute());
                          },
                        ),
                        32.verticalSpace,
                        Row(
                          children: <Widget>[
                            Expanded(
                                child: Divider(
                              color: colors.textBlack.withOpacity(0.5),
                            )),
                            Padding(
                              padding:
                                  const EdgeInsets.only(right: 12, left: 12),
                              child: Text(
                                AppHelpers.getTranslation(
                                    TrKeys.orAccessQuickly),
                                style: AppStyle.interNormal(
                                  size: 12.sp,
                                  color: AppStyle.textGrey,
                                ),
                              ),
                            ),
                            Expanded(
                              child: Divider(
                                color: colors.textBlack.withOpacity(0.5),
                              ),
                            ),
                          ],
                        ),
                        22.verticalSpace,
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: AppHelpers.getSocialButtons().map(
                            (e) {
                              return Expanded(
                                child: SocialButton(
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
                                  colors: colors,
                                ),
                              );
                            },
                          ).toList(),
                        ),
                        22.verticalSpace,
                        if (AppConstants.isDemo)
                          Column(
                            children: [
                              InkWell(
                                onTap: () {
                                  loginController.text =
                                      AppConstants.demoUserLogin;
                                  passwordController.text =
                                      AppConstants.demoUserPassword;
                                  event.setEmail(AppConstants.demoUserLogin);
                                  event.setPassword(
                                      AppConstants.demoUserPassword);
                                },
                                child: Row(
                                  children: [
                                    const Spacer(),
                                    Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        RichText(
                                          text: TextSpan(
                                            text:
                                                '${AppHelpers.getTranslation(TrKeys.login)}:',
                                            style: AppStyle.interNormal(
                                              color: colors.textBlack,
                                              letterSpacing: -0.3,
                                            ),
                                            children: [
                                              TextSpan(
                                                text:
                                                    ' ${AppConstants.demoUserLogin}',
                                                style: AppStyle.interRegular(
                                                  color: colors.textBlack,
                                                  letterSpacing: -0.3,
                                                ),
                                              )
                                            ],
                                          ),
                                        ),
                                        6.verticalSpace,
                                        RichText(
                                          text: TextSpan(
                                            text:
                                                '${AppHelpers.getTranslation(TrKeys.password)}:',
                                            style: AppStyle.interNormal(
                                              color: colors.textBlack,
                                              letterSpacing: -0.3,
                                            ),
                                            children: [
                                              TextSpan(
                                                text:
                                                    ' ${AppConstants.demoUserPassword}',
                                                style: AppStyle.interRegular(
                                                  color: colors.textBlack,
                                                  letterSpacing: -0.3,
                                                ),
                                              )
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                    const Spacer(),
                                  ],
                                ),
                              ),
                              22.verticalSpace,
                            ],
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
