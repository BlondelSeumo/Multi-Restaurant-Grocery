import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart' as h;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/application/profile/profile_provider.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/app_bars/common_app_bar.dart';
import 'package:riverpodtemp/presentation/components/buttons/pop_button.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import 'package:riverpodtemp/presentation/components/loading.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';

@RoutePage()
class TermPage extends ConsumerStatefulWidget {
  const TermPage({super.key});

  @override
  ConsumerState<TermPage> createState() => _TermPageState();
}

class _TermPageState extends ConsumerState<TermPage> {
  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(profileProvider.notifier).getTerm(context: context);
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(profileProvider);
    return CustomScaffold(
      body: (colors) => SafeArea(
        child: Column(
          children: [
            CommonAppBar(
              child: Text(
                AppHelpers.getTranslation(TrKeys.terms),
                style: AppStyle.interNoSemi(size: 18, color: colors.textBlack),
              ),
            ),
            state.isTermLoading
                ? Center(child: Loading())
                : Expanded(
                    child: SingleChildScrollView(
                      padding: EdgeInsets.all(16.r),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            state.term?.title ?? "",
                            style:
                                AppStyle.interNoSemi(color: colors.textBlack),
                          ),
                          8.verticalSpace,
                          h.Html(
                            data: state.term?.description ?? "",
                            // style: AppStyle.in
                          )
                        ],
                      ),
                    ),
                  )
          ],
        ),
      ),
      floatingButtonLocation: FloatingActionButtonLocation.startFloat,
      floatingButton: (colors) => PopButton(colors: colors),
    );
  }
}
