import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:riverpodtemp/application/order/order_provider.dart';
import 'package:riverpodtemp/infrastructure/models/data/address_new_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/time_service.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/sellect_address_screen.dart';
import 'package:riverpodtemp/presentation/components/text_fields/outline_bordered_text_field.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';
import '../../../../../application/home/home_provider.dart';
import '../../order_check/widgets/time_delivery.dart';
import 'order_container.dart';

class OrderDelivery extends StatefulWidget {
  final ValueChanged<bool> onChange;
  final VoidCallback getLocation;
  final int shopId;
  final CustomColorSet colors;

  const OrderDelivery({
    super.key,
    required this.onChange,
    required this.getLocation,
    required this.shopId,
    required this.colors,
  });

  @override
  State<OrderDelivery> createState() => _OrderDeliveryState();
}

class _OrderDeliveryState extends State<OrderDelivery> {
  late TextEditingController officeController;
  late TextEditingController houseController;
  late TextEditingController floorController;
  late TextEditingController commentController;

  @override
  void initState() {
    officeController = TextEditingController(
        text: LocalStorage.getAddressSelected()?.address?.office);
    houseController = TextEditingController(
        text: LocalStorage.getAddressSelected()?.address?.house);
    floorController = TextEditingController(
        text: LocalStorage.getAddressSelected()?.address?.floor);
    commentController = TextEditingController();
    super.initState();
  }

  @override
  void dispose() {
    officeController.dispose();
    houseController.dispose();
    floorController.dispose();
    commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(top: 24.h),
      child: SingleChildScrollView(
        child: Consumer(builder: (context, ref, child) {
          final addressData = ref.watch(homeProvider).addressData;
          return Column(
            children: [
              OrderContainer(
                onTap: () async {
                  AppHelpers.showCustomModalBottomSheet(
                    context: context,
                    modal: SelectAddressScreen(
                      colors: widget.colors,
                      addAddress: () async {
                        context.maybePop();
                        await context.pushRoute(ViewMapRoute());
                        widget.getLocation();
                        officeController.text =
                            LocalStorage.getAddressInformation()?.office ?? '';
                        houseController.text =
                            LocalStorage.getAddressInformation()?.house ?? '';
                        floorController.text =
                            LocalStorage.getAddressInformation()?.floor ?? '';
                      },
                      onSuccess: (AddressNewModel? value) {
                        officeController.text = value?.address?.office ?? '';
                        houseController.text = value?.address?.house ?? '';
                        floorController.text = value?.address?.floor ?? '';
                      },
                      onDelete: () {
                        houseController.text =
                            LocalStorage.getAddressInformation()?.house ?? '';
                        floorController.text =
                            LocalStorage.getAddressInformation()?.floor ?? '';
                      },
                    ),
                    isDarkMode: false,
                  );
                },
                icon: Padding(
                  padding: EdgeInsets.only(left: 4.w),
                  child: SvgPicture.asset(
                    "assets/svgs/adress.svg",
                    width: 20.w,
                    height: 20.h,
                    colorFilter: ColorFilter.mode(
                      widget.colors.textBlack,
                      BlendMode.srcIn,
                    ),
                  ),
                ),
                title: AppHelpers.getTranslation(TrKeys.deliveryAddress),
                description:
                    "${addressData?.title ?? ""}${addressData?.title?.isEmpty ?? true ? '' : ','} ${(addressData?.address?.address?.trim().length ?? 0) > 2 ? addressData?.address?.address?.trim().substring(0, 1) == ',' ? addressData?.address?.address?.trim().replaceFirst(',', '') : addressData?.address?.address : addressData?.address?.address?.trim() ?? ''}",
                colors: widget.colors,
              ),
              10.verticalSpace,
              OrderContainer(
                onTap: () {
                  AppHelpers.showCustomModalBottomSheet(
                    paddingTop: MediaQuery.of(context).padding.top + 150.h,
                    context: context,
                    modal: TimeDelivery(colors: widget.colors),
                    isDarkMode: false,
                    isDrag: true,
                    radius: 12,
                  );
                },
                icon: Icon(
                  FlutterRemix.calendar_check_line,
                  color: widget.colors.textBlack,
                ),
                title: AppHelpers.getTranslation(TrKeys.timeDelivery),
                description: ref.watch(orderProvider).selectDate == null
                    ? AppHelpers.getTranslation(TrKeys.notWorkTodayAndTomorrow)
                    : "${TimeService.dateFormatMD(ref.watch(orderProvider).selectDate!)} , ${TimeService.timeFormatTime('${ref.watch(orderProvider).selectTime?.hour.toString().padLeft(2, '0')}-${ref.watch(orderProvider).selectTime?.minute.toString().padLeft(2, '0')}')}",
                colors: widget.colors,
              ),
              20.verticalSpace,
              OutlinedBorderTextField(
                label: AppHelpers.getTranslation(TrKeys.office).toUpperCase(),
                textController: officeController,
                onChanged: (s) {
                  ref.read(orderProvider.notifier).setAddressInfo(office: s);
                },
              ),
              16.verticalSpace,
              OutlinedBorderTextField(
                label: AppHelpers.getTranslation(TrKeys.house).toUpperCase(),
                textController: houseController,
                onChanged: (s) {
                  ref.read(orderProvider.notifier).setAddressInfo(house: s);
                },
              ),
              16.verticalSpace,
              OutlinedBorderTextField(
                label: AppHelpers.getTranslation(TrKeys.floor).toUpperCase(),
                textController: floorController,
                onChanged: (s) {
                  ref.read(orderProvider.notifier).setAddressInfo(floor: s);
                },
              ),
              16.verticalSpace,
              OutlinedBorderTextField(
                label: AppHelpers.getTranslation(TrKeys.comment).toUpperCase(),
                textController: commentController,
                onChanged: (s) {
                  ref.read(orderProvider.notifier).setAddressInfo(note: s);
                },
              ),
            ],
          );
        }),
      ),
    );
  }
}
