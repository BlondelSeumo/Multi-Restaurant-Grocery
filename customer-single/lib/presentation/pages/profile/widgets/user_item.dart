import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';
import 'package:riverpodtemp/infrastructure/models/data/user.dart';
import 'package:riverpodtemp/presentation/components/custom_network_image.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class UserItem extends StatelessWidget {
  final UserModel? user;
  final bool isSelected;
  final Function() onTap;
  final CustomColorSet colors;

  const UserItem({
    super.key,
    required this.user,
    required this.onTap,
    required this.isSelected,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 56.r,
        margin: REdgeInsets.only(bottom: 8),
        decoration: BoxDecoration(
          color: colors.buttonColor,
          borderRadius: BorderRadius.circular(10.r),
        ),
        child: Row(
          children: [
            Container(
              margin: REdgeInsets.symmetric(vertical: 10),
              width: 4,
              decoration: ShapeDecoration(
                color: isSelected ? AppStyle.primary : AppStyle.transparent,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.only(
                    topRight: Radius.circular(10.r),
                    bottomRight: Radius.circular(10.r),
                  ),
                ),
              ),
            ),
            12.horizontalSpace,
            Container(
              width: 40.r,
              height: 40.r,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10.r),
                color: colors.textBlack.withOpacity(0.06),
              ),
              alignment: Alignment.center,
              child: CustomNetworkImage(
                url: user?.img ?? '',
                width: 32,
                height: 32,
                radius: 16,
              ),
            ),
            10.horizontalSpace,
            Expanded(
              child: Text(
                '${user?.firstname} ${user?.lastname ?? ''}',
                style: AppStyle.interSemi(
                  size: 15,
                  color: colors.textBlack,
                ),
              ),
            ),
            16.horizontalSpace,
          ],
        ),
      ),
    );
  }
}
