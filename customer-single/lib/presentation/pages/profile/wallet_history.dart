import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:grouped_list/grouped_list.dart';
import 'package:lottie/lottie.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'package:riverpodtemp/application/wallet/wallet_provider.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/extension.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/time_service.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/app_bars/common_app_bar.dart';
import 'package:riverpodtemp/presentation/components/buttons/pop_button.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import 'package:riverpodtemp/presentation/pages/profile/send_price_screen.dart';
import 'package:riverpodtemp/presentation/pages/profile/widgets/fill_wallet_screen.dart';
import 'package:riverpodtemp/presentation/pages/profile/widgets/wallet_shimmer_card.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';

@RoutePage()
class WalletHistoryPage extends ConsumerStatefulWidget {
  const WalletHistoryPage({super.key});

  @override
  ConsumerState<WalletHistoryPage> createState() => _WalletHistoryState();
}

class _WalletHistoryState extends ConsumerState<WalletHistoryPage> {
  late RefreshController controller;
  final bool isLtr = LocalStorage.getLangLtr();
  late ScrollController scrollController;

  @override
  void initState() {
    controller = RefreshController();
    scrollController = ScrollController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(walletProvider.notifier).fetchTransactions(
            context: context,
            isRefresh: true,
          );
    });
    super.initState();
  }

  @override
  void dispose() {
    controller.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final walletEvent = ref.read(walletProvider.notifier);
    final walletState = ref.watch(walletProvider);
    return Directionality(
      textDirection: isLtr ? TextDirection.ltr : TextDirection.rtl,
      child: CustomScaffold(
        body: (colors) => Column(
          children: [
            CommonAppBar(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    AppHelpers.getTranslation(TrKeys.transactions),
                    style: AppStyle.interNoSemi(
                      size: 18,
                      color: colors.textBlack,
                    ),
                  ),
                  Row(
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: OutlinedButton(
                          onPressed: () async {
                            walletEvent.fetchPayments(context: context);
                            if (!context.mounted) return;
                            AppHelpers.showCustomModalBottomSheet(
                              context: context,
                              modal: FillWalletScreen(),
                              isDarkMode: false,
                            );
                          },
                          style: OutlinedButton.styleFrom(
                            backgroundColor: AppStyle.primary,
                          ),
                          child: Text(
                            AppHelpers.getTranslation(TrKeys.add),
                            style: AppStyle.interNormal(
                              color: colors.textBlack,
                            ),
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: OutlinedButton(
                          onPressed: () async {
                            AppHelpers.showCustomModalBottomSheet(
                              context: context,
                              modal: SendPriceScreen(),
                              isDarkMode: false,
                            );
                          },
                          style: OutlinedButton.styleFrom(
                            backgroundColor: AppStyle.primary,
                          ),
                          child: Text(
                            AppHelpers.getTranslation(TrKeys.send),
                            style:
                                AppStyle.interNormal(color: colors.textBlack),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(
              child: walletState.isTransactionLoading
                  ? Padding(
                      padding: EdgeInsets.all(16.h),
                      child: ListView.separated(
                        itemCount: 5,
                        itemBuilder: (context, index) => WalletShimmerCard(),
                        separatorBuilder: (context, index) => 10.verticalSpace,
                      ),
                    )
                  : walletState.transactions.isEmpty
                      ? Center(
                          child: Lottie.asset(
                            'assets/lottie/not-found.json',
                          ),
                        )
                      : SmartRefresher(
                          enablePullDown: true,
                          enablePullUp: true,
                          physics: const BouncingScrollPhysics(),
                          controller: controller,
                          onLoading: () {
                            walletEvent.fetchTransactions(
                              context: context,
                              controller: controller,
                            );
                          },
                          onRefresh: () {
                            walletEvent.fetchTransactions(
                              context: context,
                              controller: controller,
                              isRefresh: true,
                            );
                          },
                          child: GroupedListView(
                            controller: scrollController,
                            elements:
                                walletState.transactions.reversed.toList(),
                            groupBy: (element) =>
                                TimeService.dateFormatYMD(element.createdAt),
                            shrinkWrap: true,
                            order: GroupedListOrder.DESC,
                            padding: EdgeInsets.symmetric(horizontal: 12.r),
                            physics: const BouncingScrollPhysics(),
                            itemBuilder: (context, element) {
                              return Padding(
                                padding: EdgeInsets.symmetric(horizontal: 10.r),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            element.user?.firstname ?? '',
                                            style: AppStyle.interNormal(
                                              color: colors.textBlack,
                                            ),
                                          ),
                                          10.verticalSpace,
                                          Text(
                                            element.note ?? '',
                                            style: AppStyle.interRegular(
                                              size: 12,
                                              color: colors.textBlack,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.end,
                                        children: [
                                          Text(
                                            "${element.type == 'topup' ? "+" : " - "}${LocalStorage.getSelectedCurrency().symbol}${element.price?.toDouble()}",
                                            style: AppStyle.interNormal(
                                              color: element.type == 'topup'
                                                  ? Colors.green
                                                  : AppStyle.red,
                                            ),
                                          ),
                                          10.verticalSpace,
                                          Text(
                                            TimeService.timeFormat(
                                                element.createdAt),
                                            style: AppStyle.interRegular(
                                              size: 12,
                                              color: AppStyle.reviewText,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                            groupSeparatorBuilder: (value) => Padding(
                              padding: EdgeInsets.symmetric(vertical: 12.r),
                              child: Text(
                                value.convertDateTime(),
                                style: AppStyle.interSemi(
                                  size: 16,
                                  color: colors.textBlack,
                                ),
                              ),
                            ),
                            separator: Padding(
                              padding: EdgeInsets.symmetric(vertical: 10),
                              child: Divider(
                                color: colors.textBlack.withOpacity(.1),
                              ),
                            ),
                          ),
                        ),
            )
          ],
        ),
        floatingButtonLocation: FloatingActionButtonLocation.startFloat,
        floatingButton: (colors) => Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.w),
          child: PopButton(colors: colors),
        ),
      ),
    );
  }
}
