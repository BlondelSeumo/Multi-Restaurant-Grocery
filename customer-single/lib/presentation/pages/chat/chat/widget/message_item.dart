import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import 'package:riverpodtemp/app_constants.dart';
import 'package:riverpodtemp/infrastructure/models/data/message_model.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/time_service.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/custom_network_image.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';
import 'package:swipe_to/swipe_to.dart';
import 'focused_custom_menu.dart';
import 'image_chat_screen.dart';

class MessageItem extends StatelessWidget {
  final MessageModel message;
  final MessageModel? replyMessage;
  final ValueChanged<String> edit;
  final ValueChanged<MessageModel> reply;
  final ValueChanged<String> delete;
  final CustomColorSet colors;

  const MessageItem({
    super.key,
    required this.message,
    required this.edit,
    required this.reply,
    required this.delete,
    required this.replyMessage,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    bool owner = LocalStorage.getUser()?.id == message.senderId;
    return FocusedMenuHolder(
      menuBoxDecoration: const BoxDecoration(
        color: AppStyle.white,
      ),
      borderColor: AppStyle.transparent,
      menuItems: owner
          ? [
              if (message.type != "image")
                FocusedMenuItem(
                    backgroundColor: AppStyle.subCategory,
                    title: Text(
                      TrKeys.edit,
                      style: AppStyle.interNormal(),
                    ),
                    trailingIcon: const Icon(
                      FlutterRemix.edit_box_line,
                    ),
                    onPressed: () => edit(message.doc ?? "")),
              if (message.type != "image")
                FocusedMenuItem(
                    backgroundColor: AppStyle.subCategory,
                    title: Text(
                      TrKeys.copy,
                      style: AppStyle.interNormal(),
                    ),
                    trailingIcon: const Icon(
                      FlutterRemix.file_copy_2_line,
                    ),
                    onPressed: () {
                      AppHelpers.showCheckTopSnackBar(
                        context,
                        TrKeys.messageCopied,
                      );
                      Clipboard.setData(
                        ClipboardData(
                          text: message.message ?? "",
                        ),
                      );
                    }),
              FocusedMenuItem(
                backgroundColor: AppStyle.subCategory,
                title: Text(
                  TrKeys.reply,
                  style: AppStyle.interNormal(),
                ),
                trailingIcon: const Icon(
                  FlutterRemix.reply_line,
                ),
                onPressed: () {
                  reply(message);
                },
              ),
              FocusedMenuItem(
                backgroundColor: AppStyle.subCategory,
                title: Text(
                  TrKeys.delete,
                  style: AppStyle.interNormal(color: AppStyle.red),
                ),
                trailingIcon: const Icon(
                  FlutterRemix.delete_bin_6_line,
                  color: AppStyle.red,
                ),
                onPressed: () => delete(message.doc ?? ""),
              ),
            ]
          : [
              FocusedMenuItem(
                backgroundColor: AppStyle.subCategory,
                title: Text(
                  TrKeys.reply,
                  style: AppStyle.interNormal(),
                ),
                trailingIcon: const Icon(
                  FlutterRemix.reply_line,
                ),
                onPressed: () => reply(message),
              ),
              if (message.type != "image")
                FocusedMenuItem(
                  backgroundColor: AppStyle.subCategory,
                  title: Text(
                    TrKeys.copy,
                    style: AppStyle.interNormal(),
                  ),
                  trailingIcon: const Icon(
                    FlutterRemix.file_copy_2_line,
                  ),
                  onPressed: () {
                    AppHelpers.showCheckTopSnackBar(
                        context, TrKeys.messageCopied);
                    Clipboard.setData(
                      ClipboardData(
                        text: message.message ?? "",
                      ),
                    );
                  },
                ),
            ],
      child: SwipeTo(
        key: UniqueKey(),
        onLeftSwipe: (s) {
          return reply(message);
        },
        child: Container(
          color: AppStyle.transparent,
          child: Row(
            mainAxisSize: MainAxisSize.max,
            children: [
              if (owner) const Spacer(),
              message.type == "image"
                  ? _image(owner, context)
                  : _message(
                      owner,
                      context,
                      colors,
                    ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _image(
    bool owner,
    BuildContext context,
  ) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => ImageChatPage(image: message.message ?? ""),
          ),
        );
      },
      child: Container(
        width: MediaQuery.sizeOf(context).width * 2 / 3,
        height: MediaQuery.sizeOf(context).width * 2 / 3,
        margin: EdgeInsets.only(bottom: 8.r, left: 8.r, right: 8.r),
        padding: EdgeInsets.all(2.r),
        decoration: BoxDecoration(
          color: owner ? AppStyle.primary : AppStyle.subCategory,
          borderRadius: BorderRadius.circular(AppConstants.radius.r),
        ),
        child: CustomNetworkImage(
          url: message.message ?? "",
          height: MediaQuery.sizeOf(context).width * 2 / 3,
          width: MediaQuery.sizeOf(context).width * 2 / 3,
          radius: AppConstants.radius,
        ),
      ),
    );
  }

  Widget _message(
    bool owner,
    BuildContext context,
    CustomColorSet colors,
  ) {
    return (message.message?.length ?? 0) > 26
        ? Container(
            width: MediaQuery.sizeOf(context).width * 2 / 3,
            margin: EdgeInsets.only(bottom: 8.r, left: 8.r, right: 8.r),
            padding: EdgeInsets.symmetric(vertical: 10.r, horizontal: 16.r),
            decoration: BoxDecoration(
              color: owner ? AppStyle.primary : colors.buttonColor,
              borderRadius: BorderRadius.circular(AppConstants.radius.r),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (replyMessage?.doc != "")
                  IntrinsicHeight(
                    child: Row(
                      children: [
                        VerticalDivider(
                          color: owner ? AppStyle.divider : AppStyle.icon,
                          thickness: 2,
                        ),
                        replyMessage?.type == "image"
                            ? CustomNetworkImage(
                                url: replyMessage?.message ?? "",
                                height: 56,
                                width: 56,
                                fit: BoxFit.contain,
                                radius: 0)
                            : (replyMessage?.message?.length ?? 0) > 26
                                ? SizedBox(
                                    width: MediaQuery.sizeOf(context).width *
                                        2 /
                                        3,
                                    child: Text(
                                      replyMessage?.message ?? "",
                                      style: AppStyle.interNormal(
                                        color: owner
                                            ? AppStyle.white
                                            : colors.textBlack,
                                        size: 12,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  )
                                : Text(
                                    replyMessage?.message ?? "",
                                    style: AppStyle.interNormal(
                                        color: owner
                                            ? AppStyle.white
                                            : colors.textBlack,
                                        size: 12),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  )
                      ],
                    ),
                  ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Expanded(
                      child: Text(
                        message.message ?? "",
                        style: AppStyle.interNormal(
                            color: owner ? AppStyle.white : colors.textBlack,
                            size: 12),
                      ),
                    ),
                    Padding(
                      padding: EdgeInsets.only(
                        top: 10.r,
                        left: 4.r,
                      ),
                      child: Row(
                        children: [
                          Text(
                            TimeService.timeFormat(
                              message.time ?? DateTime.now(),
                            ),
                            style: AppStyle.interRegular(
                              color: owner ? AppStyle.white : colors.textBlack,
                              size: 10,
                            ),
                          ),
                          if (owner)
                            Icon(
                              message.read
                                  ? FlutterRemix.check_double_line
                                  : FlutterRemix.check_line,
                              size: 12.r,
                              color: AppStyle.white,
                            ),
                        ],
                      ),
                    )
                  ],
                ),
              ],
            ),
          )
        : Container(
            margin: EdgeInsets.only(bottom: 8.r, left: 8.r, right: 8.r),
            padding: EdgeInsets.symmetric(vertical: 10.r, horizontal: 16.r),
            decoration: BoxDecoration(
              color: owner ? AppStyle.primary : colors.buttonColor,
              borderRadius: BorderRadius.circular(AppConstants.radius.r),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (replyMessage?.doc != "")
                  IntrinsicHeight(
                    child: Row(
                      children: [
                        VerticalDivider(
                          color: owner ? AppStyle.divider : AppStyle.icon,
                          thickness: 2,
                        ),
                        replyMessage?.type == "image"
                            ? CustomNetworkImage(
                                url: replyMessage?.message ?? "",
                                height: 56,
                                width: 56,
                                fit: BoxFit.contain,
                                radius: 0)
                            : (replyMessage?.message?.length ?? 0) > 26
                                ? SizedBox(
                                    width: MediaQuery.sizeOf(context).width *
                                        2 /
                                        3,
                                    child: Text(
                                      replyMessage?.message ?? "",
                                      style: AppStyle.interNormal(
                                          color: owner
                                              ? AppStyle.white
                                              : colors.textBlack,
                                          size: 12),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  )
                                : Text(
                                    replyMessage?.message ?? "",
                                    style: AppStyle.interNormal(
                                        color: owner
                                            ? AppStyle.white
                                            : colors.textBlack,
                                        size: 12),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  )
                      ],
                    ),
                  ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      message.message ?? "",
                      style: AppStyle.interNormal(
                          color: owner ? AppStyle.white : colors.textBlack,
                          size: 12),
                    ),
                    Padding(
                      padding: EdgeInsets.only(
                        top: 10.r,
                        left: 4.r,
                      ),
                      child: Row(
                        children: [
                          Text(
                            TimeService.timeFormat(
                              message.time ?? DateTime.now(),
                            ),
                            style: AppStyle.interRegular(
                                color:
                                    owner ? AppStyle.white : colors.textBlack,
                                size: 10),
                          ),
                          if (owner)
                            Icon(
                              message.read
                                  ? FlutterRemix.check_double_line
                                  : FlutterRemix.check_line,
                              size: 12.r,
                              color: AppStyle.white,
                            ),
                        ],
                      ),
                    )
                  ],
                ),
              ],
            ),
          );
  }
}
