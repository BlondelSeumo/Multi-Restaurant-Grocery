import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:riverpodtemp/infrastructure/models/data/address_new_data.dart';
import 'package:riverpodtemp/infrastructure/models/models.dart';

part 'view_map_state.freezed.dart';

@freezed
class ViewMapState with _$ViewMapState {
  const factory ViewMapState({
    @Default(false) bool isLoading,
    @Default(false) bool isBranchLoading,
    @Default(false) bool isActive,
    @Default(false) bool isScrolling,
    @Default(null) AddressNewModel? place,
    @Default(null) AddressNewModel? placeOne,
    @Default(false) bool isSetAddress,
    @Default([]) List<ShopData> branches,
    @Default({}) Set<Marker> shopMarkers,
  }) = _ViewMapState;

  const ViewMapState._();
}
