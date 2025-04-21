import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/application/home/home_provider.dart';
import 'package:riverpodtemp/infrastructure/models/data/address_new_data.dart';
import 'package:riverpodtemp/app_constants.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/buttons/custom_button.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class AddAddress extends StatelessWidget {
  final CustomColorSet colors;

  const AddAddress({
    super.key,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          AppHelpers.getTranslation(TrKeys.agreeLocation),
          style: AppStyle.interSemi(
            size: 16.sp,
            color: colors.textBlack,
          ),
          textAlign: TextAlign.center,
        ),
        24.verticalSpace,
        Row(
          children: [
            Expanded(
              child: CustomButton(
                textColor: colors.textBlack,
                title: AppHelpers.getTranslation(TrKeys.cancel),
                borderColor: colors.textBlack,
                background: AppStyle.transparent,
                onPressed: () {
                  Navigator.pop(context);
                  context.pushRoute(ViewMapRoute());
                },
              ),
            ),
            24.horizontalSpace,
            Expanded(
              child: Consumer(
                builder: (context, ref, child) {
                  return CustomButton(
                    title: AppHelpers.getTranslation(TrKeys.yes),
                    textColor: colors.textBlack,
                    onPressed: () {
                      Navigator.pop(context);
                      LocalStorage.setAddressSelected(
                        AddressNewModel(
                          location: [
                            (AppHelpers.getInitialLatitude() ??
                                AppConstants.demoLatitude),
                            (AppHelpers.getInitialLongitude() ??
                                AppConstants.demoLongitude),
                          ],
                          title: AppHelpers.getAppAddressName(),
                        ),
                      );
                      ref.read(homeProvider.notifier).setAddress();
                    },
                  );
                },
              ),
            ),
          ],
        )
      ],
    );
  }
}
