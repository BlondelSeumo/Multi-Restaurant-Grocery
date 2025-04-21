import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/second_button.dart';
import 'package:riverpodtemp/presentation/components/text_fields/currency_input.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

import '../../../../../infrastructure/services/app_helpers.dart';
import '../../../../theme/app_style.dart';

class WalletPayDialog extends StatefulWidget {
  final CustomColorSet colors;
  final num? totalPrice;
  final ValueChanged<num?>? onChange;

  const WalletPayDialog(
      {super.key, required this.colors, this.totalPrice, this.onChange});

  @override
  State<WalletPayDialog> createState() => _WalletPayDialogState();
}

class _WalletPayDialogState extends State<WalletPayDialog> {
  TextEditingController controller = TextEditingController();
  num? maxPrice;

  @override
  void initState() {
    if ((widget.totalPrice ?? 1) >= (LocalStorage.getWalletData()?.price ?? 1)) {
      maxPrice = LocalStorage.getWalletData()?.price;
    } else {
      maxPrice = num.tryParse(widget.totalPrice?.toStringAsFixed(2) ?? '');
    }

    controller = TextEditingController(
        text: '${maxPrice ?? 1}');
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          AppHelpers.getTranslation(TrKeys.youCanPayFullAmount),
          style: AppStyle.interNormal(color: widget.colors.textBlack),
          textAlign: TextAlign.center,
        ),
        12.verticalSpace,
        Text(
          AppHelpers.getTranslation(TrKeys.wantToPartiallyWallet),
          style:
              AppStyle.interRegular(color: widget.colors.textBlack, size: 14),
          textAlign: TextAlign.center,
        ),
        12.verticalSpace,
        // Text(
        //   AppHelpers.numberFormat(totalPrice),
        //   style: AppStyle.interNoSemi(color: colors.primary),
        //   textAlign: TextAlign.center,
        // ),
        CurrencyTextField(
          colors: widget.colors,
          controller: controller,
          onChange: (val) {
            if (val?.isNotEmpty ?? false) {
              if (num.parse(val!) >= (maxPrice ?? 1)) {
                controller.text = "${(maxPrice ?? 1)}";
              }
            }
          },
        ),
        12.verticalSpace,
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '${AppHelpers.getTranslation("remaining.wallet.balance")}: ',
              style: AppStyle.interNormal(
                  color: widget.colors.textBlack, size: 14),
              textAlign: TextAlign.center,
            ),
            Flexible(
              child: Text(
                AppHelpers.numberFormat(
                  LocalStorage.getWalletData()?.price),
                style: AppStyle.interNoSemi(
                    color: widget.colors.textBlack, size: 14),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
        12.verticalSpace,
        Row(
          children: [
            Expanded(
              child: SecondButton(
                title: TrKeys.no,
                bgColor: widget.colors.newBoxColor,
                titleColor: widget.colors.textBlack,
                onTap: () {
                  Navigator.pop(context);
                },
              ),
            ),
            12.horizontalSpace,
            Expanded(
              child: SecondButton(
                title: TrKeys.yesPay,
                bgColor: widget.colors.primary,
                titleColor: widget.colors.textBlack,
                onTap: () {
                  if((num.tryParse(controller.text) ?? 0) <1 ){
                    AppHelpers.showCheckTopSnackBar(context, AppHelpers.getTranslation(TrKeys.minQty1));
                    return;
                  }
                  widget.onChange?.call(num.tryParse(controller.text));
                  Navigator.pop(context);
                },
              ),
            ),
          ],
        )
      ],
    );
  }
}
