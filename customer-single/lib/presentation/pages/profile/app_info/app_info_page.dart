import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/app_bars/common_app_bar.dart';
import 'package:riverpodtemp/presentation/components/buttons/pop_button.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import 'package:riverpodtemp/presentation/pages/profile/widgets/profile_item.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import '../../../routes/app_router.dart';

@RoutePage()
class AppInfoPage extends StatefulWidget {
  const AppInfoPage({super.key});

  @override
  State<AppInfoPage> createState() => _AppInfoPageState();
}

class _AppInfoPageState extends State<AppInfoPage> {
  @override
  Widget build(BuildContext context) {
    final bool isLtr = LocalStorage.getLangLtr();
    return CustomScaffold(
      body: (colors) => Column(
        children: [
          CommonAppBar(
            child: Text(
              AppHelpers.getTranslation(TrKeys.appInfo),
              style: AppStyle.interNormal(
                color: colors.textBlack,
              ),
            ),
          ),
          20.verticalSpace,
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 8.r),
            child: Column(
              children: [
                ProfileItem(
                  colors: colors,
                  isLtr: isLtr,
                  title: AppHelpers.getTranslation(TrKeys.privacyPolicy),
                  icon: FlutterRemix.information_line,
                  onTap: () async {
                    context.pushRoute((PolicyRoute()));
                  },
                ),
                ProfileItem(
                  colors: colors,
                  isLtr: isLtr,
                  title: AppHelpers.getTranslation(TrKeys.terms),
                  icon: FlutterRemix.file_info_line,
                  onTap: () async {
                    context.pushRoute(TermRoute());
                  },
                ),
                ProfileItem(
                  colors: colors,
                  isLtr: isLtr,
                  title: AppHelpers.getTranslation(TrKeys.help),
                  icon: FlutterRemix.question_line,
                  onTap: () {
                    context.pushRoute(const HelpRoute());
                  },
                ),
              ],
            ),
          )
        ],
      ),
      floatingButtonLocation: FloatingActionButtonLocation.startFloat,
      floatingButton: (colors) => Padding(
        padding: EdgeInsets.symmetric(horizontal: 16.w),
        child: PopButton(colors: colors),
      ),
    );
  }
}
