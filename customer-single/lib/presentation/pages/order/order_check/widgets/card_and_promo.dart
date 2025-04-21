import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/application/order/order_provider.dart';
import 'package:riverpodtemp/application/payment_methods/payment_provider.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/pages/order/order_check/widgets/promo_code.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

import 'payment_method.dart';
import 'order_payment_container.dart';

class CardAndPromo extends StatelessWidget {
  final CustomColorSet colors;

  const CardAndPromo({super.key, required this.colors});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.w),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Consumer(
            builder: (context, ref, child) {
              return OrderPaymentContainer(
                onTap: () {
                  AppHelpers.showCustomModalBottomSheet(
                    paddingTop: MediaQuery.of(context).padding.top,
                    context: context,
                    modal: PaymentMethods(colors: colors),
                    isDarkMode: false,
                    isDrag: true,
                    radius: 12,
                  );
                },
                icon: Icon(
                  FlutterRemix.bank_card_fill,
                  color: ((AppHelpers.getPaymentType() == "admin")
                          ? (ref.watch(paymentProvider).payments.isNotEmpty)
                          : (ref
                                  .watch(orderProvider)
                                  .shopData
                                  ?.shopPayments
                                  ?.isNotEmpty ??
                              false))
                      ? AppStyle.primary
                      : colors.textBlack,
                ),
                title: ((AppHelpers.getPaymentType() == "admin")
                        ? (ref.watch(paymentProvider).payments.isNotEmpty)
                        : (ref
                                .watch(orderProvider)
                                .shopData
                                ?.shopPayments
                                ?.isNotEmpty ??
                            false))
                    ? ((AppHelpers.getPaymentType() == "admin")
                        ? (ref.watch(paymentProvider).selectPaymentData?.tag ??
                            '')
                        : (ref.watch(paymentProvider).selectPaymentData?.tag ??
                            ''))
                    : AppHelpers.getTranslation(TrKeys.noPaymentType),
                isActive: ((AppHelpers.getPaymentType() == "admin")
                    ? (ref.watch(paymentProvider).payments.isNotEmpty)
                    : (ref
                            .watch(orderProvider)
                            .shopData
                            ?.shopPayments
                            ?.isNotEmpty ??
                        false)),
                colors: colors,
              );
            },
          ),
          Consumer(builder: (context, ref, child) {
            return OrderPaymentContainer(
              colors: colors,
              onTap: () {
                AppHelpers.showCustomModalBottomSheet(
                  paddingTop: MediaQuery.of(context).padding.top,
                  context: context,
                  modal: const PromoCodeScreen(),
                  isDarkMode: false,
                  isDrag: true,
                  radius: 12,
                );
              },
              isActive: ref.watch(orderProvider).promoCode != null,
              icon: Icon(
                FlutterRemix.ticket_line,
                color: ref.watch(orderProvider).promoCode == null
                    ? colors.primary
                    : colors.primary,
              ),
              title: ref.watch(orderProvider).promoCode ??
                  AppHelpers.getTranslation(TrKeys.youHavePromoCode),
            );
          }),
        ],
      ),
    );
  }
}
