import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/infrastructure/models/models.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/presentation/components/custom_network_image.dart';
import 'package:riverpodtemp/presentation/pages/home/widgets/banner_screen.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class BannerItem extends StatelessWidget {
  final BannerData banner;
  final CustomColorSet colors;

  const BannerItem({
    super.key,
    required this.banner,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        AppHelpers.showCustomModalBottomSheet(
          context: context,
          modal: BannerScreen(
            colors: colors,
            bannerId: banner.id ?? 0,
            image: banner.img ?? "",
            desc: banner.translation?.description ?? "",
          ),
          isDarkMode: false,
        );
      },
      child: Container(
        margin: EdgeInsets.only(right: 6.r),
        width: MediaQuery.sizeOf(context).width - 46,
        decoration: BoxDecoration(
          color: AppStyle.white,
          borderRadius: BorderRadius.all(
            Radius.circular(8.r),
          ),
        ),
        child: Stack(
          children: [
            CustomNetworkImage(
              bgColor: AppStyle.white,
              url: banner.img ?? "",
              height: double.infinity,
              width: double.infinity,
              radius: 8.r,
            ),
            Positioned(
              top: 16.r,
              left: 16.r,
              bottom: 16.r,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12.r),
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 10.0, sigmaY: 10.0),
                      child: Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: 12.r,
                          vertical: 4.r,
                        ),
                        decoration: BoxDecoration(
                          boxShadow: [
                            BoxShadow(
                              color: AppStyle.white.withOpacity(0.25),
                              spreadRadius: 0,
                              blurRadius: 40,
                              offset: const Offset(
                                0,
                                -2,
                              ), // changes position of shadow
                            ),
                          ],
                          color: colors.textBlack.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(100.r),
                        ),
                        child: Text(
                          banner.translation?.buttonText ?? "",
                          style: AppStyle.interNoSemi(
                            size: 14,
                            color: AppStyle.white,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const Spacer(),
                  SizedBox(
                    width: 200.w,
                    child: Text(
                      banner.translation?.title ?? "",
                      style: AppStyle.interNoSemi(
                        size: 16,
                        color: colors.textBlack,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  SizedBox(
                    width: 200.w,
                    child: Text(
                      banner.translation?.description ?? "",
                      style: AppStyle.interRegular(
                        size: 10,
                        color: colors.textBlack,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}
