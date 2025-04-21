import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/presentation/app_assets.dart';
import 'package:riverpodtemp/presentation/components/keyboard_dismisser.dart';
import 'package:riverpodtemp/presentation/pages/initial/no_connection/no_connection_page.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';
import 'package:riverpodtemp/presentation/theme/theme_wrapper.dart';

class CustomScaffold extends StatefulWidget {
  final Widget Function(CustomColorSet colors) body;
  final Widget? Function(CustomColorSet colors)? floatingButton;
  final Widget? Function(CustomColorSet colors)? bottomNavigationBar;
  final Widget? Function(CustomColorSet colors)? drawer;
  final FloatingActionButtonLocation? floatingButtonLocation;
  final PreferredSizeWidget? Function(CustomColorSet colors)? appBar;
  final Color? bgColor;
  final bool bgImage;
  final bool extendBody;
  final bool useSafeArea;
  final bool resizeToAvoidBottomInset;
  final WidgetRef? ref;

  const CustomScaffold({
    super.key,
    this.ref,
    this.appBar,
    this.floatingButton,
    this.floatingButtonLocation,
    this.bgColor,
    this.bottomNavigationBar,
    this.bgImage = false,
    this.drawer,
    this.extendBody = false,
    this.resizeToAvoidBottomInset = false,
    required this.body,
    this.useSafeArea = false,
  });

  @override
  State<CustomScaffold> createState() => _CustomScaffoldState();
}

class _CustomScaffoldState extends State<CustomScaffold>
    with WidgetsBindingObserver {
  StreamSubscription? connectivitySubscription;
  ValueNotifier<bool> isNetworkDisabled = ValueNotifier(false);

  void _checkCurrentNetworkState() {
    Connectivity().checkConnectivity().then((connectivityResult) {
      isNetworkDisabled.value =
          connectivityResult.contains(ConnectivityResult.none);
    });
  }

  initStateFunc() {
    _checkCurrentNetworkState();
    connectivitySubscription = Connectivity().onConnectivityChanged.listen(
      (result) {
        isNetworkDisabled.value = result.contains(ConnectivityResult.none);
      },
    );
  }

  @override
  void initState() {
    WidgetsBinding.instance.addObserver(this);
    initStateFunc();
    super.initState();
  }

  @override
  Future<void> didChangeAppLifecycleState(AppLifecycleState state) async {
    super.didChangeAppLifecycleState(state);
    if (state == AppLifecycleState.resumed) {
      _checkCurrentNetworkState();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    connectivitySubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        ValueListenableBuilder(
          valueListenable: isNetworkDisabled,
          builder: (_, bool networkDisabled, __) => Visibility(
            visible: !networkDisabled,
            child: ThemeWrapper(builder: (colors, controller) {
              return KeyboardDismisser(
                child: Container(
                  decoration: widget.bgImage
                      ? BoxDecoration(
                          image: DecorationImage(
                            image: AssetImage(
                              controller.isDark
                                  ? Assets.imagesDarkBg
                                  : Assets.imagesLightBg,
                            ),
                            fit: BoxFit.cover,
                          ),
                        )
                      : null,
                  child: Scaffold(
                    extendBody: widget.extendBody,
                    resizeToAvoidBottomInset: widget.resizeToAvoidBottomInset,
                    appBar: widget.appBar?.call(colors),
                    backgroundColor: widget.bgColor ?? colors.scaffoldColor,
                    body: Padding(
                      padding: widget.useSafeArea
                          ? EdgeInsets.only(
                              top: AppHelpers.topSpace(context),
                              bottom: AppHelpers.bottomSpace(context),
                            )
                          : EdgeInsets.zero,
                      child: widget.body(colors),
                    ),
                    drawer: widget.drawer?.call((colors)),
                    floatingActionButton: widget.floatingButton?.call(colors),
                    floatingActionButtonLocation: widget.floatingButtonLocation,
                    bottomNavigationBar:
                        widget.bottomNavigationBar?.call(colors),
                  ),
                ),
              );
            },),
          ),
        ),
        ValueListenableBuilder(
          valueListenable: isNetworkDisabled,
          builder: (_, bool networkDisabled, __) => Visibility(
            visible: networkDisabled,
            child: NoConnectionPage(),
          ),
        ),
      ],
    );
  }
}
