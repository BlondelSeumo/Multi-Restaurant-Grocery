
import 'package:flutter/material.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:riverpodtemp/infrastructure/models/data/get_calculate_data.dart';
import 'package:riverpodtemp/infrastructure/models/data/order_active_model.dart';
import 'package:riverpodtemp/infrastructure/models/response/branches_response.dart';
import 'package:riverpodtemp/infrastructure/models/response/delivery_options_response.dart';
import '../../infrastructure/models/data/shop_data.dart';
part 'order_state.freezed.dart';

@freezed
class OrderState with _$OrderState {

  const factory OrderState({
    @Default(false) bool isActive,
    @Default(false) bool isOrder,
    @Default(false) bool isLoading,
    @Default(false) bool isMapLoading,
    @Default(false) bool isButtonLoading,
    @Default(false) bool isTodayWorkingDay,
    @Default(false) bool isTomorrowWorkingDay,
    @Default(null) num? walletPrice,
    @Default(false) bool isCheckShopOrder,
    @Default(false) bool isAddLoading,
    @Default(null) String? promoCode,
    @Default(null) String? office,
    @Default(null) String? house,
    @Default(null) String? floor,
    @Default(null) String? note,
    @Default(null) TimeOfDay? selectTime,
    @Default(null) DateTime? selectDate,
    @Default(TimeOfDay(hour: 0, minute: 0)) TimeOfDay startTodayTime,
    @Default(TimeOfDay(hour: 0, minute: 0)) TimeOfDay endTodayTime,
    @Default(TimeOfDay(hour: 0, minute: 0)) TimeOfDay startTomorrowTime,
    @Default(TimeOfDay(hour: 0, minute: 0)) TimeOfDay endTomorrowTime,
    @Default(0) int tabIndex,
    @Default(-1) int branchIndex,
    @Default(null) OrderActiveModel? orderData,
    @Default(null) ShopData? shopData,
    @Default([]) List<BranchModel>? branches,
    @Default(null) GetCalculateModel? calculateData,
    @Default({}) Map<MarkerId, Marker> markers,
    @Default({}) Set<Marker> shopMarkers,
    @Default([]) List<String> todayTimes,
    @Default([]) List<List<String>> dailyTimes,
    @Default(null) DeliveryOptionData? deliveryOption,
    @Default([]) List<DeliveryOptionData> deliveryOptions,
    @Default([]) List<LatLng> polylineCoordinates,
  }) = _OrderState;


  const OrderState._();
}