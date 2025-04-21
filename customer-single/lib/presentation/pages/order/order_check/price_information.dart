import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/application/order/order_state.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';
import 'widgets/title_price.dart';

class PriceInformation extends StatelessWidget {
  final bool isOrder;
  final num subTotal;
  final OrderState state;
  final CustomColorSet colors;

  const PriceInformation({
    super.key,
    required this.isOrder,
    required this.subTotal,
    required this.state,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        30.verticalSpace,
        TitleAndPrice(
          title: AppHelpers.getTranslation(TrKeys.subtotal),
          rightTitle: AppHelpers.numberFormat(
            isOrder
                ? ((state.orderData?.totalPrice ?? 0) -
                    (state.orderData?.deliveryFee ?? 0) -
                    (state.orderData?.tax ?? 0) +
                    (state.orderData?.totalDiscount ?? 0))
                : ((state.calculateData?.totalPrice ?? 0) -
                    (state.calculateData?.deliveryFee ?? 0) -
                    (state.calculateData?.totalShopTax ?? 0) +
                    (state.calculateData?.totalDiscount ?? 0)),
          ),
          textStyle: AppStyle.interRegular(
            size: 16,
            color: colors.textBlack,
          ),
          colors: colors,
        ),
        16.verticalSpace,
        Builder(builder: (context) {
          return TitleAndPrice(
            title: AppHelpers.getTranslation(TrKeys.deliveryPrice),
            rightTitle: AppHelpers.numberFormat(
              isOrder
                  ? (state.orderData?.deliveryFee ?? 0)
                  : (state.calculateData?.deliveryFee ?? 0),
            ),
            textStyle: AppStyle.interRegular(
              size: 16,
              color: colors.textBlack,
            ),
            colors: colors,
          );
        }),
        16.verticalSpace,
        if ((isOrder
                ? ((state.orderData?.tax ?? 0))
                : (state.calculateData?.totalShopTax ?? 0)) !=
            0)
          Column(
            children: [
              TitleAndPrice(
                title: AppHelpers.getTranslation(TrKeys.tax),
                rightTitle: AppHelpers.numberFormat(
                  isOrder
                      ? ((state.orderData?.tax ?? 0))
                      : (state.calculateData?.totalShopTax ?? 0),
                  symbol: isOrder
                      ? state.orderData?.currencyModel?.symbol
                      : LocalStorage.getSelectedCurrency().symbol,
                ),
                textStyle: AppStyle.interRegular(
                  size: 16,
                  color: colors.textBlack,
                ),
                colors: colors,
              ),
              16.verticalSpace,
            ],
          ),
        if ((state.orderData?.tips ?? 0) != 0)
          Column(
            children: [
              TitleAndPrice(
                title: AppHelpers.getTranslation(TrKeys.deliveryTips),
                rightTitle: AppHelpers.numberFormat(
                  state.orderData?.tips,
                  symbol: isOrder
                      ? state.orderData?.currencyModel?.symbol
                      : LocalStorage.getSelectedCurrency().symbol,
                ),
                textStyle: AppStyle.interRegular(
                  size: 16,
                  color: colors.textBlack,
                ),
                colors: colors,
              ),
              16.verticalSpace,
            ],
          ),
        if ((isOrder
                ? (state.orderData?.totalDiscount ?? 0)
                : (state.calculateData?.totalDiscount ?? 0)) !=
            0)
          Column(
            children: [
              TitleAndPrice(
                title: AppHelpers.getTranslation(TrKeys.discount),
                rightTitle: AppHelpers.numberFormat(
                  isOrder
                      ? (state.orderData?.totalDiscount ?? 0)
                      : (state.calculateData?.totalDiscount ?? 0),
                  symbol: isOrder
                      ? state.orderData?.currencyModel?.symbol
                      : LocalStorage.getSelectedCurrency().symbol,
                ),
                textStyle: AppStyle.interRegular(
                  size: 16,
                  color: AppStyle.red,
                ),
                colors: colors,
              ),
              16.verticalSpace,
            ],
          ),
        if ((isOrder
                ? (state.orderData?.coupon?.price ?? 0)
                : (state.calculateData?.couponPrice ?? 0)) !=
            0)
          TitleAndPrice(
            title: AppHelpers.getTranslation(TrKeys.promoCode),
            rightTitle: "-${AppHelpers.numberFormat(
              isOrder
                  ? (state.orderData?.coupon?.price ?? 0)
                  : (state.calculateData?.couponPrice ?? 0),
              symbol: isOrder
                  ? state.orderData?.currencyModel?.symbol
                  : LocalStorage.getSelectedCurrency().symbol,
            )}",
            textStyle: AppStyle.interRegular(
              size: 16,
              color: AppStyle.red,
            ),
            colors: colors,
          ),
        10.verticalSpace,
        const Divider(
          color: AppStyle.textGrey,
        ),
        16.verticalSpace,
        TitleAndPrice(
          title: AppHelpers.getTranslation(TrKeys.total),
          rightTitle: AppHelpers.numberFormat(
            isOrder
                ? (state.orderData?.totalPrice ?? 0)
                : (state.calculateData?.totalPrice ?? 0),
            symbol: isOrder
                ? state.orderData?.currencyModel?.symbol
                : LocalStorage.getSelectedCurrency().symbol,
          ),
          textStyle: AppStyle.interSemi(
            size: 20,
            color: colors.textBlack,
          ),
          colors: colors,
        ),
        10.verticalSpace,
        if ((isOrder ? 0 : state.walletPrice) != 0 &&
            state.walletPrice != null) ...[
          Divider(color: colors.divider),
          10.verticalSpace,
          TitleAndPrice(
            colors: colors,
            title: TrKeys.wallet,
            rightTitle: AppHelpers.numberFormat(
              isOrder ? 0 : state.walletPrice,
              symbol: isOrder
                  ? state.orderData?.currencyModel?.symbol
                  : LocalStorage.getSelectedCurrency().symbol,
            ),
            textStyle: AppStyle.interRegular(
              size: 16,
              color: AppStyle.red,
            ),
          ),
        ]
      ],
    );
  }
}
