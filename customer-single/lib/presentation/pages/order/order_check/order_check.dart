import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import 'package:riverpodtemp/application/map/view_map_provider.dart';
import 'package:riverpodtemp/application/map/view_map_state.dart';
import 'package:riverpodtemp/application/order/order_notifier.dart';
import 'package:riverpodtemp/application/order/order_provider.dart';
import 'package:riverpodtemp/application/order/order_state.dart';
import 'package:riverpodtemp/application/orders_list/orders_list_notifier.dart';
import 'package:riverpodtemp/application/payment_methods/payment_provider.dart';
import 'package:riverpodtemp/application/payment_methods/payment_state.dart';
import 'package:riverpodtemp/application/profile/profile_provider.dart';
import 'package:riverpodtemp/application/shop_order/shop_order_notifier.dart';
import 'package:riverpodtemp/application/shop_order/shop_order_provider.dart';
import 'package:riverpodtemp/application/shop_order/shop_order_state.dart';
import 'package:riverpodtemp/infrastructure/models/data/address_information.dart';
import 'package:riverpodtemp/infrastructure/models/data/payment_data.dart';
import 'package:riverpodtemp/app_constants.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/enums.dart';
import 'package:riverpodtemp/infrastructure/services/time_service.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/buttons/custom_button.dart';
import 'package:riverpodtemp/presentation/components/web_view.dart';
import 'package:riverpodtemp/presentation/pages/order/order_check/price_information.dart';
import 'package:riverpodtemp/presentation/pages/order/order_check/widgets/auto_order_modal.dart';
import 'package:riverpodtemp/presentation/pages/order/order_check/widgets/cash_modal_widget.dart';
import 'package:riverpodtemp/presentation/pages/order/order_check/widgets/order_payment_container_new.dart';
import 'package:riverpodtemp/presentation/pages/order/order_check/widgets/payment_method.dart';
import 'package:riverpodtemp/presentation/pages/order/order_check/widgets/wallet_item.dart';
import 'package:riverpodtemp/presentation/pages/order/order_check/widgets/wallet_pay_dialog.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../application/orders_list/orders_list_provider.dart';
import '../../../../infrastructure/models/models.dart';
import '../../../../infrastructure/services/local_storage.dart';
import '../../../../infrastructure/services/tpying_delay.dart';
import '../order_screen/widgets/image_dialog.dart';
import 'widgets/card_and_promo.dart';
import 'widgets/delivery_info.dart';
import 'widgets/order_button.dart';
import 'widgets/order_info.dart';

class OrderCheck extends ConsumerStatefulWidget {
  final bool isActive;
  final bool isOrder;
  final GlobalKey<ScaffoldState>? globalKey;
  final OrderStatus orderStatus;
  final CustomColorSet colors;

  const OrderCheck({
    super.key,
    required this.colors,
    required this.isActive,
    required this.isOrder,
    required this.orderStatus,
    this.globalKey,
  });

  @override
  ConsumerState<OrderCheck> createState() => _OrderCheckState();
}

class _OrderCheckState extends ConsumerState<OrderCheck> {
  bool _isCashDialogShown = false;

  _createOrder(
      {required OrderState state,
      required OrderNotifier event,
      required ShopOrderState stateOrderShop,
      required ShopOrderNotifier eventShopOrder,
      required ViewMapState stateMap,
      required PaymentState paymentState,
      required OrdersListNotifier eventOrderList}) {
    if (!((AppHelpers.getPaymentType() == "admin")
        ? (paymentState.payments.isNotEmpty)
        : (state.shopData?.shopPayments?.isNotEmpty ?? false))) {
      AppHelpers.showCheckTopSnackBarInfo(
        context,
        AppHelpers.getTranslation(TrKeys.youCantCreateOrder),
      );
    } else if (state.selectDate == null) {
      AppHelpers.showCheckTopSnackBarInfo(
        context,
        AppHelpers.getTranslation(TrKeys.notWorkTodayAndTomorrow),
      );
    } else {
      event.createOrder(
        context: context,
        data: OrderBodyData(
            walletId: state.walletPrice ==
                    num.tryParse(
                        state.calculateData?.totalPrice?.toStringAsFixed(2) ??
                            '')
                ? paymentState.wallet?.id
                : paymentState.selectPaymentData?.id,
            cashChange: paymentState.cashChange,
            walletPrice:
                state.walletPrice == num.tryParse(state.calculateData?.totalPrice?.toStringAsFixed(2) ?? '')
                    ? 0
                    : state.walletPrice,
            cartId: stateOrderShop.cart?.id ?? 0,
            shopId: state.shopData?.id ?? 0,
            coupon: state.promoCode,
            deliveryFee: state.calculateData?.deliveryFee ?? 0,
            deliveryType: state.tabIndex == 0
                ? DeliveryTypeEnum.delivery
                : DeliveryTypeEnum.pickup,
            location: Location(
                longitude: stateMap.place?.location?.firstOrNull ??
                    LocalStorage.getAddressSelected()?.location?.lastOrNull ??
                    AppConstants.demoLongitude,
                latitude: stateMap.place?.location?.lastOrNull ??
                    LocalStorage.getAddressSelected()?.location?.firstOrNull ??
                    AppConstants.demoLatitude),
            address: AddressInformation(
              address:
                  "${stateMap.place?.title ?? LocalStorage.getAddressSelected()?.title ?? ""}, ${stateMap.place?.address ?? LocalStorage.getAddressSelected()?.address?.address ?? ""}",
              house: state.house ??
                  LocalStorage.getAddressSelected()?.address?.house,
              floor: state.floor ??
                  LocalStorage.getAddressSelected()?.address?.floor,
              office: state.office ??
                  LocalStorage.getAddressSelected()?.address?.office,
            ),
            note: state.note,
            deliveryDate:
                "${state.selectDate?.year ?? 0}-${(state.selectDate?.month ?? 0).toString().padLeft(2, '0')}-${(state.selectDate?.day ?? 0).toString().padLeft(2, '0')}",
            deliveryTime: state.selectTime?.hour.toString().length == 2
                ? "${state.selectTime?.hour}:${state.selectTime?.minute.toString().padLeft(2, '0')}"
                : "0${state.selectTime?.hour}:${state.selectTime?.minute.toString().padLeft(2, '0')}"),
        payment: paymentState.selectPaymentData ?? PaymentData(),
        onSuccess: () {
          // widget.controllerCenter?.play();
          eventShopOrder.getCart(context, () {}, isOrder: true);
          eventOrderList.fetchActiveOrders(context);
          ref.read(profileProvider.notifier).fetchUser(context);
        },
        onWebview: (s, v) {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => WebViewPage(url: s)),
          ).whenComplete(() {});
        },
      );
      Delayed(milliseconds: 700).run(() {
        eventShopOrder.getCart(context, () {});
        eventOrderList.fetchActiveOrders(context);
      });
    }
  }

  _checkShopOrder() {
    AppHelpers.showAlertDialog(
      context: context,
      child: (colors) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            AppHelpers.getTranslation(TrKeys.allPreviouslyAdded),
            style: AppStyle.interNormal(
              color: colors.textBlack,
            ),
            textAlign: TextAlign.center,
          ),
          16.verticalSpace,
          Row(
            children: [
              Expanded(
                child: CustomButton(
                    title: AppHelpers.getTranslation(TrKeys.cancel),
                    background: AppStyle.transparent,
                    borderColor: AppStyle.borderColor,
                    textColor: AppStyle.red,
                    onPressed: () {
                      Navigator.pop(context);
                    }),
              ),
              10.horizontalSpace,
              Expanded(
                child: Consumer(
                  builder: (contextTwo, ref, child) {
                    return CustomButton(
                      isLoading: ref.watch(shopOrderProvider).isDeleteLoading,
                      title: AppHelpers.getTranslation(TrKeys.clearAll),
                      textColor: colors.textBlack,
                      onPressed: () {
                        ref
                            .read(shopOrderProvider.notifier)
                            .deleteCart(context);
                        ref.read(orderProvider.notifier).repeatOrder(
                              context: context,
                              shopId: 0,
                              listOfProduct:
                                  ref.watch(orderProvider).orderData?.details ??
                                      [],
                              onSuccess: () {
                                ref.read(shopOrderProvider.notifier).getCart(
                                  context,
                                  isStart: true,
                                  isShowLoading: true,
                                  () {
                                    context.maybePop();
                                    context.pushRoute(const OrderRoute());
                                  },
                                );
                              },
                            );
                      },
                    );
                  },
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: widget.colors.buttonColor,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(10.r),
          topRight: Radius.circular(10.r),
        ),
      ),
      padding: EdgeInsets.symmetric(vertical: 16.h),
      child: Consumer(
        builder: (context, ref, child) {
          final state = ref.watch(orderProvider);
          final event = ref.read(orderProvider.notifier);
          ref.listen(orderProvider, (previous, next) {
            if (next.isCheckShopOrder &&
                (next.isCheckShopOrder !=
                    (previous?.isCheckShopOrder ?? false))) {
              _checkShopOrder();
            }
          });
          num subTotal = 0;
          state.orderData?.details?.forEach((element) {
            subTotal = subTotal + (element.totalPrice ?? 0);
          });
          return Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              widget.isOrder
                  ? OrderInfo(colors: widget.colors)
                  : CardAndPromo(colors: widget.colors),
              if (!widget.isOrder && (state.walletPrice ?? 0) != 0)
                Padding(
                  padding: REdgeInsets.symmetric(vertical: 6, horizontal: 12),
                  child: WalletItem(
                    colors: widget.colors,
                    isActive: (state.walletPrice ?? 0) != 0,
                    totalPrice: state.walletPrice,
                    onTap: () {
                      if ((state.walletPrice ?? 0) != 0 ||
                          (LocalStorage.getWalletData()?.price ?? 0) <= 0) {
                        ref.read(orderProvider.notifier).setWalletPrice(null);
                        return;
                      }
                      AppHelpers.showAlertDialog(
                        context: context,
                        child: (colors) => WalletPayDialog(
                          totalPrice: state.calculateData?.totalPrice,
                          onChange: (price) {
                            ref
                                .read(orderProvider.notifier)
                                .setWalletPrice(price);
                          },
                          colors: colors,
                        ),
                      );
                    },
                  ),
                ),
              PriceInformation(
                isOrder: widget.isOrder,
                subTotal: subTotal,
                state: state,
                colors: widget.colors,
              ),
              DeliveryInfo(
                colors: widget.colors,
              ),
              if (widget.isOrder)
                ...?state.orderData?.transactions
                    ?.map((e) => OrderPaymentContainerNew(
                          isOrder: widget.isOrder,
                          price: e.price,
                          colors: widget.colors,
                          onTap: () {
                            AppHelpers.showCustomModalBottomSheet(
                              context: context,
                              modal: PaymentMethods(colors: widget.colors),
                              isDrag: true,
                              radius: 12,
                              isDarkMode: false,
                            );
                          },
                          icon: Icon(
                            e.paymentSystem?.tag == 'wallet'
                                ? FlutterRemix.wallet_3_fill
                                : e.paymentSystem?.tag == 'cash'
                                    ? FlutterRemix.money_dollar_circle_line
                                    : FlutterRemix.bank_card_2_line,
                            color: widget.colors.textBlack,
                          ),
                          title:
                              "${e.paymentSystem?.tag ?? ''} (${AppHelpers.getTranslation(e.status ?? '')})",
                        )),
              26.verticalSpace,
              if (state.shopData?.open == false ||
                  state.shopData?.shopWorkingDays
                          ?.firstWhere(
                            (element) =>
                                AppHelpers.getDayNumber(element.day ?? '') ==
                                DateTime.now().weekday,
                          )
                          .disabled ==
                      true)
                Padding(
                  padding: EdgeInsets.only(left: 16.r),
                  child: Text(
                    AppHelpers.getTranslation(TrKeys.shopText),
                    style: AppStyle.interNormal(
                      color: widget.colors.textBlack,
                    ),
                  ),
                ),
              10.verticalSpace,
              Padding(
                padding: EdgeInsets.only(
                  bottom: MediaQuery.of(context).padding.bottom,
                  right: 16.w,
                  left: 16.w,
                ),
                child: OrderButton(
                  isOpen: state.shopData?.open == true &&
                      state.shopData?.shopWorkingDays
                              ?.firstWhere(
                                (element) =>
                                    AppHelpers.getDayNumber(
                                        element.day ?? '') ==
                                    DateTime.now().weekday,
                              )
                              .disabled ==
                          false,
                  autoOrder: () {
                    AppHelpers.showCustomModalBottomSheet(
                      context: context,
                      modal: AutoOrderModal(
                        colors: widget.colors,
                        repeatData: state.orderData?.repeat,
                        orderId: state.orderData?.id ?? 0,
                        time: TimeService.timeFormat(
                            state.orderData?.createdAt ?? DateTime.now()),
                      ),
                      isDarkMode: false,
                    );
                  },
                  showImage: state.orderData?.afterDeliveredImage != null
                      ? () {
                          AppHelpers.showAlertDialog(
                            context: context,
                            child: (colors) => ImageDialog(
                              img: state.orderData?.afterDeliveredImage,
                              colors: colors,
                            ),
                          );
                        }
                      : null,
                  isRepeatLoading: state.isAddLoading,
                  isLoading:
                      ref.watch(shopOrderProvider).isAddAndRemoveLoading ||
                          state.isButtonLoading,
                  isOrder: widget.isOrder,
                  orderStatus: widget.orderStatus,
                  createOrder: () {
                    if (ref.watch(paymentProvider).selectPaymentData?.tag ==
                            'cash' &&
                        !_isCashDialogShown &&
                        state.walletPrice !=
                            num.tryParse(
                              state.calculateData?.totalPrice
                                      ?.toStringAsFixed(2) ??
                                  '',
                            )) {
                      AppHelpers.showAlertDialog(
                        context: context,
                        child: (colors) => CashModalWidget(
                          colors: colors,
                          onTap: () {
                            _isCashDialogShown = true;
                            Navigator.pop(context);
                            _createOrder(
                              state: state,
                              stateMap: ref.watch(viewMapProvider),
                              stateOrderShop: ref.watch(shopOrderProvider),
                              event: event,
                              eventShopOrder:
                                  ref.read(shopOrderProvider.notifier),
                              paymentState: ref.watch(paymentProvider),
                              eventOrderList:
                                  ref.read(ordersListProvider.notifier),
                            );
                          },
                        ),
                      );
                      return;
                    }

                    _createOrder(
                      state: state,
                      stateMap: ref.watch(viewMapProvider),
                      stateOrderShop: ref.watch(shopOrderProvider),
                      event: event,
                      eventShopOrder: ref.read(shopOrderProvider.notifier),
                      paymentState: ref.watch(paymentProvider),
                      eventOrderList: ref.read(ordersListProvider.notifier),
                    );
                  },
                  cancelOrder: () {
                    AppHelpers.showAlertDialog(
                      context: context,
                      child: (colors) => Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            AppHelpers.getTranslation(TrKeys.cancelOderTitle),
                            style: AppStyle.interNormal(
                              color: colors.textBlack,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          14.verticalSpace,
                          SizedBox(
                            height: 48.r,
                            child: Row(
                              children: [
                                Expanded(
                                  child: CustomButton(
                                    title: AppHelpers.getTranslation(TrKeys.no),
                                    onPressed: () {
                                      Navigator.pop(context);
                                    },
                                    background: colors.transparent,
                                    textColor: colors.textBlack,
                                    borderColor: colors.borderColor,
                                  ),
                                ),
                                8.horizontalSpace,
                                Expanded(
                                  child: CustomButton(
                                    title:
                                        AppHelpers.getTranslation(TrKeys.yes),
                                    onPressed: () {
                                      Navigator.pop(context);
                                      event.cancelOrder(
                                        context,
                                        state.orderData?.id ?? 0,
                                      );
                                    },
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                  callShop: () async {
                    final Uri launchUri = Uri(
                      scheme: 'tel',
                      path: state.orderData?.shop?.phone ?? "",
                    );
                    await launchUrl(launchUri);
                  },
                  callDriver: () async {
                    if (state.orderData?.deliveryMan != null) {
                      final Uri launchUri = Uri(
                        scheme: 'tel',
                        path: state.orderData?.deliveryMan?.phone ?? "",
                      );
                      await launchUrl(launchUri);
                    } else {
                      AppHelpers.showCheckTopSnackBarInfo(
                        context,
                        AppHelpers.getTranslation(TrKeys.noDriver),
                      );
                    }
                  },
                  sendSmsDriver: () async {
                    if (state.orderData?.deliveryMan != null) {
                      final Uri launchUri = Uri(
                        scheme: 'sms',
                        path: state.orderData?.deliveryMan?.phone ?? "",
                      );
                      await launchUrl(launchUri);
                    } else {
                      AppHelpers.showCheckTopSnackBarInfo(
                        context,
                        AppHelpers.getTranslation(TrKeys.noDriver),
                      );
                    }
                  },
                  isRefund: (state.orderData?.refunds?.isEmpty ?? true) ||
                      state.orderData?.refunds?.first.status == "canceled",
                  repeatOrder: () {
                    event.repeatOrder(
                      context: context,
                      shopId: ref.watch(shopOrderProvider).cart?.shopId ?? 0,
                      listOfProduct: state.orderData?.details ?? [],
                      onSuccess: () {
                        ref.read(shopOrderProvider.notifier).getCart(
                          context,
                          isRepeat: true,
                          () {
                            context.maybePop();
                            context.pushRoute(const OrderRoute());
                          },
                        );
                      },
                    );
                  },
                  colors: widget.colors,
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
