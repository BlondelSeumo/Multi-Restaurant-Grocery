import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/infrastructure/models/data/review_data.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class ImagesOneList extends StatelessWidget {
  final List<Galleries>? list;
  final int? selectImageId;
  final CustomColorSet colors;

  const ImagesOneList({
    super.key,
    required this.list,
    required this.selectImageId,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 6.r,
      width: MediaQuery.sizeOf(context).width,
      child: Center(
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: list
                    ?.map(
                      (e) => AnimatedContainer(
                        duration: const Duration(milliseconds: 400),
                        margin: EdgeInsets.only(right: 6.r),
                        height: 6.r,
                        width: selectImageId == e.id ? 32.r : 8.r,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100.r),
                          color: selectImageId == e.id
                              ? colors.textBlack
                              : AppStyle.hintColor,
                        ),
                      ),
                    )
                    .toList() ??
                [],
          ),
        ),
      ),
    );
  }
}
