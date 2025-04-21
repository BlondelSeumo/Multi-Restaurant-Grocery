import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import 'package:riverpodtemp/application/order/order_provider.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/buttons/custom_button.dart';
import 'package:riverpodtemp/presentation/components/text_fields/outline_bordered_text_field.dart';
import 'package:riverpodtemp/presentation/components/title_icon.dart';
import 'package:riverpodtemp/presentation/pages/order/order_check/widgets/payment_method.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme_wrapper.dart';
import '../../../../../application/select/select_provider.dart';
import '../../../../../infrastructure/services/input_formatter.dart';
import '../../../../components/web_view.dart';

class RatingPage extends ConsumerStatefulWidget {
  const RatingPage({
    super.key,
  });

  @override
  ConsumerState<RatingPage> createState() => _RatingPageState();
}

class _RatingPageState extends ConsumerState<RatingPage> {
  TextEditingController textEditingController = TextEditingController();
  TextEditingController priceController = TextEditingController();

  double rating = 1;
  double price = 5;

  List<num> tips = [5, 10, 15, -1];

  @override
  void dispose() {
    textEditingController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(selectProvider);
    final notifier = ref.read(selectProvider.notifier);
    return ThemeWrapper(
      builder: (colors, controller) => Container(
        margin: MediaQuery.of(context).viewInsets,
        decoration: BoxDecoration(
            color: colors.scaffoldColor,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(16.r),
              topRight: Radius.circular(16.r),
            )),
        width: double.infinity,
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.w),
          child: SingleChildScrollView(
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
                        borderRadius: BorderRadius.all(Radius.circular(40.r))),
                  ),
                ),
                24.verticalSpace,
                TitleAndIcon(
                  title: AppHelpers.getTranslation(TrKeys.ratingCourier),
                  paddingHorizontalSize: 0,
                  titleSize: 18,
                ),
                24.verticalSpace,
                OutlinedBorderTextField(
                  textController: textEditingController,
                  label:
                      AppHelpers.getTranslation(TrKeys.comment).toUpperCase(),
                ),
                24.verticalSpace,
                RatingBar.builder(
                  itemBuilder: (context, index) => const Icon(
                    FlutterRemix.star_smile_fill,
                    color: AppStyle.primary,
                  ),
                  itemCount: 5,
                  itemPadding: EdgeInsets.symmetric(horizontal: 14.h),
                  direction: Axis.horizontal,
                  onRatingUpdate: (double value) {
                    rating = value;
                  },
                  glow: false,
                ),
                Column(
                  children: [
                    12.verticalSpace,
                    TitleAndIcon(
                      title: AppHelpers.getTranslation(TrKeys.tips),
                      paddingHorizontalSize: 0,
                      titleSize: 16,
                    ),
                    12.verticalSpace,
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        ...tips.mapIndexed(
                          (e, i) {
                            return GestureDetector(
                              onTap: () {
                                if (state.selectedIndex == i) {
                                  notifier.selectIndex(-1);
                                  price = 0;
                                  return;
                                }
                                notifier.selectIndex(i);
                                if (i == 3) {
                                  price = 0;
                                } else {
                                  price = e.toDouble();
                                }
                              },
                              child: Container(
                                width: 80.r,
                                height: 60.r,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    width: state.selectedIndex == i ? 2 : 1,
                                    color: state.selectedIndex == i
                                        ? AppStyle.primary
                                        : AppStyle.textGrey,
                                  ),
                                ),
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: i != 3
                                      ? [
                                          Text(
                                            AppHelpers.numberFormat(e),
                                            style: AppStyle.interNormal(
                                              size: 14,
                                              color: state.selectedIndex == i
                                                  ? AppStyle.primary
                                                  : colors.textBlack,
                                            ),
                                          ),
                                        ]
                                      : [
                                          Icon(
                                            FlutterRemix.edit_2_line,
                                            color: state.selectedIndex == i
                                                ? AppStyle.primary
                                                : colors.textBlack,
                                          ),
                                          Text(
                                            AppHelpers.getTranslation(
                                                TrKeys.custom),
                                            style: AppStyle.interNormal(
                                              size: 14,
                                              color: state.selectedIndex == i
                                                  ? AppStyle.primary
                                                  : colors.textBlack,
                                            ),
                                          ),
                                          6.verticalSpace,
                                        ],
                                ),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                    if (state.selectedIndex == 3)
                      Padding(
                        padding: REdgeInsets.only(top: 12),
                        child: OutlinedBorderTextField(
                          textController: priceController,
                          label: AppHelpers.getTranslation(TrKeys.customTip)
                              .toUpperCase(),
                          inputFormatters: [InputFormatter.currency],
                          onChanged: (s) {
                            price = double.tryParse(s) ?? 0;
                          },
                        ),
                      ),
                  ],
                ),
                40.verticalSpace,
                Padding(
                  padding: EdgeInsets.only(
                      bottom: MediaQuery.of(context).padding.bottom + 36.h),
                  child: Consumer(builder: (context, ref, child) {
                    return CustomButton(
                      isLoading: ref.watch(orderProvider).isButtonLoading,
                      background: AppStyle.primary,
                      textColor: colors.textBlack,
                      title: AppHelpers.getTranslation(TrKeys.save),
                      onPressed: () {
                        if (state.selectedIndex != -1) {
                          AppHelpers.showCustomModalBottomSheet(
                            context: context,
                            modal: PaymentMethods(
                              colors: colors,
                              tipPrice: price,
                              tips: (payment, price) {
                                ref.read(orderProvider.notifier).sendTips(
                                      context: context,
                                      payment: payment,
                                      price: price,
                                      onWebview: (s) {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                              builder: (_) =>
                                                  WebViewPage(url: s)),
                                        ).whenComplete(() {
                                          if (context.mounted) {
                                            ref
                                                .read(orderProvider.notifier)
                                                .addReview(
                                                    context,
                                                    textEditingController.text,
                                                    rating);
                                            context.replaceRoute(
                                                const OrdersListRoute());
                                          }
                                        });
                                      },
                                      onSuccess: () {
                                        Navigator.maybePop(context);
                                      },
                                    );
                              },
                            ),
                            isDarkMode: false,
                          );
                        } else {
                          ref.read(orderProvider.notifier).addReview(
                              context, textEditingController.text, rating);
                        }
                        // context.replaceRoute(const OrdersListRoute());
                        // context.replaceRoute(const OrdersListRoute());
                      },
                    );
                  }),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}
