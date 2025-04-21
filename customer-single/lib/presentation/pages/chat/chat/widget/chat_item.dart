import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/app_constants.dart';
import 'package:riverpodtemp/infrastructure/models/data/chat_model.dart';
import 'package:riverpodtemp/infrastructure/services/time_service.dart';
import 'package:riverpodtemp/presentation/components/custom_network_image.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';

class ChatItem extends StatelessWidget {
  final ChatModel chat;

  const ChatItem({super.key, required this.chat});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(bottom: 8.r),
      padding: EdgeInsets.symmetric(vertical: 10.r, horizontal: 16.r),
      decoration: BoxDecoration(
        color:AppStyle.white,
        borderRadius: BorderRadius.circular(AppConstants.radius.r),
      ),
      child: Row(
        children: [
          CustomNetworkImage(
            url: chat.user?.img,
            height: 56,
            width: 56,
            radius: 28,
            // name: chat.user?.firstname ?? chat.user?.lastname,
          ),
          16.horizontalSpace,
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  "${chat.user?.firstname ?? ""} ${chat.user?.lastname ?? ""}",
                  style:AppStyle.interNormal(),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                6.verticalSpace,
                Text(
                  chat.lastMessage ?? "",
                  style:AppStyle.interRegular(color:AppStyle.textGrey, size: 14),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          16.horizontalSpace,
          Text(
            TimeService.dateFormatForChat(chat.lastTime?.toDate()),
            style:AppStyle.interNormal(size: 14),
          ),
        ],
      ),
    );
  }
}
