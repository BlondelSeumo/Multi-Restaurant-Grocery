import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/application/order/order_provider.dart';
import 'package:riverpodtemp/application/payment_methods/payment_provider.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/enums.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/buttons/custom_button.dart';
import 'package:riverpodtemp/presentation/pages/order/order_check/widgets/cash_item.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class CashModalWidget extends StatefulWidget {
  final CustomColorSet colors;
  final VoidCallback onTap;

  const CashModalWidget({
    super.key,
    required this.colors,
    required this.onTap,
  });

  @override
  State<CashModalWidget> createState() => _CashModalWidgetState();
}

class _CashModalWidgetState extends State<CashModalWidget> {
  ValueNotifier<Cash> type = ValueNotifier(Cash.no);

  late TextEditingController controller;

  @override
  void initState() {
    controller = TextEditingController();
    super.initState();
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder(
      valueListenable: type,
      builder: (context, value, child) {
        return SizedBox(
          width: .9.sw,
          child: Consumer(
            builder: (context, ref, child) => Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  AppHelpers.getTranslation(TrKeys.cashTitle),
                  style: AppStyle.interNormal(
                    color: widget.colors.textBlack,
                  ),
                ),
                16.verticalSpace,
                CashItem(
                  title:
                      '${AppHelpers.getTranslation(TrKeys.iHaveExactly)} ${AppHelpers.numberFormat(
                    (ref.watch(orderProvider).calculateData?.totalPrice ?? 0) -
                        (ref.watch(orderProvider).walletPrice ?? 0),
                  )}',
                  onTap: () {
                    type.value = Cash.no;
                  },
                  isActive: type.value == Cash.no,
                  colors: widget.colors,
                  type: value,
                  subTitle: AppHelpers.getTranslation(TrKeys.theCourier),
                ),
                Divider(thickness: 1, color: widget.colors.divider),
                10.verticalSpace,
                CashItem(
                  title: AppHelpers.getTranslation(TrKeys.exactAmount),
                  subTitle: AppHelpers.getTranslation(TrKeys.chooseTheAmount),
                  textEditingController: controller,
                  onTap: () {
                    type.value = Cash.yes;
                  },
                  isActive: type.value == Cash.yes,
                  colors: widget.colors,
                  type: value,
                  onChange: (value) =>
                      ref.read(paymentProvider.notifier).setCashChange(value),
                ),
                18.verticalSpace,
                CustomButton(
                  radius: 10,
                  title: TrKeys.done,
                  onPressed: widget.onTap,
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
