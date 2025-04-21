// ignore_for_file: deprecated_member_use, unused_result

import 'dart:async';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'package:riverpodtemp/application/home/home_provider.dart';
import 'package:riverpodtemp/application/language/language_provider.dart';
import 'package:riverpodtemp/application/notification/notification_provider.dart';
import 'package:riverpodtemp/application/orders_list/orders_list_provider.dart';
import 'package:riverpodtemp/application/profile/profile_provider.dart';
import 'package:riverpodtemp/application/shop_order/shop_order_provider.dart';
import 'package:riverpodtemp/app_constants.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/app_bars/common_app_bar.dart';
import 'package:riverpodtemp/presentation/components/custom_network_image.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import 'package:riverpodtemp/presentation/components/loading.dart';
import 'package:riverpodtemp/application/like/like_provider.dart';
import 'package:riverpodtemp/presentation/pages/profile/currency_page.dart';
import 'package:riverpodtemp/presentation/pages/profile/delete_screen.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'edit_profile_page.dart';
import '../../../../application/edit_profile/edit_profile_provider.dart';
import 'language_page.dart';
import 'widgets/profile_item.dart';

class ProfilePage extends ConsumerStatefulWidget {
  const ProfilePage({super.key});

  @override
  ConsumerState<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends ConsumerState<ProfilePage>
    with SingleTickerProviderStateMixin {
  late RefreshController refreshController;

  @override
  void initState() {
    refreshController = RefreshController();
    if (LocalStorage.getToken().isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(profileProvider.notifier).fetchUser(context);
        ref.read(ordersListProvider.notifier).fetchActiveOrders(context);
        Timer.periodic(AppConstants.timeRefresh, (timer) {
          ref.read(notificationProvider.notifier).fetchCount(context);
        });
      });
    } else if (LocalStorage.getToken().isEmpty) {
      WidgetsBinding.instance.addPostFrameCallback(
        (_) {
          ref.read(profileProvider.notifier).changeLoading();
        },
      );
    }

    super.initState();
  }

  getAllInformation() {
    if (LocalStorage.getToken().isNotEmpty) {
      ref.read(homeProvider.notifier)
        ..setAddress()
        ..fetchBanner(context)
        ..fetchStore(context)
        ..fetchCategories(context);
      ref.read(shopOrderProvider.notifier).getCart(context, () {});

      ref.read(likeProvider.notifier).fetchLikeProducts(context);

      ref.read(profileProvider.notifier).fetchUser(context);
    }
  }

  @override
  void dispose() {
    refreshController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bool isDarkMode = LocalStorage.getAppThemeMode();
    final bool isLtr = LocalStorage.getLangLtr();
    final state = ref.watch(profileProvider);
    final stateNotification = ref.watch(notificationProvider);
    ref.listen(languageProvider, (previous, next) {
      if (next.isSuccess && next.isSuccess != previous!.isSuccess) {
        getAllInformation();
      }
    });

    return Directionality(
      textDirection: isLtr ? TextDirection.ltr : TextDirection.rtl,
      child: CustomScaffold(
        resizeToAvoidBottomInset: false,
        body: (colors) => state.isLoading
            ? Loading()
            : Column(
                children: [
                  CommonAppBar(
                    child: LocalStorage.getToken().isEmpty
                        ? OutlinedButton(
                            style: ElevatedButton.styleFrom(
                              elevation: 0,
                              shadowColor: AppStyle.transparent,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10.r),
                                side: BorderSide(color: AppStyle.unselectedBottomItem),
                              ),
                              minimumSize: Size(80.r, 36.h),
                              backgroundColor: AppStyle.unselectedBottomItem,
                            ),
                            onPressed: () {
                              context.pushRoute(LoginRoute());
                            },
                            child: Text(
                              AppHelpers.getTranslation(TrKeys.login),
                              style: AppStyle.interNormal(
                                color: colors.white,
                                size: 12,
                              ),
                            ),
                          )
                        : Row(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  CustomNetworkImage(
                                    url: state.userData?.img ?? "",
                                    height: 40.r,
                                    width: 40.r,
                                    radius: 30.r,
                                  ),
                                  12.horizontalSpace,
                                  Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    mainAxisAlignment: MainAxisAlignment.end,
                                    children: [
                                      SizedBox(
                                        width:
                                            MediaQuery.sizeOf(context).width -
                                                150.w,
                                        child: Text(
                                          "${state.userData?.firstname ?? ""} ${state.userData?.lastname ?? ""}",
                                          style: AppStyle.interNormal(
                                            size: 14,
                                            color: colors.textBlack,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      SizedBox(
                                        width:
                                            MediaQuery.sizeOf(context).width -
                                                150.w,
                                        child: Text(
                                          state.userData?.email ?? " ",
                                          style: AppStyle.interRegular(
                                            size: 12.sp,
                                            color: AppStyle.textGrey,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  )
                                ],
                              ),
                              IconButton(
                                onPressed: () {
                                  AppHelpers.showAlertDialog(
                                    context: context,
                                    child: (colors) =>
                                        DeleteScreen(colors: colors),
                                  );
                                },
                                icon: Icon(
                                  FlutterRemix.logout_circle_r_line,
                                  color: colors.textBlack,
                                ),
                              )
                            ],
                          ),
                  ),
                  Expanded(
                    child: SmartRefresher(
                      onRefresh: LocalStorage.getToken().isEmpty
                          ? null
                          : () {
                              ref.read(profileProvider.notifier).fetchUser(
                                  context,
                                  refreshController: refreshController);
                              ref
                                  .read(ordersListProvider.notifier)
                                  .fetchActiveOrders(context);
                            },
                      controller: refreshController,
                      child: SingleChildScrollView(
                        padding: EdgeInsets.only(
                          top: 24.h,
                          right: 16.w,
                          left: 16.w,
                          bottom: 24.h,
                        ),
                        child: Builder(builder: (context) {
                          return Column(
                            children: [
                              if (LocalStorage.getToken().isNotEmpty)
                                ProfileItem(
                                  colors: colors,
                                  isLtr: isLtr,
                                  title:
                                      "${AppHelpers.getTranslation(TrKeys.wallet)}: ${AppHelpers.numberFormat(
                                    state.userData?.wallet?.price ?? 0,
                                  )}",
                                  icon: FlutterRemix.wallet_3_line,
                                  onTap: () {
                                    context
                                        .pushRoute(const WalletHistoryRoute());
                                  },
                                ),
                              if (LocalStorage.getToken().isNotEmpty)
                                AppHelpers.getReferralActive()
                                    ? ProfileItem(
                                        colors: colors,
                                        isLtr: isLtr,
                                        title: AppHelpers.getTranslation(
                                            TrKeys.inviteFriend),
                                        icon: FlutterRemix
                                            .money_dollar_circle_line,
                                        onTap: () {
                                          context.pushRoute(
                                              const ShareReferralRoute());
                                        },
                                      )
                                    : const SizedBox.shrink(),
                              if (LocalStorage.getToken().isNotEmpty)
                                ProfileItem(
                                  colors: colors,
                                  isLtr: isLtr,
                                  title:
                                      AppHelpers.getTranslation(TrKeys.orders),
                                  icon: FlutterRemix.history_line,
                                  isCount: true,
                                  count: ref
                                      .watch(ordersListProvider)
                                      .totalActiveCount
                                      .toString(),
                                  onTap: () {
                                    context.pushRoute(const OrdersListRoute());
                                  },
                                ),
                              if (LocalStorage.getToken().isNotEmpty)
                                ProfileItem(
                                  colors: colors,
                                  isLtr: isLtr,
                                  title: AppHelpers.getTranslation(
                                      TrKeys.notifications),
                                  icon: FlutterRemix.notification_2_line,
                                  isCount: true,
                                  count: (stateNotification.countOfNotifications
                                              ?.notification ??
                                          0)
                                      .toString(),
                                  onTap: () {
                                    context.pushRoute(
                                      const NotificationListRoute(),
                                    );
                                  },
                                ),
                              if (LocalStorage.getToken().isNotEmpty)
                                ProfileItem(
                                  colors: colors,
                                  isLtr: isLtr,
                                  title: AppHelpers.getTranslation(
                                      TrKeys.reservation),
                                  icon: FlutterRemix.reserved_line,
                                  onTap: () async {
                                    context.pushRoute(ReservationRoute());
                                  },
                                ),
                              ProfileItem(
                                colors: colors,
                                isLtr: isLtr,
                                title:
                                    AppHelpers.getTranslation(TrKeys.branches),
                                icon: FlutterRemix.store_2_fill,
                                onTap: () {
                                  context.pushRoute(const AllBranchesRoute());
                                },
                              ),
                              ProfileItem(
                                colors: colors,
                                isLtr: isLtr,
                                title: AppHelpers.getTranslation(
                                    TrKeys.likedProducts),
                                icon: FlutterRemix.heart_3_line,
                                onTap: () {
                                  context.pushRoute(const LikeRoute());
                                },
                              ),
                              if (LocalStorage.getToken().isNotEmpty)
                                ProfileItem(
                                  colors: colors,
                                  isLtr: isLtr,
                                  title: AppHelpers.getTranslation(
                                      TrKeys.profileSettings),
                                  icon: FlutterRemix.user_settings_line,
                                  onTap: () {
                                    ref.refresh(editProfileProvider);
                                    AppHelpers.showCustomModalBottomSheet(
                                      paddingTop:
                                          MediaQuery.of(context).padding.top,
                                      context: context,
                                      modal: const EditProfileScreen(),
                                      isDarkMode: isDarkMode,
                                    );
                                  },
                                ),
                              ProfileItem(
                                colors: colors,
                                isLtr: isLtr,
                                title:
                                    AppHelpers.getTranslation(TrKeys.language),
                                icon: FlutterRemix.global_line,
                                onTap: () {
                                  AppHelpers.showCustomModalBottomSheet(
                                    isDismissible: false,
                                    context: context,
                                    modal: LanguageScreen(
                                      onSave: () {
                                        Navigator.pop(context);
                                      },
                                    ),
                                    isDarkMode: isDarkMode,
                                  );
                                },
                              ),
                              ProfileItem(
                                colors: colors,
                                isLtr: isLtr,
                                title: AppHelpers.getTranslation(
                                    TrKeys.currencies),
                                icon: FlutterRemix.bank_card_line,
                                onTap: () {
                                  AppHelpers.showCustomModalBottomSheet(
                                    context: context,
                                    modal: CurrencyScreen(colors: colors),
                                    isDarkMode: isDarkMode,
                                  );
                                },
                              ),
                              if (LocalStorage.getToken().isNotEmpty)
                                ProfileItem(
                                  colors: colors,
                                  isLtr: isLtr,
                                  title: AppHelpers.getTranslation(
                                      TrKeys.notification),
                                  icon: FlutterRemix.settings_4_line,
                                  onTap: () {
                                    context.pushRoute(const SettingRoute());
                                  },
                                ),
                              ProfileItem(
                                colors: colors,
                                isLtr: isLtr,
                                title:
                                    AppHelpers.getTranslation(TrKeys.careers),
                                icon: FlutterRemix.empathize_line,
                                onTap: () async {
                                  context.pushRoute(CareersRoute());
                                },
                              ),
                              ProfileItem(
                                colors: colors,
                                isLtr: isLtr,
                                title: AppHelpers.getTranslation(TrKeys.blogs),
                                icon: FlutterRemix.article_line,
                                onTap: () async {
                                  context.pushRoute(BlogsRoute());
                                },
                              ),
                              ProfileItem(
                                colors: colors,
                                isLtr: isLtr,
                                title:
                                    AppHelpers.getTranslation(TrKeys.appInfo),
                                icon: FlutterRemix.information_line,
                                onTap: () {
                                  context.pushRoute(const AppInfoRoute());
                                },
                              ),
                              ProfileItem(
                                colors: colors,
                                isLtr: isLtr,
                                title: AppHelpers.getTranslation(
                                    TrKeys.appSetting),
                                icon: FlutterRemix.information_line,
                                onTap: () {
                                  context.pushRoute(const AppSettingRoute());
                                },
                              ),
                              // ProfileItem(
                              //   isLtr: isLtr,
                              //   title: AppHelpers.getTranslation(
                              //       TrKeys.signUpToDeliver),
                              //   icon: FlutterRemix.external_link_line,
                              //   onTap: () {
                              //     context.pushRoute(const HelpRoute());
                              //   },
                              // ),
                              if (LocalStorage.getToken().isNotEmpty)
                                ProfileItem(
                                  colors: colors,
                                  isLtr: isLtr,
                                  title: AppHelpers.getTranslation(
                                    TrKeys.deleteAccount,
                                  ),
                                  icon: FlutterRemix.logout_box_r_line,
                                  onTap: () {
                                    AppHelpers.showAlertDialog(
                                      context: context,
                                      child: (colors) => DeleteScreen(
                                        isDeleteAccount: true,
                                        colors: colors,
                                      ),
                                    );
                                  },
                                ),
                            ],
                          );
                        }),
                      ),
                    ),
                  )
                ],
              ),
      ),
    );
  }
}
