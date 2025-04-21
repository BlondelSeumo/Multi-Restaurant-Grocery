// ignore_for_file: unused_result

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:grouped_list/grouped_list.dart';

import 'package:riverpodtemp/application/chat/chat_notifier.dart';
import 'package:riverpodtemp/application/chat/chat_provider.dart';
import 'package:riverpodtemp/infrastructure/models/data/message_model.dart';
import 'package:riverpodtemp/infrastructure/models/data/user.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/img_service.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/time_service.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/custom_network_image.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import 'package:riverpodtemp/presentation/components/loading.dart';
import 'package:riverpodtemp/presentation/pages/chat/chat/widget/message_item.dart';
import 'package:riverpodtemp/presentation/pages/chat/chat/widget/send_button.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';
import '../../../../domain/di/dependency_manager.dart';

@RoutePage()
class ChatPage extends ConsumerStatefulWidget {
  final UserModel? sender;
  final String? chatId;

  const ChatPage({
    super.key,
    required this.sender,
    this.chatId,
  });

  @override
  ConsumerState<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends ConsumerState<ChatPage> {
  late TextEditingController messageController;
  final focusNode = FocusNode();
  final GlobalKey sendButtonKey = GlobalKey();
  String? editMessageId;
  MessageModel? replyMessage;
  late ChatNotifier notifier;

  @override
  void initState() {
    messageController = TextEditingController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      notifier = ref.read(chatProvider.notifier);
      notifier.checkChatId(context: context, sellerId: widget.sender?.id ?? 0);
    });
    super.initState();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
  }

  @override
  void dispose() {
    messageController.dispose();
    super.dispose();
  }

  readMessage(List<MessageModel> message, String chatId) {
    for (var element in message) {
      if (element.senderId != LocalStorage.getUser()?.id && !element.read) {
        chatRepository.readMessage(chatDocId: chatId, docId: element.doc ?? "");
      }
    }
  }

  editMessage() {
    notifier.editMessage(
        context: context,
        message: messageController.text,
        chatId: widget.chatId,
        messageId: editMessageId ?? "");

    messageController.clear();
    editMessageId = null;
    return;
  }

  deleteMessage(String deleteMessageId) {
    notifier.deleteMessage(
      context: context,
      messageId: deleteMessageId,
      chatId: widget.chatId,
    );
  }

  reply() {
    notifier.replyMessage(
      context: context,
      messageId: replyMessage?.doc ?? "",
      chatId: widget.chatId,
      message: messageController.text,
    );
    replyMessage = null;
    messageController.clear();
    sendButtonKey.currentState?.setState(() {});
  }

  sendMessage({String? chatId}) {
    if (messageController.text.trim().isNotEmpty) {
      if (widget.chatId == null && chatId == null) {
        notifier.createAndSendMessage(
            context: context,
            message: messageController.text,
            userId: widget.sender?.id ?? 0,
            onSuccess: () {
              notifier.sendMessage(
                context: context,
                message: messageController.text,
                chatId: widget.chatId,
              );
              messageController.clear();
            });

        return;
      }
      notifier.sendMessage(
        context: context,
        message: messageController.text,
        chatId: widget.chatId,
      );

      messageController.clear();
      return;
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(chatProvider);
    return CustomScaffold(
      key: sendButtonKey,
      appBar: (colors) => _appBar(colors),
      body: (colors) => (widget.chatId == null &&
              state.chatModel?.docId == null)
          ? Center(
              child: Text(
                AppHelpers.getTranslation(TrKeys.noMessagesHereYet),
                style: AppStyle.interNormal(size: 16),
              ),
            )
          : state.isMessageLoading
              ? Loading()
              : StreamBuilder(
                  stream: FirebaseFirestore.instance
                      .collection("chat")
                      .doc(widget.chatId ?? state.chatModel?.docId ?? "")
                      .collection("message")
                      .orderBy("time", descending: true)
                      .snapshots(),
                  builder: (context, snapshot) {
                    List<MessageModel> messages = [];
                    for (var element in snapshot.data?.docs ?? []) {
                      messages.add(
                          MessageModel.fromJson(element.data(), element.id));
                    }
                    readMessage(messages,
                        widget.chatId ?? state.chatModel?.docId ?? "");
                    return GroupedListView<MessageModel, DateTime>(
                      elements: messages,
                      reverse: true,
                      order: GroupedListOrder.DESC,
                      groupBy: (element) => TimeService.dateFormatYMD(
                          element.time ?? DateTime.now()),
                      groupSeparatorBuilder: (DateTime groupByValue) => Center(
                        child: Padding(
                          padding: EdgeInsets.symmetric(vertical: 4.r),
                          child: Text(
                            TimeService.dateFormatDM(groupByValue),
                            style: AppStyle.interNormal(
                              color: colors.textBlack,
                            ),
                          ),
                        ),
                      ),
                      itemBuilder: (context, dynamic element) {
                        return MessageItem(
                          colors: colors,
                          message: element,
                          replyMessage: messages.firstWhere(
                            (e) => e.doc == element.replyDocId,
                            orElse: () => MessageModel(
                              message: "",
                              senderId: 0,
                              doc: "",
                            ),
                          ),
                          edit: (id) {
                            editMessageId = id;
                            messageController.text = element.message ?? "";
                            focusNode.requestFocus();
                          },
                          reply: (message) {
                            replyMessage = message;
                            focusNode.requestFocus();
                            sendButtonKey.currentState?.setState(() {});
                          },
                          delete: deleteMessage,
                        );
                      },
                      itemComparator: (message, newMessage) =>
                          message.time
                              ?.compareTo(newMessage.time ?? DateTime.now()) ??
                          0,
                    );
                  },
                ),
      bottomNavigationBar: (colors) => SendButton(
        focusNode: focusNode,
        replyMessage: replyMessage,
        sendMessage: () {
          editMessageId != null
              ? editMessage()
              : replyMessage?.doc != null
                  ? reply()
                  : sendMessage(chatId: state.chatModel?.docId);
        },
        controller: messageController,
        removeReplyMessage: () {
          replyMessage = null;
          focusNode.unfocus();
          sendButtonKey.currentState?.setState(() {});
        },
        sendImage: () {
          AppHelpers.openDialogImagePicker(
            colors: colors,
            context: context,
            openCamera: () async {
              String? titleImg = await ImgService.getCamera();
              if (context.mounted && (titleImg != null)) {
                notifier.sendImage(
                  context: context,
                  file: titleImg,
                  chatId: widget.chatId,
                  id: widget.sender?.id,
                );
                Navigator.pop(context);
              }
            },
            openGallery: () async {
              String? titleImg = await ImgService.getGallery();
              if (context.mounted && (titleImg != null)) {
                notifier.sendImage(
                  context: context,
                  file: titleImg,
                  chatId: widget.chatId,
                  id: widget.sender?.id,
                );
                Navigator.pop(context);
              }
            },
          );
        },
        isLoading: state.isButtonLoading,
        colors: colors,
      ),
    );
  }

  AppBar _appBar(CustomColorSet colors) {
    return AppBar(
      toolbarHeight: 46.r,
      automaticallyImplyLeading: false,
      elevation: 0.2,
      leading: BackButton(
        color: colors.textBlack,
      ),
      backgroundColor: colors.buttonColor,
      title: Row(
        children: [
          CustomNetworkImage(
            url: widget.sender?.img,
            height: 40,
            width: 40,
            radius: 20,
            // name: widget.chat?.user?.firstname ?? widget.chat?.user?.lastname,
          ),
          16.horizontalSpace,
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  "${widget.sender?.firstname ?? ""} ${widget.sender?.lastname ?? ""}",
                  style: AppStyle.interNormal(color: colors.textBlack),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                6.verticalSpace,
              ],
            ),
          ),
          16.horizontalSpace,
        ],
      ),
    );
  }
}
// 42424242424242424242
// String@sdf.dsf
// 04/44
