import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:riverpodtemp/infrastructure/models/data/recipe_data.dart';
import 'package:riverpodtemp/presentation/components/custom_network_image.dart';
import 'package:riverpodtemp/presentation/routes/app_router.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class GridRecipeItem extends StatelessWidget {
  final RecipeData recipe;
  final CustomColorSet colors;

  const GridRecipeItem({
    super.key,
    required this.recipe,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        context.pushRoute(
          RecipeDetailsRoute(recipe: recipe),
        );
      },
      child: Container(
        height: 330.r,
        width: 188.r,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10.r),
          color: colors.buttonColor,
          border: Border.all(color: colors.scaffoldColor),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.only(
                topRight: Radius.circular(10.r),
                topLeft: Radius.circular(10.r),
              ),
              child: CustomNetworkImage(
                url: recipe.image ?? "",
                height: 151,
                width: double.infinity,
                radius: 0,
              ),
            ),
            Expanded(
              child: Padding(
                padding: REdgeInsets.symmetric(horizontal: 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    Text(
                      recipe.translation?.title ?? "",
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w400,
                        fontSize: 16.sp,
                        color: colors.textBlack,
                        letterSpacing: -14 * 0.02,
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Divider(
                          height: 1.r,
                          thickness: 1.r,
                          color: AppStyle.divider,
                        ),
                        8.verticalSpace,
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            Icon(
                              FlutterRemix.time_fill,
                              size: 18.r,
                              color: AppStyle.primary,
                            ),
                            Text(
                              '${recipe.totalTime} min',
                              style: GoogleFonts.inter(
                                fontWeight: FontWeight.w500,
                                fontSize: 12.sp,
                                color: AppStyle.primary,
                                letterSpacing: -14 * 0.02,
                              ),
                            ),
                            Container(
                              width: 4.r,
                              height: 4.r,
                              margin: EdgeInsets.symmetric(horizontal: 4.r),
                              decoration: const BoxDecoration(
                                color: AppStyle.textGrey,
                                shape: BoxShape.circle,
                              ),
                            ),
                            Icon(
                              FlutterRemix.restaurant_fill,
                              size: 18.r,
                              color: AppStyle.primary,
                            ),
                            Text(
                              '${recipe.calories} kkal',
                              style: GoogleFonts.inter(
                                fontWeight: FontWeight.w500,
                                fontSize: 12.sp,
                                color: AppStyle.primary,
                                letterSpacing: -14 * 0.02,
                              ),
                            ),
                          ],
                        ),
                        8.verticalSpace,
                        Divider(
                          height: 1.r,
                          thickness: 1.r,
                          color: AppStyle.divider,
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        CustomNetworkImage(
                          url: recipe.shop?.logoImg ?? "",
                          height: 30,
                          width: 30,
                          radius: 15,
                        ),
                        9.horizontalSpace,
                        Text(
                          recipe.shop?.translation?.title ?? "",
                          style: GoogleFonts.inter(
                            fontWeight: FontWeight.w400,
                            fontSize: 16.sp,
                            color: AppStyle.textGrey,
                            letterSpacing: -14 * 0.02,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
