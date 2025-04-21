import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';


class CustomNetworkImage extends StatelessWidget {
  final String? url;
  final double height;
  final double width;
  final double radius;
  final BoxFit fit;
  final Color bgColor;

  const CustomNetworkImage({
    super.key,
    this.url,

    this.fit = BoxFit.cover,
    required this.height,
    required this.width,
    required this.radius,
    this.bgColor = AppStyle.mainBack,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: AppHelpers.checkIsSvg(url)
          ? SvgPicture.network(
              url??'',
              width: width,
              height: height,
              fit: BoxFit.cover,
              placeholderBuilder: (_) => Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(radius),
                  color: AppStyle.shimmerBase,
                ),
              ),
            )
          : CachedNetworkImage(
              height: height,

              width: width,
              imageUrl: url??'',
              fit: fit,
              progressIndicatorBuilder: (context, url, progress) {
                return Container(
                  height: height,
                  width: width,
                  decoration: BoxDecoration(
                    color: AppStyle.shimmerBase,
                  ),
                );
              },
              errorWidget: (context, url, error) {
                return Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(radius),
                    color: bgColor,
                  ),
                  alignment: Alignment.center,
                  child: const Icon(
                    FlutterRemix.image_line,
                    color: AppStyle.shimmerBaseDark,
                  ),
                );
              },
            ),
    );
  }
}
