import 'package:flutter/material.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:rating_summary/rating_summary.dart';
import 'package:riverpodtemp/infrastructure/models/data/shop_data.dart';
import 'package:riverpodtemp/infrastructure/models/response/review_count.dart';
import 'package:riverpodtemp/infrastructure/models/response/review_response.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/title_icon.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';
import 'review_item.dart';

class ReviewScreen extends StatelessWidget {
  final ShopData? shop;
  final ReviewCountModel? reviewCount;
  final List<ReviewModel> review;
  final CustomColorSet colors;

  const ReviewScreen({
    super.key,
    required this.shop,
    required this.review,
    required this.reviewCount,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 20.r, horizontal: 15.r),
      decoration: BoxDecoration(
        color: colors.buttonColor,
        borderRadius: BorderRadius.circular(10.r),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          4.verticalSpace,
          TitleAndIcon(
            title: AppHelpers.getTranslation(TrKeys.reviews),
            paddingHorizontalSize: 0,
          ),
          24.verticalSpace,
          review.isNotEmpty
              ? Row(
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: EdgeInsets.only(left: 6.r),
                          child: Text(
                            AppHelpers.getTranslation(TrKeys.overallRating),
                            style: AppStyle.interNoSemi(
                              size: 14,
                              color: colors.textBlack,
                            ),
                          ),
                        ),
                        8.verticalSpace,
                        RatingBar.builder(
                          initialRating:
                              double.tryParse(shop?.avgRate ?? "0") ?? 0,
                          minRating: 0,
                          direction: Axis.horizontal,
                          allowHalfRating: true,
                          itemCount: 5,
                          itemSize: 20.r,
                          itemPadding:
                              const EdgeInsets.symmetric(horizontal: 4.0),
                          itemBuilder: (context, _) => Container(
                            decoration: BoxDecoration(
                              color: AppStyle.primary,
                              borderRadius: BorderRadius.circular(4.r),
                            ),
                            child: Padding(
                              padding: EdgeInsets.all(4.r),
                              child: const Icon(
                                FlutterRemix.star_fill,
                                color: AppStyle.white,
                              ),
                            ),
                          ),
                          onRatingUpdate: (rating) {},
                          ignoreGestures: true,
                        ),
                        8.verticalSpace,
                        Padding(
                          padding: EdgeInsets.only(left: 6.r),
                          child: Text(
                            "${shop?.rateCount ?? "0"} ${AppHelpers.getTranslation(TrKeys.reviews).toLowerCase()}",
                            style: AppStyle.interNormal(
                              size: 14,
                              color: AppStyle.textGrey,
                            ),
                          ),
                        ),
                      ],
                    ),
                    16.horizontalSpace,
                    Expanded(
                      child: RatingSummary(
                        labelStyle: TextStyle(color: colors.textBlack),
                        counter: int.tryParse(shop?.rateCount ?? "0") ?? 0,
                        average: double.tryParse(shop?.avgRate ?? "0") ?? 0,
                        showAverage: false,
                        counterFiveStars: reviewCount?.group?["5"] ?? 0,
                        counterFourStars: reviewCount?.group?["4"] ?? 0,
                        counterThreeStars: reviewCount?.group?["3"] ?? 0,
                        counterTwoStars: reviewCount?.group?["2"] ?? 0,
                        counterOneStars: reviewCount?.group?["1"] ?? 0,
                        color: AppStyle.primary,
                        backgroundColor: AppStyle.shimmerBase,
                      ),
                    )
                  ],
                )
              : Center(
                  child: Text(
                    AppHelpers.getTranslation(TrKeys.noReview),
                    style: AppStyle.interNoSemi(size: 16.r),
                  ),
                ),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: review.length,
            itemBuilder: (context, index) {
              return ReviewItem(
                review: review[index],
                colors: colors,
              );
            },
          ),
        ],
      ),
    );
  }
}
