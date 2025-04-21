import 'dart:ui';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/infrastructure/models/models.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/custom_network_image.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class RecommendedItem extends StatelessWidget {
  final CategoryData recipeCategory;
  final CustomColorSet colors;

  const RecommendedItem({
    super.key,
    required this.recipeCategory,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        context.pushRoute(
          ShopRecipesRoute(
            categoryId: recipeCategory.id,
            categoryTitle: recipeCategory.translation?.title ?? "",
          ),
        );
      },
      child: Container(
        margin: EdgeInsets.only(left: 0, right: 9.r),
        width: MediaQuery.sizeOf(context).width / 3,
        height: 190.h,
        decoration: BoxDecoration(
          color: AppStyle.transparent,
          borderRadius: BorderRadius.all(
            Radius.circular(10.r),
          ),
          border: Border.all(color: AppStyle.borderColor),
        ),
        child: Stack(
          children: [
            CustomNetworkImage(
              url: recipeCategory.img ?? "",
              width: MediaQuery.sizeOf(context).width / 2,
              height: 190.h,
              radius: 10.r,
            ),
            Padding(
              padding: EdgeInsets.all(12.r),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      8.horizontalSpace,
                      Expanded(
                        child: Text(
                          recipeCategory.translation?.title ?? "",
                          style: AppStyle.interNormal(
                            size: 12,
                            color: colors.textBlack,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  ClipRRect(
                    borderRadius: BorderRadius.all(Radius.circular(100.r)),
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 10.0, sigmaY: 10.0),
                      child: Container(
                        padding: EdgeInsets.symmetric(
                            vertical: 4.h, horizontal: 12.w),
                        decoration: BoxDecoration(
                          color: colors.textBlack.withOpacity(0.4),
                          borderRadius: BorderRadius.all(
                            Radius.circular(100.r),
                          ),
                        ),
                        child: Text(
                          "${recipeCategory.receiptsCount ?? 0}  ${AppHelpers.getTranslation(TrKeys.products)}",
                          style: AppStyle.interNormal(
                            size: 12,
                            color: AppStyle.white,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
