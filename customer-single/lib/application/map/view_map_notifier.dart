import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:riverpodtemp/domain/iterface/user.dart';
import 'package:riverpodtemp/infrastructure/models/data/address_new_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_connectivity.dart';
import 'package:riverpodtemp/app_constants.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/marker_image_cropper.dart';

import '../../domain/iterface/shops.dart';
import '../../infrastructure/services/tr_keys.dart';
import 'view_map_state.dart';

class ViewMapNotifier extends StateNotifier<ViewMapState> {
  final ShopsRepositoryFacade _shopsRepository;
  final UserRepositoryFacade _userRepository;

  ViewMapNotifier(this._shopsRepository, this._userRepository)
      : super(const ViewMapState());

  void changePlace(AddressNewModel place) {
    state = state.copyWith(placeOne: place, isSetAddress: true);
  }

  void scrolling(bool scroll) {
    state = state.copyWith(isScrolling: scroll);
  }

  saveLocation(
    BuildContext context, {
    VoidCallback? onSuccess,
    AddressNewModel? addressNewModel,
  }) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      state = state.copyWith(
        isLoading: true,
      );
      final response = await _userRepository.saveLocation(
        address: state.placeOne!.copyWith(
          title: LocalStorage.getAddressSelected()?.title??addressNewModel?.title,
          address: addressNewModel?.address,
        ),
      );
      response.when(
        success: (data) async {
          state = state.copyWith(
            isLoading: false,
          );
          onSuccess?.call();
        },
        failure: (failure, status) {
          state = state.copyWith(
            isLoading: false,
          );
        },
      );
    } else {
      if (context.mounted) {
        AppHelpers.showNoConnectionSnackBar(context);
      }
    }
  }

  updateLocation(BuildContext context, int? id,
      {VoidCallback? onSuccess, AddressNewModel? addressNewModel}) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      state = state.copyWith(
        isLoading: true,
      );
      final response = await _userRepository.updateLocation(
        address: state.placeOne!.copyWith(
          title: LocalStorage.getAddressSelected()?.title,
          address: addressNewModel?.address,
        ),
        addressId: id,
      );
      response.when(
        success: (data) async {
          state = state.copyWith(isLoading: false);
          onSuccess?.call();
        },
        failure: (failure, status) {
          state = state.copyWith(isLoading: false);
        },
      );
    } else {
      if (context.mounted) {
        AppHelpers.showNoConnectionSnackBar(context);
      }
    }
  }

  void checkAddress() {
    AddressNewModel? data = LocalStorage.getAddressSelected();
    if (data == null) {
      state = state.copyWith(isSetAddress: false);
    } else {
      state = state.copyWith(isSetAddress: true);
    }
  }

  updateActive() {
    state = state.copyWith(isLoading: true);
  }

  Future<void> checkDriverZone(
      {required BuildContext context,
      required LatLng location,
      int? shopId}) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      state = state.copyWith(isLoading: true, isActive: false);
      final response =
          await _shopsRepository.checkDriverZone(location, shopId: shopId);
      response.when(
        success: (data) async {
          state = state.copyWith(isLoading: false, isActive: data);
          if (!data) {
            AppHelpers.showCheckTopSnackBarInfo(
              context,
              AppHelpers.getTranslation(TrKeys.noDriverZone),
            );
          }
        },
        failure: (activeFailure, status) {
          state = state.copyWith(isLoading: false);
          if (status != 400) {
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

  Future<void> fetchBranches(BuildContext context) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      state = state.copyWith(
        isBranchLoading: true,
      );
      final response = await _shopsRepository.getAllShops(
        1,
        isOpen: true,
      );
      response.when(
        success: (data) {
          state = state.copyWith(
            branches: data.data ?? [],
            isBranchLoading: false,
          );
          final ImageCropperForMarker image = ImageCropperForMarker();
          Set<Marker> list = {};
          data.data?.forEach((element) async {
            list.add(Marker(
                markerId: const MarkerId("Shop"),
                position: LatLng(
                  element.location?.latitude ?? AppConstants.demoLatitude,
                  element.location?.longitude ?? AppConstants.demoLongitude,
                ),
                infoWindow: InfoWindow(
                  title: element.translation?.title?.toUpperCase(),
                ),
                icon: await image.resizeAndCircle(element.logoImg ?? "", 120)));
          });

          state = state.copyWith(shopMarkers: list);
        },
        failure: (failure, status) {
          state = state.copyWith(
            isBranchLoading: false,
          );
          AppHelpers.showCheckTopSnackBar(
            context,
            AppHelpers.getTranslation(failure.toString()),
          );
        },
      );
    } else {
      if (context.mounted) {
        AppHelpers.showNoConnectionSnackBar(
          context,
        );
      }
    }
  }
}
