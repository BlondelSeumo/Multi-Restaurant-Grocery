// ignore_for_file: use_build_context_synchronously

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'package:riverpodtemp/application/home/home_notifier.dart';
import 'package:riverpodtemp/application/home/home_state.dart';
import 'package:riverpodtemp/infrastructure/models/data/address_new_data.dart';
import 'package:riverpodtemp/infrastructure/models/data/shop_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/app_bars/common_app_bar.dart';
import 'package:riverpodtemp/presentation/components/sellect_address_screen.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

import '../../routes/app_router.dart';
import 'widgets/select_branch.dart';

class AppBarHome extends StatelessWidget {
  final HomeState state;
  final HomeNotifier event;
  final RefreshController refreshController;
  final CustomColorSet colors;

  const AppBarHome({
    super.key,
    required this.state,
    required this.event,
    required this.refreshController,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return CommonAppBar(
      child: InkWell(
        onTap: () {
          if (LocalStorage.getToken().isEmpty) {
            context.pushRoute(ViewMapRoute());
            return;
          }
          AppHelpers.showCustomModalBottomSheet(
            context: context,
            modal: SelectAddressScreen(
              colors: colors,
              addAddress: () async {
                Navigator.pop(context);
                await context.pushRoute(ViewMapRoute());
              },
              onSuccess: (AddressNewModel? value) {},
            ),
            isDarkMode: false,
          );

          // dynamic isCheck = await context.pushRoute(ViewMapRoute());
          // if (isCheck) {
          //   event.checkBranch(context);
          //   event.setAddress();
          // }
        },
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            Expanded(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: colors.buttonColor,
                    ),
                    padding: EdgeInsets.all(12.r),
                    child: SvgPicture.asset(
                      "assets/svgs/adress.svg",
                      colorFilter:
                          ColorFilter.mode(colors.textBlack, BlendMode.srcIn),
                    ),
                  ),
                  10.horizontalSpace,
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text(
                          AppHelpers.getTranslation(TrKeys.deliveryAddress),
                          style: AppStyle.interNormal(
                            size: 12,
                            color: AppStyle.textGrey,
                          ),
                        ),
                        SizedBox(
                          width: MediaQuery.sizeOf(context).width / 2 - 60.r,
                          child: Builder(
                            builder: (context) {
                              return Text(
                                "${state.addressData?.title ?? ""}${state.addressData?.title?.isEmpty ?? true ? '' : ','} ${state.addressData?.address?.address ?? ""}",
                                style: AppStyle.interBold(
                                  size: 14,
                                  color: colors.textBlack,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              );
                            }
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Container(
              height: 32.h,
              width: 1.w,
              color: AppStyle.textGrey,
            ),
            8.horizontalSpace,
            Expanded(
              child: InkWell(
                onTap: () {
                  AppHelpers.showCustomModalBottomSheet(
                    paddingTop: 300,
                    context: context,
                    modal: SelectBranch(colors: colors),
                    isDarkMode: false,
                  );
                  refreshController.resetNoData();
                },
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Text(
                      AppHelpers.getTranslation(TrKeys.branch),
                      style: AppStyle.interNormal(
                        size: 12,
                        color: AppStyle.textGrey,
                      ),
                    ),
                    !state.isBranchesLoading
                        ? Text(
                            state.branches
                                    .firstWhere((element) {
                                      return element.id == state.selectBranchId;
                                    }, orElse: () {
                                      return ShopData();
                                    })
                                    .translation
                                    ?.title ??
                                "",
                            style: AppStyle.interBold(
                              size: 14,
                              color: colors.textBlack,
                            ),
                            maxLines: 1,
                          )
                        : const SizedBox.shrink(),
                  ],
                ),
              ),
            ),
            Icon(
              Icons.keyboard_arrow_down_sharp,
              color: colors.textBlack,
            )
          ],
        ),
      ),
    );
  }
}
