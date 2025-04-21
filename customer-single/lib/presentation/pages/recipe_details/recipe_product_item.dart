import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:riverpodtemp/infrastructure/models/data/product_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/presentation/components/custom_network_image.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

import '../../theme/app_style.dart';
import 'increase_decrease_buttons.dart';

class RecipeProductItem extends StatelessWidget {
  final Stocks? product;
  final Function() onIncrease;
  final Function() onDecrease;
  final CustomColorSet colors;

  const RecipeProductItem({
    super.key,
    this.product,
    required this.onIncrease,
    required this.onDecrease,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Container(
              decoration: BoxDecoration(
                // border: Border.all(
                //   color: colors.scaffoldColor,
                //   width: 4.r,
                // ),
                borderRadius: BorderRadius.circular(15.r),
              ),
              child: CustomNetworkImage(
                url: product?.product?.img ?? "",
                width: 90,
                height: 90,
                radius: 15,
              ),
            ),
            18.horizontalSpace,
            Expanded(
              child: SizedBox(
                height: 90.r,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${product?.product?.translation?.title}',
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w400,
                        fontSize: 16.sp,
                        color: AppStyle.textGrey,
                        letterSpacing: -0.4,
                      ),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          AppHelpers.numberFormat(product?.totalPrice),
                          style: GoogleFonts.inter(
                            fontWeight: FontWeight.w700,
                            fontSize: 20.sp,
                            color: AppStyle.textGrey,
                            letterSpacing: -0.4,
                          ),
                        ),
                        IncreaseDecreaseButtons(
                          buttonSize: 40,
                          unit: product?.product?.unit,
                          cartCount: product?.quantity,
                          onDecrease: onDecrease,
                          onIncrease: onIncrease,
                          colors: colors,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        18.verticalSpace,
      ],
    );
  }
}
