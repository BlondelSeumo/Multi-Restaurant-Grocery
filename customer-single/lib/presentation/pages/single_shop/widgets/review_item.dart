import 'package:flutter/material.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:jiffy/jiffy.dart';
import 'package:readmore/readmore.dart';
import 'package:riverpodtemp/infrastructure/models/response/review_response.dart';
import 'package:riverpodtemp/presentation/components/custom_network_image.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

import '../../../theme/app_style.dart';

class ReviewItem extends StatelessWidget {
  final ReviewModel review;
  final CustomColorSet colors;

  const ReviewItem({super.key, required this.review, required this.colors});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Divider(color: colors.divider),
        Row(
          children: [
            CustomNetworkImage(
              url: review.user?.img ?? "",
              height: 36,
              width: 36,
              radius: 18,
            ),
            8.horizontalSpace,
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "${review.user?.firstname ?? ""} ${review.user?.lastname ?? ""}",
                  style: AppStyle.interNormal(
                    size: 14,
                    color: colors.textBlack,
                  ),
                ),
                SizedBox(
                  width: 200.w,
                  child: Text(
                    review.order?.address?.address ?? "",
                    style: AppStyle.interNormal(
                      color: AppStyle.textGrey,
                      size: 12,
                    ),
                    maxLines: 1,
                  ),
                ),
              ],
            )
          ],
        ),
        8.verticalSpace,
        Row(
          children: [
            RatingBar.builder(
                initialRating: (review.rating ?? 0).toDouble(),
                minRating: 0,
                direction: Axis.horizontal,
                allowHalfRating: true,
                itemCount: 5,
                itemSize: 16.r,
                itemPadding: const EdgeInsets.symmetric(horizontal: 4.0),
                itemBuilder: (context, _) => Container(
                      decoration: BoxDecoration(
                          color: AppStyle.primary,
                          borderRadius: BorderRadius.circular(4.r)),
                      child: Padding(
                        padding: EdgeInsets.all(4.r),
                        child: const Icon(
                          FlutterRemix.star_fill,
                          color: AppStyle.white,
                        ),
                      ),
                    ),
                onRatingUpdate: (rating) {},
                ignoreGestures: true),
            6.horizontalSpace,
            Text(
              Jiffy.parseFromDateTime(review.createdAt ?? DateTime.now())
                  .fromNow(),
              style:
                  AppStyle.interNormal(size: 10.sp, color: AppStyle.textGrey),
            )
          ],
        ),
        8.verticalSpace,
        ReadMoreText(
          "${review.comment ?? ""} ",
          trimLines: 2,
          colorClickableText: AppStyle.textGrey,
          trimMode: TrimMode.Line,
          trimCollapsedText: 'Show more',
          trimExpandedText: 'Show less',
          style: AppStyle.interNormal(
            size: 14,
            color: colors.textBlack,
          ),
          moreStyle: AppStyle.interNormal(color: AppStyle.textGrey, size: 12),
          lessStyle: AppStyle.interNormal(color: AppStyle.textGrey, size: 12),
        ),
        8.verticalSpace,
      ],
    );
  }
}
