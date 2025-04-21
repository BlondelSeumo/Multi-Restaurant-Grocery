// import 'package:flutter/material.dart';
// import 'package:flutter_riverpod/flutter_riverpod.dart';
// import 'package:flutter_screenutil/flutter_screenutil.dart';
//
// import 'package:riverpodtemp/application/order/order_provider.dart';
// import 'package:riverpodtemp/application/order/order_state.dart';
// import 'package:riverpodtemp/application/order_time/time_state.dart';
// import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
// import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
// import 'package:riverpodtemp/presentation/components/custom_tab_bar.dart';
// import 'package:riverpodtemp/presentation/components/select_item.dart';
// import 'package:riverpodtemp/presentation/components/title_icon.dart';
// import 'package:riverpodtemp/presentation/theme/app_style.dart';
// import 'package:riverpodtemp/presentation/theme/theme.dart';
//
// import '../../../../../../application/order_time/time_notifier.dart';
// import '../../../../../../application/order_time/time_provider.dart';
//
// class TimeDelivery extends ConsumerStatefulWidget {
//   final CustomColorSet colors;
//
//   const TimeDelivery({required this.colors, super.key});
//
//   @override
//   ConsumerState<TimeDelivery> createState() => _TimeDeliveryState();
// }
//
// class _TimeDeliveryState extends ConsumerState<TimeDelivery>
//     with TickerProviderStateMixin {
//   late TimeNotifier event;
//   late TimeState state;
//   late OrderState stateOrder;
//   late TabController _tabController;
//   final _tabs = [
//     Tab(text: AppHelpers.getTranslation(TrKeys.today)),
//     Tab(text: AppHelpers.getTranslation(TrKeys.tomorrow)),
//   ];
//
//   Iterable list = [];
//
//   List<String> listOfTime = [];
//   List<String> listOfTimeTomorrow = [];
//
//   getTimeList() {
//     TimeOfDay time =
//         (ref.read(orderProvider).startTodayTime.hour > TimeOfDay.now().hour
//             ? ref.read(orderProvider).startTodayTime
//             : TimeOfDay.now());
//
//     if (time.hour == 0 && ref.read(orderProvider).endTodayTime.hour == 0) {
//       while (time.hour <=
//           (ref.read(orderProvider).endTodayTime.hour == 0
//               ? 24
//               : ref.read(orderProvider).endTodayTime.hour - 1)) {
//         listOfTime.add(
//             "${time.hour}:${time.minute.toString().padLeft(2, '0')} - ${time.replacing(minute: time.minute + (int.tryParse(ref.read(orderProvider).shopData?.deliveryTime?.to ?? "40") ?? 0)).hour}:${time.replacing(minute: time.minute + (int.tryParse(ref.read(orderProvider).shopData?.deliveryTime?.to ?? "40") ?? 0)).minute > 30 ? time.replacing(minute: time.minute + (int.tryParse(ref.read(orderProvider).shopData?.deliveryTime?.to ?? "40") ?? 0)).minute : "00"}");
//         time = time.addHour(1);
//         if (time.hour == 0) {
//           break;
//         }
//       }
//     } else {
//       final deliveryTime = (int.tryParse(
//               ref.read(orderProvider).shopData?.deliveryTime?.to ?? "40") ??
//           0);
//       while (time.hour <=
//           (ref.read(orderProvider).endTodayTime.hour == 0
//               ? 24
//               : ref.read(orderProvider).endTodayTime.hour - 1)) {
//         final hour = (time.minute + deliveryTime) ~/ 60;
//         final minute = (time.minute + deliveryTime) % 60;
//         final nextTime = TimeOfDay(hour: hour + time.hour, minute: minute);
//
//         listOfTime.add(
//             "${time.hour}:${time.minute.toString().padLeft(2, '0')} - ${nextTime.hour}:${nextTime.minute < 10 ? '0' : ""}${nextTime.minute}");
//         time = time.addHour(1);
//         if (time.hour == 0) {
//           break;
//         }
//       }
//     }
//
//     TimeOfDay timeTomorrow = ref.read(orderProvider).startTomorrowTime;
//     if (timeTomorrow.hour == 0 &&
//         ref.read(orderProvider).endTomorrowTime.hour == 0) {
//       while (timeTomorrow.hour <=
//           (ref.read(orderProvider).endTomorrowTime.hour == 0
//               ? 24
//               : ref.read(orderProvider).endTomorrowTime.hour - 1)) {
//         listOfTimeTomorrow.add(
//             "${timeTomorrow.hour}:${timeTomorrow.minute.toString().padLeft(2, '0')} - ${timeTomorrow.replacing(minute: time.minute + (int.tryParse(ref.read(orderProvider).shopData?.deliveryTime?.to ?? "40") ?? 0)).hour == 24 ? "00" : timeTomorrow.replacing(minute: time.minute + (int.tryParse(ref.read(orderProvider).shopData?.deliveryTime?.to ?? "40") ?? 0)).hour == 24}:${timeTomorrow.replacing(minute: time.minute + (int.tryParse(ref.read(orderProvider).shopData?.deliveryTime?.to ?? "40") ?? 0)).minute.toString().padLeft(2, "0")}");
//         timeTomorrow = timeTomorrow.addHour(1);
//         if (timeTomorrow.hour == 0) {
//           break;
//         }
//       }
//     } else {
//       while (timeTomorrow.hour <= (ref.read(orderProvider).endTomorrowTime.hour == 0 ? 24 : ref.read(orderProvider).endTomorrowTime.hour - 1)) {
//         listOfTimeTomorrow.add(
//             "${timeTomorrow.hour}:${timeTomorrow.minute.toString().padLeft(2, '0')} - ${timeTomorrow.replacing(minute: time.minute + (int.tryParse(ref.read(orderProvider).shopData?.deliveryTime?.to ?? "40") ?? 0)).hour == 24 ? "00" : timeTomorrow.replacing(minute: time.minute + (int.tryParse(ref.read(orderProvider).shopData?.deliveryTime?.to ?? "40") ?? 0)).hour + 1}:${timeTomorrow.replacing(minute: time.minute + (int.tryParse(ref.read(orderProvider).shopData?.deliveryTime?.to ?? "40") ?? 0)).minute.toString().padLeft(2, "0")}");
//         timeTomorrow = timeTomorrow.addHour(1);
//         if (timeTomorrow.hour == 0) {
//           break;
//         }
//       }
//     }
//
//     if (listOfTime.isEmpty) {
//       WidgetsBinding.instance.addPostFrameCallback((_) {
//         ref.read(timeProvider.notifier).changeOne(1);
//         _tabController.animateTo(1);
//       });
//     }
//   }
//
//   List<String> getSingleDayTime(
//       String? startTimeString, String? endTimeString) {
//     TimeOfDay startTime = TimeOfDay(
//       hour: int.tryParse(
//               startTimeString?.substring(0, startTimeString.indexOf(":")) ??
//                   "") ??
//           0,
//       minute: int.tryParse(
//               startTimeString?.substring((startTimeString.indexOf(":")) + 1) ??
//                   "") ??
//           0,
//     );
//     TimeOfDay endTime = TimeOfDay(
//       hour: int.tryParse(
//               endTimeString?.substring(0, endTimeString.indexOf("-")) ?? "") ??
//           0,
//       minute: int.tryParse(
//               endTimeString?.substring((endTimeString.indexOf("-")) + 1) ??
//                   "") ??
//           0,
//     );
//     List<String> listOfTime = [];
//     if (startTime.hour == 0 && endTime.hour == 0) {
//       while (startTime.hour <= (endTime.hour == 0 ? 24 : endTime.hour - 1)) {
//         listOfTime.add(
//             "${startTime.hour}:${startTime.minute.toString().padLeft(2, '0')} - ${startTime.replacing(minute: startTime.minute + (int.tryParse(ref.read(orderProvider).shopData?.deliveryTime?.to ?? "40") ?? 0)).hour == 24 ? "00" : startTime.replacing(minute: startTime.minute + (int.tryParse(ref.read(orderProvider).shopData?.deliveryTime?.to ?? "40") ?? 0)).hour == 24}:${startTime.replacing(minute: startTime.minute + (int.tryParse(ref.read(orderProvider).shopData?.deliveryTime?.to ?? "40") ?? 0)).minute.toString().padLeft(2, "0")}");
//         startTime = startTime.addHour(1);
//         if (startTime.hour == 0) {
//           break;
//         }
//       }
//     } else {
//       while (startTime.hour <= (endTime.hour == 0 ? 24 : endTime.hour - 1)) {
//         listOfTime.add(
//             "${startTime.hour}:${startTime.minute.toString().padLeft(2, '0')} - ${startTime.replacing(minute: startTime.minute + (int.tryParse(ref.read(orderProvider).shopData?.deliveryTime?.to ?? "40") ?? 0)).hour == 24 ? "00" : startTime.replacing(minute: startTime.minute + (int.tryParse(ref.read(orderProvider).shopData?.deliveryTime?.to ?? "40") ?? 0)).hour + 1}:${startTime.replacing(minute: startTime.minute + (int.tryParse(ref.read(orderProvider).shopData?.deliveryTime?.to ?? "40") ?? 0)).minute.toString().padLeft(2, "0")}");
//         startTime = startTime.addHour(1);
//         if (startTime.hour == 0) {
//           break;
//         }
//       }
//     }
//     return listOfTime;
//   }
//
//   isCheckCloseDay(String? dateFormat) {
//     DateTime date = DateFormat("EEEE, MMM dd").parse(dateFormat ?? "");
//     return ref
//         .read(orderProvider)
//         .shopData
//         ?.shopClosedDate
//         ?.map((e) => e.day!.day)
//         .contains(date.day);
//   }
//
//   @override
//   void initState() {
//     for (int i = 0; i < 5; i++) {
//       _tabs.add(
//         Tab(
//           text: AppHelpers.getTranslation(
//             DateFormat("EEEE, MMM dd").format(
//               DateTime.now().add(
//                 Duration(days: i + 2),
//               ),
//             ),
//           ),
//         ),
//       );
//     }
//     _tabController = TabController(
//         length: 7,
//         vsync: this,
//         initialIndex: ref.read(orderProvider).isTodayWorkingDay ? 0 : 1);
//     list = [
//       "${AppHelpers.getTranslation(TrKeys.today)} — ${ref.read(orderProvider).shopData?.deliveryTime?.to ?? 40} ${AppHelpers.getTranslation(TrKeys.min)}",
//       AppHelpers.getTranslation(TrKeys.other)
//     ];
//     WidgetsBinding.instance.addPostFrameCallback((_) {
//       ref.read(timeProvider.notifier).reset();
//     });
//     getTimeList();
//     super.initState();
//   }
//
//   @override
//   void didChangeDependencies() {
//     event = ref.read(timeProvider.notifier);
//     super.didChangeDependencies();
//   }
//
//   @override
//   void dispose() {
//     _tabController.dispose();
//     super.dispose();
//   }
//
//   @override
//   Widget build(BuildContext context) {
//     stateOrder = ref.watch(orderProvider);
//     state = ref.watch(timeProvider);
//     return Container(
//       decoration: BoxDecoration(
//         color: widget.colors.scaffoldColor,
//         borderRadius: BorderRadius.only(
//           topLeft: Radius.circular(12.r),
//           topRight: Radius.circular(12.r),
//         ),
//       ),
//       width: double.infinity,
//       child: Padding(
//         padding: EdgeInsets.symmetric(horizontal: 16.w),
//         child: Column(
//           mainAxisSize: MainAxisSize.min,
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: [
//             8.verticalSpace,
//             Center(
//               child: Container(
//                 height: 4.h,
//                 width: 48.w,
//                 decoration: BoxDecoration(
//                   color: AppStyle.dragElement,
//                   borderRadius: BorderRadius.all(
//                     Radius.circular(40.r),
//                   ),
//                 ),
//               ),
//             ),
//             14.verticalSpace,
//             TitleAndIcon(
//               title: state.currentIndexOne == 0
//                   ? AppHelpers.getTranslation(TrKeys.deliveryTime)
//                   : AppHelpers.getTranslation(TrKeys.timeSchedule),
//               paddingHorizontalSize: 0,
//               rightTitle: state.currentIndexOne == 0
//                   ? ""
//                   : AppHelpers.getTranslation(TrKeys.clear),
//               rightTitleColor: AppStyle.red,
//               onRightTap: state.currentIndexOne == 0
//                   ? () {}
//                   : () {
//                       event.changeOne(0);
//                     },
//             ),
//             24.verticalSpace,
//             state.currentIndexOne == 0 &&
//                     ref.watch(orderProvider).isTodayWorkingDay
//                 ? ListView.builder(
//                     shrinkWrap: true,
//                     itemCount: 2,
//                     itemBuilder: (context, index) {
//                       return SelectItem(
//                         onTap: () {
//                           event.changeOne(index);
//                         },
//                         isActive: state.currentIndexOne == index,
//                         title: list.elementAt(index),
//                         colors: widget.colors,
//                       );
//                     },
//                   )
//                 : Expanded(
//                     child: Column(
//                       children: [
//                         CustomTabBar(
//                           colors: widget.colors,
//                           isScrollable: true,
//                           tabController: _tabController,
//                           tabs: _tabs,
//                         ),
//                         Expanded(
//                           child: TabBarView(
//                             controller: _tabController,
//                             children: [
//                               stateOrder.isTodayWorkingDay
//                                   ? listOfTime.isNotEmpty
//                                       ? ListView.builder(
//                                           padding: EdgeInsets.only(
//                                               top: 24.h, bottom: 16.h),
//                                           itemCount: listOfTime.length,
//                                           itemBuilder: (context, index) {
//                                             return SelectItem(
//                                               colors: widget.colors,
//                                               onTap: () {
//                                                 event.selectIndex(index);
//                                                 ref
//                                                     .read(
//                                                         orderProvider.notifier)
//                                                     .setTimeAndDay(
//                                                       TimeOfDay(
//                                                           hour: int.tryParse(
//                                                                 listOfTime[
//                                                                         index]
//                                                                     .substring(
//                                                                   0,
//                                                                   listOfTime[
//                                                                           index]
//                                                                       .indexOf(
//                                                                     ":",
//                                                                   ),
//                                                                 ),
//                                                               ) ??
//                                                               0,
//                                                           minute: 0),
//                                                       DateTime.now(),
//                                                     );
//                                               },
//                                               isActive:
//                                                   state.selectIndex == index,
//                                               title:
//                                                   listOfTime.elementAt(index),
//                                             );
//                                           },
//                                         )
//                                       : Padding(
//                                           padding: EdgeInsets.symmetric(
//                                             horizontal: 32.r,
//                                             vertical: 48.r,
//                                           ),
//                                           child: Text(
//                                             AppHelpers.getTranslation(
//                                                 TrKeys.notWorkTodayTime),
//                                             style:
//                                                 AppStyle.interNormal(size: 20),
//                                             textAlign: TextAlign.center,
//                                           ),
//                                         )
//                                   : Padding(
//                                       padding: EdgeInsets.symmetric(
//                                           horizontal: 32.r, vertical: 48.r),
//                                       child: Text(
//                                         AppHelpers.getTranslation(
//                                             TrKeys.notWorkToday),
//                                         style: AppStyle.interNormal(size: 20),
//                                         textAlign: TextAlign.center,
//                                       ),
//                                     ),
//                               stateOrder.isTomorrowWorkingDay
//                                   ? ListView.builder(
//                                       padding: EdgeInsets.only(
//                                           top: 24.h, bottom: 16.h),
//                                       itemCount: listOfTimeTomorrow.length,
//                                       itemBuilder: (context, index) {
//                                         return SelectItem(
//                                           colors: widget.colors,
//                                           onTap: () {
//                                             event.selectIndex(index);
//                                             ref
//                                                 .read(orderProvider.notifier)
//                                                 .setTimeAndDay(
//                                                   TimeOfDay(
//                                                       hour: int.tryParse(
//                                                             listOfTimeTomorrow[
//                                                                     index]
//                                                                 .substring(
//                                                               0,
//                                                               listOfTimeTomorrow[
//                                                                       index]
//                                                                   .indexOf(
//                                                                 ":",
//                                                               ),
//                                                             ),
//                                                           ) ??
//                                                           0,
//                                                       minute: 0),
//                                                   DateTime.now().add(
//                                                     const Duration(days: 1),
//                                                   ),
//                                                 );
//                                           },
//                                           isActive: state.selectIndex == index,
//                                           title: listOfTimeTomorrow
//                                               .elementAt(index),
//                                         );
//                                       },
//                                     )
//                                   : Padding(
//                                       padding: EdgeInsets.symmetric(
//                                           horizontal: 32.r, vertical: 48.r),
//                                       child: Text(
//                                         AppHelpers.getTranslation(
//                                           TrKeys.notWorkTomorrow,
//                                         ),
//                                         style: AppStyle.interNormal(size: 20),
//                                         textAlign: TextAlign.center,
//                                       ),
//                                     ),
//                               ...List.generate(
//                                 5,
//                                 (indexTab) {
//                                   for (int i = 0;
//                                       (i <
//                                           (stateOrder.shopData?.shopWorkingDays
//                                                   ?.length ??
//                                               0));
//                                       i++) {
//                                     if (stateOrder.shopData?.shopWorkingDays?[i]
//                                                 .day
//                                                 ?.toLowerCase() ==
//                                             _tabs[indexTab + 2]
//                                                 .text
//                                                 ?.toLowerCase()
//                                                 .substring(
//                                                   0,
//                                                   _tabs[indexTab + 2]
//                                                       .text!
//                                                       .toLowerCase()
//                                                       .indexOf(","),
//                                                 ) &&
//                                         !(stateOrder
//                                                 .shopData
//                                                 ?.shopWorkingDays?[i]
//                                                 .disabled ??
//                                             false) &&
//                                         !isCheckCloseDay(
//                                             _tabs[indexTab + 2].text)) {
//                                       return ListView.builder(
//                                         padding: EdgeInsets.only(
//                                             top: 24.h, bottom: 16.h),
//                                         itemCount: getSingleDayTime(
//                                                 stateOrder.shopData
//                                                     ?.shopWorkingDays?[i].from,
//                                                 stateOrder.shopData
//                                                     ?.shopWorkingDays?[i].to)
//                                             .length,
//                                         itemBuilder: (context, index) {
//                                           return SelectItem(
//                                             onTap: () {
//                                               event.selectIndex(index);
//                                               ref.read(orderProvider.notifier).setTimeAndDay(
//                                                   TimeOfDay(
//                                                       hour: int.tryParse(getSingleDayTime(
//                                                                       stateOrder
//                                                                           .shopData
//                                                                           ?.shopWorkingDays?[
//                                                                               i]
//                                                                           .from,
//                                                                       stateOrder
//                                                                           .shopData
//                                                                           ?.shopWorkingDays?[
//                                                                               i]
//                                                                           .to)[
//                                                                   index]
//                                                               .substring(
//                                                                   0,
//                                                                   getSingleDayTime(stateOrder.shopData?.shopWorkingDays?[i].from, stateOrder.shopData?.shopWorkingDays?[i].to)[index]
//                                                                       .indexOf(
//                                                                           ":"))) ??
//                                                           0,
//                                                       minute: 0),
//                                                   DateFormat("EEEE, MMM dd")
//                                                       .parse(_tabs[indexTab + 2].text ?? ""));
//                                             },
//                                             isActive:
//                                                 state.selectIndex == index,
//                                             title: getSingleDayTime(
//                                                     stateOrder
//                                                         .shopData
//                                                         ?.shopWorkingDays?[i]
//                                                         .from,
//                                                     stateOrder
//                                                         .shopData
//                                                         ?.shopWorkingDays?[i]
//                                                         .to)
//                                                 .elementAt(index),
//                                             colors: widget.colors,
//                                           );
//                                         },
//                                       );
//                                     }
//                                   }
//                                   return Padding(
//                                     padding: EdgeInsets.symmetric(
//                                         horizontal: 32.r, vertical: 48.r),
//                                     child: Text(
//                                       "${AppHelpers.getTranslation(TrKeys.notWork)} ${_tabs[indexTab + 2].text}",
//                                       style: AppStyle.interNormal(size: 20),
//                                       textAlign: TextAlign.center,
//                                     ),
//                                   );
//                                 },
//                               ),
//                             ],
//                           ),
//                         )
//                       ],
//                     ),
//                   )
//           ],
//         ),
//       ),
//     );
//   }
// }

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import 'package:riverpodtemp/application/order/order_provider.dart';
import 'package:riverpodtemp/application/order_time/time_notifier.dart';
import 'package:riverpodtemp/application/order_time/time_provider.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/extension.dart';
import 'package:riverpodtemp/infrastructure/services/time_service.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/custom_tab_bar.dart';
import 'package:riverpodtemp/presentation/components/modal_drag.dart';
import 'package:riverpodtemp/presentation/components/modal_wrap.dart';
import 'package:riverpodtemp/presentation/components/select_item.dart';
import 'package:riverpodtemp/presentation/components/title_icon.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';
import 'package:riverpodtemp/presentation/theme/theme_wrapper.dart';

class TimeDelivery extends ConsumerStatefulWidget {
  final CustomColorSet colors;

  const TimeDelivery({required this.colors, super.key});

  @override
  ConsumerState<TimeDelivery> createState() => _TimeDeliveryState();
}

class _TimeDeliveryState extends ConsumerState<TimeDelivery>
    with TickerProviderStateMixin {
  late TimeNotifier event;

  late TabController _tabController;
  final _tabs = [
    Tab(text: AppHelpers.getTranslation(TrKeys.today)),
    Tab(text: AppHelpers.getTranslation(TrKeys.tomorrow)),
  ];

  isCheckCloseDay(String? dateFormat) {
    DateTime date = TimeService.dateFormatEMD(
      DateTime.tryParse(dateFormat ?? ''),
    );
    return ref
        .read(orderProvider)
        .shopData
        ?.shopClosedDate
        ?.map((e) => e.day!.day)
        .contains(date.day);
  }

  @override
  void initState() {
    for (int i = 0; i < 5; i++) {
      _tabs.add(
        Tab(
          text: AppHelpers.getTranslation(
            TimeService.dateFormatEMDString(
              DateTime.now().add(Duration(days: i + 2)),
            ),
          ),
        ),
      );
    }
    _tabController = TabController(
        length: 7,
        vsync: this,
        initialIndex: ref.read(orderProvider).todayTimes.isNotEmpty ? 0 : 1);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // ref.read(timeProvider.notifier).reset();
      ref.read(orderProvider.notifier).checkWorkingDay();
    });
    super.initState();
  }

  @override
  void didChangeDependencies() {
    event = ref.read(timeProvider.notifier);
    super.didChangeDependencies();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(orderProvider);
    final timeState = ref.watch(timeProvider);
    final notifier = ref.read(orderProvider.notifier);
    return ModalWrap(
      color: widget.colors.scaffoldColor,
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 16.w),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            8.verticalSpace,
            ModalDrag(),
            TitleAndIcon(
              title: state.deliveryOption != null
                  ? TrKeys.deliveryTime
                  : TrKeys.timeSchedule,
              paddingHorizontalSize: 0,
              rightTitle: state.deliveryOption != null
                  ? ""
                  : AppHelpers.getTranslation(TrKeys.clear),
              rightTitleColor: AppStyle.red,
              onRightTap: state.deliveryOption != null
                  ? () {}
                  : () {
                      event.changeOne(0);
                      notifier.setDeliveryOption(
                        context,
                        state.deliveryOptions.first,
                      );
                    },
            ),
            24.verticalSpace,
            Expanded(
              child: Column(
                children: [
                  ThemeWrapper(builder: (colors, controller) {
                    return CustomTabBar(
                      colors: colors,
                      isScrollable: true,
                      tabController: _tabController,
                      tabs: _tabs,
                    );
                  }),
                  Expanded(
                    child: TabBarView(
                      controller: _tabController,
                      children: [
                        state.todayTimes.isNotEmpty
                            ? ListView.builder(
                                padding:
                                    EdgeInsets.only(top: 24.h, bottom: 16.h),
                                itemCount: state.todayTimes.length,
                                itemBuilder: (context, index) {
                                  return SelectItem(
                                    onTap: () {
                                      event.selectIndex(
                                        index,
                                        tabIndex: _tabController.index,
                                      );
                                      ref
                                          .read(orderProvider.notifier)
                                          .setTimeAndDay(
                                            context,
                                            timeOfDay: state
                                                .todayTimes[index].toNextTime,
                                            day: DateTime.now(),
                                          );
                                      Navigator.pop(context);
                                    },
                                    isActive: timeState.selectIndex == index &&
                                        _tabController.index ==
                                            timeState.currentIndexTwo,
                                    title: state.todayTimes[index].toTime,
                                    colors: widget.colors,
                                  );
                                },
                              )
                            : Padding(
                                padding: EdgeInsets.symmetric(
                                  horizontal: 32.r,
                                  vertical: 48.r,
                                ),
                                child: Text(
                                  AppHelpers.getTranslation(
                                      TrKeys.notWorkToday),
                                  style: AppStyle.interNormal(size: 20),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                        ...List.generate(
                          state.dailyTimes.length,
                          (indexTab) {
                            return state.dailyTimes[indexTab].isEmpty
                                ? Padding(
                                    padding: EdgeInsets.symmetric(
                                        horizontal: 32.r, vertical: 48.r),
                                    child: Text(
                                      "${AppHelpers.getTranslation(TrKeys.notWork)} ${_tabs[indexTab + 1].text}",
                                      style: AppStyle.interNormal(size: 20),
                                      textAlign: TextAlign.center,
                                    ),
                                  )
                                : ListView.builder(
                                    padding: EdgeInsets.only(
                                        top: 24.h, bottom: 16.h),
                                    itemCount:
                                        state.dailyTimes[indexTab].length,
                                    itemBuilder: (context, index) {
                                      return SelectItem(
                                        onTap: () {
                                          DateTime day = indexTab == 0
                                              ? DateTime.now()
                                                  .add(Duration(days: 1))
                                              : TimeService.dateFormatEMD(
                                                  DateTime.tryParse(
                                                    _tabs[indexTab + 1].text ??
                                                        '',
                                                  ),
                                                );
                                          event.selectIndex(index,
                                              tabIndex: _tabController.index);
                                          ref
                                              .read(orderProvider.notifier)
                                              .setTimeAndDay(
                                                context,
                                                timeOfDay: state
                                                    .dailyTimes[indexTab][index]
                                                    .toNextTime,
                                                day: day,
                                              );
                                          Navigator.pop(context);
                                        },
                                        isActive:
                                            timeState.selectIndex == index &&
                                                _tabController.index ==
                                                    timeState.currentIndexTwo,
                                        title: state.dailyTimes[indexTab]
                                            .elementAt(index)
                                            .toTime,
                                        colors: widget.colors,
                                      );
                                    },
                                  );
                          },
                        ),
                      ],
                    ),
                  )
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}
