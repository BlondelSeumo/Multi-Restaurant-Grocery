// ignore_for_file: use_build_context_synchronously

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:riverpodtemp/domain/di/dependency_manager.dart';
import 'package:riverpodtemp/domain/iterface/cart.dart';
import 'package:riverpodtemp/domain/iterface/draw.dart';
import 'package:riverpodtemp/infrastructure/models/data/addons_data.dart';
import 'package:riverpodtemp/infrastructure/models/data/location.dart';
import 'package:riverpodtemp/infrastructure/models/data/order_active_model.dart';
import 'package:riverpodtemp/infrastructure/models/data/order_body_data.dart';
import 'package:riverpodtemp/app_constants.dart';
import 'package:riverpodtemp/infrastructure/models/data/shop_data.dart';
import 'package:riverpodtemp/infrastructure/models/response/delivery_options_response.dart';
import 'package:riverpodtemp/infrastructure/services/enums.dart';
import 'package:riverpodtemp/infrastructure/services/extension.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/marker_image_cropper.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/web_view.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';
import '../../domain/iterface/orders.dart';
import '../../domain/iterface/shops.dart';
import '../../infrastructure/models/data/payment_data.dart';
import '../../infrastructure/models/request/cart_request.dart';
import '../../infrastructure/services/app_connectivity.dart';
import '../../infrastructure/services/app_helpers.dart';
import 'order_state.dart';
import 'package:intl/intl.dart' as intl;

class OrderNotifier extends StateNotifier<OrderState> {
  final OrdersRepositoryFacade _orderRepository;
  final ShopsRepositoryFacade _shopsRepository;
  final CartRepositoryFacade _cartRepository;
  final DrawRepositoryFacade _drawRouting;

  OrderNotifier(this._orderRepository, this._shopsRepository,
      this._cartRepository, this._drawRouting)
      : super(const OrderState());

  int? cartId;

  setWalletPrice(num? price) {
    state = state.copyWith(walletPrice: price);
  }

  void setAddressInfo(
      {String? office, String? house, String? floor, String? note}) {
    state = state.copyWith(
        office: office ?? state.office,
        house: house ?? state.house,
        floor: floor ?? state.floor,
        note: note ?? state.note);
  }

  void checkWorkingDay() {
    if (!(state.shopData?.open ?? false)) return;
    List<String> todayTimes = getTimes(-1);
    List<List<String>> dailyTimes = [];
    for (int i = 0; i < 6; i++) {
      dailyTimes.add(getTimes(i));
    }

    state = state.copyWith(dailyTimes: dailyTimes, todayTimes: todayTimes);
  }

  setDeliveryOption(BuildContext context, DeliveryOptionData? data) {
    state = state.copyWith(deliveryOption: data);
    getCalculate(
      isLoading: false,
      context: context,
      type:
          data == null ? DeliveryTypeEnum.schedule : DeliveryTypeEnum.delivery,
    );
  }

  Future<void> getCalculate({
    required BuildContext context,
    int? cartId,
    required DeliveryTypeEnum type,
    bool isLoading = true,
  }) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      if (isLoading) {
        state = state.copyWith(isLoading: true);
      } else {
        state = state.copyWith(isButtonLoading: true);
      }
      final response = await ordersRepository.getCalculate(
        cartId: cartId ?? this.cartId ?? 0,
        location: LocationModel(
          latitude: LocalStorage.getAddressSelected()?.location?.first ??
              AppConstants.demoLatitude,
          longitude: LocalStorage.getAddressSelected()?.location?.last ??
              AppConstants.demoLongitude,
        ),
        type: type == DeliveryTypeEnum.delivery
            ? state.deliveryOption?.id == null
                ? DeliveryTypeEnum.schedule
                : DeliveryTypeEnum.delivery
            : type,
        deliveryOptionId: state.deliveryOption?.id,
        coupon: state.promoCode,
      );
      response.when(
        success: (data) async {
          if (isLoading) {
            state = state.copyWith(
                isLoading: false, calculateData: data, walletPrice: null);
          } else {
            state = state.copyWith(
                isButtonLoading: false, calculateData: data, walletPrice: null);
          }
        },
        failure: (failure, status) {
          if (isLoading) {
            state = state.copyWith(isLoading: false);
          } else {
            state = state.copyWith(isButtonLoading: false);
          }
          AppHelpers.showCheckTopSnackBar(
            context,
            failure,
          );
          if (status == 401) {
            context.router.popUntilRoot();
            context.replaceRoute(const LoginRoute());
          }
        },
      );
    } else {
      if (context.mounted) {
        AppHelpers.showNoConnectionSnackBar(context);
      }
    }
  }

  List<String> getTimes(int i) {
    debugPrint("Get times $i");
    final days = state.shopData?.shopWorkingDays;
    List<ShopClosedDate> closedDays = state.shopData?.shopClosedDate ?? [];
    DateTime now = DateTime.now().add(Duration(days: i + 1));
    if (closedDays
        .any((e) => e.day?.withoutTime.compareTo(now.withoutTime) == 0)) {
      return [];
    }
    List<String> times = [];
    final yesterday = intl.DateFormat("EEEE")
        .format(now.subtract(const Duration(days: 1)))
        .toLowerCase();
    final today = intl.DateFormat("EEEE").format(now).toLowerCase();
    TimeOfDay deliveryTime = TimeOfDay(
        hour: state.shopData?.deliveryTime?.type == 'hour'
            ? (int.tryParse(state.shopData?.deliveryTime?.to ?? '') ?? 0)
            : 0,
        minute: state.shopData?.deliveryTime?.type == 'minute'
            ? (int.tryParse(state.shopData?.deliveryTime?.to ?? '') ?? 0)
            : 0);
    debugPrint("Today $today");
    debugPrint("Yesterday $yesterday");
    debugPrint("Delivery time $deliveryTime");
    days?.forEach((element) {
      if (element.disabled ?? false) return;
      if (element.day?.toLowerCase() == yesterday) {
        if (AppHelpers.checkYesterday(element.from, element.to) &&
            yesterday != 'sunday') {
          TimeOfDay time =
              i == -1 ? TimeOfDay.now() : const TimeOfDay(hour: 0, minute: 0);
          TimeOfDay time2 = time.plusMinutes(
              minute: deliveryTime.hour * 60 + deliveryTime.minute);
          for (int i = time.hour; i < element.to.toTimeOfDay.hour; i++) {
            times.add(
                "${time.hour}:${time.minute} - ${time2.hour}:${time2.minute}");
            time = time.plusMinutes(minute: AppConstants.scheduleInterval);
            time2 = time2.plusMinutes(minute: AppConstants.scheduleInterval);
          }
        }
      }
      if (element.day?.toLowerCase() == today) {
        if (today == "monday") {
          if (AppHelpers.checkYesterday(element.from, element.to)) {
            TimeOfDay time =
                i == -1 ? TimeOfDay.now() : const TimeOfDay(hour: 0, minute: 0);
            TimeOfDay time2 = time.plusMinutes(
                minute: deliveryTime.hour * 60 + deliveryTime.minute);
            for (num i = time.hour; i < element.to.toTimeOfDay.hour; i) {
              times.add(
                  "${time.hour}:${time.minute} - ${time2.hour}:${time2.minute}");
              time = time.plusMinutes(minute: AppConstants.scheduleInterval);
              time2 = time2.plusMinutes(minute: AppConstants.scheduleInterval);
              i += AppConstants.scheduleInterval / 60;
            }
          }
        }
        if (AppHelpers.checkYesterday(element.from, element.to)) {
          TimeOfDay time = i == -1
              ? TimeOfDay.now().hour > element.from.toTimeOfDay.hour &&
                      TimeOfDay.now().minute > element.from.toTimeOfDay.minute
                  ? TimeOfDay.now()
                  : element.from.toTimeOfDay
              : element.from.toTimeOfDay;
          TimeOfDay time2 = time.plusMinutes(
              minute: deliveryTime.hour * 60 + deliveryTime.minute);
          for (num i = time.hour; i < 24; i) {
            times.add(
                "${time.hour}:${time.minute} - ${time2.hour}:${time2.minute}");
            time = time.plusMinutes(minute: AppConstants.scheduleInterval);
            time2 = time2.plusMinutes(minute: AppConstants.scheduleInterval);
            i += AppConstants.scheduleInterval / 60;
          }
        } else {
          TimeOfDay time = i == -1
              ? TimeOfDay.now().hour > element.from.toTimeOfDay.hour &&
                      TimeOfDay.now().minute > element.from.toTimeOfDay.minute
                  ? TimeOfDay.now()
                  : element.from.toTimeOfDay
              : element.from.toTimeOfDay;
          TimeOfDay time2 = time.plusMinutes(
              minute: deliveryTime.hour * 60 + deliveryTime.minute);
          for (num i = time.hour; i < element.to.toTimeOfDay.hour; i) {
            times.add(
                "${time.hour}:${time.minute} - ${time2.hour}:${time2.minute}");
            time = time.plusMinutes(minute: AppConstants.scheduleInterval);
            time2 = time2.plusMinutes(minute: AppConstants.scheduleInterval);
            if (time2.hour == element.to.toTimeOfDay.hour &&
                time2.minute >= element.to.toTimeOfDay.minute) {
              break;
            }
            i += AppConstants.scheduleInterval / 60;
          }
        }
      }
    });
    if (state.selectDate == null && times.isNotEmpty) {
      state = state.copyWith(
        selectTime: times.first.toNextTime,
        selectDate: now,
      );
    }
    return times;
  }

  void changeActive(bool isChange) {
    state = state.copyWith(isActive: isChange);
  }

  void setPromoCode(String? promoCode) {
    state = state.copyWith(promoCode: promoCode);
  }

  void resetState() {
    state = state.copyWith(
      orderData: null,
      selectDate: null,
      isButtonLoading: false,
    );
  }

  sendTips({
    required BuildContext context,
    required num? price,
    required PaymentData payment,
    VoidCallback? onSuccess,
    ValueChanged<String>? onWebview,
  }) async {
    final num wallet = LocalStorage.getWalletData()?.price ?? 0;
    if (payment.tag == "wallet" && wallet < (price ?? 0)) {
      AppHelpers.showCheckTopSnackBarInfo(
          context, AppHelpers.getTranslation(TrKeys.notEnoughMoney));
      state = state.copyWith(isButtonLoading: false);
      return;
    }
    if (payment.tag?.toLowerCase() != "cash") {
      final res = await _orderRepository.tipProcess(
          state.orderData?.id, payment.tag ?? '', payment.id, price);
      res.map(success: (key) {
        onSuccess?.call();
        if (payment.tag?.toLowerCase() != 'wallet') {
          onWebview?.call(key.data);
        }
      }, failure: (e) {
        state = state.copyWith(isButtonLoading: false);
        if (context.mounted) {
          AppHelpers.showCheckTopSnackBar(
            context,
            e.error,
          );
        }
      });
    }
  }

  void changeTabIndex(int index) {
    state = state.copyWith(tabIndex: index);
  }

  void setTimeAndDay(
    BuildContext context, {
    TimeOfDay? timeOfDay,
    DateTime? day,
  }) {
    state = state.copyWith(
      selectTime: timeOfDay ?? TimeOfDay(hour: 0, minute: 0),
      selectDate: day,
    );
    if (state.deliveryOption != null) {
      setDeliveryOption(context, null);
    }
  }

  // void checkWorkingDay() {
  //   int todayWeekIndex = 0;
  //   int tomorrowWeekIndex = 0;
  //   for (int i = 0; i < state.shopData!.shopWorkingDays!.length; i++) {
  //     if (state.shopData!.shopWorkingDays![i].day ==
  //             intl.DateFormat("EEEE").format(DateTime.now()).toLowerCase() &&
  //         !(state.shopData!.shopWorkingDays![i].disabled ?? true)) {
  //       state = state.copyWith(isTodayWorkingDay: true);
  //       todayWeekIndex = i;
  //       break;
  //     } else {
  //       state = state.copyWith(isTodayWorkingDay: false);
  //     }
  //   }
  //   for (int i = 0; i < state.shopData!.shopWorkingDays!.length; i++) {
  //     if (state.shopData!.shopWorkingDays![i].day ==
  //             intl.DateFormat("EEEE")
  //                 .format(DateTime.now().add(const Duration(days: 1)))
  //                 .toLowerCase() &&
  //         !(state.shopData!.shopWorkingDays![i].disabled ?? true)) {
  //       state = state.copyWith(isTomorrowWorkingDay: true);
  //       tomorrowWeekIndex = i;
  //       break;
  //     } else {
  //       state = state.copyWith(isTomorrowWorkingDay: false);
  //     }
  //   }
  //
  //   if (state.isTodayWorkingDay) {
  //     for (int i = 0; i < state.shopData!.shopClosedDate!.length; i++) {
  //       if (DateTime.now().year ==
  //               state.shopData!.shopClosedDate![i].day!.year &&
  //           DateTime.now().month ==
  //               state.shopData!.shopClosedDate![i].day!.month &&
  //           DateTime.now().day == state.shopData!.shopClosedDate![i].day!.day) {
  //         state = state.copyWith(isTodayWorkingDay: false);
  //         break;
  //       } else {
  //         state = state.copyWith(isTodayWorkingDay: true);
  //       }
  //     }
  //     if (state.isTodayWorkingDay) {
  //       TimeOfDay startTimeOfDay = TimeOfDay(
  //         hour: int.tryParse(state
  //                     .shopData!.shopWorkingDays?[todayWeekIndex].from
  //                     ?.substring(
  //                         0,
  //                         state.shopData!.shopWorkingDays?[todayWeekIndex].from
  //                                 ?.indexOf("-") ??
  //                             0) ??
  //                 "") ??
  //             0,
  //         minute: int.tryParse(state
  //                     .shopData!.shopWorkingDays?[todayWeekIndex].from
  //                     ?.substring((state.shopData!
  //                                 .shopWorkingDays?[todayWeekIndex].from
  //                                 ?.indexOf("-") ??
  //                             0) +
  //                         1) ??
  //                 "") ??
  //             0,
  //       );
  //       TimeOfDay endTimeOfDay = TimeOfDay(
  //         hour: int.tryParse(state.shopData!.shopWorkingDays?[todayWeekIndex].to
  //                     ?.substring(
  //                         0,
  //                         state.shopData!.shopWorkingDays?[todayWeekIndex].to
  //                                 ?.indexOf("-") ??
  //                             0) ??
  //                 "") ??
  //             0,
  //         minute: int.tryParse(state
  //                     .shopData!.shopWorkingDays?[todayWeekIndex].to
  //                     ?.substring((state
  //                                 .shopData!.shopWorkingDays?[todayWeekIndex].to
  //                                 ?.indexOf("-") ??
  //                             0) +
  //                         1) ??
  //                 "") ??
  //             0,
  //       );
  //       state = state.copyWith(
  //         startTodayTime: startTimeOfDay,
  //         endTodayTime: endTimeOfDay,
  //       );
  //       if (DateTime.now().hour < endTimeOfDay.hour) {
  //         state = state.copyWith(
  //             selectDate: DateTime.now(),
  //             selectTime: DateTime.now().hour > startTimeOfDay.hour
  //                 ? TimeOfDay(
  //                     hour: DateTime.now().hour, minute: DateTime.now().minute)
  //                 : TimeOfDay(
  //                     hour: startTimeOfDay.hour,
  //                     minute: startTimeOfDay.minute));
  //       }
  //     }
  //   }
  //
  //   if (state.isTomorrowWorkingDay) {
  //     for (int i = 0; i < state.shopData!.shopClosedDate!.length; i++) {
  //       if (DateTime.now().add(const Duration(days: 1)).year ==
  //               state.shopData!.shopClosedDate![i].day!.year &&
  //           DateTime.now().add(const Duration(days: 1)).month ==
  //               state.shopData!.shopClosedDate![i].day!.month &&
  //           DateTime.now().add(const Duration(days: 1)).day ==
  //               state.shopData!.shopClosedDate![i].day!.day) {
  //         state = state.copyWith(isTomorrowWorkingDay: false);
  //         break;
  //       } else {
  //         state = state.copyWith(isTomorrowWorkingDay: true);
  //       }
  //     }
  //     if (state.isTomorrowWorkingDay) {
  //       TimeOfDay startTimeOfDay = TimeOfDay(
  //         hour: int.tryParse(state
  //                     .shopData!.shopWorkingDays?[tomorrowWeekIndex].from
  //                     ?.substring(
  //                         0,
  //                         state.shopData!.shopWorkingDays?[tomorrowWeekIndex]
  //                                 .from
  //                                 ?.indexOf("-") ??
  //                             0) ??
  //                 "") ??
  //             0,
  //         minute: int.tryParse(state
  //                     .shopData!.shopWorkingDays?[tomorrowWeekIndex].from
  //                     ?.substring((state.shopData!
  //                                 .shopWorkingDays?[tomorrowWeekIndex].from
  //                                 ?.indexOf("-") ??
  //                             0) +
  //                         1) ??
  //                 "") ??
  //             0,
  //       );
  //       TimeOfDay endTimeOfDay = TimeOfDay(
  //         hour: int.tryParse(state
  //                     .shopData!.shopWorkingDays?[tomorrowWeekIndex].to
  //                     ?.substring(
  //                         0,
  //                         state.shopData!.shopWorkingDays?[tomorrowWeekIndex].to
  //                                 ?.indexOf("-") ??
  //                             0) ??
  //                 "") ??
  //             0,
  //         minute: int.tryParse(state
  //                     .shopData!.shopWorkingDays?[tomorrowWeekIndex].to
  //                     ?.substring((state.shopData!
  //                                 .shopWorkingDays?[tomorrowWeekIndex].to
  //                                 ?.indexOf("-") ??
  //                             0) +
  //                         1) ??
  //                 "") ??
  //             0,
  //       );
  //       state = state.copyWith(
  //         startTomorrowTime: startTimeOfDay,
  //         endTomorrowTime: endTimeOfDay,
  //       );
  //       if (state.selectDate == null) {
  //         state = state.copyWith(
  //             selectDate: DateTime.now().add(const Duration(days: 1)),
  //             selectTime: TimeOfDay(
  //                 hour: startTimeOfDay.hour, minute: startTimeOfDay.minute));
  //       }
  //     }
  //   }
  // }

  changeBranch(int index) {
    state = state.copyWith(branchIndex: index);
  }

  Future<void> fetchShop(BuildContext context, int uuid) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      state = state.copyWith(isLoading: true);
      final response = await _shopsRepository.getSingleShop(uuid: uuid);
      response.when(
        success: (data) async {
          state = state.copyWith(isLoading: false, shopData: data.data);
          checkWorkingDay();
          final ImageCropperForMarker image = ImageCropperForMarker();
          Set<Marker> list = {};
          list.add(Marker(
              markerId: const MarkerId("Shop"),
              position: LatLng(
                data.data?.location?.latitude ?? AppConstants.demoLatitude,
                data.data?.location?.longitude ?? AppConstants.demoLongitude,
              ),
              icon:
                  await image.resizeAndCircle(data.data?.logoImg ?? "", 120)));
          state = state.copyWith(shopMarkers: list);
        },
        failure: (activeFailure, status) {
          state = state.copyWith(isLoading: false);
          AppHelpers.showCheckTopSnackBar(
            context,
            AppHelpers.getTranslation(activeFailure.toString()),
          );
        },
      );
    } else {
      if (context.mounted) {
        AppHelpers.showNoConnectionSnackBar(context);
      }
    }
  }

  Future<void> fetchShopBranch(BuildContext context, int shopId) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      final response = await _shopsRepository.getShopBranch(uuid: shopId);
      response.when(
        success: (data) async {
          state = state.copyWith(branches: data.data);
        },
        failure: (activeFailure, status) {},
      );
    } else {
      if (context.mounted) {
        AppHelpers.showNoConnectionSnackBar(context);
      }
    }
  }

  // Future<void> getCalculate(
  //     {required BuildContext context,
  //     required int cartId,
  //     required double long,
  //     required double lat,
  //     required DeliveryTypeEnum type,
  //     bool isLoading = true}) async {
  //   final connected = await AppConnectivity.connectivity();
  //   if (connected) {
  //     if (isLoading) {
  //       state = state.copyWith(isLoading: true);
  //     } else {
  //       state = state.copyWith(isButtonLoading: true);
  //     }
  //     final response = await _orderRepository.getCalculate(
  //         cartId: cartId,
  //         lat: lat,
  //         long: long,
  //         type: type,
  //         coupon: state.promoCode);
  //     response.when(
  //       success: (data) async {
  //         if (isLoading) {
  //           state = state.copyWith(
  //             isLoading: false,
  //             calculateData: data,
  //           );
  //         } else {
  //           state = state.copyWith(
  //             isButtonLoading: false,
  //             calculateData: data,
  //           );
  //         }
  //       },
  //       failure: (activeFailure, status) {
  //         if (isLoading) {
  //           state = state.copyWith(isLoading: true);
  //         } else {
  //           state = state.copyWith(isButtonLoading: false);
  //         }
  //         AppHelpers.showCheckTopSnackBar(
  //           context,
  //           AppHelpers.getTranslation(activeFailure.toString()),
  //         );
  //         if (status == 401) {
  //           context.router.popUntilRoot();
  //           context.replaceRoute(const LoginRoute());
  //         }
  //       },
  //     );
  //   } else {
  //     if (context.mounted) {
  //       AppHelpers.showNoConnectionSnackBar(context);
  //     }
  //   }
  // }

  Future createOrder({
    required BuildContext context,
    required OrderBodyData data,
    required PaymentData payment,
    required VoidCallback onSuccess,
    Function(String, bool)? onWebview,
  }) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      state = state.copyWith(isButtonLoading: true);
      final num wallet = LocalStorage.getWalletData()?.price ?? 0;
      if (payment.tag == "wallet" && wallet < (state.calculateData?.totalPrice ?? 0)) {
        AppHelpers.showCheckTopSnackBarInfo(
            context, AppHelpers.getTranslation(TrKeys.notEnoughMoney));
        state = state.copyWith(isButtonLoading: false);
        return;
      }
      final response = await _orderRepository.createOrder(data);
      response.when(
        success: (data) async {
          onSuccess.call();
          LocalStorage.deleteCartList();
          switch (payment.tag) {
            case 'cash':
            case 'wallet':
              paymentsRepository.createTransaction(
                  orderId: data.id ?? 0, paymentId: payment.id);
              break;
            default:
              paymentsRepository.createTransaction(
                  orderId: data.id ?? 0, paymentId: payment.id);
              await makePayment(context, payment.tag ?? '', data.id);
              break;
          }
          final ImageCropperForMarker image = ImageCropperForMarker();

          state = state.copyWith(
              orderData: data, isButtonLoading: false, isMapLoading: true);

          Map<MarkerId, Marker> list = {
            const MarkerId("Shop"): Marker(
                markerId: const MarkerId("Shop"),
                position: LatLng(
                  data.shop?.location?.latitude ?? AppConstants.demoLatitude,
                  data.shop?.location?.longitude ?? AppConstants.demoLongitude,
                ),
                icon:
                    await image.resizeAndCircle(data.shop?.logoImg ?? "", 120)),
            const MarkerId("User"): Marker(
                markerId: const MarkerId("User"),
                position: LatLng(
                  data.location?.latitude ?? AppConstants.demoLatitude,
                  data.location?.longitude ?? AppConstants.demoLongitude,
                ),
                icon: await image.resizeAndCircle(data.user?.img ?? "", 120)),
          };
          state = state.copyWith(markers: list, isMapLoading: false);
          getRoutingAll(
              context: context,
              end: LatLng(
                  data.location?.latitude ?? 0, data.location?.longitude ?? 0),
              start: LatLng(data.shop?.location?.latitude ?? 0,
                  data.shop?.location?.longitude ?? 0));
        },
        failure: (failure, status) {
          state = state.copyWith(isButtonLoading: false);
          if (context.mounted) {
            AppHelpers.showCheckTopSnackBar(context, failure);
          }
        },
      );
    } else {
      if (context.mounted) {
        AppHelpers.showNoConnectionSnackBar(context);
      }
    }
  }

  Future<void> makePayment(
    BuildContext context,
    String name,
    int? orderId,
  ) async {
    try {
      final response =
          await _orderRepository.process(name: name, orderId: orderId);
      response.when(
        success: (data) async {
          Navigator.push(context,
              MaterialPageRoute(builder: (_) => WebViewPage(url: data)));
        },
        failure: (activeFailure, status) {
          state = state.copyWith(isButtonLoading: false);
          if (context.mounted) {
            AppHelpers.showCheckTopSnackBar(
              context,
              AppHelpers.getTranslation(activeFailure.toString()),
            );
          }
        },
      );
    } catch (e) {
      AppHelpers.showCheckTopSnackBar(
        context,
        AppHelpers.getTranslation(TrKeys.paymentMethodFailed),
      );
    }
  }

  void repeatOrder({
    required BuildContext context,
    required int shopId,
    required VoidCallback onSuccess,
    List<Detail>? listOfProduct,
  }) async {
    state = state.copyWith(isCheckShopOrder: false);
    if (shopId == 0) {
      final connected = await AppConnectivity.connectivity();
      if (connected) {
        state = state.copyWith(isAddLoading: true);
        List<CartRequest> list = [];
        listOfProduct?.forEach((element) {
          for (Addons addon in element.addons ?? []) {
            list.add(
              CartRequest(
                  stockId: addon.stocks?.id,
                  quantity: addon.quantity,
                  parentId: element.stock?.id ?? 0),
            );
          }
          list.add(
            CartRequest(
              stockId: element.stock?.id,
              quantity: element.quantity,
            ),
          );
          if (element.bonus ?? false) {
            list.add(CartRequest(
              stockId: element.stock?.id ?? 0,
              quantity: element.quantity ?? 0,
            ));
          }
        });
        final response = await _cartRepository.insertCart(
          cart: CartRequest(
            shopId: state.orderData?.shop?.id ?? 0,
            carts: list,
          ),
        );
        response.when(
          success: (data) {
            state = state.copyWith(isAddLoading: false);
            onSuccess();
          },
          failure: (activeFailure, status) {
            state = state.copyWith(isAddLoading: false);
            AppHelpers.showCheckTopSnackBar(
              context,
              AppHelpers.getTranslation(activeFailure.toString()),
            );
          },
        );
      } else {
        if (context.mounted) {
          AppHelpers.showNoConnectionSnackBar(context);
        }
      }
    } else {
      state = state.copyWith(isCheckShopOrder: true);
    }
  }

  Future<void> showOrder(
      BuildContext context, num orderId, bool isRefresh) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      if (!isRefresh) {
        state = state.copyWith(isLoading: true, isMapLoading: true);
      }

      final response = await _orderRepository.getSingleOrder(orderId);
      response.when(
        success: (data) async {
          final ImageCropperForMarker image = ImageCropperForMarker();
          if (!isRefresh) {
            state = state.copyWith(
              orderData: data,
              isLoading: false,
            );
            Map<MarkerId, Marker> list = {
              const MarkerId("Shop"): Marker(
                  markerId: const MarkerId("Shop"),
                  position: LatLng(
                    data.shop?.location?.latitude ?? AppConstants.demoLatitude,
                    data.shop?.location?.longitude ??
                        AppConstants.demoLongitude,
                  ),
                  icon: await image.resizeAndCircle(
                      data.shop?.logoImg ?? "", 120)),
              const MarkerId("User"): Marker(
                  markerId: const MarkerId("User"),
                  position: LatLng(
                    data.location?.latitude ?? AppConstants.demoLatitude,
                    data.location?.longitude ?? AppConstants.demoLongitude,
                  ),
                  icon: await image.resizeAndCircle(data.user?.img ?? "", 120)),
            };
            state = state.copyWith(markers: list, isMapLoading: false);
            getRoutingAll(
                context: context,
                end: LatLng(data.location?.latitude ?? 0,
                    data.location?.longitude ?? 0),
                start: LatLng(data.shop?.location?.latitude ?? 0,
                    data.shop?.location?.longitude ?? 0));
          } else {
            state = state.copyWith(orderData: data);
            Map<MarkerId, Marker> list = {
              const MarkerId("Shop"): Marker(
                  markerId: const MarkerId("Shop"),
                  position: LatLng(
                    data.shop?.location?.latitude ?? AppConstants.demoLatitude,
                    data.shop?.location?.longitude ??
                        AppConstants.demoLongitude,
                  ),
                  icon: await image.resizeAndCircle(
                      data.shop?.logoImg ?? "", 120)),
              const MarkerId("User"): Marker(
                  markerId: const MarkerId("User"),
                  position: LatLng(
                    data.location?.latitude ?? AppConstants.demoLatitude,
                    data.location?.longitude ?? AppConstants.demoLongitude,
                  ),
                  icon: await image.resizeAndCircle(data.user?.img ?? "", 120)),
            };

            state = state.copyWith(markers: list);
          }
        },
        failure: (activeFailure, status) {
          if (!isRefresh) {
            state = state.copyWith(isLoading: false);
          }
          if (context.mounted) {
            AppHelpers.showCheckTopSnackBar(
              context,
              AppHelpers.getTranslation(activeFailure.toString()),
            );
          }
        },
      );
    } else {
      if (context.mounted) {
        AppHelpers.showNoConnectionSnackBar(context);
      }
    }
  }

  Future<void> cancelOrder(BuildContext context, num orderId) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      state = state.copyWith(isButtonLoading: true);
      final response = await _orderRepository.cancelOrder(orderId);
      response.when(
        success: (data) async {
          state = state.copyWith(isButtonLoading: false);
          context.maybePop(context);
        },
        failure: (activeFailure, status) {
          state = state.copyWith(isButtonLoading: false);
          if (context.mounted) {
            AppHelpers.showCheckTopSnackBar(
              context,
              AppHelpers.getTranslation(activeFailure.toString()),
            );
          }
        },
      );
    } else {
      if (context.mounted) {
        AppHelpers.showNoConnectionSnackBar(context);
      }
    }
  }

  Future<void> refundOrder(BuildContext context, String title) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      state = state.copyWith(isButtonLoading: true);
      final response =
          await _orderRepository.refundOrder(state.orderData?.id ?? 0, title);
      response.when(
        success: (data) async {
          state = state.copyWith(isButtonLoading: false);
          AppHelpers.showCheckTopSnackBarDone(
              context, AppHelpers.getTranslation(TrKeys.successfully));
          context.maybePop(context);
        },
        failure: (activeFailure, status) {
          state = state.copyWith(isButtonLoading: false);
          if (context.mounted) {
            AppHelpers.showCheckTopSnackBar(
              context,
              AppHelpers.getTranslation(activeFailure.toString()),
            );
          }
        },
      );
    } else {
      if (context.mounted) {
        AppHelpers.showNoConnectionSnackBar(context);
      }
    }
  }

  Future<void> addReview(
      BuildContext context, String comment, double rating) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      state = state.copyWith(isButtonLoading: true);
      final response = await _orderRepository.addReview(
          state.orderData?.id ?? 0,
          rating: rating,
          comment: comment);
      response.when(
        success: (data) async {
          state = state.copyWith(isButtonLoading: false);
          context.maybePop(context);
        },
        failure: (activeFailure, status) {
          state = state.copyWith(isButtonLoading: false);
          if (context.mounted) {
            AppHelpers.showCheckTopSnackBar(
              context,
              AppHelpers.getTranslation(activeFailure.toString()),
            );
          }
        },
      );
    } else {
      if (context.mounted) {
        AppHelpers.showNoConnectionSnackBar(context);
      }
    }
  }

  // Future<void> makePayment(
  //   BuildContext context,
  //   String name,
  //   int? orderId,
  // ) async {
  //   try {
  //     final response = await _orderRepository.process(orderId ?? 0, name);
  //     response.when(
  //       success: (data) async {
  //         Navigator.push(context,
  //             MaterialPageRoute(builder: (_) => WebViewPage(url: data)));
  //       },
  //       failure: (activeFailure, status) {
  //         state = state.copyWith(isButtonLoading: false);
  //         if (context.mounted) {
  //           AppHelpers.showCheckTopSnackBar(
  //             context,
  //             AppHelpers.getTranslation(activeFailure.toString()),
  //           );
  //         }
  //       },
  //     );
  //   } catch (e) {
  //     AppHelpers.showCheckTopSnackBar(
  //       context,
  //       AppHelpers.getTranslation(TrKeys.paymentMethodFailed),
  //     );
  //   }
  // }

  Future<void> getRoutingAll({
    required BuildContext context,
    LatLng? start,
    LatLng? end,
  }) async {
    if (await AppConnectivity.connectivity()) {
      state = state.copyWith(polylineCoordinates: []);
      final response = await _drawRouting.getRouting(start: start, end: end);
      response.when(
        success: (data) {
          List<LatLng> list = [];
          List ls = data.features[0].geometry.coordinates;
          for (int i = 0; i < ls.length; i++) {
            list.add(LatLng(ls[i][1], ls[i][0]));
          }
          state = state.copyWith(
            polylineCoordinates: list,
          );
        },
        failure: (failure, status) {
          state = state.copyWith(polylineCoordinates: []);
        },
      );
    } else {
      if (context.mounted) {
        AppHelpers.showNoConnectionSnackBar(context);
      }
    }
  }
}
