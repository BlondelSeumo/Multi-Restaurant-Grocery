import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpodtemp/domain/di/dependency_manager.dart';
import 'package:riverpodtemp/infrastructure/models/data/payment_data.dart';
import 'package:riverpodtemp/infrastructure/models/data/user.dart';
import 'package:riverpodtemp/infrastructure/models/response/transactions_response_two.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';
import 'wallet_state.dart';

class WalletNotifier extends StateNotifier<WalletState> {
  int page = 0;
  int searchPage = 0;

  WalletNotifier() : super(const WalletState());

  fetchTransactions({
    required BuildContext context,
    bool? isRefresh,
    RefreshController? controller,
  }) async {
    if (isRefresh ?? false) {
      controller?.resetNoData();
      page = 0;
      state = state.copyWith(transactions: [], isTransactionLoading: true);
    }
    final res = await userRepository.getWalletHistory(++page);
    res.when(success: (data) {
      List<TransactionDataTwo> list = List.from(state.transactions);
      list.addAll(data.data ?? []);
      state = state.copyWith(isTransactionLoading: false, transactions: list);
      if (isRefresh ?? false) {
        controller?.refreshCompleted();
        return;
      } else if (data.data?.isEmpty ?? true) {
        controller?.loadNoData();
        return;
      }
      controller?.loadComplete();
      return;
    }, failure: (failure, s) {
      if (isRefresh ?? false) {
        controller?.refreshFailed();
        return;
      }
      controller?.loadFailed();
      state = state.copyWith(isTransactionLoading: false);
      AppHelpers.showCheckTopSnackBar(context, failure);
    });
  }

  searchUser(
      {required BuildContext context,
      bool? isRefresh,
      RefreshController? controller,
      required String search}) async {
    if (isRefresh ?? false) {
      controller?.resetNoData();
      searchPage = 0;
      state = state.copyWith(listOfUser: [], isSearchingLoading: true);
    }

    final res =
        await paymentsRepository.searchUsers(query: search, page: ++searchPage);
    res.when(success: (data) {
      List<UserModel> list = List.from(state.listOfUser ?? []);
      list.addAll(data);
      state = state.copyWith(listOfUser: list, isSearchingLoading: false);
      if (isRefresh ?? false) {
        controller?.refreshCompleted();
        return;
      } else if (data.isEmpty) {
        controller?.loadNoData();
        return;
      }
      controller?.loadComplete();
      return;
    }, failure: (failure, s) {
      state = state.copyWith(isSearchingLoading: false);
      if (isRefresh ?? false) {
        controller?.refreshFailed();
        return;
      }
      controller?.loadFailed();
      AppHelpers.showCheckTopSnackBar(context, failure);
    });
  }

  fetchPayments({required BuildContext context}) async {
    final res = await paymentsRepository.getPayments();
    res.when(success: (data) {
      List<PaymentData> list = [];
      for (int i = 0; i < (data?.data?.length ?? 0); i++) {
        if (data?.data?[i].tag != "cash" && data?.data?[i].tag != "wallet") {
          list.add(data?.data?[i] ?? PaymentData());
        }
      }
      state = state.copyWith(payments: list, selectPayment: 0);
    }, failure: (failure, s) {
      AppHelpers.showCheckTopSnackBar(context, failure);
    });
  }

  selectPayment({required int index}) {
    state = state.copyWith(selectPayment: index);
  }

  fetchMaksekeskus(BuildContext context, num price) async {
    state = state.copyWith(isMaksekeskusLoading: true);
    final res = await paymentsRepository.paymentMaksekeskusView(price: price);
    res.when(success: (l) async {
      state = state.copyWith(isMaksekeskusLoading: false, maksekeskus: l.data);
    }, failure: (failure, s) {
      state = state.copyWith(isMaksekeskusLoading: false);
      AppHelpers.showCheckTopSnackBar(context, failure);
    });
  }

  fillWallet({
    required BuildContext context,
    required VoidCallback onSuccess,
    required String price,
  }) async {
    // if (state.payments?[state.selectPayment].tag == 'maksekeskus') {
    //   AppHelpers.showCustomModalBottomSheet(
    //       context: context,
    //       modal: MaksekeskusScreen(
    //         price: double.tryParse(price) ?? 0,
    //         onSuccess: (url) async {
    //           await context
    //               .pushRoute(WebViewRoute(url: url))
    //               .whenComplete(() => onSuccess());
    //         },
    //       ));
    //   return;
    // }
    state = state.copyWith(isButtonLoading: true);
    final res = await ordersRepository.walletProcess(
      name: state.payments?[state.selectPayment].tag ?? "",
      price: double.tryParse(price) ?? 0,
      walletId: int.tryParse(LocalStorage.getUser()?.wallet?.id ?? '0'),
    );
    res.when(success: (data) async {
      state = state.copyWith(isButtonLoading: false);
      await context.pushRoute(WebViewRoute(url: data));
      if (context.mounted) {
        Navigator.pop(context);
      }
      onSuccess.call();
    }, failure: (failure, s) {
      state = state.copyWith(isButtonLoading: false);
      AppHelpers.showCheckTopSnackBar(context, failure);
    });
  }

  sendWallet(
      {required BuildContext context,
      required String price,
      required VoidCallback onSuccess,
      required String uuid}) async {
    if ((double.tryParse(price) ?? 0) == 0) {
      return;
    }
    state = state.copyWith(isButtonLoading: true);
    final res = await paymentsRepository.sendWallet(
        uuid: uuid, price: double.tryParse(price) ?? 0);
    res.when(success: (data) async {
      state = state.copyWith(isButtonLoading: false);
      onSuccess();
    }, failure: (failure, s) {
      state = state.copyWith(isButtonLoading: false);
      AppHelpers.showCheckTopSnackBar(context, failure);
    });
  }
}
