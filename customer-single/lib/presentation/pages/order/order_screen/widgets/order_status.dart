import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/enums.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

import 'order_status_item.dart';

class OrderStatusScreen extends StatelessWidget {
  final OrderStatus status;
  final CustomColorSet colors;

  const OrderStatusScreen({
    super.key,
    required this.status,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(top: 16.h),
      decoration: BoxDecoration(
        color: colors.buttonColor,
        borderRadius: BorderRadius.all(
          Radius.circular(10.r),
        ),
      ),
      padding: EdgeInsets.all(14.r),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            children: [
              Text(
                AppHelpers.getTranslation(
                    AppHelpers.getOrderStatusText(status)),
                style: AppStyle.interNormal(
                  size: 13,
                  color: colors.textBlack,
                ),
              ),
            ],
          ),
          status == OrderStatus.canceled
              ? Row(
                  children: [
                    OrderStatusItem(
                      colors: colors,
                      icon: Icon(
                        Icons.done_all,
                        size: 16.r,
                        color: colors.textBlack,
                      ),
                      bgColor: AppStyle.red,
                      isActive: true,
                      isProgress: false,
                    ),
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 500),
                      height: 6.h,
                      width: 12.w,
                      decoration: const BoxDecoration(
                        color: AppStyle.red,
                      ),
                    ),
                    OrderStatusItem(
                      colors: colors,
                      icon: Icon(
                        Icons.restaurant_rounded,
                        size: 16.r,
                        color: colors.textBlack,
                      ),
                      bgColor: AppStyle.red,
                      isActive: true,
                      isProgress: false,
                    ),
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 500),
                      height: 6.h,
                      width: 12.w,
                      decoration: const BoxDecoration(
                        color: AppStyle.red,
                      ),
                    ),
                    OrderStatusItem(
                      colors: colors,
                      icon: SvgPicture.asset(
                        "assets/svgs/delivery2.svg",
                        width: 20.w,
                        colorFilter: ColorFilter.mode(
                          colors.textBlack,
                          BlendMode.srcIn,
                        ),
                      ),
                      bgColor: AppStyle.red,
                      isActive: true,
                      isProgress: false,
                    ),
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 500),
                      height: 6.h,
                      width: 12.w,
                      decoration: const BoxDecoration(
                        color: AppStyle.red,
                      ),
                    ),
                    OrderStatusItem(
                      colors: colors,
                      icon: Icon(
                        Icons.flag,
                        size: 16.r,
                        color: colors.textBlack,
                      ),
                      bgColor: AppStyle.red,
                      isActive: true,
                      isProgress: false,
                    ),
                  ],
                )
              : status == OrderStatus.delivered
                  ? Row(
                      children: [
                        OrderStatusItem(
                          colors: colors,
                          icon: Icon(
                            Icons.done_all,
                            size: 16.r,
                            color: colors.textBlack,
                          ),
                          bgColor: AppStyle.primary,
                          isActive: true,
                          isProgress: false,
                        ),
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 500),
                          height: 6.h,
                          width: 12.w,
                          decoration: const BoxDecoration(
                            color: AppStyle.primary,
                          ),
                        ),
                        OrderStatusItem(
                          colors: colors,
                          icon: Icon(
                            Icons.restaurant_rounded,
                            size: 16.r,
                            color: colors.textBlack,
                          ),
                          bgColor: AppStyle.primary,
                          isActive: true,
                          isProgress: false,
                        ),
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 500),
                          height: 6.h,
                          width: 12.w,
                          decoration: const BoxDecoration(
                            color: AppStyle.primary,
                          ),
                        ),
                        OrderStatusItem(
                          colors: colors,
                          icon: SvgPicture.asset(
                            "assets/svgs/delivery2.svg",
                            width: 20.w,
                            colorFilter: ColorFilter.mode(
                                colors.textBlack, BlendMode.srcIn),
                          ),
                          bgColor: AppStyle.primary,
                          isActive: true,
                          isProgress: false,
                        ),
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 500),
                          height: 6.h,
                          width: 12.w,
                          decoration: const BoxDecoration(
                            color: AppStyle.primary,
                          ),
                        ),
                        OrderStatusItem(
                          colors: colors,
                          icon: Icon(
                            Icons.flag,
                            size: 16.r,
                            color: colors.textBlack,
                          ),
                          bgColor: AppStyle.primary,
                          isActive: true,
                          isProgress: false,
                        ),
                      ],
                    )
                  : Row(
                      children: [
                        OrderStatusItem(
                          colors: colors,
                          icon: Icon(
                            Icons.done_all,
                            size: 16.r,
                            color: colors.textBlack,
                          ),
                          isActive: status != OrderStatus.open,
                          isProgress: status == OrderStatus.open,
                        ),
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 500),
                          height: 6.h,
                          width: 12.w,
                          decoration: BoxDecoration(
                            color: status != OrderStatus.open
                                ? AppStyle.primary
                                : AppStyle.white,
                          ),
                        ),
                        OrderStatusItem(
                          colors: colors,
                          icon: Icon(
                            Icons.restaurant_rounded,
                            size: 16.r,
                            color: colors.textBlack,
                          ),
                          isActive: status == OrderStatus.ready ||
                              status == OrderStatus.onWay,
                          isProgress: status == OrderStatus.accepted,
                        ),
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 500),
                          height: 6.h,
                          width: 12.w,
                          decoration: BoxDecoration(
                            color: status == OrderStatus.ready ||
                                    status == OrderStatus.onWay
                                ? AppStyle.primary
                                : AppStyle.white,
                          ),
                        ),
                        OrderStatusItem(
                          colors: colors,
                          icon: SvgPicture.asset(
                            status == OrderStatus.onWay
                                ? "assets/svgs/delivery2.svg"
                                : "assets/svgs/delivery.svg",
                            width: 20.w,
                            colorFilter: ColorFilter.mode(
                              colors.textBlack,
                              BlendMode.srcIn,
                            ),
                          ),
                          isActive: status == OrderStatus.onWay,
                          isProgress: status == OrderStatus.ready ||
                              status == OrderStatus.delivered,
                        ),
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 500),
                          height: 6.h,
                          width: 12.w,
                          decoration: const BoxDecoration(
                            color: AppStyle.white,
                          ),
                        ),
                        OrderStatusItem(
                          colors: colors,
                          icon: Icon(
                            Icons.flag,
                            size: 16.r,
                            color: colors.textBlack,
                          ),
                          isActive: false,
                          isProgress: false,
                        ),
                      ],
                    )
        ],
      ),
    );
  }
}
