// ignore_for_file: prefer_interpolation_to_compose_strings, use_build_context_synchronously
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:riverpodtemp/app_constants.dart';
import 'package:riverpodtemp/application/app_widget/app_provider.dart';
import 'package:riverpodtemp/application/home/home_provider.dart';
import 'package:riverpodtemp/application/map/view_map_notifier.dart';
import 'package:riverpodtemp/application/map/view_map_provider.dart';
import 'package:riverpodtemp/application/profile/profile_provider.dart';
import 'package:riverpodtemp/domain/di/dependency_manager.dart';
import 'package:riverpodtemp/infrastructure/models/data/address_information.dart';
import 'package:riverpodtemp/infrastructure/models/data/address_new_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tpying_delay.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/buttons/animation_button_effect.dart';
import 'package:riverpodtemp/presentation/components/buttons/custom_button.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import 'package:riverpodtemp/presentation/components/keyboard_dismisser.dart';
import 'package:riverpodtemp/presentation/pages/view_map/view_map_modal.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/map_themes.dart';

@RoutePage()
class ViewMapPage extends ConsumerStatefulWidget {
  final bool isShopLocation;
  final bool isPop;
  final bool isParcel;
  final int? shopId;
  final int? indexAddress;
  final AddressNewModel? address;
  final VoidCallback? onDelete;

  const ViewMapPage({
    super.key,
    this.onDelete,
    this.isParcel = false,
    this.isPop = true,
    this.isShopLocation = false,
    this.shopId,
    this.indexAddress,
    this.address,
  });

  @override
  ConsumerState<ViewMapPage> createState() => _ViewMapPageState();
}

class _ViewMapPageState extends ConsumerState<ViewMapPage>
    with SingleTickerProviderStateMixin {
  late ViewMapNotifier event;
  late TextEditingController controller;
  final GeolocatorPlatform _geolocatorPlatform = GeolocatorPlatform.instance;
  GoogleMapController? googleMapController;
  CameraPosition? cameraPosition;
  dynamic check;
  late LatLng latLng;
  final Delayed delayed = Delayed(milliseconds: 700);

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  void didChangeDependencies() {
    event = ref.read(viewMapProvider.notifier);
    super.didChangeDependencies();
  }

  checkPermission() async {
    check = await _geolocatorPlatform.checkPermission();
  }

  Future<void> getMyLocation() async {
    if (check == LocationPermission.denied ||
        check == LocationPermission.deniedForever) {
      check = await Geolocator.requestPermission();
      if (check != LocationPermission.denied &&
          check != LocationPermission.deniedForever) {
        var loc = await Geolocator.getCurrentPosition();
        latLng = LatLng(loc.latitude, loc.longitude);
        googleMapController!
            .animateCamera(CameraUpdate.newLatLngZoom(latLng, 15));
      }
    } else {
      if (check != LocationPermission.deniedForever) {
        var loc = await Geolocator.getCurrentPosition();
        latLng = LatLng(loc.latitude, loc.longitude);
        googleMapController!
            .animateCamera(CameraUpdate.newLatLngZoom(latLng, 15));
      }
    }
  }

  @override
  void initState() {
    controller = TextEditingController();
    latLng = LatLng(
      widget.address?.location?.first ??
          LocalStorage.getAddressSelected()?.location?.first ??
          (AppHelpers.getInitialLatitude() ?? AppConstants.demoLatitude),
      widget.address?.location?.last ??
          LocalStorage.getAddressSelected()?.location?.last ??
          (AppHelpers.getInitialLongitude() ?? AppConstants.demoLongitude),
    );
    checkPermission();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(viewMapProvider);
    final bool isLtr = LocalStorage.getLangLtr();
    final bool isDarkMode = ref.watch(appProvider).isDarkMode;
    return KeyboardDismisser(
      child: Directionality(
        textDirection: isLtr ? TextDirection.ltr : TextDirection.rtl,
        child: CustomScaffold(
          body: (colors) => SizedBox(
            width: MediaQuery.sizeOf(context).width,
            height: MediaQuery.sizeOf(context).height,
            child: Stack(
              children: [
                SizedBox(
                  width: MediaQuery.sizeOf(context).width,
                  height: state.isScrolling
                      ? MediaQuery.sizeOf(context).height
                      : MediaQuery.sizeOf(context).height - 0.r,
                  child: GoogleMap(
                    style: AppMapThemes.getTheme(),
                    onCameraMoveStarted: () {
                      ref.read(viewMapProvider.notifier).scrolling(true);
                    },
                    myLocationButtonEnabled: false,
                    initialCameraPosition: CameraPosition(
                      bearing: 0,
                      target: latLng,
                      tilt: 0,
                      zoom: 17,
                    ),
                    mapToolbarEnabled: false,
                    zoomControlsEnabled: false,
                    onTap: (position) {
                      event.updateActive();
                      delayed.run(
                        () async {
                          try {
                            final List<Placemark> placemarks =
                                await placemarkFromCoordinates(
                              cameraPosition?.target.latitude ??
                                  latLng.latitude,
                              cameraPosition?.target.longitude ??
                                  latLng.longitude,
                            );

                            controller.text =
                                AppHelpers.appPlaceName(placemarks);
                          } catch (e) {
                            controller.text = '';
                          }

                          event
                            ..checkDriverZone(
                                context: context,
                                location: LatLng(
                                  cameraPosition?.target.latitude ??
                                      latLng.latitude,
                                  cameraPosition?.target.longitude ??
                                      latLng.longitude,
                                ),
                                shopId: widget.shopId)
                            ..changePlace(
                              AddressNewModel(
                                address: AddressInformation(
                                  address: controller.text,
                                ),
                                location: [
                                  cameraPosition?.target.latitude ??
                                      latLng.latitude,
                                  cameraPosition?.target.longitude ??
                                      latLng.longitude
                                ],
                              ),
                            );
                        },
                      );
                      googleMapController!.animateCamera(
                          CameraUpdate.newLatLngZoom(position, 15));
                    },
                    onCameraIdle: () {
                      event.updateActive();
                      delayed.run(() async {
                        try {
                          final List<Placemark> placemarks =
                              await placemarkFromCoordinates(
                            cameraPosition?.target.latitude ?? latLng.latitude,
                            cameraPosition?.target.longitude ??
                                latLng.longitude,
                          );
                          controller.text = AppHelpers.appPlaceName(placemarks);
                        } catch (e) {
                          controller.text = '';
                        }

                        if (!widget.isShopLocation) {
                          event
                            ..checkDriverZone(
                              context: context,
                              location: LatLng(
                                cameraPosition?.target.latitude ??
                                    latLng.latitude,
                                cameraPosition?.target.longitude ??
                                    latLng.longitude,
                              ),
                              shopId: widget.shopId,
                            )
                            ..changePlace(
                              AddressNewModel(
                                address: AddressInformation(
                                    address: controller.text),
                                location: [
                                  cameraPosition?.target.latitude ??
                                      latLng.latitude,
                                  cameraPosition?.target.longitude ??
                                      latLng.longitude
                                ],
                              ),
                            );
                        } else {
                          event.changePlace(
                            AddressNewModel(
                              address:
                                  AddressInformation(address: controller.text),
                              location: [
                                cameraPosition?.target.latitude ??
                                    latLng.latitude,
                                cameraPosition?.target.longitude ??
                                    latLng.longitude
                              ],
                            ),
                          );
                        }
                        ref.read(viewMapProvider.notifier).scrolling(false);
                      });
                    },
                    onCameraMove: (position) {
                      cameraPosition = position;
                    },
                    onMapCreated: (controller) {
                      googleMapController = controller;
                    },
                  ),
                ),
                AnimatedPositioned(
                  bottom: MediaQuery.paddingOf(context).bottom +
                      24 +
                      (MediaQuery.sizeOf(context).height / 2),
                  left: MediaQuery.sizeOf(context).width / 2 - 23.w,
                  duration: const Duration(milliseconds: 500),
                  child: Image.asset(
                    "assets/images/marker.png",
                    width: 46.w,
                    height: 46.h,
                  ),
                ),
                AnimatedPositioned(
                  duration: const Duration(milliseconds: 500),
                  bottom: 224.r,
                  right: state.isScrolling ? -100 : 12.w,
                  child: InkWell(
                    onTap: () async {
                      await getMyLocation();
                    },
                    child: Container(
                      width: 50.r,
                      height: 50.r,
                      decoration: BoxDecoration(
                        color: colors.primary,
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Icon(
                          FlutterRemix.navigation_line,
                          color: colors.textBlack,
                        ),
                      ),
                    ),
                  ),
                ),
                AnimatedPositioned(
                  duration: const Duration(milliseconds: 500),
                  bottom: 224.r,
                  left: state.isScrolling ? -100 : 12.w,
                  child: Padding(
                    padding: REdgeInsets.only(right: 8),
                    child: GestureDetector(
                      onTap: () {
                        Navigator.pop(context);
                      },
                      child: AnimationButtonEffect(
                        child: Container(
                          decoration: BoxDecoration(
                            color: colors.textWhite,
                            borderRadius: BorderRadius.all(
                              Radius.circular(30.r),
                            ),
                          ),
                          padding: EdgeInsets.all(14.h),
                          child: Icon(
                            FlutterRemix.arrow_left_line,
                            color: colors.textBlack,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                if (widget.address != null && (widget.address?.active ?? false))
                  AnimatedPositioned(
                    duration: const Duration(milliseconds: 500),
                    top: 32.r,
                    right: state.isScrolling ? -100 : 16.w,
                    child: InkWell(
                      onTap: () async {
                        ref.read(profileProvider.notifier).deleteAddress(
                            index: widget.indexAddress ?? 0,
                            id: widget.address?.id);
                        ref.read(homeProvider.notifier).deleteAddress();
                        context.router.popForced<bool>(true);
                      },
                      child: Container(
                        width: 48.r,
                        height: 48.r,
                        decoration: BoxDecoration(
                            color: AppStyle.red,
                            borderRadius:
                                BorderRadius.all(Radius.circular(24.r)),
                            boxShadow: [
                              BoxShadow(
                                  color: AppStyle.shimmerBase,
                                  blurRadius: 2,
                                  offset: const Offset(0, 2))
                            ]),
                        child: const Center(
                            child: Icon(
                          FlutterRemix.delete_bin_fill,
                          color: AppStyle.white,
                        )),
                      ),
                    ),
                  ),
                if (!state.isScrolling)
                  AnimatedPositioned(
                    duration: const Duration(milliseconds: 500),
                    bottom: 0,
                    child: Container(
                      width: MediaQuery.of(context).size.width,
                      decoration: BoxDecoration(
                        color: colors.buttonColor,
                        borderRadius: BorderRadius.only(
                          topLeft: Radius.circular(10.r),
                          topRight: Radius.circular(10.r),
                        ),
                      ),
                      child: Padding(
                        padding: EdgeInsets.all(12.r),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              AppHelpers.getTranslation(
                                  TrKeys.destinationAddress),
                              style: AppStyle.interNoSemi(
                                size: 20,
                                color: colors.textBlack,
                              ),
                            ),
                            10.verticalSpace,
                            Divider(color: AppStyle.textGrey),
                            10.verticalSpace,
                            Padding(
                              padding: EdgeInsets.symmetric(vertical: 8.r),
                              child: Row(
                                children: [
                                  Icon(
                                    FlutterRemix.map_pin_2_fill,
                                    color: AppStyle.red,
                                  ),
                                  10.horizontalSpace,
                                  Flexible(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          controller.text.length > 2 &&
                                                  controller.text
                                                          .trim()
                                                          .substring(0, 1) ==
                                                      ','
                                              ? controller.text
                                                  .replaceFirst(',', '')
                                              : controller.text,
                                          style: AppStyle.interNormal(
                                            size: 16,
                                            color: colors.textBlack,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        Text(
                                          controller.text
                                              .split(',')
                                              .last
                                              .trim(),
                                          style: AppStyle.interRegular(
                                            size: 14,
                                            color: colors.textBlack,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            16.verticalSpace,
                            CustomButton(
                              isLoading: controller.text.isEmpty,
                              title: AppHelpers.getTranslation(TrKeys.ready),
                              textColor: colors.textBlack,
                              onPressed: () {
                                if (widget.isParcel) {
                                  Navigator.pop(
                                    context,
                                    AddressNewModel(
                                      address: AddressInformation(
                                        address: controller.text,
                                      ),
                                      location: [
                                        cameraPosition?.target.latitude ??
                                            latLng.latitude,
                                        cameraPosition?.target.longitude ??
                                            latLng.longitude
                                      ],
                                    ),
                                  );
                                  return;
                                }
                                if (!state.isScrolling) {
                                  AppHelpers.showCustomModalBottomSheet(
                                    paddingTop: -50,
                                    context: context,
                                    modal: ViewMapModal(
                                      controller: controller,
                                      address: widget.address,
                                      latLng: latLng,
                                      isShopLocation: widget.isShopLocation,
                                      onSearch: () async {
                                        final placeId = await context
                                            .pushRoute(const MapSearchRoute());
                                        if (placeId != null) {
                                          final res = await googlePlace.details
                                              .get(placeId.toString());
                                          try {
                                            final List<Placemark> placemarks =
                                                await placemarkFromCoordinates(
                                              res?.result?.geometry?.location
                                                      ?.lat ??
                                                  latLng.latitude,
                                              res?.result?.geometry?.location
                                                      ?.lng ??
                                                  latLng.longitude,
                                            );

                                            if (placemarks.isNotEmpty) {
                                              final Placemark pos =
                                                  placemarks[0];
                                              final List<String> addressData =
                                                  [];
                                              addressData.add(pos.locality!);
                                              if (pos.subLocality != null &&
                                                  pos.subLocality!.isNotEmpty) {
                                                addressData
                                                    .add(pos.subLocality!);
                                              }
                                              if (pos.thoroughfare != null &&
                                                  pos.thoroughfare!
                                                      .isNotEmpty) {
                                                addressData
                                                    .add(pos.thoroughfare!);
                                              }
                                              addressData.add(pos.name!);
                                              final String placeName =
                                                  addressData.join(', ');
                                              controller.text = placeName;
                                            }
                                          } catch (e) {
                                            controller.text = '';
                                          }

                                          googleMapController!.animateCamera(
                                              CameraUpdate.newLatLngZoom(
                                                  LatLng(
                                                      res?.result?.geometry
                                                              ?.location?.lat ??
                                                          latLng.latitude,
                                                      res?.result?.geometry
                                                              ?.location?.lng ??
                                                          latLng.longitude),
                                                  15));
                                          event.changePlace(
                                            AddressNewModel(
                                              title: controller.text,
                                              address: AddressInformation(
                                                address: controller.text,
                                              ),
                                              location: [
                                                res?.result?.geometry?.location
                                                        ?.lat ??
                                                    latLng.latitude,
                                                res?.result?.geometry?.location
                                                        ?.lng ??
                                                    latLng.longitude,
                                              ],
                                            ),
                                          );
                                        }
                                      },
                                      colors: colors,
                                    ),
                                    isDarkMode: isDarkMode,
                                  );
                                }
                              },
                            ),
                            12.verticalSpace,
                          ],
                        ),
                      ),
                    ),
                  )
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// // ignore_for_file: use_build_context_synchronously
//
// import 'package:auto_route/auto_route.dart';
//
// import 'package:carousel_slider/carousel_slider.dart';
// import 'package:flutter/material.dart';
// import 'package:flutter_remix/flutter_remix.dart';
// import 'package:flutter_riverpod/flutter_riverpod.dart';
// import 'package:flutter_screenutil/flutter_screenutil.dart';
// import 'package:geocoding/geocoding.dart';
// import 'package:geolocator/geolocator.dart';
// import 'package:google_maps_flutter/google_maps_flutter.dart';
// import 'package:riverpodtemp/application/app_widget/app_provider.dart';
// import 'package:riverpodtemp/application/home/home_provider.dart';
// import 'package:riverpodtemp/domain/di/dependency_manager.dart';
// import 'package:riverpodtemp/infrastructure/models/data/address_information.dart';
// import 'package:riverpodtemp/infrastructure/models/models.dart';
// import 'package:riverpodtemp/app_constants.dart';
// import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
// import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
// import 'package:riverpodtemp/infrastructure/services/tpying_delay.dart';
// import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
// import 'package:riverpodtemp/presentation/components/buttons/animation_button_effect.dart';
// import 'package:riverpodtemp/presentation/components/buttons/custom_button.dart';
// import 'package:riverpodtemp/presentation/components/buttons/pop_button.dart';
// import 'package:riverpodtemp/presentation/components/keyboard_dismisser.dart';
// import 'package:riverpodtemp/presentation/components/loading.dart';
// import 'package:riverpodtemp/presentation/components/text_fields/outline_bordered_text_field.dart';
// import 'package:riverpodtemp/presentation/components/text_fields/search_text_field.dart';
// import 'package:riverpodtemp/presentation/components/title_icon.dart';
// import 'package:riverpodtemp/presentation/routes/app_router.dart';
// import 'package:riverpodtemp/presentation/theme/app_style.dart';
// import 'package:sliding_up_panel/sliding_up_panel.dart';
// import '../../../../application/map/view_map_notifier.dart';
// import '../../../../application/map/view_map_provider.dart';
// import 'shop_item_in_map.dart';
//
// @RoutePage()
// class ViewMapPage extends ConsumerStatefulWidget {
//   final bool isShopLocation;
//   final int? shopId;
//
//   const ViewMapPage({
//     super.key,
//     this.isShopLocation = false,
//     this.shopId,
//   });
//
//   @override
//   ConsumerState<ViewMapPage> createState() => _ViewMapPageState();
// }
//
// class _ViewMapPageState extends ConsumerState<ViewMapPage> {
//   late ViewMapNotifier event;
//   late TextEditingController controller;
//   late TextEditingController office;
//   late TextEditingController house;
//   late TextEditingController floor;
//   late CarouselSliderController carouselController;
//   final GeolocatorPlatform _geolocatorPlatform = GeolocatorPlatform.instance;
//   GoogleMapController? googleMapController;
//
//   CameraPosition? cameraPosition;
//   dynamic check;
//   late LatLng latLng;
//
//   @override
//   void initState() {
//     controller = TextEditingController();
//     office = TextEditingController();
//     house = TextEditingController();
//     floor = TextEditingController();
//     carouselController = CarouselSliderController();
//     latLng = LatLng(
//       LocalStorage.getAddressSelected()?.location?.latitude ??
//           (AppHelpers.getInitialLatitude() ?? AppConstants.demoLatitude),
//       LocalStorage.getAddressSelected()?.location?.longitude ??
//           (AppHelpers.getInitialLongitude() ?? AppConstants.demoLongitude),
//     );
//     WidgetsBinding.instance.addPostFrameCallback((_) {
//       ref.read(viewMapProvider.notifier).fetchBranches(context);
//       ref
//           .read(homeProvider.notifier)
//           .fetchBranchesFilter(context, TrKeys.allShops, null);
//     });
//     checkPermission();
//     super.initState();
//   }
//
//   @override
//   void didChangeDependencies() {
//     event = ref.read(viewMapProvider.notifier);
//     super.didChangeDependencies();
//   }
//
//   @override
//   void dispose() {
//     controller.dispose();
//     office.dispose();
//     house.dispose();
//     floor.dispose();
//     super.dispose();
//   }
//
//   List<String> listOfFilter = [
//     TrKeys.filter,
//     TrKeys.allShops,
//     TrKeys.nearYou,
//     TrKeys.work247,
//     TrKeys.newShops,
//   ];
//
//   checkPermission() async {
//     check = await _geolocatorPlatform.checkPermission();
//   }
//
//   Future<void> getMyLocation() async {
//     if (check == LocationPermission.denied ||
//         check == LocationPermission.deniedForever) {
//       check = await Geolocator.requestPermission();
//       if (check != LocationPermission.denied &&
//           check != LocationPermission.deniedForever) {
//         var loc = await Geolocator.getCurrentPosition();
//         latLng = LatLng(loc.latitude, loc.longitude);
//         googleMapController!
//             .animateCamera(CameraUpdate.newLatLngZoom(latLng, 15));
//       }
//     } else {
//       if (check != LocationPermission.deniedForever) {
//         var loc = await Geolocator.getCurrentPosition();
//         latLng = LatLng(loc.latitude, loc.longitude);
//         googleMapController!
//             .animateCamera(CameraUpdate.newLatLngZoom(latLng, 15));
//       }
//     }
//   }
//
//   LatLngBounds _bounds(Set<Marker> markers) {
//     if (markers.isEmpty) {
//       return LatLngBounds(
//           southwest: const LatLng(0, 0), northeast: const LatLng(0, 0));
//     }
//     return _createBounds(markers.map((m) => m.position).toList());
//   }
//
//   LatLngBounds _createBounds(List<LatLng> positions) {
//     final southwestLat = positions.map((p) => p.latitude).reduce(
//         (value, element) => value < element ? value : element); // smallest
//     final southwestLon = positions
//         .map((p) => p.longitude)
//         .reduce((value, element) => value < element ? value : element);
//     final northeastLat = positions.map((p) => p.latitude).reduce(
//         (value, element) => value > element ? value : element); // biggest
//     final northeastLon = positions
//         .map((p) => p.longitude)
//         .reduce((value, element) => value > element ? value : element);
//     return LatLngBounds(
//         southwest: LatLng(southwestLat, southwestLon),
//         northeast: LatLng(northeastLat, northeastLon));
//   }
//
//   @override
//   Widget build(BuildContext context) {
//     final state = ref.watch(homeProvider);
//     final eventHome = ref.watch(homeProvider.notifier);
//     final stateMap = ref.watch(viewMapProvider);
//     final bool isLtr = LocalStorage.getLangLtr();
//     final bool isDarkMode = ref.watch(appProvider).isDarkMode;
//     return KeyboardDismisser(
//       child: Directionality(
//         textDirection: isLtr ? TextDirection.ltr : TextDirection.rtl,
//         child: CustomScaffold(
//           backgroundColor: isDarkMode ? AppStyle.mainBackDark : AppStyle.mainBack,
//           body: Column(
//             mainAxisAlignment: MainAxisAlignment.spaceBetween,
//             children: [
//               Expanded(
//                 child: SlidingUpPanel(
//                   borderRadius: BorderRadius.only(
//                     topLeft: Radius.circular(15.r),
//                     topRight: Radius.circular(15.r),
//                   ),
//                   minHeight: 100.h,
//                   maxHeight: 400.h,
//                   defaultPanelState: PanelState.OPEN,
//                   color: isDarkMode ? AppStyle.dontHaveAnAccBackDark : AppStyle.white,
//                   body: Padding(
//                     padding: REdgeInsets.only(bottom: 0),
//                     child: Stack(
//                       children: [
//                         GoogleMap(
//                           padding: REdgeInsets.only(bottom: 100.h),
//                           markers: state.shopMarkers,
//                           myLocationButtonEnabled: false,
//                           initialCameraPosition: CameraPosition(
//                             bearing: 0,
//                             target: latLng,
//                             tilt: 0,
//                             zoom: 17,
//                           ),
//                           mapToolbarEnabled: false,
//                           zoomControlsEnabled: true,
//                           onTap: (position) {
//                             event.updateActive();
//                             Delayed(milliseconds: 700).run(() async {
//                               try {
//                                 final List<Placemark> placemarks =
//                                     await placemarkFromCoordinates(
//                                   cameraPosition?.target.latitude ??
//                                       latLng.latitude,
//                                   cameraPosition?.target.longitude ??
//                                       latLng.longitude,
//                                 );
//
//                                 if (placemarks.isNotEmpty) {
//                                   final Placemark pos = placemarks[0];
//                                   final List<String> addressData = [];
//                                   addressData.add(pos.locality!);
//                                   if (pos.subLocality != null &&
//                                       pos.subLocality!.isNotEmpty) {
//                                     addressData.add(pos.subLocality!);
//                                   }
//                                   if (pos.thoroughfare != null &&
//                                       pos.thoroughfare!.isNotEmpty) {
//                                     addressData.add(pos.thoroughfare!);
//                                   }
//                                   addressData.add(pos.name!);
//                                   final String placeName =
//                                       addressData.join(', ');
//                                   controller.text = placeName;
//                                 }
//                               } catch (e) {
//                                 controller.text = '';
//                               }
//                               event
//                                 ..checkDriverZone(
//                                     context: context,
//                                     location: LatLng(
//                                       cameraPosition?.target.latitude ??
//                                           latLng.latitude,
//                                       cameraPosition?.target.longitude ??
//                                           latLng.longitude,
//                                     ),
//                                     shopId: widget.shopId)
//                                 ..changePlace(
//                                   AddressData(
//                                     title: controller.text,
//                                     address: controller.text,
//                                     location: LocationModel(
//                                       latitude:
//                                           cameraPosition?.target.latitude ??
//                                               latLng.latitude,
//                                       longitude:
//                                           cameraPosition?.target.longitude ??
//                                               latLng.longitude,
//                                     ),
//                                   ),
//                                 );
//                               if (state.shopFilter == TrKeys.nearYou) {
//                                 eventHome.fetchBranchesFilter(context,
//                                     TrKeys.nearYou, cameraPosition?.target);
//                               }
//                             });
//                             googleMapController!.animateCamera(
//                                 CameraUpdate.newLatLngZoom(position, 15));
//                           },
//                           onCameraIdle: () {
//                             event.updateActive();
//                             Delayed(milliseconds: 700).run(() async {
//                               try {
//                                 final List<Placemark> placemarks =
//                                     await placemarkFromCoordinates(
//                                   cameraPosition?.target.latitude ??
//                                       latLng.latitude,
//                                   cameraPosition?.target.longitude ??
//                                       latLng.longitude,
//                                 );
//
//                                 if (placemarks.isNotEmpty) {
//                                   final Placemark pos = placemarks[0];
//                                   final List<String> addressData = [];
//                                   addressData.add(pos.locality!);
//                                   if (pos.subLocality != null &&
//                                       pos.subLocality!.isNotEmpty) {
//                                     addressData.add(pos.subLocality!);
//                                   }
//                                   if (pos.thoroughfare != null &&
//                                       pos.thoroughfare!.isNotEmpty) {
//                                     addressData.add(pos.thoroughfare!);
//                                   }
//                                   addressData.add(pos.name!);
//                                   final String placeName =
//                                       addressData.join(', ');
//                                   controller.text = placeName;
//                                 }
//                               } catch (e) {
//                                 controller.text = '';
//                               }
//                               if (!widget.isShopLocation) {
//                                 event
//                                   ..checkDriverZone(
//                                       context: context,
//                                       location: LatLng(
//                                         cameraPosition?.target.latitude ??
//                                             latLng.latitude,
//                                         cameraPosition?.target.longitude ??
//                                             latLng.longitude,
//                                       ),
//                                       shopId: widget.shopId)
//                                   ..changePlace(
//                                     AddressData(
//                                       title: controller.text,
//                                       address: controller.text,
//                                       location: LocationModel(
//                                         latitude:
//                                             cameraPosition?.target.latitude ??
//                                                 latLng.latitude,
//                                         longitude:
//                                             cameraPosition?.target.longitude ??
//                                                 latLng.longitude,
//                                       ),
//                                     ),
//                                   );
//                               } else {
//                                 event.changePlace(
//                                   AddressData(
//                                     title: controller.text,
//                                     address: controller.text,
//                                     location: LocationModel(
//                                       latitude:
//                                           cameraPosition?.target.latitude ??
//                                               latLng.latitude,
//                                       longitude:
//                                           cameraPosition?.target.longitude ??
//                                               latLng.longitude,
//                                     ),
//                                   ),
//                                 );
//                               }
//                             });
//                             if (state.shopFilter == TrKeys.nearYou) {
//                               eventHome.fetchBranchesFilter(context,
//                                   TrKeys.nearYou, cameraPosition?.target);
//                             }
//                           },
//                           onCameraMove: (position) {
//                             cameraPosition = position;
//                           },
//                           onMapCreated: (controller) {
//                             controller.animateCamera(
//                                 CameraUpdate.newLatLngBounds(
//                                     _bounds(state.shopMarkers), 50));
//                             googleMapController = controller;
//                           },
//                         ),
//                         SafeArea(
//                           child: Container(
//                             width: MediaQuery.sizeOf(context).width - 32.w,
//                             padding: EdgeInsets.all(4.r),
//                             margin: EdgeInsets.all(16.r),
//                             decoration: BoxDecoration(
//                                 color: AppStyle.white,
//                                 borderRadius: BorderRadius.circular(8.r)),
//                             child: SearchTextField(
//                               isRead: true,
//                               isBorder: true,
//                               hintText:
//                                   AppHelpers.getTranslation(TrKeys.search),
//                               textEditingController: controller,
//                               onTap: () async {
//                                 final placeId = await context
//                                     .pushRoute(const MapSearchRoute());
//                                 if (placeId != null) {
//                                   final res = await googlePlace.details
//                                       .get(placeId.toString());
//                                   try {
//                                     final List<Placemark> placemarks =
//                                         await placemarkFromCoordinates(
//                                       res?.result?.geometry?.location?.lat ??
//                                           latLng.latitude,
//                                       res?.result?.geometry?.location?.lng ??
//                                           latLng.longitude,
//                                     );
//
//                                     if (placemarks.isNotEmpty) {
//                                       final Placemark pos = placemarks[0];
//                                       final List<String> addressData = [];
//                                       addressData.add(pos.locality!);
//                                       if (pos.subLocality != null &&
//                                           pos.subLocality!.isNotEmpty) {
//                                         addressData.add(pos.subLocality!);
//                                       }
//                                       if (pos.thoroughfare != null &&
//                                           pos.thoroughfare!.isNotEmpty) {
//                                         addressData.add(pos.thoroughfare!);
//                                       }
//                                       addressData.add(pos.name!);
//                                       final String placeName =
//                                           addressData.join(', ');
//                                       controller.text = placeName;
//                                     }
//                                   } catch (e) {
//                                     controller.text = '';
//                                   }
//
//                                   googleMapController!.animateCamera(
//                                       CameraUpdate.newLatLngZoom(
//                                           LatLng(
//                                               res?.result?.geometry?.location
//                                                       ?.lat ??
//                                                   latLng.latitude,
//                                               res?.result?.geometry?.location
//                                                       ?.lng ??
//                                                   latLng.longitude),
//                                           15));
//                                   event.changePlace(
//                                     AddressData(
//                                       title: controller.text,
//                                       address: controller.text,
//                                       location: LocationModel(
//                                         latitude: res?.result?.geometry
//                                                 ?.location?.lat ??
//                                             latLng.latitude,
//                                         longitude: res?.result?.geometry
//                                                 ?.location?.lng ??
//                                             latLng.longitude,
//                                       ),
//                                     ),
//                                   );
//                                 }
//                               },
//                             ),
//                           ),
//                         ),
//                         Align(
//                           alignment: Alignment.center,
//                           child: Padding(
//                             padding: EdgeInsets.only(bottom: 110.r),
//                             child: Image.asset(
//                               "assets/images/marker.png",
//                               width: 46.w,
//                               height: 46.h,
//                             ),
//                           ),
//                         ),
//                         Positioned(
//                           bottom: 120.h,
//                           right: 16.w,
//                           child: InkWell(
//                             onTap: () async {
//                               await getMyLocation();
//                             },
//                             child: Container(
//                               width: 50.r,
//                               height: 50.r,
//                               decoration: BoxDecoration(
//                                   color: AppStyle.white,
//                                   borderRadius:
//                                       BorderRadius.all(Radius.circular(10.r)),
//                                   boxShadow: [
//                                     BoxShadow(
//                                         color: AppStyle.shimmerBase,
//                                         blurRadius: 2,
//                                         offset: const Offset(0, 2))
//                                   ]),
//                               child: const Center(
//                                   child: Icon(FlutterRemix.navigation_line)),
//                             ),
//                           ),
//                         )
//                       ],
//                     ),
//                   ),
//                   panel: Column(
//                     mainAxisSize: MainAxisSize.min,
//                     crossAxisAlignment: CrossAxisAlignment.center,
//                     children: [
//                       8.verticalSpace,
//                       Container(
//                         width: 49.w,
//                         height: 3.h,
//                         decoration: BoxDecoration(
//                           borderRadius: BorderRadius.circular(40.r),
//                           color: AppStyle.dragElement,
//                         ),
//                       ),
//                       14.verticalSpace,
//                       Column(
//                         crossAxisAlignment: CrossAxisAlignment.start,
//                         children: [
//                           Padding(
//                             padding: REdgeInsets.symmetric(horizontal: 12),
//                             child: TitleAndIcon(
//                               title: AppHelpers.getTranslation(
//                                   TrKeys.enterADeliveryAddress),
//                             ),
//                           ),
//                           10.verticalSpace,
//                           SizedBox(
//                             height: 40.h,
//                             child: ListView.builder(
//                                 shrinkWrap: true,
//                                 padding: EdgeInsets.symmetric(horizontal: 16),
//                                 scrollDirection: Axis.horizontal,
//                                 itemCount: listOfFilter.length,
//                                 itemBuilder: (context, index) {
//                                   return InkWell(
//                                     onTap: () {
//                                       if (index != 0) {
//                                         if (state.shopFilter !=
//                                             listOfFilter[index]) {
//                                           eventHome.changeFilter(
//                                               listOfFilter[index]);
//                                           eventHome.fetchBranchesFilter(
//                                               context,
//                                               listOfFilter[index],
//                                               cameraPosition?.target);
//                                         }
//                                       }
//                                     },
//                                     child: AnimationButtonEffect(
//                                       child: Container(
//                                         margin: EdgeInsets.only(right: 6.r),
//                                         decoration: BoxDecoration(
//                                             borderRadius:
//                                                 BorderRadius.circular(100.r),
//                                             color: state.shopFilter ==
//                                                     listOfFilter[index]
//                                                 ? AppStyle.primary
//                                                 : AppStyle.iconButtonBack),
//                                         padding: EdgeInsets.symmetric(
//                                             horizontal: 20.r),
//                                         child: index != 0
//                                             ? Center(
//                                                 child: Text(
//                                                     AppHelpers.getTranslation(
//                                                         listOfFilter[index])),
//                                               )
//                                             : Row(
//                                                 children: [
//                                                   Icon(
//                                                     FlutterRemix
//                                                         .sound_module_line,
//                                                     size: 18.r,
//                                                   ),
//                                                   6.horizontalSpace,
//                                                   Text(
//                                                       AppHelpers.getTranslation(
//                                                           listOfFilter[index]))
//                                                 ],
//                                               ),
//                                       ),
//                                     ),
//                                   );
//                                 }),
//                           ),
//                         ],
//                       ),
//                       12.verticalSpace,
//                       state.isBranchesLoading
//                           ? SizedBox(height: 188.h, child: Loading())
//                           : state.branches.isNotEmpty
//                               ? SizedBox(
//                                   height: 188.h,
//                                   child: state.branches.length == 1
//                                       ? Row(
//                                           children: [
//                                             ShopItemInMap(
//                                               onTap: () {
//                                                 context.maybePop();
//                                                 eventHome.setBranchId(context,
//                                                     shopId: state
//                                                         .branches.first.id);
//                                               },
//                                               shop: state.branches.first,
//                                             ),
//                                           ],
//                                         )
//                                       : CarouselSlider.builder(
//                                           options: CarouselOptions(
//                                             enableInfiniteScroll: true,
//                                             enlargeCenterPage: false,
//                                             disableCenter: false,
//                                             padEnds: false,
//                                             viewportFraction: 0.52,
//                                             initialPage: 0,
//                                             scrollDirection: Axis.horizontal,
//                                             onPageChanged: (index, s) {
//                                               if (state.shopFilter !=
//                                                   TrKeys.nearYou) {
//                                                 googleMapController?.animateCamera(
//                                                     CameraUpdate.newLatLngZoom(
//                                                         LatLng(
//                                                             (state
//                                                                         .branches[
//                                                                             index]
//                                                                         .location
//                                                                         ?.latitude ??
//                                                                     AppConstants
//                                                                         .demoLatitude) -
//                                                                 0.0002,
//                                                             state
//                                                                     .branches[
//                                                                         index]
//                                                                     .location
//                                                                     ?.longitude ??
//                                                                 AppConstants
//                                                                     .demoLongitude),
//                                                         15));
//                                               }
//                                             },
//                                           ),
//                                           carouselController:
//                                               carouselController,
//                                           itemCount: state.branches.length,
//                                           itemBuilder: (BuildContext context,
//                                               int index, int realIndex) {
//                                             return AnimationButtonEffect(
//                                               child: ShopItemInMap(
//                                                 onTap: () {
//                                                   context.maybePop();
//                                                   eventHome.setBranchId(context,
//                                                       shopId: state
//                                                           .branches[index].id);
//                                                 },
//                                                 shop: state.branches[index],
//                                               ),
//                                             );
//                                           },
//                                         ),
//                                 )
//                               : SizedBox(
//                                   height: 188.h,
//                                   child: Center(
//                                     child: Text(AppHelpers.getTranslation(
//                                         TrKeys.noRestaurant)),
//                                   ),
//                                 ),
//                       14.verticalSpace,
//                       Padding(
//                         padding: EdgeInsets.only(
//                           bottom: MediaQuery.of(context).padding.bottom,
//                           left: 16.r,
//                           right: 16.r,
//                         ),
//                         child: Row(
//                           mainAxisAlignment: MainAxisAlignment.spaceBetween,
//                           children: [
//                             PopButton(colors: colors),
//                             24.horizontalSpace,
//                             Expanded(
//                               child: CustomButton(
//                                 isLoading: !widget.isShopLocation
//                                     ? stateMap.isLoading
//                                     : false,
//                                 background: !widget.isShopLocation
//                                     ? (stateMap.isActive
//                                         ? AppStyle.primary
//                                         : AppStyle.bgGrey)
//                                     : AppStyle.primary,
//                                 textColor: !widget.isShopLocation
//                                     ? (stateMap.isActive
//                                         ? colors.textBlack
//                                         : AppStyle.textGrey)
//                                     : colors.textBlack,
//                                 title: !widget.isShopLocation
//                                     ? (stateMap.isActive
//                                         ? AppHelpers.getTranslation(
//                                             TrKeys.apply)
//                                         : AppHelpers.getTranslation(
//                                             TrKeys.noDriverZone))
//                                     : AppHelpers.getTranslation(TrKeys.apply),
//                                 onPressed: () {
//                                   if (widget.isShopLocation) {
//                                     Navigator.pop(context, stateMap.place);
//                                   } else {
//                                     if (stateMap.isActive) {
//                                       eventHome
//                                         ..fetchBanner(context)
//                                         ..fetchStore(context)
//                                         ..fetchCategories(context);
//                                       LocalStorage.setAddressSelected(
//                                           stateMap.place ?? AddressData());
//                                       eventHome.setAddress();
//                                       AppHelpers.showAlertDialog(
//                                           context: context,
//                                           child: SingleChildScrollView(
//                                             child: Column(
//                                               mainAxisSize: MainAxisSize.min,
//                                               children: [
//                                                 TitleAndIcon(
//                                                   title: AppHelpers
//                                                       .getTranslation(TrKeys
//                                                           .addAddressInformation),
//                                                   paddingHorizontalSize: 0,
//                                                 ),
//                                                 24.verticalSpace,
//                                                 OutlinedBorderTextField(
//                                                   textController: office,
//                                                   label:
//                                                       AppHelpers.getTranslation(
//                                                               TrKeys.office)
//                                                           .toUpperCase(),
//                                                 ),
//                                                 24.verticalSpace,
//                                                 OutlinedBorderTextField(
//                                                   textController: house,
//                                                   label:
//                                                       AppHelpers.getTranslation(
//                                                               TrKeys.house)
//                                                           .toUpperCase(),
//                                                 ),
//                                                 24.verticalSpace,
//                                                 OutlinedBorderTextField(
//                                                   textController: floor,
//                                                   label:
//                                                       AppHelpers.getTranslation(
//                                                               TrKeys.floor)
//                                                           .toUpperCase(),
//                                                 ),
//                                                 32.verticalSpace,
//                                                 CustomButton(
//                                                     title: AppHelpers
//                                                         .getTranslation(
//                                                             TrKeys.save),
//                                                     onPressed: () {
//                                                       AddressInformation data =
//                                                           AddressInformation(
//                                                               house: house.text,
//                                                               office:
//                                                                   office.text,
//                                                               floor:
//                                                                   floor.text);
//                                                       LocalStorage
//                                                           .setAddressInformation(
//                                                               data);
//                                                       Navigator.pop(context);
//                                                       Navigator.pop(
//                                                           context, true);
//                                                     }),
//                                                 16.verticalSpace,
//                                                 CustomButton(
//                                                     borderColor: colors.textBlack,
//                                                     textColor: colors.textBlack,
//                                                     background:
//                                                         AppStyle.transparent,
//                                                     title: AppHelpers
//                                                         .getTranslation(
//                                                             TrKeys.skip),
//                                                     onPressed: () {
//                                                       Navigator.pop(context);
//                                                       Navigator.pop(
//                                                           context, true);
//                                                     }),
//                                               ],
//                                             ),
//                                           ));
//                                     } else {
//                                       AppHelpers.showCheckTopSnackBarInfo(
//                                         context,
//                                         AppHelpers.getTranslation(
//                                             TrKeys.noDriverZone),
//                                       );
//                                     }
//                                   }
//                                 },
//                               ),
//                             ),
//                           ],
//                         ),
//                       )
//                     ],
//                   ),
//                 ),
//               ),
//             ],
//           ),
//         ),
//       ),
//     );
//   }
// }
