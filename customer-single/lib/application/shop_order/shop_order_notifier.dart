// ignore_for_file: use_build_context_synchronously

import 'package:auto_route/auto_route.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpodtemp/domain/iterface/cart.dart';
import 'package:riverpodtemp/infrastructure/models/data/addons_data.dart';
import 'package:riverpodtemp/infrastructure/models/data/cart_data.dart';
import 'package:riverpodtemp/infrastructure/models/data/local_cart_model.dart';
import 'package:riverpodtemp/infrastructure/models/data/product_data.dart';
import 'package:riverpodtemp/infrastructure/models/request/cart_request.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tpying_delay.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/infrastructure/services/vibration.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';
import '../../infrastructure/services/app_connectivity.dart';
import '../../infrastructure/services/app_helpers.dart';
import 'shop_order_state.dart';

class ShopOrderNotifier extends StateNotifier<ShopOrderState> {
  final CartRepositoryFacade _cartRepository;

  ShopOrderNotifier(this._cartRepository) : super(const ShopOrderState());
  final _delayed = Delayed(milliseconds: 700);

  // Future<void> addCount(
  //     {required BuildContext context, required int localIndex}) async {
  //   final connected = await AppConnectivity.connectivity();
  //   if (connected) {
  //     Vibrate.feedback(FeedbackType.selection);
  //     CartLocalModel item = LocalStorage.getCartLocal()[localIndex];
  //     await LocalStorage.setCartLocal(
  //         item.copyWith(quantity: item.quantity + 1));
  //     state = state.copyWith(isLoading: false);
  //     int cartIndex =
  //         state.cart?.userCarts?.first.cartDetails?.searchIndex(item) ?? 0;
  //     CartDetail oldDetail =
  //         state.cart?.userCarts?.first.cartDetails?[cartIndex] ?? CartDetail();
  //     CartDetail newDetail = oldDetail.copyWith(quantity: 1 + item.quantity);
  //     List<CartDetail> newCartList =
  //         state.cart?.userCarts?.first.cartDetails ?? [];
  //     newCartList.removeAt(cartIndex);
  //     newCartList.insert(cartIndex, newDetail);
  //     UserCart newCart =
  //         state.cart!.userCarts!.first.copyWith(cartDetails: newCartList);
  //     List<UserCart> newUserCart = state.cart?.userCarts ?? [];
  //     newUserCart.removeAt(0);
  //     newUserCart.insert(0, newCart);
  //     Cart newDate = state.cart!.copyWith(userCarts: newUserCart);
  //     state = state.copyWith(cart: newDate);
  //     _delayed.run(() async {
  //       state = state.copyWith(
  //         isAddAndRemoveLoading: true,
  //       );
  //       List<CartRequest> list = [
  //         CartRequest(
  //             stockId: state.cart?.userCarts?.first.cartDetails?[cartIndex]
  //                     .stock?.id ??
  //                 0,
  //             quantity: state.cart?.userCarts?.first.cartDetails?[cartIndex]
  //                     .quantity ??
  //                 1)
  //       ];
  //       for (Addons element
  //           in state.cart?.userCarts?.first.cartDetails?[cartIndex].addons ??
  //               []) {
  //         list.add(CartRequest(
  //           stockId: element.stocks?.id,
  //           quantity: element.quantity,
  //           parentId: state
  //                   .cart?.userCarts?.first.cartDetails?[cartIndex].stock?.id ??
  //               0,
  //         ));
  //       }
  //
  //       /// creating new cart
  //       final response = await _cartRepository.insertCart(
  //         cart: CartRequest(
  //             shopId: LocalStorage.getShopId(),
  //             stockId: state.cart?.userCarts?.first.cartDetails?[cartIndex]
  //                     .stock?.id ??
  //                 0,
  //             quantity: state.cart?.userCarts?.first.cartDetails?[cartIndex]
  //                     .quantity ??
  //                 1,
  //             carts: list),
  //       );
  //       response.when(
  //         success: (data) async {
  //           state =
  //               state.copyWith(cart: data.data, isAddAndRemoveLoading: false);
  //         },
  //         failure: (activeFailure, status) {
  //           state = state.copyWith(isAddAndRemoveLoading: false);
  //           AppHelpers.showCheckTopSnackBar(
  //             context,
  //             AppHelpers.getTranslation(activeFailure.toString()),
  //           );
  //         },
  //       );
  //     });
  //   } else {
  //     if (context.mounted) {
  //       AppHelpers.showNoConnectionSnackBar(context);
  //     }
  //   }
  // }

  Future<void> addCount({
    required BuildContext context,
    required int localIndex,
    ProductData? product,
  }) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      Vibrate.feedback(FeedbackType.selection);
      CartLocalModel item = LocalStorage.getCartLocal()[localIndex];
      if (product != null && (product.maxQty ?? 0) < (1 + item.quantity)) {
        AppHelpers.showCheckTopSnackBarInfo(
          context,
          '${AppHelpers.getTranslation(TrKeys.maxQty)} ${product.maxQty}',
        );
        return;
      }
      await LocalStorage.setCartLocal(
        item.copyWith(quantity: item.quantity + 1),
      );
      state = state.copyWith(isLoading: false);
      int cartIndex =
          state.cart?.userCarts?.first.cartDetails?.searchIndex(item) ?? 0;
      CartDetail oldDetail =
          state.cart?.userCarts?.first.cartDetails?[cartIndex] ?? CartDetail();
      CartDetail newDetail = oldDetail.copyWith(quantity: 1 + item.quantity);
      List<CartDetail> newCartList =
          state.cart?.userCarts?.first.cartDetails ?? [];
      if(newCartList.length > cartIndex) {
        newCartList.removeAt(cartIndex);
      }
      newCartList.insert(cartIndex, newDetail);
      UserCart newCart =
      state.cart!.userCarts!.first.copyWith(cartDetails: newCartList);
      List<UserCart> newUserCart = state.cart?.userCarts ?? [];
      newUserCart.removeAt(0);
      newUserCart.insert(0, newCart);
      Cart newDate = state.cart!.copyWith(userCarts: newUserCart);
      state = state.copyWith(cart: newDate);
      _delayed.run(() async {
        state = state.copyWith(
          isAddAndRemoveLoading: true,
        );
        List<CartRequest> list = [
          CartRequest(
              stockId: state.cart?.userCarts?.first.cartDetails?[cartIndex]
                  .stock?.id ??
                  0,
              quantity: state.cart?.userCarts?.first.cartDetails?[cartIndex]
                  .quantity ??
                  1)
        ];
        for (Addons element
        in state.cart?.userCarts?.first.cartDetails?[cartIndex].addons ??
            []) {
          list.add(CartRequest(
            stockId: element.stocks?.id,
            quantity: element.quantity,
            parentId: state
                .cart?.userCarts?.first.cartDetails?[cartIndex].stock?.id ??
                0,
          ));
        }

        /// creating new cart
        final response = await _cartRepository.insertCart(
          cart: CartRequest(
              shopId: LocalStorage.getShopId(),
              stockId: state.cart?.userCarts?.first.cartDetails?[cartIndex]
                  .stock?.id ??
                  0,
              quantity: state.cart?.userCarts?.first.cartDetails?[cartIndex]
                  .quantity ??
                  1,
              carts: list),
        );
        response.when(
          success: (data) async {
            state =
                state.copyWith(cart: data.data, isAddAndRemoveLoading: false);
          },
          failure: (activeFailure, status) {
            state = state.copyWith(isAddAndRemoveLoading: false);
            AppHelpers.showCheckTopSnackBar(
              context,
              AppHelpers.getTranslation(activeFailure.toString()),
            );
          },
        );
      });
    } else {
      if (context.mounted) {
        AppHelpers.showNoConnectionSnackBar(context);
      }
    }
  }

  Future<void> removeCount(
      {required BuildContext context, required int localIndex}) async {
    Vibrate.feedback(FeedbackType.selection);

    CartLocalModel item = LocalStorage.getCartLocal()[localIndex];
    if (item.quantity > 1) {
      final connected = await AppConnectivity.connectivity();
      if (connected) {
        await LocalStorage.setCartLocal(
            item.copyWith(quantity: item.quantity - 1));
        state = state.copyWith(isLoading: false);
        int cartIndex =
            state.cart?.userCarts?.first.cartDetails?.searchIndex(item) ?? 0;
        // print("cartIndex: $cartIndex");
        CartDetail oldDetail =
            state.cart?.userCarts?.first.cartDetails?[cartIndex] ??
                CartDetail();
        CartDetail newDetail = oldDetail.copyWith(quantity: item.quantity - 1);
        List<CartDetail> newCartList =
            state.cart?.userCarts?.first.cartDetails ?? [];

        if(newCartList.length > cartIndex) {
          newCartList.removeAt(cartIndex);
        }
        newCartList.insert(cartIndex, newDetail);
        UserCart newCart =
            state.cart!.userCarts!.first.copyWith(cartDetails: newCartList);
        List<UserCart> newUserCart = state.cart?.userCarts ?? [];
        newUserCart.removeAt(0);
        newUserCart.insert(0, newCart);
        Cart newDate = state.cart!.copyWith(userCarts: newUserCart);
        state = state.copyWith(cart: newDate);
        _delayed.run(() async {
          state = state.copyWith(isAddAndRemoveLoading: true);
          List<CartRequest> list = [
            CartRequest(
                stockId: oldDetail.stock?.id ?? 0,
                quantity: state.cart?.userCarts?.first.cartDetails?[cartIndex]
                        .quantity ??
                    1)
          ];
          for (Addons element in oldDetail.addons ?? []) {
            list.add(CartRequest(
              stockId: element.stocks?.id,
              quantity: element.quantity,
              parentId: oldDetail.stock?.id ?? 0,
            ));
          }
          final response = await _cartRepository.insertCart(
            cart: CartRequest(
                shopId: LocalStorage.getShopId(),
                stockId: oldDetail.stock?.id ?? 0,
                quantity: state.cart?.userCarts?.first.cartDetails?[cartIndex]
                        .quantity ??
                    1,
                carts: list),
          );
          response.when(
            success: (data) async {
              state =
                  state.copyWith(cart: data.data, isAddAndRemoveLoading: false);
              getCart(context, () {}, isShowLoading: false);
            },
            failure: (activeFailure, status) {
              state = state.copyWith(isAddAndRemoveLoading: false);
              AppHelpers.showCheckTopSnackBar(
                context,
                AppHelpers.getTranslation(activeFailure.toString()),
              );
            },
          );
        });
      } else {
        if (context.mounted) {
          AppHelpers.showNoConnectionSnackBar(context);
        }
      }
    } else {
      final connected = await AppConnectivity.connectivity();
      if (connected) {
        LocalStorage.setCartLocal(item.copyWith(quantity: 0));
        state = state.copyWith(
          isAddAndRemoveLoading: true,
        );
        int cartIndex = state.cart?.userCarts?.first.cartDetails
                ?.map((item) => item.stock?.id)
                .toList()
                .indexOf(item.stockId) ??
            -1;
        CartDetail oldDetail =
            state.cart?.userCarts?.first.cartDetails?[cartIndex] ??
                CartDetail();
        final cartId = state.cart?.id ?? 0;
        final cartDetailId = oldDetail.id ?? 0;
        List<CartDetail>? newCartList =
            state.cart?.userCarts?.first.cartDetails ?? [];
        if (cartIndex != -1) {
          newCartList.removeAt(cartIndex);
        } else {
          newCartList.clear();
        }

        UserCart? newCart =
            state.cart?.userCarts?.first.copyWith(cartDetails: newCartList);
        List<UserCart> newUserCart = state.cart?.userCarts ?? [];
        if (newUserCart.isNotEmpty) {
          newUserCart.removeAt(0);
          newUserCart.insert(0, newCart ?? UserCart());
        } else {
          newUserCart.clear();
        }

        Cart? newDate = state.cart?.copyWith(userCarts: newUserCart);
        if (newDate?.userCarts?.first.cartDetails?.isEmpty ?? true) {
          state = state.copyWith(cart: null);
          final responseDelete =
              await _cartRepository.deleteCart(cartId: cartId);
          responseDelete.when(
            success: (data) async {
              state = state.copyWith(isAddAndRemoveLoading: false);
              context.maybePop();
              getCart(context, () {}, isShowLoading: false);
            },
            failure: (activeFailure, status) {
              state = state.copyWith(isAddAndRemoveLoading: false);
            },
          );
        } else {
          state = state.copyWith(cart: newDate);
          final response = await _cartRepository.removeProductCart(
              cartDetailId: cartDetailId);
          response.when(
            success: (data) async {
              state = state.copyWith(isAddAndRemoveLoading: false);
              getCart(context, () {}, isShowLoading: false);
            },
            failure: (activeFailure, status) {
              state = state.copyWith(isAddAndRemoveLoading: false);
            },
          );
        }
      } else {
        if (context.mounted) {
          AppHelpers.showNoConnectionSnackBar(context);
        }
      }
    }
  }

  Future addCountLocal({
    required BuildContext context,
    required ProductData? product,
    required Stocks? stock,
  }) async {
    state = state.copyWith(isAddAndRemoveLoading: true);
    AppHelpers.addProduct(
        context: context, product: product, stock: stock, update: () {});

    await getCartLocal(context: context);

    state = state.copyWith(isAddAndRemoveLoading: false);
  }

  Future removeCountLocal({
    required BuildContext context,
    required ProductData? product,
    required Stocks? stock,
  }) async {
    state = state.copyWith(isAddAndRemoveLoading: true);
    AppHelpers.removeProduct(
        context: context, product: product, stock: stock, update: () {});
    await getCartLocal(context: context);
    state = state.copyWith(isAddAndRemoveLoading: false);
  }

  Future addCart(
    BuildContext context,
    ProductData product, {
    int? stockId,
  }) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      Vibrate.feedback(FeedbackType.selection);
      LocalStorage.setCartLocal(CartLocalModel(
          quantity: 1, stockId: stockId ?? product.stock?.id ?? 0));
      state = state.copyWith(isLoading: state.isLoading);
    }
  }

  Future getCart(
    BuildContext context,
    VoidCallback onSuccess, {
    bool isShowLoading = true,
    bool isStart = false,
    bool isRepeat = false,
    bool isOrder = false,
  }) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      if (isShowLoading) {
        state = state.copyWith(isLoading: true);
      }
      final response = await _cartRepository.getCart();
      response.when(
        success: (data) async {
          if (isRepeat) {
            state = state.copyWith(cart: data.data);
            onSuccess();
            return;
          }
          if (isShowLoading) {
            state = state.copyWith(cart: data.data, isLoading: false);
            if (isStart) {
              data.data?.userCarts?.first.cartDetails?.forEach((element) {
                LocalStorage.setCartLocal(
                  CartLocalModel(
                    quantity: element.quantity ?? 1,
                    stockId: element.stock?.id ?? 0,
                    addons: element.addons
                        ?.map((e) => Addon(
                            stockId: e.stockId ?? 0, quantity: e.quantity ?? 0))
                        .toList(),
                  ),
                );
              });
            } else {
              data.data?.userCarts?.first.cartDetails
                  ?.toList(growable: false)
                  .forEach((element) async {
                if (LocalStorage.getCartLocal().findIndex(element.stock?.id) ==
                    -1) {
                  int cartIndex = state.cart?.userCarts?.first.cartDetails
                          ?.map((item) => item.stock?.id)
                          .toList()
                          .indexOf(element.stock?.id) ??
                      -1;
                  // CartDetail oldDetail =
                  //     state.cart?.userCarts?.first.cartDetails?[cartIndex] ??
                  //         CartDetail();
                  // final cartId = state.cart?.id ?? 0;
                  // final cartDetailId = oldDetail.id ?? 0;
                  List<CartDetail>? newCartList =
                      state.cart?.userCarts?.first.cartDetails ?? [];
                  if (cartIndex != -1) {
                    newCartList.removeAt(cartIndex);
                  } else {
                    newCartList.clear();
                  }

                  UserCart? newCart = state.cart?.userCarts?.first
                      .copyWith(cartDetails: newCartList);
                  List<UserCart> newUserCart = state.cart?.userCarts ?? [];
                  if (newUserCart.isNotEmpty) {
                    newUserCart.removeAt(0);
                    newUserCart.insert(0, newCart ?? UserCart());
                  } else {
                    newUserCart.clear();
                  }

                  // Cart? newDate = state.cart?.copyWith(userCarts: newUserCart);
                  // if (newDate?.userCarts?.first.cartDetails?.isEmpty ?? true) {
                  //   state = state.copyWith(cart: null);
                  //   final responseDelete =
                  //       await _cartRepository.deleteCart(cartId: cartId);
                  //   responseDelete.when(
                  //     success: (data) async {
                  //       state = state.copyWith(isAddAndRemoveLoading: false);
                  //       context.maybePop();
                  //       getCart(context, () {}, isShowLoading: false);
                  //     },
                  //     failure: (activeFailure, status) {
                  //       state = state.copyWith(isAddAndRemoveLoading: false);
                  //     },
                  //   );
                  // }
                  // else {
                  //   state = state.copyWith(cart: newDate);
                  //   final response = await _cartRepository.removeProductCart(
                  //       cartDetailId: cartDetailId);
                  //   response.when(
                  //     success: (data) async {
                  //       state = state.copyWith(isAddAndRemoveLoading: false);
                  //       getCart(context, () {}, isShowLoading: false);
                  //     },
                  //     failure: (activeFailure, status) {
                  //       state = state.copyWith(isAddAndRemoveLoading: false);
                  //     },
                  //   );
                  // }
                }
              });
            }

            onSuccess();
          } else {
            state = state.copyWith(cart: data.data);
          }
        },
        failure: (activeFailure, status) {
          if (status == 404) {
            if (isOrder) {
              LocalStorage.deleteCartList();
              LocalStorage.deleteCartLocal();
            }
            if (isShowLoading) {
              state = state.copyWith(isLoading: false, cart: null);
            } else {
              state = state.copyWith(cart: null);
            }
          } else if (status != 401) {
            if (isShowLoading) {
              state = state.copyWith(isLoading: false);
            }
            AppHelpers.showCheckTopSnackBar(
              context,
              AppHelpers.getTranslation(activeFailure),
            );
          } else {
            if (isShowLoading) {
              state = state.copyWith(isLoading: false);
            }
            LocalStorage.logout();
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

  Future getCartLocal(
      {required BuildContext context, VoidCallback? onSuccess}) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      state = state.copyWith(isLoading: true);
      // print('elbekjon1');
      bool hasProducts = false;
      LocalStorage.getCartList().forEach(
        (e) {
          if (e.count > 0) {
            hasProducts = true;
          }
        },
      );
      if (hasProducts) {
        final response = await _cartRepository.productCalculateCart();
        response.when(
          success: (data) {
            state = state.copyWith(cartLocal: data.data, isLoading: false);
            // LocalStorage.setTotalCartList(
            //     list: data.data?.data?.map((e) => LocalCartModel(
            //         productId: e.stock?.product?.id,
            //         stockId: e.stock?.id,
            //         count: e.quantity ?? 0))
            //         .toList() ??
            //         []);
            onSuccess?.call();
          },
          failure: (activeFailure, status) {
            if (status == 404) {
              state = state.copyWith(isLoading: false, cart: null);
            } else if (status != 401) {
              state = state.copyWith(isLoading: false);
              AppHelpers.showCheckTopSnackBar(
                context,
                AppHelpers.getTranslation(activeFailure.toString()),
              );
            } else {
              state = state.copyWith(isLoading: false);
            }
          },
        );
      } else {
        deleteCart(context, isPop: false);
      }
    } else {
      if (context.mounted) {
        AppHelpers.showNoConnectionSnackBar(context);
      }
    }
  }

  Future deleteCart(BuildContext context, {bool isPop = true}) async {
    final connected = await AppConnectivity.connectivity();
    state = state.copyWith(isDeleteLoading: true);
    if (LocalStorage.getToken().isEmpty) {
      LocalStorage.deleteCartList();
      state = state.copyWith(isDeleteLoading: false);
      if (isPop) {
        Navigator.pop(context);
      }
      return;
    }
    if (connected) {
      final response =
          await _cartRepository.deleteCart(cartId: state.cart?.id ?? 0);
      response.when(
        success: (data) async {
          LocalStorage.deleteCartLocal();
          state = state.copyWith(isDeleteLoading: false, cart: null);
          if (isPop) {
            Navigator.maybePop(context);
          }
          return;
        },
        failure: (activeFailure, status) {
          state = state.copyWith(
            isDeleteLoading: false,
          );
          AppHelpers.showCheckTopSnackBar(
            context,
            AppHelpers.getTranslation(activeFailure.toString()),
          );
          return;
        },
      );
    } else {
      if (context.mounted) {
        AppHelpers.showNoConnectionSnackBar(context);
        return;
      }
    }
  }

  Future<void> deleteUser(BuildContext context, int index) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      _cartRepository.deleteUser(
          cartId: state.cart?.id ?? 0,
          userId: state.cart?.userCarts?[index].uuid ?? "");
      Cart? cart = state.cart;
      List<UserCart>? list = cart?.userCarts;
      list?.removeAt(index);
      Cart? newCart = cart?.copyWith(userCarts: list);
      state = state.copyWith(cart: newCart);
    } else {
      if (context.mounted) {
        AppHelpers.showNoConnectionSnackBar(context);
        return;
      }
    }
  }

  Future<void> startGroupOrder(BuildContext context, int cartId) async {
    final connected = await AppConnectivity.connectivity();
    state = state.copyWith(
      isStartGroup: false,
      isStartGroupLoading: true,
    );
    if (connected) {
      final response = await _cartRepository.startGroupOrder(cartId: cartId);
      response.when(
        success: (data) async {
          Cart? cart = state.cart;
          Cart? newCart = cart?.copyWith(group: true);
          state = state.copyWith(
            cart: newCart,
            isStartGroup: true,
            isStartGroupLoading: false,
          );
        },
        failure: (activeFailure, status) {
          state = state.copyWith(
            isStartGroup: false,
            isStartGroupLoading: false,
          );
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

  void createCart(
    BuildContext context,
    int shopId,
  ) async {
    state = state.copyWith(isCheckShopOrder: false, isOtherShop: false);
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      state = state.copyWith(isCheckShopOrder: true);
      final response = await _cartRepository.createCart(
        cart: CartRequest(shopId: shopId),
      );
      response.when(
        success: (data) {
          state = state.copyWith(isCheckShopOrder: false, cart: data.data);
          startGroupOrder(context, data.data?.id ?? 0);
        },
        failure: (activeFailure, status) {
          state = state.copyWith(isCheckShopOrder: false);
          if (status == 400) {
            state = state.copyWith(isOtherShop: true);
          } else {
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
}
