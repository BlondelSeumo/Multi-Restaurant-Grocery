// ignore_for_file: deprecated_member_use

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:jiffy/jiffy.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'package:riverpodtemp/application/notification/notification_provider.dart';
import 'package:riverpodtemp/infrastructure/models/response/notification_response.dart';
import 'package:riverpodtemp/app_constants.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/app_bars/common_app_bar.dart';
import 'package:riverpodtemp/presentation/components/buttons/custom_button.dart';
import 'package:riverpodtemp/presentation/components/buttons/pop_button.dart';
import 'package:riverpodtemp/presentation/components/custom_network_image.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import 'package:riverpodtemp/presentation/components/custom_tab_bar.dart';
import 'package:riverpodtemp/presentation/components/loading.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../theme/app_style.dart';

@RoutePage()
class NotificationListPage extends ConsumerStatefulWidget {
  const NotificationListPage({super.key});

  @override
  ConsumerState<NotificationListPage> createState() =>
      _NotificationListPageState();
}

class _NotificationListPageState extends ConsumerState<NotificationListPage>
    with SingleTickerProviderStateMixin {
  final bool isLtr = LocalStorage.getLangLtr();
  late TabController _tabController;
  late RefreshController newsController;
  late RefreshController ordersController;
  late RefreshController reservationController;
  final _tabs = [
    Tab(text: AppHelpers.getTranslation(TrKeys.news)),
    Tab(text: AppHelpers.getTranslation(TrKeys.orders)),
    Tab(text: AppHelpers.getTranslation(TrKeys.reservation)),
  ];

  @override
  void initState() {
    newsController = RefreshController();
    ordersController = RefreshController();
    reservationController = RefreshController();
    _tabController = TabController(length: 3, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(notificationProvider.notifier).fetchNews(context);
      ref.read(notificationProvider.notifier).fetchOrders(context);
      ref.read(notificationProvider.notifier).fetchReservation(context);
    });
    super.initState();
  }

  @override
  void dispose() {
    newsController.dispose();
    ordersController.dispose();
    reservationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(notificationProvider);
    final event = ref.read(notificationProvider.notifier);
    return Directionality(
      textDirection: isLtr ? TextDirection.ltr : TextDirection.rtl,
      child: CustomScaffold(
        body: (colors) => Column(
          children: [
            CommonAppBar(
              child: Text(
                AppHelpers.getTranslation(TrKeys.notifications),
                style: AppStyle.interNoSemi(
                  size: 18,
                  color: colors.textBlack,
                ),
              ),
            ),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.r),
              child: CustomTabBar(
                isScrollable: true,
                tabController: _tabController,
                tabs: _tabs,
                colors: colors,
              ),
            ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  SmartRefresher(
                    controller: newsController,
                    enablePullDown: true,
                    enablePullUp: true,
                    onRefresh: () {
                      event.fetchNewsPaginate(
                          refreshController: newsController, isRefresh: true);
                    },
                    onLoading: () {
                      event.fetchNewsPaginate(
                        refreshController: newsController,
                      );
                    },
                    child: state.isAllNotificationsLoading
                        ? Loading()
                        : ListView.builder(
                            shrinkWrap: true,
                            padding: EdgeInsets.only(
                                top: 24.h,
                                right: 16.w,
                                left: 16.w,
                                bottom: MediaQuery.of(context).padding.bottom +
                                    72.h),
                            itemCount: state.news.length,
                            itemBuilder: (context, index) {
                              return InkWell(
                                onTap: () async {
                                  if (state.news[index].readAt == null) {
                                    event.readOne(
                                        index: index,
                                        context,
                                        id: state.news[index].id,
                                        typeIndex: 0);
                                  }
                                  if (state.news[index].orderData != null) {
                                    context.pushRoute(OrderProgressRoute(
                                        orderId:
                                            state.news[index].orderData?.id));
                                  } else if (state.news[index].blogData !=
                                      null) {
                                    await launch(
                                      "${AppConstants.webUrl}/blog/${state.news[index].blogData?.uuid}",
                                      forceSafariVC: true,
                                      forceWebView: true,
                                      enableJavaScript: true,
                                    );
                                  } else {
                                    await launch(
                                      "${AppConstants.webUrl}/reservations",
                                      forceSafariVC: true,
                                      forceWebView: true,
                                      enableJavaScript: true,
                                    );
                                  }
                                },
                                child: Column(
                                  children: [
                                    notificationItem(state.news[index], colors),
                                    const Divider()
                                  ],
                                ),
                              );
                            }),
                  ),
                  SmartRefresher(
                    controller: ordersController,
                    enablePullDown: true,
                    enablePullUp: true,
                    onRefresh: () {
                      event.fetchOrdersPaginate(
                          refreshController: ordersController, isRefresh: true);
                    },
                    onLoading: () {
                      event.fetchOrdersPaginate(
                        refreshController: ordersController,
                      );
                    },
                    child: state.isAllNotificationsLoading
                        ? Loading()
                        : ListView.builder(
                            shrinkWrap: true,
                            padding: EdgeInsets.only(
                                top: 24.h,
                                right: 16.w,
                                left: 16.w,
                                bottom: MediaQuery.of(context).padding.bottom +
                                    72.h),
                            itemCount: state.orders.length,
                            itemBuilder: (context, index) {
                              return InkWell(
                                onTap: () async {
                                  if (state.orders[index].readAt == null) {
                                    event.readOne(
                                        index: index,
                                        context,
                                        id: state.orders[index].id,
                                        typeIndex: 1);
                                  }
                                  if (state.orders[index].orderData != null) {
                                    context.pushRoute(OrderProgressRoute(
                                        orderId:
                                            state.orders[index].orderData?.id));
                                  } else if (state.orders[index].blogData !=
                                      null) {
                                    await launch(
                                      "${AppConstants.webUrl}/blog/${state.orders[index].blogData?.uuid}",
                                      forceSafariVC: true,
                                      forceWebView: true,
                                      enableJavaScript: true,
                                    );
                                  } else {
                                    await launch(
                                      "${AppConstants.webUrl}/reservations",
                                      forceSafariVC: true,
                                      forceWebView: true,
                                      enableJavaScript: true,
                                    );
                                  }
                                },
                                child: Column(
                                  children: [
                                    notificationItem(
                                        state.orders[index], colors),
                                    const Divider()
                                  ],
                                ),
                              );
                            }),
                  ),
                  SmartRefresher(
                    controller: reservationController,
                    enablePullDown: true,
                    enablePullUp: true,
                    onRefresh: () {
                      event.fetchReservationsPaginate(
                          refreshController: reservationController,
                          isRefresh: true);
                    },
                    onLoading: () {
                      event.fetchReservationsPaginate(
                        refreshController: reservationController,
                      );
                    },
                    child: state.isAllNotificationsLoading
                        ? Loading()
                        : ListView.builder(
                            shrinkWrap: true,
                            padding: EdgeInsets.only(
                                top: 24.h,
                                right: 16.w,
                                left: 16.w,
                                bottom: MediaQuery.of(context).padding.bottom +
                                    72.h),
                            itemCount: state.reservations.length,
                            itemBuilder: (context, index) {
                              return InkWell(
                                onTap: () async {
                                  if (state.reservations[index].readAt ==
                                      null) {
                                    event.readOne(
                                        index: index,
                                        context,
                                        id: state.reservations[index].id,
                                        typeIndex: 2);
                                  }
                                  if (state.reservations[index].orderData !=
                                      null) {
                                    context.pushRoute(OrderProgressRoute(
                                        orderId: state.reservations[index]
                                            .orderData?.id));
                                  } else if (state
                                          .reservations[index].blogData !=
                                      null) {
                                    await launch(
                                      "${AppConstants.webUrl}/blog/${state.reservations[index].blogData?.uuid}",
                                      forceSafariVC: true,
                                      forceWebView: true,
                                      enableJavaScript: true,
                                    );
                                  } else {
                                    await launch(
                                      "${AppConstants.webUrl}/reservations",
                                      forceSafariVC: true,
                                      forceWebView: true,
                                      enableJavaScript: true,
                                    );
                                  }
                                },
                                child: Column(
                                  children: [
                                    notificationItem(
                                      state.reservations[index],
                                      colors,
                                    ),
                                    const Divider()
                                  ],
                                ),
                              );
                            },
                          ),
                  ),
                ],
              ),
            )
          ],
        ),
        floatingButtonLocation: FloatingActionButtonLocation.centerFloat,
        floatingButton: (colors) => Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.w),
          child: Row(
            children: [
              PopButton(colors: colors),
              10.horizontalSpace,
              Expanded(
                  child: CustomButton(
                background: colors.textBlack,
                textColor: colors.textWhite,
                title: AppHelpers.getTranslation(TrKeys.readAll),
                onPressed: () async {
                  event.readAll(context);
                },
              ))
            ],
          ),
        ),
      ),
    );
  }

  Widget notificationItem(
    NotificationModel notification,
    CustomColorSet colors,
  ) {
    return Row(
      children: [
        CustomNetworkImage(
          radius: 22,
          url: notification.client?.img ?? notification.blogData?.img ?? "",
          height: 44,
          width: 44,
        ),
        12.horizontalSpace,
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (notification.client != null)
              Row(
                children: [
                  Text(
                    '${notification.client?.firstname ?? ''} ${notification.client?.lastname?.substring(0, 1) ?? ''}.',
                    style:
                        AppStyle.interSemi(size: 16, color: colors.textBlack),
                  ),
                  15.horizontalSpace,
                  Container(
                    height: 8.r,
                    width: 8.r,
                    decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: notification.readAt == null
                            ? AppStyle.primary
                            : AppStyle.transparent),
                  )
                ],
              ),
            2.verticalSpace,
            Row(
              children: [
                SizedBox(
                  width: notification.client != null
                      ? MediaQuery.sizeOf(context).width / 2
                      : null,
                  child: Text(
                    '${notification.body ?? notification.title}',
                    overflow: TextOverflow.ellipsis,
                    maxLines: 3,
                    style: AppStyle.interRegular(
                        size: 14, color: colors.textBlack),
                  ),
                ),
                if (notification.client == null)
                  Container(
                    margin: EdgeInsets.only(left: 8.r),
                    height: 8.r,
                    width: 8.r,
                    decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: notification.readAt == null
                            ? AppStyle.primary
                            : AppStyle.transparent),
                  )
              ],
            ),
            4.verticalSpace,
            Text(
              Jiffy.parseFromDateTime(notification.createdAt ?? DateTime.now())
                  .fromNow(),
              style: AppStyle.interRegular(size: 12, color: AppStyle.textGrey),
            ),
          ],
        ),
      ],
    );
  }
}
