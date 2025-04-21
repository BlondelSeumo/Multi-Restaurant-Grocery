import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/application/wallet/wallet_provider.dart';
import 'package:riverpodtemp/infrastructure/models/data/user.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/app_validators.dart';
import 'package:riverpodtemp/infrastructure/services/tpying_delay.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/buttons/custom_button.dart';
import 'package:riverpodtemp/presentation/components/loading.dart';
import 'package:riverpodtemp/presentation/components/modal_drag.dart';
import 'package:riverpodtemp/presentation/components/modal_wrap.dart';
import 'package:riverpodtemp/presentation/components/text_fields/currency_input.dart';
import 'package:riverpodtemp/presentation/components/text_fields/text_field.dart';
import 'package:riverpodtemp/presentation/pages/profile/widgets/user_item.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme_wrapper.dart';

import '../../../application/profile/profile_provider.dart';

class SendPriceScreen extends ConsumerStatefulWidget {
  const SendPriceScreen({super.key});

  @override
  ConsumerState<SendPriceScreen> createState() => _SenPriceScreenState();
}

class _SenPriceScreenState extends ConsumerState<SendPriceScreen> {
  final GlobalKey<FormState> form = GlobalKey<FormState>();
  final delayed = Delayed(milliseconds: 700);
  late TextEditingController priceController;
  late TextEditingController userController;
  UserModel? user;

  @override
  void initState() {
    priceController = TextEditingController();
    userController = TextEditingController();
    WidgetsBinding.instance.addPostFrameCallback((_) {});
    super.initState();
  }

  @override
  void dispose() {
    priceController.dispose();
    userController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(walletProvider);
    final notifier = ref.read(walletProvider.notifier);
    return ThemeWrapper(
      builder: (colors, controller) => ModalWrap(
        color: colors.scaffoldColor,
        child: Padding(
          padding: REdgeInsets.symmetric(horizontal: 16),
          child: Form(
            key: form,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ModalDrag(),
                Text(
                  AppHelpers.getTranslation(TrKeys.send),
                  style: AppStyle.interNormal(color: colors.textBlack),
                ),
                16.verticalSpace,
                CurrencyTextField(
                  colors: colors,
                  controller: priceController,
                ),
                16.verticalSpace,
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      CustomTextField(
                        hintText: TrKeys.searchUser,
                        validator: AppValidators.emptyCheck,
                        controller: userController,
                        onChange: (text) {
                          delayed.run(() {
                            notifier.searchUser(
                                context: context,
                                search: text,
                                isRefresh: true);
                          });
                        },
                      ),
                      Expanded(
                        child: state.isSearchingLoading
                            ? Loading()
                            : ListView.builder(
                                padding: EdgeInsets.only(top: 16.r),
                                itemCount: state.listOfUser?.length ?? 0,
                                shrinkWrap: true,
                                itemBuilder: (context, index) {
                                  return UserItem(
                                    colors: colors,
                                    user: state.listOfUser?[index],
                                    onTap: () {
                                      userController.text =
                                          "${state.listOfUser?[index].firstname ?? ""} ${state.listOfUser?[index].lastname ?? ""}";
                                      user = state.listOfUser?[index];
                                    },
                                    isSelected: false,
                                  );
                                },
                              ),
                      )
                    ],
                  ),
                ),
                CustomButton(
                  isLoading: state.isButtonLoading,
                  title: AppHelpers.getTranslation(TrKeys.pay),
                  textColor: colors.textBlack,
                  onPressed: () {
                    if ((form.currentState?.validate() ?? false) &&
                        priceController.text.isNotEmpty) {
                      notifier.sendWallet(
                          context: context,
                          price: priceController.text,
                          onSuccess: () {
                            notifier.fetchTransactions(
                                context: context, isRefresh: true);
                            ref
                                .read(profileProvider.notifier)
                                .fetchUser(context);
                            Navigator.pop(context);
                          },
                          uuid: user?.uuid ?? '');
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
