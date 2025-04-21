import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/application/order/order_provider.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/custom_network_image.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class DeliveryInfo extends StatelessWidget {
  final CustomColorSet colors;

  const DeliveryInfo({super.key, required this.colors});

  @override
  Widget build(BuildContext context) {
    return Consumer(
      builder: (context, ref, child) {
        return ref.watch(orderProvider).orderData?.deliveryMan == null
            ? const SizedBox.shrink()
            : Column(
                children: [
                  16.verticalSpace,
                  Container(
                    decoration: BoxDecoration(
                      color: AppStyle.bgGrey,
                      borderRadius: BorderRadius.all(
                        Radius.circular(10.r),
                      ),
                    ),
                    margin: EdgeInsets.symmetric(horizontal: 16.w),
                    padding:
                        EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
                    child: Row(
                      children: [
                        ClipOval(
                          child: CustomNetworkImage(
                            url: ref
                                    .watch(orderProvider)
                                    .orderData
                                    ?.deliveryMan
                                    ?.img ??
                                "",
                            height: 48,
                            width: 48,
                            radius: 0,
                          ),
                        ),
                        12.horizontalSpace,
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "${ref.watch(orderProvider).orderData?.deliveryMan?.firstname ?? ""} ${ref.watch(orderProvider).orderData?.deliveryMan?.lastname ?? ""}",
                              style: AppStyle.interSemi(
                                size: 16,
                                color: colors.textBlack,
                              ),
                            ),
                            Text(
                              AppHelpers.getTranslation(TrKeys.driver),
                              style: AppStyle.interRegular(
                                size: 12.sp,
                                color: colors.textBlack,
                              ),
                            ),
                          ],
                        ),
                        Spacer(),
                        GestureDetector(
                          onTap: () async {
                            context.pushRoute(
                              ChatRoute(
                                  sender:
                                      ref.watch(orderProvider).orderData?.user),
                            );
                          },
                          child: Container(
                            height: 30.r,
                            width: 30.r,
                            decoration: BoxDecoration(
                              color: colors.textBlack,
                              shape: BoxShape.circle,
                            ),
                            margin: EdgeInsets.all(4.r),
                            child: Icon(
                              FlutterRemix.chat_1_fill,
                              color: AppStyle.white,
                              size: 14.r,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              );
      },
    );
  }
}
