import 'package:auto_route/auto_route.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'package:riverpodtemp/domain/iterface/address.dart';
import 'package:riverpodtemp/domain/iterface/user.dart';
import 'package:riverpodtemp/infrastructure/models/data/address_new_data.dart';
import 'package:riverpodtemp/infrastructure/models/models.dart';
import 'package:riverpodtemp/infrastructure/services/app_connectivity.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/enums.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';

import '../../domain/iterface/gallery.dart';
import '../../domain/iterface/shops.dart';
import '../../infrastructure/services/tr_keys.dart';
import '../../presentation/routes/app_router.dart';
import 'profile_state.dart';

class ProfileNotifier extends StateNotifier<ProfileState> {
  final UserRepositoryFacade _userRepository;
  final ShopsRepositoryFacade _shopsRepository;
  final GalleryRepositoryFacade _galleryRepository;
  final AddressRepositoryFacade _addressRepository;

  ProfileNotifier(this._userRepository, this._shopsRepository,
      this._galleryRepository, this._addressRepository)
      : super(const ProfileState());
  int page = 1;

  findSelectIndex() {
    for (int i = 0; i < (state.userData?.addresses?.length ?? 0); i++) {
      if (state.userData?.addresses?[i].active ?? false) {
        state = state.copyWith(selectAddress: i);
        break;
      }
    }
  }

  void change(int index) {
    state = state.copyWith(selectAddress: index);
  }

  setAddress(dynamic data) {
    state = state.copyWith(addressModel: data);
  }

  setActiveAddress({int? id, required int index}) async {
    List<AddressNewModel> list = List.from(state.userData?.addresses ?? []);
    for (var element in list) {
      element.active = false;
    }
    list[index].active = true;
    ProfileData newUser = state.userData!.copyWith(addresses: list);
    state = state.copyWith(userData: newUser);
    _userRepository.setActiveAddress(id: id ?? 0);
  }

  getTerm({required BuildContext context}) async {
    state = state.copyWith(isTermLoading: state.term == null);
    final res = await _userRepository.getTerm();
    res.when(
      success: (l) {
        state = state.copyWith(isTermLoading: false, term: l);
      },
      failure: (r, s) {
        state = state.copyWith(isTermLoading: false);
        AppHelpers.showCheckTopSnackBar(context, r.toString());
      },
    );
  }

  deleteAddress({int? id, required int index}) async {
    List<AddressNewModel> list = List.from(state.userData?.addresses ?? []);
    list.removeAt(index);
    ProfileData newUser = state.userData!.copyWith(addresses: list);
    state = state.copyWith(userData: newUser);
    _userRepository.deleteAddress(id: id ?? 0);
  }

  getPolicy({required BuildContext context}) async {
    state = state.copyWith(isPolicyLoading: state.policy == null);
    final res = await _userRepository.getPolicy();
    res.when(
      success: (l) {
        state = state.copyWith(isPolicyLoading: false, policy: l);
      },
      failure: (r, s) {
        state = state.copyWith(isPolicyLoading: false);
        AppHelpers.showCheckTopSnackBar(context, r.toString());
      },
    );
  }

  resetShopData() {
    state = state.copyWith(
        bgImage: "", logoImage: "", addressModel: null, isSaveLoading: false);
  }

  setBgImage(String bgImage) {
    state = state.copyWith(bgImage: bgImage);
  }

  setLogoImage(String logoImage) {
    state = state.copyWith(logoImage: logoImage);
  }

  Future<void> fetchUserAddress(BuildContext context) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      state = state.copyWith(isLoadingUserAddress: true);
      final response = await _addressRepository.getUserAddresses();
      response.when(
        success: (data) {
          state = state.copyWith(
            userData: state.userData?.copyWith(addresses: data.data),
            isLoadingUserAddress: false,
          );
        },
        failure: (error, statusCode) {
          state = state.copyWith(isLoadingUserAddress: false);
        },
      );
    } else {
      if (context.mounted) {
        AppHelpers.showNoConnectionSnackBar(context);
      }
    }
  }

  void changeLoading(){
    state = state.copyWith(isLoading: false);
  }

  Future<void> fetchUser(
    BuildContext context, {
    RefreshController? refreshController,
    VoidCallback? onSuccess,
  }) async {
    if (LocalStorage.getToken().isNotEmpty) {
      final connected = await AppConnectivity.connectivity();
      if (connected) {
        if (refreshController == null) {
          state = state.copyWith(isLoading: true);
        }
        final response = await _userRepository.getProfileDetails();
        response.when(
          success: (data) async {
            LocalStorage.setWalletData(data.data?.wallet);
            LocalStorage.setUser(data.data);
            if (refreshController == null) {
              state = state.copyWith(isLoading: false, userData: data.data);
            } else {
              state = state.copyWith(userData: data.data);
            }
            refreshController?.refreshCompleted();
            onSuccess?.call();
            findSelectIndex();
          },
          failure: (failure, status) {
            if (refreshController == null) {
              state = state.copyWith(isLoading: false);
            }
            if (status == 401) {
              context.router.popUntilRoot();
              context.replaceRoute(const LoginRoute());
            }
            AppHelpers.showCheckTopSnackBar(
              context,
              failure,
            );
          },
        );
      } else {
        if (context.mounted) {
          AppHelpers.showNoConnectionSnackBar(context);
        }
      }
    }
  }

  // Future<void> fetchUser(
  //   BuildContext context, {
  //   RefreshController? refreshController,
  //   VoidCallback? onSuccess,
  // }) async {
  //   if (LocalStorage.getToken().isNotEmpty) {
  //     final connected = await AppConnectivity.connectivity();
  //     if (connected) {
  //       if (refreshController == null) {
  //         state = state.copyWith(isLoading: true);
  //       }
  //       final response = await _userRepository.getProfileDetails();
  //       response.when(
  //         success: (data) async {
  //           LocalStorage.setProfileImage(data.data?.img);
  //           LocalStorage.setWalletData(data.data?.wallet);
  //           if (refreshController == null) {
  //             state = state.copyWith(isLoading: false, userData: data.data);
  //           } else {
  //             state = state.copyWith(userData: data.data);
  //           }
  //           refreshController?.refreshCompleted();
  //         },
  //         failure: (activeFailure, status) {
  //           if (refreshController == null) {
  //             state = state.copyWith(isLoading: false);
  //           }
  //           if (status == 401) {
  //             context.router.popUntilRoot();
  //             context.replaceRoute(const LoginRoute());
  //           }
  //           AppHelpers.showCheckTopSnackBar(
  //             context,
  //             AppHelpers.getTranslation(activeFailure.toString()),
  //           );
  //         },
  //       );
  //     } else {
  //       if (context.mounted) {
  //         AppHelpers.showNoConnectionSnackBar(context);
  //       }
  //     }
  //   }
  // }

  Future<void> fetchReferral(BuildContext context,
      {RefreshController? refreshController}) async {
    if (LocalStorage.getToken().isNotEmpty) {
      final connected = await AppConnectivity.connectivity();
      if (connected) {
        if (refreshController == null) {
          state = state.copyWith(isReferralLoading: true);
        }
        final response = await _userRepository.getReferralDetails();
        response.when(
          success: (data) async {
            if (refreshController == null) {
              state =
                  state.copyWith(isReferralLoading: false, referralData: data);
            } else {
              state = state.copyWith(referralData: data);
            }
            refreshController?.refreshCompleted();
          },
          failure: (activeFailure, status) {
            if (refreshController == null) {
              state = state.copyWith(isReferralLoading: false);
            }
            // AppHelpers.showCheckTopSnackBar(
            //   context,
            //   AppHelpers.getTranslation(activeFailure.toString()),
            // );
          },
        );
      } else {
        if (context.mounted) {
          AppHelpers.showNoConnectionSnackBar(context);
        }
      }
    }
  }

  Future<void> logOut() async {
    final fcm = await FirebaseMessaging.instance.getToken();
    _userRepository.logoutAccount(fcm: fcm ?? "");
  }

  Future<void> deleteAccount(BuildContext context) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      state = state.copyWith(isLoading: true);
      final response = await _userRepository.deleteAccount();
      response.when(
        success: (data) async {
          LocalStorage.logout();
          context.router.popUntilRoot();
          context.replaceRoute(const LoginRoute());
          state = state.copyWith(isLoading: false);
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

  void setUser(ProfileData user) async {
    state = state.copyWith(userData: user);
  }

  void getWallet(
    BuildContext context, {
    RefreshController? refreshController,
  }) async {
    page = 1;
    if (LocalStorage.getToken().isNotEmpty) {
      final connected = await AppConnectivity.connectivity();
      if (connected) {
        if (refreshController == null) {
          state = state.copyWith(isLoadingHistory: true);
        }
        final response = await _userRepository.getWalletHistories(page);
        response.when(
          success: (data) async {
            if (refreshController == null) {
              state = state.copyWith(
                isLoadingHistory: false,
                walletHistory: data.data,
              );
            } else {
              state = state.copyWith(walletHistory: data.data);
            }
            refreshController?.refreshCompleted();
          },
          failure: (activeFailure, status) {
            if (refreshController == null) {
              state = state.copyWith(isLoadingHistory: false);
            }
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
  }

  void getWalletPage(
      BuildContext context, RefreshController refreshController) async {
    if (LocalStorage.getToken().isNotEmpty) {
      final connected = await AppConnectivity.connectivity();
      if (connected) {
        final response = await _userRepository.getWalletHistories(++page);
        response.when(
          success: (data) async {
            List<WalletData> list = List.from(state.walletHistory ?? []);
            list.addAll(data.data ?? []);
            state = state.copyWith(walletHistory: list);
            refreshController.loadComplete();
            if (data.data?.isEmpty ?? true) {
              refreshController.loadNoData();
            } else {
              refreshController.loadComplete();
            }
          },
          failure: (activeFailure, status) {
            refreshController.loadNoData();
            --page;
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
  }

  changeIndex(int index) {
    state = state.copyWith(typeIndex: index);
  }

  Future<void> createShop({
    required BuildContext context,
    required String tax,
    required String deliveryTo,
    required String deliveryFrom,
    required String phone,
    required String startPrice,
    required String name,
    required String desc,
    required String perKm,
    required AddressData address,
    required String deliveryType,
    required num categoryId,
  }) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      state = state.copyWith(isSaveLoading: true);

      String? logoImage;
      String? backgroundImage;
      final logoResponse = await _galleryRepository.uploadImage(
        state.logoImage,
        UploadType.shopsLogo,
      );
      logoResponse.when(
        success: (data) {
          logoImage = data.imageData?.title;
        },
        failure: (failure, s) {
          debugPrint('===> upload logo image failure: $failure');
          AppHelpers.showCheckTopSnackBar(
            context,
            AppHelpers.getTranslation(s.toString()),
          );
        },
      );
      final backgroundResponse = await _galleryRepository.uploadImage(
        state.bgImage,
        UploadType.shopsBack,
      );
      backgroundResponse.when(
        success: (data) {
          backgroundImage = data.imageData?.title;
        },
        failure: (failure, s) {
          debugPrint('===> upload background image failure: $failure');
          AppHelpers.showCheckTopSnackBar(
            context,
            AppHelpers.getTranslation(s.toString()),
          );
        },
      );
      final response = await _shopsRepository.createShop(
        logoImage: logoImage,
        backgroundImage: backgroundImage,
        tax: double.tryParse(tax) ?? 0,
        deliveryTo: double.tryParse(deliveryTo) ?? 0,
        deliveryFrom: double.tryParse(deliveryFrom) ?? 0,
        deliveryType: deliveryType,
        phone: phone,
        name: name,
        description: desc,
        startPrice: double.tryParse(startPrice) ?? 0,
        perKm: double.tryParse(perKm) ?? 0,
        address: address,
        type: state.typeIndex == 1 ? "shop" : "restaurant",
        category: categoryId,
      );
      response.when(
        success: (data) {
          state = state.copyWith(isSaveLoading: false);
          fetchUser(context, refreshController: RefreshController());
          context.maybePop();
        },
        failure: (failure, s) {
          state = state.copyWith(isSaveLoading: false);
          AppHelpers.showCheckTopSnackBar(
            context,
            AppHelpers.getTranslation(s.toString()),
          );
          debugPrint('==> create shop failure: $failure');
        },
      );
    } else {
      if (context.mounted) {
        AppHelpers.showCheckTopSnackBar(
          context,
          AppHelpers.getTranslation(TrKeys.checkYourNetworkConnection),
        );
      }
    }
  }
}
