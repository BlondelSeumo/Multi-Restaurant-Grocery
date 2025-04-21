import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'package:riverpodtemp/domain/di/dependency_manager.dart';
import 'package:riverpodtemp/infrastructure/models/data/chat_model.dart';
import 'package:riverpodtemp/infrastructure/models/data/message_model.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/enums.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'chat_state.dart';

class ChatNotifier extends StateNotifier<MainState> {
  ChatNotifier() : super(const MainState());

  String? lastDocId;

  checkChatId({required BuildContext context, required int sellerId}) async {
    state = state.copyWith(isMessageLoading: true);
    final res = await chatRepository.getChat(senderId: sellerId);
    res.when(success: (l) {
      state = state.copyWith(
        chatModel: l,
        isMessageLoading: false,
      );
    }, failure: (fail, s) {
      state = state.copyWith(
        isMessageLoading: false,
        chatModel: null,
      );
    });
  }

  sendImage({
    required BuildContext context,
    required String file,
    required String? chatId,
    required int? id,
  }) async {
    state = state.copyWith(isButtonLoading: true);
    if (chatId == null && state.chatModel?.docId ==null) {
      final res = await chatRepository.createChat(id: id);
      res.when(success: (l) async {
        state = state.copyWith(chatModel: l);
      }, failure: (fail, s) {
        AppHelpers.showCheckTopSnackBar(context, fail);
      });
    }
    final res = await galleryRepository.uploadImage(file, UploadType.chats);
    res.when(success: (image) {
      chatRepository.sendMessage(
        chatDocId: chatId ?? state.chatModel?.docId ?? "",
        message: MessageModel(
          message: image.imageData?.title,
          senderId: LocalStorage.getUser()?.id ?? 0,
          type: "image",
          doc: "",
        ),
      );
      state = state.copyWith(isButtonLoading: false);
    }, failure: (fail, s) {
      state = state.copyWith(isButtonLoading: false);
      AppHelpers.showCheckTopSnackBar(context, fail);
    });
  }

  sendMessage(
      {required BuildContext context,
      required String message,
      required String? chatId}) {
    chatRepository.sendMessage(
      chatDocId: chatId ?? state.chatModel?.docId ?? "",
      message: MessageModel(
          message: message, senderId: LocalStorage.getUser()?.id ?? 0, doc: ""),
    );
    List<ChatModel> list = List.from(state.chatList);
    int index = list.indexWhere((element) => element.docId == chatId);
    if (index != -1) {
      ChatModel chat = list[index];
      list.removeAt(index);
      list.insert(0, chat);
      state = state.copyWith(chatList: list);
    }
  }

  editMessage(
      {required BuildContext context,
      required String message,
      required String messageId,
      required String? chatId}) {
    chatRepository.editMessage(
      chatDocId: chatId ?? state.chatModel?.docId ?? "",
      message: message,
      docId: messageId,
    );
  }

  getChatList({
    required BuildContext context,
    bool? isRefresh,
    RefreshController? controller,
  }) async {
    if (isRefresh ?? false) {
      controller?.resetNoData();
      lastDocId = null;
      state = state.copyWith(chatList: [], isLoading: true);
    }

    final res = await chatRepository.getChatList(
      lastDocId: lastDocId,
    );
    res.when(success: (data) {
      if (data.isEmpty) {
        controller?.loadNoData();
        state = state.copyWith(isLoading: false);
        return;
      }
      lastDocId = data.last.docId;
      List<ChatModel> list = List.from(state.chatList);
      list.addAll(data);
      state = state.copyWith(isLoading: false, chatList: list);
      if (isRefresh ?? false) {
        controller?.refreshCompleted();
        return;
      }
      controller?.loadComplete();
      return;
    }, failure: (failure, status) {
      state = state.copyWith(isLoading: false);
      AppHelpers.showCheckTopSnackBar(context, failure);
    });
  }

  replyMessage(
      {required BuildContext context,
      required String message,
      required String messageId,
      required String? chatId}) {
    chatRepository.replyMessage(
      chatDocId: chatId ?? state.chatModel?.docId ?? "",
      message: MessageModel(
          message: message,
          senderId: LocalStorage.getUser()?.id ?? 0,
          doc: "",
          replyDocId: messageId),
    );
  }

  deleteMessage(
      {required BuildContext context,
      required String messageId,
      required String? chatId}) {
    chatRepository.deleteMessage(
        chatDocId: chatId ?? state.chatModel?.docId ?? "", docId: messageId);
  }

  createAndSendMessage({
    required BuildContext context,
    required String message,
    required int userId,
    required Function onSuccess,
  }) async {
    final res = await chatRepository.createChat(id: userId);
    res.when(success: (l) async {
      state = state.copyWith(chatModel: l);
      onSuccess();
    }, failure: (fail, s) {
      AppHelpers.showCheckTopSnackBar(context, fail);
    });
  }
}
