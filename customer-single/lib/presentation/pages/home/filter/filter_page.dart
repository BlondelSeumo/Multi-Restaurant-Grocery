import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/application/filter/filter_notifier.dart';
import 'package:riverpodtemp/application/filter/filter_state.dart';
import 'package:riverpodtemp/infrastructure/models/data/take_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/buttons/custom_button.dart';
import 'package:riverpodtemp/presentation/components/custom_toggle.dart';
import 'package:riverpodtemp/presentation/components/loading.dart';
import 'package:riverpodtemp/presentation/components/title_icon.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';
import 'package:riverpodtemp/presentation/theme/theme_wrapper.dart';

import '../../../../../application/filter/filter_provider.dart';
import 'widgets/filter_item.dart';

class FilterPage extends ConsumerStatefulWidget {
  final ScrollController controller;

  const FilterPage({
    super.key,
    required this.controller,
  });

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _FilterPageState();
}

class _FilterPageState extends ConsumerState<FilterPage> {
  List sorts = [
    AppHelpers.getTranslation(TrKeys.trustYou),
    AppHelpers.getTranslation(TrKeys.bestSale),
    AppHelpers.getTranslation(TrKeys.highlyRated),
    AppHelpers.getTranslation(TrKeys.lowSale),
    AppHelpers.getTranslation(TrKeys.lowRating),
  ];
  final _dealsController = ValueNotifier<bool>(false);

  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(filterProvider.notifier)
        ..init(context)
        ..setCheck(context, false);
    });

    _dealsController.addListener(() {
      ref
          .read(filterProvider.notifier)
          .setCheck(context, _dealsController.value);
    });

    super.initState();
  }

  @override
  void dispose() {
    _dealsController.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bool isLtr = LocalStorage.getLangLtr();
    final state = ref.watch(filterProvider);
    final event = ref.read(filterProvider.notifier);
    return ThemeWrapper(
      builder: (colors, controller) => Directionality(
          textDirection: isLtr ? TextDirection.ltr : TextDirection.rtl,
          child: Container(
            decoration: BoxDecoration(
              color: colors.scaffoldColor,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(12.r),
                topRight: Radius.circular(12.r),
              ),
            ),
            width: double.infinity,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: ListView(
                controller: widget.controller,
                primary: false,
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
                  18.verticalSpace,
                  TitleAndIcon(
                    title:
                        "${AppHelpers.getTranslation(TrKeys.filter)} (${!state.isLoading ? state.shopCount : AppHelpers.getTranslation(TrKeys.loading)})",
                    rightTitleColor: AppStyle.red,
                    rightTitle: AppHelpers.getTranslation(TrKeys.clearAll),
                    onRightTap: () {
                      event.clear(context);
                    },
                  ),
                  state.isTagLoading
                      ? Padding(
                          padding: EdgeInsets.only(top: 56.h),
                          child: Loading(),
                        )
                      : Column(
                          children: [
                            8.verticalSpace,
                            _priceRange(state, event, colors),
                            state.tags.isNotEmpty
                                ? Column(
                                    children: [
                                      8.verticalSpace,
                                      FilterItem(
                                        title: AppHelpers.getTranslation(
                                          TrKeys.specialOffers,
                                        ),
                                        list: state.tags,
                                        isOffer: true,
                                        currentItem: state.filterModel?.offer,
                                        onTap: (s) {
                                          if ((s as TakeModel).id ==
                                              state.filterModel?.offer) {
                                            state.filterModel?.offer = null;
                                          } else {
                                            state.filterModel?.offer = s.id;
                                          }
                                          event.setFilterModel(
                                            context,
                                            state.filterModel,
                                          );
                                        },
                                        colors: colors,
                                      ),
                                    ],
                                  )
                                : const SizedBox.shrink(),
                            8.verticalSpace,
                            FilterItem(
                              title: AppHelpers.getTranslation(TrKeys.sortBy),
                              list: sorts,
                              isSort: true,
                              currentItem: state.filterModel?.sort,
                              onTap: (s) {
                                if (s == state.filterModel?.sort) {
                                  state.filterModel?.sort = null;
                                } else {
                                  state.filterModel?.sort = s;
                                }
                                event.setFilterModel(
                                    context, state.filterModel);
                              },
                              colors: colors,
                            ),
                            8.verticalSpace,
                            CustomToggle(
                              title: AppHelpers.getTranslation(TrKeys.deals),
                              isChecked: state.deals,
                              controller: _dealsController,
                              onChange: () {},
                              colors: colors,
                            ),
                            40.verticalSpace,
                            CustomButton(
                              isLoading: state.isLoading,
                              background: colors.primary,
                              textColor: colors.textBlack,
                              title:
                                  "${AppHelpers.getTranslation(TrKeys.show)} ${state.shopCount} ${AppHelpers.getTranslation(TrKeys.products)} ",
                              onPressed: () {
                                context.pushRoute(const ResultFilterRoute());
                              },
                            ),
                          ],
                        ),
                ],
              ),
            ),
          )),
    );
  }

  Container _priceRange(
    FilterState state,
    FilterNotifier event,
    CustomColorSet colors,
  ) {
    return Container(
      width: double.infinity,
      padding:
          EdgeInsets.only(left: 10.w, right: 10.w, top: 18.h, bottom: 10.h),
      decoration: BoxDecoration(
        color: colors.buttonColor,
        borderRadius: BorderRadius.all(
          Radius.circular(10.r),
        ),
      ),
      child: Column(
        children: [
          Text(
            AppHelpers.getTranslation(TrKeys.priceRange),
            style: AppStyle.interNoSemi(
              size: 16,
              color: colors.textBlack,
            ),
          ),
          18.verticalSpace,
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Padding(
                padding: EdgeInsets.only(bottom: 2.h),
                child: SizedBox(
                  width: 46.w,
                  child: Text(
                    AppHelpers.numberFormat(
                      double.tryParse(state.rangeValues.start.toString()),
                    ),
                    style: AppStyle.interNormal(
                      size: 14,
                      color: colors.textBlack,
                    ),
                  ),
                ),
              ),
              Expanded(
                child: Column(
                  children: [
                    Padding(
                      padding: EdgeInsets.only(
                        right: 22.r,
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          for (int i = 0; i < state.prices.length; i++)
                            Container(
                              width: 10.w,
                              height: 100.h / state.prices[i],
                              decoration: BoxDecoration(
                                  color: ((state.rangeValues.start /
                                                      (state.endPrice / 15))
                                                  .round() <=
                                              i) &&
                                          ((state.rangeValues.end /
                                                      (state.endPrice / 15))
                                                  .round() >=
                                              i)
                                      ? AppStyle.primary
                                      : AppStyle.bgGrey,
                                  borderRadius: BorderRadius.circular(48.r)),
                            )
                        ],
                      ),
                    ),
                    8.verticalSpace,
                    Padding(
                      padding: EdgeInsets.only(
                        right: 24.r,
                      ),
                      child: RangeSlider(
                        activeColor: AppStyle.primary,
                        inactiveColor: AppStyle.bgGrey,
                        min: 1,
                        max: state.endPrice,
                        values: state.rangeValues,
                        onChanged: (value) {
                          event.setRange(
                            RangeValues(value.start, value.end),
                            context,
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: EdgeInsets.only(bottom: 2.h),
                child: SizedBox(
                  width: 56.w,
                  child: Text(
                    AppHelpers.numberFormat(
                      double.tryParse(state.rangeValues.end.toString()),
                    ),
                    style: AppStyle.interNormal(
                      size: 12.sp,
                      color: colors.textBlack,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
