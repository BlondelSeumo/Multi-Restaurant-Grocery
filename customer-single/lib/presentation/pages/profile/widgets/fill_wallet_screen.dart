import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/application/profile/profile_provider.dart';
import 'package:riverpodtemp/application/wallet/wallet_provider.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/buttons/custom_button.dart';
import 'package:riverpodtemp/presentation/components/modal_drag.dart';
import 'package:riverpodtemp/presentation/components/text_fields/currency_input.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme_wrapper.dart';

import '../../../components/modal_wrap.dart';

class FillWalletScreen extends ConsumerStatefulWidget {
  const FillWalletScreen({super.key});

  @override
  ConsumerState<FillWalletScreen> createState() => _FillWalletScreenState();
}

class _FillWalletScreenState extends ConsumerState<FillWalletScreen> {
  final GlobalKey<FormState> form = GlobalKey<FormState>();
  late TextEditingController priceController;

  @override
  void initState() {
    priceController = TextEditingController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(walletProvider.notifier).fetchPayments(context: context);
    });
    super.initState();
  }

  @override
  void dispose() {
    priceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(walletProvider);
    final notifier = ref.read(walletProvider.notifier);
    return ThemeWrapper(
      builder: (colors, controller) => ModalWrap(
        color: colors.scaffoldColor,
        child: Form(
          key: form,
          child: Padding(
            padding: REdgeInsets.symmetric(horizontal: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ModalDrag(),
                Text(
                  AppHelpers.getTranslation(TrKeys.fillWallet),
                  style: AppStyle.interNormal(color: colors.textBlack),
                ),
                16.verticalSpace,
                CurrencyTextField(
                  controller: priceController,
                  colors: colors,
                ),
                16.verticalSpace,
                Expanded(
                  child: ListView.builder(
                    padding: EdgeInsets.zero,
                    itemCount: state.payments?.length ?? 0,
                    shrinkWrap: true,
                    itemBuilder: (context, index) {
                      return InkWell(
                        onTap: () => notifier.selectPayment(index: index),
                        child: Column(
                          children: [
                            8.verticalSpace,
                            Row(
                              children: [
                                Icon(
                                  state.selectPayment == index
                                      ? FlutterRemix.checkbox_circle_fill
                                      : FlutterRemix.checkbox_blank_circle_line,
                                  color: state.selectPayment == index
                                      ? AppStyle.primary
                                      : colors.textBlack,
                                ),
                                10.horizontalSpace,
                                Text(
                                  AppHelpers.getTranslation(
                                      state.payments?[index].tag ?? ""),
                                  style: AppStyle.interNormal(
                                    size: 14,
                                    color: colors.textBlack,
                                  ),
                                )
                              ],
                            ),
                            const Divider(),
                            8.verticalSpace
                          ],
                        ),
                      );
                    },
                  ),
                ),
                16.verticalSpace,
                CustomButton(
                  isLoading: state.isButtonLoading,
                  textColor: colors.textBlack,
                  title: AppHelpers.getTranslation(TrKeys.pay),
                  onPressed: () {
                    if(priceController.text=='0') {
                      AppHelpers.showCheckTopSnackBarInfo(
                        context,
                        TrKeys.anotherNumber,
                      );
                      return;
                    }
                    if ((form.currentState?.validate() ?? false) &&
                        priceController.text.isNotEmpty) {
                      if (state.payments?.isEmpty ?? true) {
                        AppHelpers.showCheckTopSnackBar(
                          context,
                          TrKeys.noPaymentMethods,
                        );
                        return;
                      }
                      notifier.fillWallet(
                        context: context,
                        price: priceController.text.replaceAll(' ', ''),
                        onSuccess: () {
                          Navigator.pop(context);
                          notifier.fetchTransactions(
                            context: context,
                            isRefresh: true,
                          );
                          ref.read(profileProvider.notifier).fetchUser(context);
                          if ((state.payments?[state.selectPayment].tag ==
                              TrKeys.maksekeskus)) {
                            Navigator.pop(context);
                          }
                        },
                      );
                    } else {
                      AppHelpers.showCheckTopSnackBarInfo(
                        context,
                        AppHelpers.getTranslation(TrKeys.paymentNotSelected),
                      );
                    }
                  },
                ),
                28.verticalSpace,
              ],
            ),
          ),
        ),
      ),
    );
  }
}
