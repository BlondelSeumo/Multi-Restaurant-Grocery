// ignore_for_file: use_build_context_synchronously

import 'package:auto_route/auto_route.dart';
import 'package:firebase_dynamic_links/firebase_dynamic_links.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/application/shop_order/shop_order_provider.dart';
import 'package:riverpodtemp/infrastructure/models/data/remote_message_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import 'package:riverpodtemp/presentation/components/keyboard_dismisser.dart';
import 'package:riverpodtemp/presentation/pages/home/home_page.dart';
import 'package:riverpodtemp/presentation/pages/product/product_page.dart';
import 'package:riverpodtemp/presentation/pages/profile/profile_page.dart';
import 'package:riverpodtemp/presentation/pages/search/search_page.dart';
import 'package:riverpodtemp/presentation/pages/shop/cart/cart_order_page.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import '../../../application/main/main_provider.dart';
import '../shop/cart/cart_order_local_page.dart';
import '../single_shop/single_shop_page.dart';
import 'package:proste_indexed_stack/proste_indexed_stack.dart';

@RoutePage()
class MainPage extends StatefulWidget {
  const MainPage({
    super.key,
  });

  @override
  State<MainPage> createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  final FirebaseDynamicLinks dynamicLinks = FirebaseDynamicLinks.instance;
  List<IndexedStackChild> list = [
    IndexedStackChild(child: const HomePage(), preload: true),
    IndexedStackChild(
      child: const SearchPage(),
    ),
    IndexedStackChild(child: const SizedBox.shrink()),
    IndexedStackChild(
      child: const SingleShopPage(),
    ),
    IndexedStackChild(child: const ProfilePage(), preload: true),
  ];

  @override
  void initState() {
    initDynamicLinks();
    FirebaseMessaging.instance.requestPermission(
      sound: true,
      alert: true,
      badge: false,
    );

    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      RemoteMessageData data = RemoteMessageData.fromJson(message.data);
      AppHelpers.showCheckTopSnackBarInfo(
          context, AppHelpers.getTranslation(TrKeys.yourOrderStatusChanged),
          onTap: () {
        context.router.popUntilRoot();
        context.pushRoute(
          OrderProgressRoute(
            orderId: data.id,
          ),
        );
      });
    });
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      RemoteMessageData data = RemoteMessageData.fromJson(message.data);
      context.router.popUntilRoot();
      context.pushRoute(
        OrderProgressRoute(
          orderId: data.id,
        ),
      );
    });

    super.initState();
  }

  Future<void> initDynamicLinks() async {
    dynamicLinks.onLink.listen((dynamicLinkData) {
      String link = dynamicLinkData.link.toString();
      AppHelpers.showCustomModalBottomSheet(
        paddingTop: MediaQuery.of(context).padding.top + 100.h,
        context: context,
        modal: ProductScreen(
          productId:
              link.substring(link.indexOf("=") + 1, link.lastIndexOf("/")),
        ),
        isDarkMode: false,
        isDrag: true,
        radius: 16,
      );
    }).onError((error) {
      debugPrint(error.message);
    });

    final PendingDynamicLinkData? data =
        await FirebaseDynamicLinks.instance.getInitialLink();
    final Uri? deepLink = data?.link;
    if (deepLink != null) {
      AppHelpers.showCustomModalBottomSheet(
        paddingTop: MediaQuery.of(context).padding.top + 100.h,
        context: context,
        modal: ProductScreen(
          productId: deepLink.queryParameters['product'],
        ),
        isDarkMode: false,
        isDrag: true,
        radius: 16,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return KeyboardDismisser(
        child: CustomScaffold(
      resizeToAvoidBottomInset: false,
      body: (colors) => Consumer(
        builder: (BuildContext context, WidgetRef ref, Widget? child) {
          final index = ref.watch(mainProvider).selectIndex;
          return ProsteIndexedStack(
            index: index,
            children: list,
          );
        },
      ),
      bottomNavigationBar: (colors) => Consumer(
        builder: (BuildContext context, WidgetRef ref, Widget? child) {
          ref.watch(shopOrderProvider);
          return BottomNavigationBar(
            backgroundColor: colors.scaffoldColor,
            selectedItemColor: AppStyle.primary,
            unselectedItemColor: AppStyle.textGrey,
            type: BottomNavigationBarType.fixed,
            currentIndex: ref.watch(mainProvider).selectIndex,
            showSelectedLabels: false,
            showUnselectedLabels: false,
            onTap: (index) {
              if (index == 2) {
                AppHelpers.showCustomModalBottomDragSheet(
                  context: context,
                  modal: (c) => LocalStorage.getToken().isNotEmpty
                      ? CartOrderPage(
                          controller: c,
                          isGroupOrder: false,
                          colors: colors,
                        )
                      : CartOrderLocalPage(
                          controller: c,
                          isGroupOrder: false,
                          colors: colors,
                        ),
                  isDarkMode: false,
                  isDrag: true,
                  radius: 12,
                );
              } else if (index == 4) {
                // if (LocalStorage.getToken().isEmpty) {
                //   context.replaceRoute(const LoginRoute());
                //   return;
                // }
                ref.read(mainProvider.notifier).selectIndex(index);
              } else {
                ref.read(mainProvider.notifier).selectIndex(index);
              }
            },
            items: [
              const BottomNavigationBarItem(
                  label: "",
                  icon: Icon(FlutterRemix.restaurant_line),
                  activeIcon: Icon(FlutterRemix.restaurant_fill)),
              const BottomNavigationBarItem(
                  label: "",
                  icon: Icon(FlutterRemix.search_line),
                  activeIcon: Icon(FlutterRemix.search_fill)),
              BottomNavigationBarItem(
                  label: "",
                  icon: Stack(children: [
                    const Icon(FlutterRemix.shopping_bag_3_line),
                    if (LocalStorage.getToken().isNotEmpty
                        ? LocalStorage.getCartLocal().isNotEmpty
                        : LocalStorage.getCartList().isNotEmpty)
                      Positioned(
                        top: 0,
                        right: 0,
                        child: Container(
                          width: 8.r,
                          height: 8.r,
                          decoration: const BoxDecoration(
                              color: AppStyle.red, shape: BoxShape.circle),
                        ),
                      )
                  ]),
                  activeIcon: const Icon(FlutterRemix.shopping_bag_3_line)),
              const BottomNavigationBarItem(
                  label: "",
                  icon: Icon(FlutterRemix.store_2_line),
                  activeIcon: Icon(FlutterRemix.store_2_fill)),
              const BottomNavigationBarItem(
                  label: "",
                  icon: Icon(FlutterRemix.user_3_line),
                  activeIcon: Icon(FlutterRemix.user_3_fill)),
            ],
          );
        },
      ),
    ));
  }
}
