import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/infrastructure/models/data/shop_data.dart';
import 'package:riverpodtemp/infrastructure/models/response/Galleries_response.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/buttons/animation_button_effect.dart';
import 'package:riverpodtemp/presentation/components/custom_network_image.dart';

import '../../../routes/app_router.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';

class ShopBgScreen extends StatelessWidget {
  final ShopData? shop;
  final GalleriesModel? galleriesModel;

  const ShopBgScreen({super.key, required this.shop,required this.galleriesModel});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        CustomNetworkImage(
            url: shop?.backgroundImg ?? "",
            height: 150.h,
            width: double.infinity,
            radius: 0),
        Positioned(
          bottom: 16,
          left: 16,
          right: 16,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            mainAxisSize: MainAxisSize.max,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: EdgeInsets.only(left: 6.r),
                    child: Text(
                      shop?.translation?.title ?? "",
                      style: AppStyle.interSemi(
                        size: 24,
                        color: AppStyle.white,
                      ),
                    ),
                  ),
                  6.verticalSpace,
                  Row(
                    children: [
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
                        shop?.rateCount ?? "",
                        style: AppStyle.interNoSemi(
                          size: 16,
                          color: AppStyle.white,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              InkWell(
                onTap: (){
                  context.pushRoute(AllGalleriesRoute(galleriesModel: galleriesModel));
                },
                child: AnimationButtonEffect(
                  child: Container(
                    decoration: BoxDecoration(
                        color: AppStyle.white.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(4.r)),
                    padding: EdgeInsets.all(4.r),
                    child: Text(
                      AppHelpers.getTranslation(TrKeys.seeAllPhotos),
                      style: AppStyle.interNormal(color: AppStyle.white, size: 14),
                    ),
                  ),
                ),
              )
            ],
          ),
        )
      ],
    );
  }
}
