import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpodtemp/infrastructure/models/data/payment_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_connectivity.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import '../../domain/iterface/payments.dart';
import 'payment_state.dart';

class PaymentNotifier extends StateNotifier<PaymentState> {
  final PaymentsRepositoryFacade _paymentsRepository;

  PaymentNotifier(this._paymentsRepository) : super(const PaymentState());

  void changePayment(PaymentData paymentData) {
    state = state.copyWith(selectPaymentData: paymentData);
  }

  Future<void> fetchPayments(
    BuildContext context, {
    bool withOutCash = false,
  }) async {
    final connected = await AppConnectivity.connectivity();
    if (connected) {
      state = state.copyWith(isPaymentsLoading: true);
      final response = await _paymentsRepository.getPayments();
      response.when(
        success: (data) {
          List<PaymentData> payments = [];
          List<PaymentData> onlinePayments = [];
          if (withOutCash) {
            // payments =
            //     data?.data?.reversed.where((e) => e.tag == 'wallet').toList() ??
            //         [];
            onlinePayments = data?.data?.reversed
                .where((e) => e.tag != "cash" && e.tag != 'wallet')
                .toList() ??
                [];
          } else {
            payments =
                data?.data?.reversed.where((e) => e.tag == "cash").toList() ??
                    [];
            onlinePayments = data?.data?.reversed
                .where((e) => e.tag != "cash" && e.tag != 'wallet')
                .toList() ??
                [];
          }
          state = state.copyWith(
            payments: payments,
            isPaymentsLoading: false,
            selectPaymentData: data?.data?.firstWhere(
                  (element) => element.tag == 'cash',
              orElse: () => PaymentData(),
            ),
            wallet: data?.data?.firstWhere(
                  (element) => element.tag == 'wallet',
              orElse: () => PaymentData(),
            ),
            onlinePayments: onlinePayments,
          );
        },
        failure: (failure, status) {
          state = state.copyWith(isPaymentsLoading: false);
          AppHelpers.showCheckTopSnackBar(
            context,
            AppHelpers.getTranslation(failure.toString()),
          );
        },
      );
    } else {
      if (context.mounted) {
        AppHelpers.showNoConnectionSnackBar(context);
      }
    }
  }

  void setCashChange(String? value) {
    state = state.copyWith(cashChange: value);
  }

}
