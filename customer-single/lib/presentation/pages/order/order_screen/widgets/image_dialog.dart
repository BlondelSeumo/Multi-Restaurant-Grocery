import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/custom_network_image.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class ImageDialog extends StatelessWidget {
  final String? img;
  final CustomColorSet colors;

  const ImageDialog({super.key, this.img, required this.colors});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Text(
                AppHelpers.getTranslation(TrKeys.thisImageWasUploadDriver),
                style: AppStyle.interNormal(
                  color: colors.textBlack,
                ),
              ),
            ),
            GestureDetector(
              onTap: () => Navigator.pop(context),
              child: Padding(
                padding: REdgeInsets.all(4),
                child: Icon(
                  FlutterRemix.close_circle_line,
                  color: colors.textBlack,
                ),
              ),
            ),
          ],
        ),
        12.verticalSpace,
        CustomNetworkImage(
          url: img ?? "",
          radius: 16,
          height: 100,
          width: 100,
        ),
      ],
    );
  }
}
