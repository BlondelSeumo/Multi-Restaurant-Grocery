import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/application/reservation/reservation_provider.dart';
import 'package:riverpodtemp/application/shop/shop_provider.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/select_item.dart';
import 'package:riverpodtemp/presentation/components/title_icon.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class ReservationTime extends ConsumerStatefulWidget {
  final int? id;
  final CustomColorSet colors;

  const ReservationTime({required this.colors, this.id, super.key});

  @override
  ConsumerState<ReservationTime> createState() => _ReservationTimeState();
}

class _ReservationTimeState extends ConsumerState<ReservationTime> {
  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback(
      (_) {
        ref.read(reservationProvider.notifier).getTimes(
              id: widget.id,
              shopWorkingDay: ref.watch(shopProvider).shopData?.shopWorkingDays,
            );
      },
    );
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(reservationProvider);
    final event = ref.read(reservationProvider.notifier);
    return Container(
      decoration: BoxDecoration(
        color: widget.colors.scaffoldColor,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(12.r),
          topRight: Radius.circular(12.r),
        ),
      ),
      width: double.infinity,
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 16.w),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            8.verticalSpace,
            Center(
              child: Container(
                height: 4.h,
                width: 48.w,
                decoration: BoxDecoration(
                  color: AppStyle.dragElement,
                  borderRadius: BorderRadius.all(
                    Radius.circular(40.r),
                  ),
                ),
              ),
            ),
            14.verticalSpace,
            TitleAndIcon(
              title: AppHelpers.getTranslation(TrKeys.reservationTime),
              paddingHorizontalSize: 0,
              rightTitleColor: AppStyle.red,
            ),
            24.verticalSpace,
            Flexible(
              child: ListView.builder(
                shrinkWrap: true,
                itemCount: state.timesInterval?.length,
                itemBuilder: (context, index) {
                  final item = state.timesInterval?[index];
                  return SelectItem(
                    colors: widget.colors,
                    onTap: () {
                      event.setTime(item);
                      Navigator.pop(context);
                    },
                    isActive: item?.start == state.selectedTime?.start,
                    title: item?.start ?? '',
                  );
                },
              ),
            )
          ],
        ),
      ),
    );
  }
}
