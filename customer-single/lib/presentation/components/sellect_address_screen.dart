import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'package:riverpodtemp/application/home/home_provider.dart';
import 'package:riverpodtemp/application/order/order_provider.dart';
import 'package:riverpodtemp/application/profile/profile_provider.dart';
import 'package:riverpodtemp/application/shop_order/shop_order_provider.dart';
import 'package:riverpodtemp/infrastructure/models/data/address_information.dart';
import 'package:riverpodtemp/infrastructure/models/data/address_new_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/enums.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/buttons/custom_button.dart';
import 'package:riverpodtemp/presentation/components/keyboard_dismisser.dart';
import 'package:riverpodtemp/presentation/components/loading.dart';
import 'package:riverpodtemp/presentation/components/sellect_address_item.dart';
import 'package:riverpodtemp/presentation/components/title_icon.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class SelectAddressScreen extends ConsumerStatefulWidget {
  final VoidCallback addAddress;
  final ValueChanged<AddressNewModel?>? onSuccess;
  final VoidCallback? onDelete;
  final CustomColorSet colors;

  const SelectAddressScreen({
    required this.colors,
    super.key,
    required this.addAddress,
    this.onSuccess,
    this.onDelete,
  });

  @override
  ConsumerState<SelectAddressScreen> createState() =>
      _SelectAddressScreenState();
}

class _SelectAddressScreenState extends ConsumerState<SelectAddressScreen> {
  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(profileProvider.notifier)
        ..findSelectIndex()
        ..fetchUserAddress(context);
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final bool isLtr = LocalStorage.getLangLtr();
    final state = ref.watch(profileProvider);
    return Directionality(
      textDirection: isLtr ? TextDirection.ltr : TextDirection.rtl,
      child: KeyboardDismisser(
        child: Container(
          decoration: BoxDecoration(
            color: widget.colors.scaffoldColor,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(16.r),
              topRight: Radius.circular(16.r),
            ),
          ),
          width: double.infinity,
          child: SingleChildScrollView(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.w),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  8.verticalSpace,
                  Center(
                    child: Container(
                      height: 4.h,
                      width: 48.w,
                      decoration: BoxDecoration(
                        color: AppStyle.dragElement,
                        borderRadius: BorderRadius.all(
                          Radius.circular(40.r),
                        ),
                      ),
                    ),
                  ),
                  24.verticalSpace,
                  TitleAndIcon(
                    title: AppHelpers.getTranslation(TrKeys.selectAddress),
                    paddingHorizontalSize: 0,
                    titleSize: 18,
                  ),
                  24.verticalSpace,
                  if (state.isLoadingUserAddress)
                    Loading()
                  else
                    ListView.builder(
                      padding: EdgeInsets.zero,
                      physics: const NeverScrollableScrollPhysics(),
                      shrinkWrap: true,
                      itemCount: state.userData?.addresses?.length ?? 0,
                      itemBuilder: (context, index) {
                        return SelectAddressItem(
                          colors: widget.colors,
                          onTap: () {
                            ref.read(profileProvider.notifier).change(index);
                          },
                          isActive:
                              ref.watch(profileProvider).selectAddress == index,
                          address: ref
                              .watch(profileProvider)
                              .userData
                              ?.addresses?[index],
                          update: () async {
                            context.maybePop();
                            bool? res = await context.router.push(
                              ViewMapRoute(
                                address: ref
                                    .watch(profileProvider)
                                    .userData
                                    ?.addresses?[index],
                                indexAddress: index,
                              ),
                            );
                            if (res ?? false) {
                              widget.onDelete?.call();
                            }
                            if (context.mounted) {
                              ref.read(profileProvider.notifier).fetchUser(
                                context,
                                onSuccess: () {
                                  ref
                                      .read(profileProvider.notifier)
                                      .findSelectIndex();
                                },
                              );
                            }
                          },
                        );
                      },
                    ),
                  16.verticalSpace,
                  CustomButton(
                    background: AppStyle.transparent,
                    borderColor: widget.colors.textBlack,
                    textColor: widget.colors.textBlack,
                    title: AppHelpers.getTranslation(TrKeys.addAddress),
                    onPressed: () {
                      widget.addAddress.call();
                    },
                  ),
                  16.verticalSpace,
                  CustomButton(
                    title: AppHelpers.getTranslation(TrKeys.save),
                    onPressed: () {
                      final addressModel = ref
                          .watch(profileProvider)
                          .userData
                          ?.addresses?[ref.watch(profileProvider).selectAddress]
                          .address;
                      final addressDetail =
                          ref.watch(profileProvider).userData?.addresses?[
                              ref.watch(profileProvider).selectAddress];
                      ref.read(profileProvider.notifier).setActiveAddress(
                            index: ref.watch(profileProvider).selectAddress,
                            id: ref
                                .watch(profileProvider)
                                .userData
                                ?.addresses?[
                                    ref.watch(profileProvider).selectAddress]
                                .id,
                          );
                      final address = AddressNewModel(
                        title: addressDetail?.title ?? "",
                        address: AddressInformation(
                          address: addressModel?.address ?? "",
                          house: addressModel?.house,
                          floor: addressModel?.floor,
                          office: addressModel?.office,
                        ),
                        location: [
                          addressDetail?.location?.last,
                          addressDetail?.location?.first,
                        ],
                      );
                      LocalStorage.setAddressSelected(address);
                      ref.read(homeProvider.notifier)
                        ..fetchBannerPage(
                          context,
                          RefreshController(),
                          isRefresh: true,
                        )
                        // ..fetchRestaurantPage(context, RefreshController(),
                        //     isRefresh: true)
                        // ..fetchShopPageRecommend(context, RefreshController(),
                        //     isRefresh: true)
                        // ..fetchShopPage(context, RefreshController(),
                        //     isRefresh: true)
                        ..fetchStorePage(context, RefreshController(),
                            isRefresh: true)
                        // ..fetchRestaurantPageNew(context, RefreshController(),
                        //     isRefresh: true)
                        ..fetchCategoriesPage(context, RefreshController(),
                            isRefresh: true)
                        ..setAddress();
                      ref.read(orderProvider.notifier).getCalculate(
                            context: context,
                            isLoading: false,
                            cartId: ref.read(shopOrderProvider).cart?.id ?? 0,
                            type: ref.read(orderProvider).tabIndex == 1
                                ? DeliveryTypeEnum.pickup
                                : DeliveryTypeEnum.delivery,
                          );
                      widget.onSuccess?.call(address);
                      context.maybePop();
                    },
                  ),
                  32.verticalSpace,
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
