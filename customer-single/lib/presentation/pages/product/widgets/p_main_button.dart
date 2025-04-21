import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/application/product/product_notifier.dart';
import 'package:riverpodtemp/application/product/product_state.dart';
import 'package:riverpodtemp/application/shop_order/shop_order_notifier.dart';
import 'package:riverpodtemp/application/shop_order/shop_order_state.dart';
import 'package:riverpodtemp/infrastructure/models/data/addons_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/buttons/custom_button.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class ProductMainButton extends StatelessWidget {
  final ShopOrderNotifier eventOrderShop;
  final ShopOrderState stateOrderShop;
  final ProductState state;
  final ProductNotifier event;
  final CustomColorSet colors;

  const ProductMainButton({
    super.key,
    required this.state,
    required this.event,
    required this.stateOrderShop,
    required this.eventOrderShop,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    num sumTotalPrice = 0;
    state.selectedStock?.addons?.forEach((element) {
      if (element.active ?? false) {
        sumTotalPrice += ((element.product?.stock?.totalPrice ?? 0) *
            (element.quantity ?? 1));
      }
    });
    sumTotalPrice =
        (sumTotalPrice + (state.selectedStock?.totalPrice ?? 0) * state.count);
    return Container(
      height: 110.h,
      color: colors.buttonColor,
      padding: EdgeInsets.only(
        right: 16.w,
        left: 16.w,
        bottom: MediaQuery.of(context).padding.bottom,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            height: 50.h,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.all(Radius.circular(10.r)),
              border: Border.all(color: AppStyle.textGrey),
            ),
            child: Row(
              children: [
                GestureDetector(
                  onTap: () {
                    event.disCount(context);
                  },
                  child: Padding(
                    padding:
                        EdgeInsets.symmetric(vertical: 8.h, horizontal: 10.w),
                    child: Icon(
                      Icons.remove,
                      color: colors.textBlack,
                    ),
                  ),
                ),
                Text(
                  state.count.toString(),
                  style: AppStyle.interSemi(
                    size: 14,
                    color: colors.textBlack,
                  ),
                ),
                GestureDetector(
                  onTap: () {
                    event.addCount(context);
                  },
                  child: Padding(
                    padding:
                        EdgeInsets.symmetric(vertical: 8.h, horizontal: 10.w),
                    child: Icon(
                      Icons.add,
                      color: colors.textBlack,
                    ),
                  ),
                ),
              ],
            ),
          ),
          8.horizontalSpace,
          SizedBox(
            width: 120.w,
            child: CustomButton(
              isLoading: state.isAddLoading,
              textColor: colors.textBlack,
              title: AppHelpers.getTranslation(TrKeys.add),
              onPressed: () {
                if (LocalStorage.getToken().isNotEmpty) {
                  event.createCart(
                      context,
                      stateOrderShop.cart?.shopId ??
                          (state.productData!.shopId ?? 0), () {
                    Navigator.pop(context);
                    eventOrderShop.getCart(context, () {}, isStart: true);
                  });
                } else {
                  List<Addons> list = [];
                  state.selectedStock?.addons?.forEach((element) {
                    if (element.active ?? false) {
                      list.add(element);
                    }
                  });
                  eventOrderShop.addCountLocal(
                    context: context,
                    product: state.productData,
                    stock: state.selectedStock?.copyWith(addons: list),
                  );
                  Navigator.pop(context);
                }
              },
            ),
          ),
          const SizedBox(
            width: 5,
          ),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  AppHelpers.getTranslation(TrKeys.total),
                  style: AppStyle.interNormal(
                    size: 14,
                    color: colors.textBlack,
                  ),
                ),
                Text(
                  AppHelpers.numberFormat(sumTotalPrice),
                  style: AppStyle.interNoSemi(
                    size: 23,
                    color: colors.textBlack,
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}
