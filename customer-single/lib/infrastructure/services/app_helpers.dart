// ignore_for_file: deprecated_member_use

import 'dart:io';
import 'dart:math';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:geocoding/geocoding.dart';
import 'package:intl/intl.dart';

import 'package:riverpodtemp/app_constants.dart';
import 'package:riverpodtemp/domain/di/dependency_manager.dart';
import 'package:riverpodtemp/infrastructure/models/data/addons_data.dart';
import 'package:riverpodtemp/infrastructure/models/data/local_cart_model.dart';
import 'package:riverpodtemp/infrastructure/models/data/socials_model.dart';
import 'package:riverpodtemp/infrastructure/models/models.dart';
import 'package:riverpodtemp/infrastructure/models/request/cart_request.dart';
import 'package:riverpodtemp/infrastructure/services/enums.dart';
import 'package:riverpodtemp/infrastructure/services/extension.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/button_effect.dart';
import 'package:riverpodtemp/presentation/components/buttons/custom_button.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';
import 'package:riverpodtemp/presentation/theme/theme_wrapper.dart';
import 'package:top_snackbar_flutter/custom_snack_bar.dart';
import 'package:top_snackbar_flutter/top_snack_bar.dart';
import '../../../infrastructure/services/local_storage.dart';
import '../models/data/cart_data.dart';
import 'vibration.dart';

extension ExtendedIterable<E> on Iterable<E> {
  Iterable mapIndexed<T>(T Function(E e, int i) f) {
    var i = 0;
    return map((e) => f(e, i++));
  }
}

class AppHelpers {
  AppHelpers._();

  static bool checkYesterday(String? startTime, String? endTime) {
    final now = DateTime.now().subtract(const Duration(days: 1));
    final format = DateFormat('HH:mm');

    DateTime start = format.parse(startTime.toSingleTime);
    DateTime end = format.parse(endTime.toSingleTime);

    start = DateTime(
        now.year, now.month, now.day, start.hour, start.minute, start.second);
    end = DateTime(
        now.year, now.month, now.day, end.hour, end.minute, end.second);
    return end.isBefore(start);
  }


  static bool getHourFormat24() {
    final List<SettingsData> settings = LocalStorage.getSettingsList();
    for (final setting in settings) {
      if (setting.key == 'using_12_hour_format') {
        return (setting.value ?? "0") == "0";
      }
    }
    return true;
  }

  static String generateNonce([int length = 32]) {
    const charset =
        '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-.';
    final random = Random.secure();
    return List.generate(length, (i) => charset[random.nextInt(charset.length)])
        .join();
  }

  static double bottomSpace(BuildContext context) {
    return MediaQuery.paddingOf(context).bottom * 0.6 + 16;
  }

  static double topSpace(BuildContext context) {
    return (MediaQuery.paddingOf(context).top * 0.6) + 8;
  }

  static List<SocialModel> getSocialButtons() {
    if (!Platform.isIOS) {
      return AppConstants.socials.where((social) {
        return social.type != SocialType.apple;
      }).toList();
    }
    return AppConstants.socials;
  }

  static String numberFormat(
    num? number, {
    String? symbol,
    bool? isOrder,
    int? decimalDigits,
  }) {
    if (LocalStorage.getSelectedCurrency().position == "before") {
      return NumberFormat.currency(
        customPattern: '\u00a4#,###.#',
        symbol: (isOrder ?? false)
            ? symbol ?? LocalStorage.getSelectedCurrency().symbol
            : LocalStorage.getSelectedCurrency().symbol,
        decimalDigits: decimalDigits ??
            ((number?.toStringAsFixed(1).length ?? 0) > 5 ? 0 : 2),
      ).format(number ?? 0);
    } else {
      return NumberFormat.currency(
        customPattern: '#,###.#\u00a4',
        symbol: (isOrder ?? false)
            ? symbol ?? LocalStorage.getSelectedCurrency().symbol
            : LocalStorage.getSelectedCurrency().symbol,
        decimalDigits: decimalDigits ??
            ((number?.toStringAsFixed(1).length ?? 0) > 5 ? 0 : 2),
      ).format(number ?? 0);
    }
  }

  static int getDayNumber(String day) {
    switch (day.toLowerCase()) {
      case 'monday':
        return 1;
      case 'tuesday':
        return 2;
      case 'wednesday':
        return 3;
      case 'thursday':
        return 4;
      case 'friday':
        return 5;
      case 'saturday':
        return 6;
      case 'sunday':
        return 7;
      default:
        throw ArgumentError('Invalid day of the week');
    }
  }

  static String errorHandler(e) {
    try {
      return (e.runtimeType == DioException)
          ? ((e as DioException).response?.data["message"] == "Bad request."
              ? (e.response?.data["params"] as Map).values.first[0]
              : e.response?.data["message"])
          : e.toString();
    } catch (s) {
      try {
        return (e.runtimeType == DioException)
            ? ((e as DioException).response?.data.toString().substring(
                    (e.response?.data.toString().indexOf("<title>") ?? 0) + 7,
                    e.response?.data.toString().indexOf("</title") ?? 0))
                .toString()
            : e.toString();
      } catch (r) {
        return (e.runtimeType == DioException)
            ? ((e as DioException).response?.data["message"]).toString()
            : e.toString();
      }
    }
  }

  static showNoConnectionSnackBar(
    BuildContext context,
  ) {
    ScaffoldMessenger.of(context).clearSnackBars();
    final snackBar = SnackBar(
      backgroundColor: AppStyle.primary,
      behavior: SnackBarBehavior.floating,
      duration: const Duration(seconds: 3),
      content: Text(
        'No internet connection',
        style: AppStyle.interNoSemi(
          size: 14,
          color: AppStyle.white,
        ),
      ),
      action: SnackBarAction(
        label: 'Close',
        disabledTextColor: AppStyle.black,
        textColor: AppStyle.black,
        onPressed: () {
          ScaffoldMessenger.of(context).hideCurrentSnackBar();
        },
      ),
    );
    ScaffoldMessenger.of(context).showSnackBar(snackBar);
  }

  static openDialog({
    required BuildContext context,
    required String title,
  }) {
    return showDialog(
      context: context,
      builder: (_) {
        return ThemeWrapper(
          builder: (colors, controller) => Dialog(
            backgroundColor: AppStyle.transparent,
            insetPadding: EdgeInsets.symmetric(horizontal: 16.w),
            child: Container(
              margin: EdgeInsets.all(24.w),
              width: double.infinity,
              padding: EdgeInsets.all(24.w),
              decoration: BoxDecoration(
                color: AppStyle.bgGrey,
                borderRadius: BorderRadius.circular(24.r),
              ),
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    Text(
                      title,
                      textAlign: TextAlign.center,
                      style: AppStyle.interNormal(
                          color: colors.textBlack, size: 18),
                    ),
                    24.verticalSpace,
                    CustomButton(
                      onPressed: () => Navigator.pop(context),
                      title: AppHelpers.getTranslation(TrKeys.close),
                      background: AppStyle.primary,
                      textColor: AppStyle.white,
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  static addProduct({
    required BuildContext context,
    required ProductData? product,
    required VoidCallback update,
    required Stocks? stock,
  }) {
    if ((stock?.quantity ?? 0) <= 0) {
      Vibrate.feedback(FeedbackType.error);
      openDialog(
          context: context,
          title: AppHelpers.getTranslation(TrKeys.errorQuantity));
      return;
    }
    Vibrate.feedback(FeedbackType.selection);
    int count = getCountCart(
        productId: product?.id, stockId: stock?.id, addons: stock?.addons);
    if (count >= (product?.maxQty ?? 100)) {
      openDialog(
        context: context,
        title: "${AppHelpers.getTranslation(TrKeys.errorMaxQty)} $count",
      );
      return;
    }
    if (count >= (stock?.quantity ?? 100)) {
      openDialog(
        context: context,
        title: "${AppHelpers.getTranslation(TrKeys.errorQuantity)} $count",
      );
      return;
    }
    if ((stock?.quantity ?? 100) <=
        count + (count != 0 ? 1 : product?.minQty ?? 1)) {
      LocalStorage.setCartList(
        addons: stock?.addons,
        productId: product?.id,
        stockId: stock?.id,
        count: count + (count != 0 ? 1 : stock?.quantity ?? 1),
      );

      update.call();

      return;
    }

    LocalStorage.setCartList(
        addons: stock?.addons,
        productId: product?.id,
        stockId: stock?.id,
        count: count +
            (count != 0
                ? 1
                : (product?.minQty ?? 1) == 0
                    ? 1
                    : (product?.minQty ?? 1)));
    update.call();
  }

  static removeProduct(
      {required BuildContext context,
      required ProductData? product,
      required VoidCallback update,
      required Stocks? stock}) {
    Vibrate.feedback(FeedbackType.selection);
    int count = AppHelpers.getCountCart(
        productId: product?.id, stockId: stock?.id, addons: stock?.addons);
    if (count <= (product?.minQty ?? 1)) {
      LocalStorage.setCartList(
        productId: product?.id,
        stockId: stock?.id,
        count: 0,
        addons: stock?.addons,
      );
      update.call();
      return;
    }
    LocalStorage.setCartList(
        addons: stock?.addons,
        productId: product?.id,
        stockId: stock?.id,
        count: count - 1);
    update.call();
  }

  static deleteProduct(
      {required BuildContext context,
      required ProductData? product,
      required VoidCallback update,
      required Stocks? stock}) {
    Vibrate.feedback(FeedbackType.selection);
    LocalStorage.setCartList(
      productId: product?.id,
      stockId: stock?.id,
      count: 0,
      addons: stock?.addons
          ?.skipWhile((value) => !(value.active ?? false))
          .toList(),
    );
    update.call();
  }

  static bool productInclude(
      {required int? productId,
      required int? stockId,
      required List<Addons>? addons}) {
    final list = LocalStorage.getCartList();
    for (var element in list) {
      if (element.productId == productId && element.stockId == stockId) {
        if (element.count <= 0) {
          return false;
        }
        if (element.addons?.isNotEmpty ?? false) {
          continue;
        }
        return true;
      }
    }
    return false;
  }

  static int getCountCart(
      {required int? productId,
      required int? stockId,
      required List<Addons>? addons}) {
    final list = LocalStorage.getCartList();
    for (var element in list) {
      if (element.productId == productId && element.stockId == stockId) {
        if ((element.addons?.isEmpty ?? true) && (addons?.isEmpty ?? true)) {
          return element.count;
        }

        final a = addons?.map((e) => e.stockId).toList();
        a?.sort((a, b) => a?.compareTo(b ?? 0) ?? 0);

        final b = element.addons?.map((e) => e.stockId).toList();
        b?.sort((a, b) => a?.compareTo(b ?? 0) ?? 0);

        if (listEquals(a, b)) {
          return element.count;
        }
      }
    }
    return 0;
  }

  static void setCartAfterLogin() {
    final listOfProduct = LocalStorage.getCartList();
    List<List<CartRequest>> listOfList = [];
    if (listOfProduct.isNotEmpty) {
      for (var element in listOfProduct) {
        List<CartRequest> list = [];
        LocalStorage.setCartLocal(CartLocalModel(
          quantity: element.count,
          stockId: element.stockId ?? 0,
        ));
        list.add(
          CartRequest(
            stockId: element.stockId,
            quantity: element.count,
          ),
        );
        for (Addons addon in element.addons ?? []) {
          list.add(
            CartRequest(
                stockId: addon.stockId,
                quantity: addon.quantity,
                parentId: element.stockId),
          );
        }
        listOfList.add(list);
      }
      for (var element in listOfList) {
        cartRepository.insertCart(
            cart:
                CartRequest(shopId: LocalStorage.getShopId(), carts: element));
      }
      LocalStorage.deleteCartList();
    }
  }

  static ExtrasType getExtraTypeByValue(String? value) {
    switch (value) {
      case 'color':
        return ExtrasType.color;
      case 'text':
        return ExtrasType.text;
      case 'image':
        return ExtrasType.image;
      default:
        return ExtrasType.text;
    }
  }

  static OrderStatus getOrderStatus(String? value) {
    switch (value) {
      case 'new':
        return OrderStatus.open;
      case 'accepted':
        return OrderStatus.accepted;
      case 'ready':
        return OrderStatus.ready;
      case 'on_a_way':
        return OrderStatus.onWay;
      case 'delivered':
        return OrderStatus.delivered;
      default:
        return OrderStatus.canceled;
    }
  }

  static String? getOrderByString(String value) {
    switch (getTranslationReverse(value)) {
      case "new":
        return "new";
      case "trust_you":
        return "trust_you";
      case 'highly_rated':
        return "high_rating";
      case 'best_sale':
        return "best_sale";
      case 'low_sale':
        return "low_sale";
      case 'low_rating':
        return "low_rating";
    }
    return null;
  }

  static String getOrderStatusText(OrderStatus value) {
    switch (value) {
      case OrderStatus.open:
        return "new";
      case OrderStatus.accepted:
        return "accepted";
      case OrderStatus.ready:
        return "ready";
      case OrderStatus.onWay:
        return "on_a_way";
      case OrderStatus.delivered:
        return "delivered";
      default:
        return "canceled";
    }
  }

  static showCheckTopSnackBar(BuildContext context, String text) {
    return showTopSnackBar(
      Overlay.of(context),
      CustomSnackBar.error(
        message: "$text. Please check your credentials and try again",
      ),
    );
  }

  static showCheckTopSnackBarInfo(BuildContext context, String text,
      {VoidCallback? onTap}) {
    return showTopSnackBar(
        Overlay.of(context), CustomSnackBar.info(message: text),
        onTap: onTap);
  }

  static showCheckTopSnackBarDone(BuildContext context, String text) {
    return showTopSnackBar(
      Overlay.of(context),
      CustomSnackBar.success(
        message: text,
      ),
    );
  }

  static double getOrderStatusProgress(String? status) {
    switch (status) {
      case 'new':
        return 0.2;
      case 'accepted':
        return 0.4;
      case 'ready':
        return 0.6;
      case 'on_a_way':
        return 0.8;
      case 'delivered':
        return 1;
      default:
        return 0.2;
    }
  }

  static String getAppName() {
    final List<SettingsData> settings = LocalStorage.getSettingsList();
    for (final setting in settings) {
      if (setting.key == 'title') {
        if (setting.value == 'null') return '';
        return setting.value ?? '';
      }
    }
    return '';
  }

  static bool getReferralActive() {
    final List<SettingsData> settings = LocalStorage.getSettingsList();
    for (final setting in settings) {
      if (setting.key == 'referral_active') {
        return setting.value == "1";
      }
    }
    return false;
  }

  static String? getAppPhone() {
    final List<SettingsData> settings = LocalStorage.getSettingsList();
    for (final setting in settings) {
      if (setting.key == 'phone') {
        return setting.value;
      }
    }
    return '';
  }

  static String? getPaymentType() {
    // final List<SettingsData> settings = LocalStorage.getSettingsList();
    // for (final setting in settings) {
    //   if (setting.key == 'payment_type') {
    //     return setting.value;
    //   }
    // }
    return 'admin';
  }

  static String getAppAddressName() {
    final List<SettingsData> settings = LocalStorage.getSettingsList();
    for (final setting in settings) {
      if (setting.key == 'address') {
        if (setting.value == 'null') return '';
        return setting.value ?? '';
      }
    }
    return '';
  }

  static String getTranslation(String trKey) {
    final Map<String, dynamic> translations = LocalStorage.getTranslations();
    for (final key in translations.keys) {
      if (trKey == key) {
        return translations[key];
      }
    }
    return trKey;
  }

  static String getTranslationReverse(String trKey) {
    final Map<String, dynamic> translations = LocalStorage.getTranslations();
    for (int i = 0; i < translations.values.length; i++) {
      if (trKey == translations.values.elementAt(i)) {
        return translations.keys.elementAt(i);
      }
    }
    return trKey;
  }

  static bool checkIsSvg(String? url) {
    if (url == null || (url.length) < 3) {
      return false;
    }
    final length = url.length;
    return url.substring(length - 3, length) == 'svg';
  }

  static double? getInitialLatitude() {
    try {
      final List<SettingsData> settings = LocalStorage.getSettingsList();
      for (final setting in settings) {
        if (setting.key == 'location') {
          final String? latString =
              setting.value?.substring(0, setting.value?.indexOf(','));
          if (latString == null) {
            return null;
          }
          final double? lat = double.tryParse(latString);
          return lat;
        }
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  static String appPlaceName(List<Placemark> placemarks) {
    if (placemarks.isNotEmpty) {
      final Placemark pos = placemarks[0];
      final List<String> addressData = [];
      addressData.add(pos.name!);
      if (pos.thoroughfare != null && pos.thoroughfare!.isNotEmpty) {
        addressData.add(pos.thoroughfare!);
      }
      if (pos.subLocality != null && pos.subLocality!.isNotEmpty) {
        addressData.add(pos.subLocality!);
      }
      addressData.add(pos.locality!);
      final String placeName = addressData.join(', ');
      return placeName;
    }
    return '';
  }

  static double? getInitialLongitude() {
    try {
      final List<SettingsData> settings = LocalStorage.getSettingsList();
      for (final setting in settings) {
        if (setting.key == 'location') {
          final String? latString =
              setting.value?.substring(0, setting.value?.indexOf(','));
          if (latString == null) {
            return null;
          }
          final String? lonString = setting.value
              ?.substring((latString.length) + 2, setting.value?.length);
          if (lonString == null) {
            return null;
          }
          final double? lon = double.tryParse(lonString);
          return lon;
        }
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  static void showCustomModalBottomDragSheet({
    required BuildContext context,
    required Function(ScrollController controller) modal,
    bool isDarkMode = false,
    double radius = 16,
    bool isDrag = true,
    bool isDismissible = true,
    double paddingTop = 100,
    double maxChildSize = 0.9,
  }) {
    showModalBottomSheet(
      isDismissible: isDismissible,
      enableDrag: isDrag,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(radius.r),
          topRight: Radius.circular(radius.r),
        ),
      ),
      isScrollControlled: true,
      constraints: BoxConstraints(
        maxHeight: MediaQuery.sizeOf(context).height - paddingTop.r,
      ),
      backgroundColor: AppStyle.transparent,
      context: context,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: maxChildSize,
        maxChildSize: maxChildSize,
        expand: false,
        builder: (BuildContext context, ScrollController scrollController) {
          return modal(scrollController);
        },
      ),
    );
  }

  static void showCustomModalBottomSheet({
    required BuildContext context,
    required Widget modal,
    required bool isDarkMode,
    double radius = 16,
    bool isDrag = true,
    bool isDismissible = true,
    double paddingTop = 200,
  }) {
    showModalBottomSheet(
      isDismissible: isDismissible,
      enableDrag: isDrag,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(radius.r),
          topRight: Radius.circular(radius.r),
        ),
      ),
      isScrollControlled: true,
      constraints: BoxConstraints(
        maxHeight: MediaQuery.sizeOf(context).height - paddingTop.r,
      ),
      backgroundColor: AppStyle.transparent,
      context: context,
      builder: (context) => modal,
    );
  }

  static void showAlertDialog({
    required BuildContext context,
    required Widget Function(CustomColorSet colors) child,
    double radius = 16,
  }) {
    // AlertDialog alert = AlertDialog(
    //   backgroundColor: bgColor,
    //   shape: RoundedRectangleBorder(
    //     borderRadius: BorderRadius.all(
    //       Radius.circular(radius.r),
    //     ),
    //   ),
    //   contentPadding: EdgeInsets.all(20.r),
    //   iconPadding: EdgeInsets.zero,
    //   content: child,
    // );

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return ThemeWrapper(
          builder: (colors, controller) => AlertDialog(
            backgroundColor: colors.scaffoldColor,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.all(
                Radius.circular(radius.r),
              ),
            ),
            contentPadding: EdgeInsets.all(20.r),
            iconPadding: EdgeInsets.zero,
            content: child(colors),
          ),
        );
      },
    );
  }

  static openDialogImagePicker({
    required BuildContext context,
    required VoidCallback openCamera,
    required VoidCallback openGallery,
    required CustomColorSet colors,
  }) {
    return showDialog(
      context: context,
      builder: (_) {
        return Dialog(
          backgroundColor: AppStyle.transparent,
          insetPadding: EdgeInsets.symmetric(horizontal: 16.w),
          child: Container(
            margin: EdgeInsets.all(24.w),
            width: double.infinity,
            padding: EdgeInsets.all(24.w),
            decoration: BoxDecoration(
              color: colors.buttonColor,
              borderRadius: BorderRadius.circular(24.r),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Text(
                  getTranslation(TrKeys.selectPhoto),
                  textAlign: TextAlign.center,
                  style: AppStyle.interNormal(
                    size: 18,
                    color: colors.textBlack,
                  ),
                ),
                Divider(color: colors.divider),
                8.verticalSpace,
                ButtonEffectAnimation(
                  onTap: openCamera,
                  child: Padding(
                    padding:
                        EdgeInsets.symmetric(horizontal: 16.r, vertical: 8.r),
                    child: Row(
                      children: [
                        Icon(
                          FlutterRemix.camera_lens_line,
                          color: colors.textBlack,
                        ),
                        4.horizontalSpace,
                        Text(
                          getTranslation(TrKeys.takePhoto),
                          textAlign: TextAlign.center,
                          style: AppStyle.interNormal(
                            size: 16,
                            color: colors.textBlack,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                8.verticalSpace,
                ButtonEffectAnimation(
                  onTap: openGallery,
                  child: Padding(
                    padding:
                        EdgeInsets.symmetric(horizontal: 16.r, vertical: 8.r),
                    child: Row(
                      children: [
                        Icon(
                          FlutterRemix.gallery_line,
                          color: colors.textBlack,
                        ),
                        4.horizontalSpace,
                        Text(
                          getTranslation(TrKeys.chooseFromLibrary),
                          textAlign: TextAlign.center,
                          style: AppStyle.interNormal(
                            size: 16,
                            color: colors.textBlack,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

extension TimeOfDayExtension on TimeOfDay {
  TimeOfDay addHour(int hour) {
    return replacing(hour: this.hour != 23 ? (this.hour + hour) : 0, minute: 0);
  }
}

extension FindIndex on List<CartLocalModel> {
  int findIndex(int? stokeId) {
    int index = map((item) => item.stockId).toList().indexOf(stokeId ?? 0);
    return index;
  }

  int searchIndex(CartDetail cartDetail) {
    return indexWhere(
      (element) {
        return cartDetail.stock?.id == element.stockId &&
            cartDetail.addons?.map(
                  (e) {
                    return "${e.stockId}${e.quantity}";
                  },
                ).join('') ==
                element.addons
                    ?.map(
                      (e) => "${e.stockId}${e.quantity}",
                    )
                    .join('');
      },
    );
  }

  List<String> toUniqueStringList() {
    return map((e) => "${e.stockId}${e.addons?.map(
          (e) => "${e.stockId}${e.quantity}",
        ).toList().join('')}").toList();
  }
}

extension CartLocalModelEx on CartLocalModel {
  String getUniqueString() {
    return '$stockId${addons?.map(
          (e) => "${e.stockId}${e.quantity}",
        ).toList().join('')}';
  }
}

extension FindIndex2 on List<CartDetail> {
  int searchIndex(CartLocalModel cartLocalModel) {
    return indexWhere(
      (element) {
        return element.stock?.id == cartLocalModel.stockId &&
            element.addons
                    ?.map(
                      (e) => "${e.stockId}${e.quantity}",
                    )
                    .toList()
                    .join('') ==
                cartLocalModel.addons
                    ?.map(
                      (e) => "${e.stockId}${e.quantity}",
                    )
                    .toList()
                    .join('');
      },
    );
  }
}
