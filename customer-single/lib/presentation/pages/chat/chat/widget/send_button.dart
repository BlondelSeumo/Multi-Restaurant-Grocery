import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/app_constants.dart';
import 'dart:io' show Platform;

import 'package:riverpodtemp/infrastructure/models/data/message_model.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/button_effect.dart';
import 'package:riverpodtemp/presentation/components/custom_network_image.dart';
import 'package:riverpodtemp/presentation/components/loading.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class SendButton extends StatelessWidget {
  final VoidCallback sendMessage;
  final VoidCallback sendImage;
  final TextEditingController controller;
  final FocusNode focusNode;
  final MessageModel? replyMessage;
  final bool isLoading;
  final VoidCallback removeReplyMessage;
  final CustomColorSet colors;

  const SendButton({
    super.key,
    required this.sendMessage,
    required this.controller,
    required this.focusNode,
    this.replyMessage,
    required this.removeReplyMessage,
    required this.sendImage,
    required this.isLoading,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: colors.buttonColor,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          6.verticalSpace,
          if (replyMessage != null)
            Padding(
              padding: EdgeInsets.only(left: 16.r, top: 8.r, bottom: 8.r),
              child: IntrinsicHeight(
                child: Row(
                  children: [
                    const Icon(
                      FlutterRemix.reply_line,
                    ),
                    8.horizontalSpace,
                    const VerticalDivider(
                      color: AppStyle.divider,
                      thickness: 2,
                    ),
                    SizedBox(
                      width: MediaQuery.sizeOf(context).width - 120.r,
                      child: replyMessage?.type == "image"
                          ? Align(
                              alignment: Alignment.centerLeft,
                              child: CustomNetworkImage(
                                url: replyMessage?.message ?? "",
                                height: 56,
                                width: 56,
                                fit: BoxFit.contain,
                                radius: 0,
                              ),
                            )
                          : Text(
                              replyMessage?.message ?? "",
                              style: AppStyle.interNormal(
                                size: 12,
                                letterSpacing: -0.5,
                                color: colors.textBlack,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                    ),
                    ButtonEffectAnimation(
                      onTap: removeReplyMessage,
                      child: Padding(
                        padding: EdgeInsets.all(8.r),
                        child: const Icon(
                          FlutterRemix.close_line,
                        ),
                      ),
                    )
                  ],
                ),
              ),
            ),
          Container(
            height: 60.r,
            margin: EdgeInsets.only(
              left: 16.r,
              right: 16.r,
              bottom: MediaQuery.viewInsetsOf(context).bottom +
                  MediaQuery.paddingOf(context).bottom +
                  (Platform.isAndroid ? 8.r : (12.r)),
            ),
            padding: REdgeInsets.only(right: 16),
            decoration: BoxDecoration(
              border: Border.all(color: AppStyle.icon),
              borderRadius: BorderRadius.circular(AppConstants.radius.r),
              color: AppStyle.icon,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                IconButton(
                  onPressed: sendImage,
                  icon: Icon(
                    FlutterRemix.gallery_line,
                    color: colors.textBlack,
                  ),
                ),
                Expanded(
                  child: TextFormField(
                    focusNode: focusNode,
                    onEditingComplete: sendMessage,
                    controller: controller,
                    cursorWidth: 1.r,
                    cursorColor: colors.textBlack,
                    style: AppStyle.interNormal(
                      size: 14,
                      letterSpacing: -0.5,
                      color: colors.textBlack,
                    ),
                    decoration: InputDecoration(
                      border: InputBorder.none,
                      hintStyle: AppStyle.interNormal(
                        size: 12,
                        letterSpacing: -0.5,
                        color: AppStyle.textGrey,
                      ),
                      hintText: AppHelpers.getTranslation(TrKeys.typeSomething),
                    ),
                  ),
                ),
                8.horizontalSpace,
                InkWell(
                  onTap: sendMessage,
                  child: Container(
                    width: 42.r,
                    height: 42.r,
                    decoration: const BoxDecoration(
                        color: AppStyle.bgGrey, shape: BoxShape.circle),
                    child: isLoading
                        ? Loading()
                        : Icon(
                            FlutterRemix.send_plane_2_line,
                            size: 18.r,
                          ),
                  ),
                )
              ],
            ),
          ),
        ],
      ),
    );
  }
}
