import 'package:auto_route/annotations.dart';
import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/app_bars/common_app_bar.dart';
import 'package:riverpodtemp/presentation/components/buttons/pop_button.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import 'package:riverpodtemp/presentation/pages/app_setting/widgets/custom_switch.dart';
import 'package:riverpodtemp/presentation/pages/app_setting/widgets/custom_text_wrapper.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme_wrapper.dart';

@RoutePage()
class AppSettingPage extends StatefulWidget {
  const AppSettingPage({super.key});

  @override
  State<AppSettingPage> createState() => _AppSettingPageState();
}

class _AppSettingPageState extends State<AppSettingPage> {
  @override
  Widget build(BuildContext context) {
    return CustomScaffold(
      body: (colors) => Column(
        children: [
          CommonAppBar(
            child: Text(
              AppHelpers.getTranslation(TrKeys.appSetting),
              style: AppStyle.interNoSemi(
                size: 18,
                color: colors.textBlack,
              ),
            ),
          ),
          20.verticalSpace,
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 12.r),
            child: Column(
              children: [
                CustomTextWrapper(
                  title: TrKeys.interface,
                  colors: colors,
                  child: Row(
                    children: [
                      Expanded(
                        child: Row(
                          children: [
                            Icon(
                              FlutterRemix.sun_line,
                              color: colors.textBlack,
                              size: 22.r,
                            ),
                            8.horizontalSpace,
                            Text(
                              AppHelpers.getTranslation(TrKeys.uiTheme),
                              style: AppStyle.interNormal(
                                size: 16,
                                color: colors.textBlack,
                              ),
                            ),
                          ],
                        ),
                      ),
                      ThemeWrapper(builder: (c, controller) {
                        return GestureDetector(
                          onTap: () => controller.toggle(),
                          child: CustomSwitch(
                            isOn: controller.isDark,
                            onChanged: (p0) => controller.toggle(),
                            colors: colors,
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      floatingButtonLocation: FloatingActionButtonLocation.startFloat,
      floatingButton: (colors) =>  Padding(
        padding: EdgeInsets.symmetric(horizontal: 16.w),
        child: PopButton(colors: colors),
      ),
    );
  }
}
