import 'package:auto_route/auto_route.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import 'package:riverpodtemp/application/reservation/reservation_provider.dart';
import 'package:riverpodtemp/application/shop/shop_provider.dart';
import 'package:riverpodtemp/infrastructure/models/response/reservation_request.dart';
import 'package:riverpodtemp/infrastructure/models/response/table_response.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/input_formatter.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/time_service.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/buttons/custom_button.dart';
import 'package:riverpodtemp/presentation/components/buttons/pop_button.dart';
import 'package:riverpodtemp/presentation/components/custom_network_image.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import 'package:riverpodtemp/presentation/components/loading.dart';
import 'package:riverpodtemp/presentation/components/text_fields/outline_bordered_text_field.dart';
import 'package:riverpodtemp/presentation/pages/order/order_type/widgets/order_container.dart';
import 'package:riverpodtemp/presentation/pages/profile/widgets/reservation_time_modal.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';

@RoutePage()
class ReservationPage extends ConsumerStatefulWidget {
  const ReservationPage({super.key});

  @override
  ConsumerState<ReservationPage> createState() => _ReservationPageState();
}

class _ReservationPageState extends ConsumerState<ReservationPage> {
  late ValueNotifier<TextEditingController> birthDay;
  MainClass? selectItemZone;
  ShopSectionData? selectItemTable;
  late final TextEditingController guestsController;

  @override
  void initState() {
    guestsController = TextEditingController();
    birthDay = ValueNotifier(
      TextEditingController(
        text: TimeService.dateFormatDMYs(DateTime.now())
      ),
    );
    WidgetsBinding.instance.addPostFrameCallback(
      (_) {
        ref.read(shopProvider.notifier).fetchShop(
          context,
          LocalStorage.getShopId(),
          onSuccess: (data) {
            ref.read(reservationProvider.notifier).setShopWorkingDay(
                  shopWorkingDay: data?.shopWorkingDays,
                );
          },
        );
        // ref.read(shopProvider.notifier).fetchShopMain(
        //   context,
        //   onSuccess: (data) {
        //     ref.read(reservationProvider.notifier).setShopWorkingDay(
        //           shopWorkingDay: data?.shopWorkingDays,
        //         );
        //   },
        // );
        ref.read(reservationProvider.notifier)
          ..getReservations(context)
          ..fetchBookings(shopId: ref.read(shopProvider).shopData?.id);
      },
    );
    super.initState();
  }

  @override
  void dispose() {
    guestsController.dispose();
    birthDay.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(reservationProvider);
    final event = ref.read(reservationProvider.notifier);

    return CustomScaffold(
      body: (colors) => state.isLoading
          ? Center(child: Loading())
          : SingleChildScrollView(
              child: Column(
                children: [
                  30.verticalSpace,
                  Container(
                    margin: EdgeInsets.all(10.r),
                    padding: EdgeInsets.all(20.r),
                    decoration: BoxDecoration(
                      color: AppStyle.white,
                      borderRadius: BorderRadius.circular(10.r),
                    ),
                    child: Column(
                      children: [
                        Center(
                          child: Container(
                            padding: EdgeInsets.all(10.r),
                            decoration: BoxDecoration(
                              color: AppStyle.arrowRightProfileButton,
                              borderRadius: BorderRadius.circular(8.r),
                            ),
                            child: CustomNetworkImage(
                              url: state.sections.firstOrNull?.img ?? '',
                              height: 60.r,
                              width: 60.r,
                              radius: 30,
                            ),
                          ),
                        ),
                        20.verticalSpace,
                        Text(
                          state.sections.lastOrNull?.shop?.translation?.title ??
                              '',
                          style: AppStyle.interNormal(),
                        ),
                        6.verticalSpace,
                        Text(
                          state.sections.lastOrNull?.shop?.translation
                                  ?.address ??
                              '',
                          style: AppStyle.interNormal(),
                        ),
                        20.verticalSpace,
                        ValueListenableBuilder(
                          valueListenable: birthDay,
                          builder: (context, value, child) {
                            return OutlinedBorderTextField(
                              onTap: () {
                                AppHelpers.showCustomModalBottomSheet(
                                  context: context,
                                  modal: Container(
                                    height: 250.h,
                                    padding: const EdgeInsets.only(top: 6.0),
                                    margin: EdgeInsets.only(
                                      bottom: MediaQuery.of(context)
                                          .viewInsets
                                          .bottom,
                                    ),
                                    decoration: BoxDecoration(
                                        color: AppStyle.buttonColor,
                                        borderRadius:
                                            BorderRadius.circular(12.r)),
                                    child: SafeArea(
                                      top: false,
                                      child: CupertinoTheme(
                                        data: CupertinoThemeData(
                                          textTheme: CupertinoTextThemeData(
                                            dateTimePickerTextStyle:
                                                AppStyle.interNormal(
                                              color: AppStyle.textGrey,
                                              size: 18,
                                            ),
                                          ),
                                        ),
                                        child: CupertinoDatePicker(
                                          backgroundColor: AppStyle.buttonColor,
                                          initialDateTime:
                                              TimeService.dateFormatYMD(
                                                  DateTime.tryParse(
                                                      value.text)),
                                          maximumDate: DateTime(2050),
                                          mode: CupertinoDatePickerMode.date,
                                          minimumDate: DateTime(
                                            DateTime.now().year,
                                            DateTime.now().month,
                                            DateTime.now().day,
                                          ),
                                          itemExtent: 30.r,
                                          minimumYear: 2025,
                                          use24hFormat: true,
                                          onDateTimeChanged:
                                              (DateTime newDate) {
                                            if (newDate.isBefore(DateTime(
                                                DateTime.now().year,
                                                DateTime.now().month,
                                                DateTime.now().day))) {
                                              return;
                                            }
                                            event.setSelectedData(newDate);
                                            birthDay.value.text =
                                                TimeService.dateFormatDMYs(
                                                    newDate);
                                          },
                                        ),
                                      ),
                                    ),
                                  ),
                                  isDarkMode: false,
                                );
                              },
                              readOnly: true,
                              label:
                                  AppHelpers.getTranslation(TrKeys.dateOfBirth)
                                      .toUpperCase(),
                              hint: "YYYY-MMM-DD",
                              validation: (s) {
                                if (s?.isNotEmpty ?? false) {
                                  return null;
                                }
                                return AppHelpers.getTranslation(
                                  TrKeys.canNotBeEmpty,
                                );
                              },
                              textController: value,
                            );
                          },
                        ),
                        30.verticalSpace,
                        if (state.sections.firstOrNull?.translations != null)
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      AppHelpers.getTranslation(TrKeys.zona),
                                      style: AppStyle.interNormal(
                                        size: 9,
                                        color: AppStyle.black,
                                      ),
                                    ),
                                    Container(
                                      height: 48.r,
                                      decoration: BoxDecoration(
                                        border: Border(
                                          bottom: BorderSide(
                                              color:
                                                  AppStyle.differBorderColor),
                                        ),
                                      ),
                                      child: PopupMenuButton<MainClass>(
                                        elevation: 1,
                                        offset: Offset(48.r, 48.r),
                                        itemBuilder: (context) {
                                          return state.sections
                                              .map(
                                                (e) => PopupMenuItem(
                                                  value: e,
                                                  onTap: () {},
                                                  child: Text(
                                                    e.translation?.title ?? '',
                                                    style: AppStyle.interNormal(
                                                      color: AppStyle.black,
                                                    ),
                                                  ),
                                                ),
                                              )
                                              .toList();
                                        },
                                        onSelected: (value) {
                                          selectItemZone = value;
                                          event.getTables(
                                              context: context,
                                              shopSectionId:
                                                  selectItemZone?.id);
                                          setState(() {});
                                        },
                                        child: Padding(
                                          padding: EdgeInsets.all(6.r),
                                          child: Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.spaceBetween,
                                            children: [
                                              Text(
                                                selectItemZone
                                                        ?.translation?.title ??
                                                    '',
                                              ),
                                              Icon(FlutterRemix
                                                  .arrow_down_s_line),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              14.horizontalSpace,
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      AppHelpers.getTranslation(TrKeys.table),
                                      style: AppStyle.interNormal(
                                        size: 9,
                                        color: AppStyle.black,
                                      ),
                                    ),
                                    Container(
                                      height: 48.r,
                                      decoration: BoxDecoration(
                                        border: Border(
                                          bottom: BorderSide(
                                            color: AppStyle.differBorderColor,
                                          ),
                                        ),
                                      ),
                                      child: PopupMenuButton<ShopSectionData>(
                                        elevation: 1,
                                        offset: Offset(48.r, 48.r),
                                        itemBuilder: (context) {
                                          return state.data
                                              .map(
                                                (e) => PopupMenuItem(
                                                  value: e,
                                                  onTap: () {},
                                                  child: Text(
                                                    e.name ?? '',
                                                    style: AppStyle.interNormal(
                                                      color: AppStyle.black,
                                                    ),
                                                  ),
                                                ),
                                              )
                                              .toList();
                                        },
                                        onSelected: (value) {
                                          selectItemTable = value;
                                          setState(() {});
                                        },
                                        child: Padding(
                                          padding: EdgeInsets.all(6.r),
                                          child: Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.spaceBetween,
                                            children: [
                                              Text(
                                                selectItemTable?.name ?? '',
                                              ),
                                              Icon(FlutterRemix
                                                  .arrow_down_s_line),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        20.verticalSpace,
                        OutlinedBorderTextField(
                          textController: guestsController,
                          inputType: TextInputType.phone,
                          inputFormatters: [
                            InputFormatter.digitsOnly,
                          ],
                          label: AppHelpers.getTranslation(TrKeys.guests)
                              .toUpperCase(),
                          validation: (s) {
                            if (s?.isNotEmpty ?? false) {
                              return null;
                            }
                            return AppHelpers.getTranslation(
                              TrKeys.canNotBeEmpty,
                            );
                          },
                        ),
                        20.verticalSpace,
                        OrderContainer(
                          onTap: () {
                            if (selectItemTable?.id == null) return;
                            AppHelpers.showCustomModalBottomSheet(
                              paddingTop:
                                  MediaQuery.of(context).padding.top + 150.h,
                              context: context,
                              modal: ReservationTime(
                                id: selectItemTable!.id,
                                colors: colors,
                              ),
                              isDarkMode: false,
                              isDrag: true,
                              radius: 12,
                            );
                          },
                          icon: const Icon(FlutterRemix.calendar_check_line),
                          title:
                              AppHelpers.getTranslation(TrKeys.reservationTime),
                          description: state.timesInterval
                                      ?.contains(state.selectedTime) ??
                                  false
                              ? TimeService.timeFormatTime(state.selectedTime?.start?.replaceAll(':', '-'))
                              : TrKeys.chooseTime,
                          colors: colors,
                        ),
                        10.verticalSpace,
                        if (state.selectedTime != null)
                          CustomButton(
                            title: TrKeys.submit,
                            isLoading: state.isSendLoading,
                            onPressed: () {
                              if (state.bookingId == null) {
                                ref
                                    .read(reservationProvider.notifier)
                                    .fetchBookings(
                                      shopId:
                                          ref.read(shopProvider).shopData?.id,
                                    );
                                // AppHelpers.showCheckTopSnackBar(
                                //   context,
                                //   TrKeys.couldYouMakeBooking,
                                // );
                                return;
                              }
                              event.sendReservationTime(
                                tableId: selectItemTable?.id,
                                guest: int.tryParse(guestsController.text) ?? 0,
                                bookingId: state.bookingId,
                                onSuccess: () {
                                  Navigator.pop(context);
                                },
                              );
                            },
                          ),
                      ],
                    ),
                  )
                ],
              ),
            ),
      floatingButton: (colors) => Padding(
        padding: EdgeInsets.symmetric(horizontal: 16.w),
        child: PopButton(colors: colors),
      ),
      floatingButtonLocation: FloatingActionButtonLocation.startFloat,
    );
  }
}
