import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'package:riverpodtemp/application/app_widget/app_provider.dart';
import 'package:riverpodtemp/infrastructure/models/response/languages_response.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';
import '../domain/di/dependency_manager.dart';
import 'components/custom_range_slider.dart';
import 'package:provider/provider.dart' as p;

class AppWidget extends ConsumerStatefulWidget {
  const AppWidget({super.key});

  @override
  ConsumerState<AppWidget> createState() => _AppWidgetState();
}

class _AppWidgetState extends ConsumerState<AppWidget> {
  final appRouter = AppRouter();

  Future<void> setLanguage() async {
    await LocalStorage.setLanguageData(
      LanguageData(
        locale: WidgetsBinding.instance.platformDispatcher.locale.languageCode,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.refresh(appProvider);
    return FutureBuilder(
      future: Future.wait([setUpDependencies()]),
      builder: (context, AsyncSnapshot<List<dynamic>> snapshot) {
        return ScreenUtilInit(
          useInheritedMediaQuery: true,
          designSize: const Size(375, 812),
          builder: (context, child) {
            return RefreshConfiguration(
              footerBuilder: () => const ClassicFooter(
                idleIcon: SizedBox(),
                idleText: "",
                noDataText: "",
              ),
              headerBuilder: () => const WaterDropMaterialHeader(
                backgroundColor: AppStyle.white,
                color: AppStyle.textGrey,
              ),
              child: FutureBuilder(
                  future: AppTheme.create,
                  builder: (context, snapshot) {
                    return p.ChangeNotifierProvider(
                      create: (context) => snapshot.data,
                      child: MaterialApp.router(
                        debugShowCheckedModeBanner: false,
                        routerDelegate: appRouter.delegate(),
                        routeInformationParser: appRouter.defaultRouteParser(),
                        locale: Locale(state.activeLanguage?.locale ?? 'en'),
                        theme: ThemeData(
                          useMaterial3: false,
                          sliderTheme: SliderThemeData(
                            overlayShape: SliderComponentShape.noOverlay,
                            rangeThumbShape: CustomRoundRangeSliderThumbShape(
                              enabledThumbRadius: 12.r,
                            ),
                          ),
                        ),
                        themeMode:
                            state.isDarkMode ? ThemeMode.dark : ThemeMode.light,
                      ),
                    );
                  }),
            );
          },
        );
      },
    );
  }
}
