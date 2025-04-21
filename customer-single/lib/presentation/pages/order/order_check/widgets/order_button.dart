import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/application/payment_methods/payment_provider.dart';
import 'package:riverpodtemp/application/shop_order/shop_order_provider.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/enums.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/buttons/custom_button.dart';
import 'package:riverpodtemp/presentation/pages/order/order_check/widgets/refund_screen.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';
import '../../../../../application/order/order_provider.dart';

class OrderButton extends StatelessWidget {
  final bool isOrder;
  final bool isOpen;
  final bool isLoading;
  final bool isRepeatLoading;
  final OrderStatus orderStatus;
  final VoidCallback createOrder;
  final VoidCallback cancelOrder;
  final VoidCallback repeatOrder;
  final VoidCallback callShop;
  final VoidCallback callDriver;
  final VoidCallback? showImage;
  final VoidCallback sendSmsDriver;
  final CustomColorSet colors;
  final VoidCallback autoOrder;
  final bool isRefund;

  const OrderButton({
    super.key,
    required this.isOrder,
    required this.orderStatus,
    required this.createOrder,
    required this.isLoading,
    required this.cancelOrder,
    required this.callShop,
    required this.callDriver,
    required this.sendSmsDriver,
    required this.isRefund,
    required this.repeatOrder,
    required this.isRepeatLoading,
    this.showImage,
    required this.autoOrder,
    required this.colors,
    required this.isOpen,
  });

  @override
  Widget build(BuildContext context) {
    if (isOrder) {
      switch (orderStatus) {
        case OrderStatus.onWay:
          return Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              SizedBox(
                width: (MediaQuery.sizeOf(context).width - 60) / 2,
                child: CustomButton(
                  isLoading: isLoading,
                  background: colors.scaffoldColor,
                  title: AppHelpers.getTranslation(TrKeys.callTheDriver),
                  onPressed: callDriver,
                ),
              ),
              SizedBox(
                width: (MediaQuery.sizeOf(context).width - 60) / 2,
                child: CustomButton(
                  isLoading: isLoading,
                  background: colors.scaffoldColor,
                  title: AppHelpers.getTranslation(TrKeys.sendMessage),
                  onPressed: sendSmsDriver,
                ),
              ),
            ],
          );
        case OrderStatus.open:
          return CustomButton(
            isLoading: isLoading,
            background: AppStyle.red,
            textColor: colors.textBlack,
            title: AppHelpers.getTranslation(TrKeys.cancelOrder),
            onPressed: cancelOrder,
          );
        case OrderStatus.accepted:
          return CustomButton(
            isLoading: isLoading,
            background: colors.black,
            textColor: colors.white,
            title: AppHelpers.getTranslation(TrKeys.callCenterRestaurant),
            onPressed: callShop,
          );
        case OrderStatus.ready:
          return CustomButton(
            isLoading: isLoading,
            background: colors.textBlack,
            textColor: colors.textBlack,
            title: AppHelpers.getTranslation(TrKeys.callCenterRestaurant),
            onPressed: callShop,
          );
        case OrderStatus.delivered:
          return isRefund
              ? Column(
                  children: [
                    if (showImage != null)
                      Padding(
                        padding: REdgeInsets.only(bottom: 8.0),
                        child: GestureDetector(
                          onTap: showImage,
                          child: Container(
                            margin: EdgeInsets.only(top: 8.h),
                            decoration: BoxDecoration(
                              color: AppStyle.transparent,
                              border:
                                  Border.all(color: colors.textBlack, width: 2),
                              borderRadius: BorderRadius.circular(10.r),
                            ),
                            padding: REdgeInsets.all(16),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  AppHelpers.getTranslation(TrKeys.orderImage),
                                  style: AppStyle.interNormal(
                                    size: 14.sp,
                                    color: colors.textBlack,
                                    letterSpacing: -0.3,
                                  ),
                                ),
                                12.horizontalSpace,
                                const Icon(FlutterRemix.gallery_fill),
                              ],
                            ),
                          ),
                        ),
                      ),
                    10.verticalSpace,
                    CustomButton(
                      isLoading: isRepeatLoading,
                      background: AppStyle.transparent,
                      borderColor: colors.textBlack,
                      textColor: colors.textBlack,
                      title: AppHelpers.getTranslation(TrKeys.autoOrder),
                      onPressed: autoOrder,
                    ),
                    10.verticalSpace,
                    CustomButton(
                      isLoading: isRepeatLoading,
                      background: AppStyle.transparent,
                      borderColor: colors.textBlack,
                      textColor: colors.textBlack,
                      title: AppHelpers.getTranslation(TrKeys.repeatOrder),
                      onPressed: repeatOrder,
                    ),
                    10.verticalSpace,
                    CustomButton(
                      isLoading: isLoading,
                      title: AppHelpers.getTranslation(TrKeys.reFound),
                      background: AppStyle.red,
                      textColor: colors.textBlack,
                      onPressed: () {
                        AppHelpers.showCustomModalBottomSheet(
                          context: context,
                          modal: RefundScreen(colors: colors),
                          isDarkMode: false,
                        );
                      },
                    ),
                  ],
                )
              : const SizedBox.shrink();
        case OrderStatus.canceled:
          return const SizedBox.shrink();
      }
    } else {
      return Consumer(builder: (context, ref, child) {
        final bool isNotEmptyCart = (ref
                .watch(shopOrderProvider)
                .cart
                ?.userCarts
                ?.first
                .cartDetails
                ?.isNotEmpty ??
            false);
        final bool isNotEmptyPaymentType = ((AppHelpers.getPaymentType() ==
                "admin")
            ? (ref.watch(paymentProvider).payments.isNotEmpty)
            : (ref.watch(orderProvider).shopData?.shopPayments?.isNotEmpty ??
                false));
        final active = (ref.watch(orderProvider).shopData?.open ?? false) && ref.watch(orderProvider).selectDate != null;
        return CustomButton(
          isLoading: isLoading,
          background: isNotEmptyCart || isNotEmptyPaymentType
              ? (ref.watch(orderProvider).tabIndex == 0 ||
                      (ref.watch(orderProvider).selectDate != null)
                  ? AppStyle.primary
                  : AppStyle.bgGrey)
              : AppStyle.primary,
          textColor: isNotEmptyCart || isNotEmptyPaymentType
              ? (ref.watch(orderProvider).tabIndex == 0 ||
                      (ref.watch(orderProvider).selectDate != null)
                  ? colors.textBlack
                  : AppStyle.textGrey)
              : colors.textBlack,
          title: !active
              ? AppHelpers.getTranslation(TrKeys.notWorkToday)
              : (ref.watch(orderProvider)).walletPrice ==
              num.tryParse(
                  (ref.watch(orderProvider)).calculateData?.totalPrice?.toStringAsFixed(2) ??
                      '')
              ? AppHelpers.getTranslation(TrKeys.orderNow)
              : "${AppHelpers.getTranslation(TrKeys.continueToPayment)} — ${AppHelpers.numberFormat(
            (num.tryParse((ref.watch(orderProvider)).calculateData?.totalPrice
                ?.toStringAsFixed(2) ??
                '') ??
                0) - ((ref.watch(orderProvider)).walletPrice ?? 0),
          )}",
          onPressed: isOpen ? createOrder : null,
        );
      });
    }
  }
}
