import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:riverpodtemp/domain/di/injection.dart';
import 'package:riverpodtemp/domain/handlers/api_result.dart';
import 'package:riverpodtemp/domain/handlers/http_service.dart';
import 'package:riverpodtemp/domain/iterface/chat.dart';
import 'package:riverpodtemp/infrastructure/models/data/chat_model.dart';
import 'package:riverpodtemp/infrastructure/models/data/message_model.dart';
import 'package:riverpodtemp/infrastructure/models/data/user.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';

class ChatRepository implements ChatFacade {
  static final FirebaseFirestore store = FirebaseFirestore.instance;

  @override
  void deleteMessage({required String chatDocId, required String docId}) {
    store
        .collection("chat")
        .doc(chatDocId)
        .collection("message")
        .doc(docId)
        .delete();
  }

  @override
  void readMessage({required String chatDocId, required String docId}) {
    store
        .collection("chat")
        .doc(chatDocId)
        .collection("message")
        .doc(docId)
        .update({"read": true});
  }

  @override
  void editMessage(
      {required String message,
      required String chatDocId,
      required String docId}) {
    store
        .collection("chat")
        .doc(chatDocId)
        .collection("message")
        .doc(docId)
        .update({"message": message});
  }

  @override
  Future<ApiResult<List<ChatModel>>> getChatList({String? lastDocId}) async {
    try {
      List<ChatModel> list = [];
      final QuerySnapshot<Map<String, dynamic>> res;
      if (lastDocId != null) {
        final lastDoc = await store.collection("chat").doc(lastDocId).get();
        res = await store
            .collection("chat")
            .where("ids", arrayContainsAny: [LocalStorage.getUser()?.id])
            .orderBy("time", descending: true)
            .startAfterDocument(lastDoc)
            .limit(6)
            .get();
      } else {
        res = await store
            .collection("chat")
            .where("ids", arrayContainsAny: [LocalStorage.getUser()?.id])
            .orderBy("time", descending: true)
            .limit(8)
            .get();
      }

      for (var element in res.docs) {
        final user = await showChatUser(
            sellerId: ChatModel.fromJson(
                  chat: element.data(),
                  doc: element.id,
                ).senderId ??
                0);
        user.when(success: (l) {
          list.add(ChatModel.fromJson(
              chat: element.data(), doc: element.id, user: l));
        }, failure: (fail, s) {
          list.add(ChatModel.fromJson(
            chat: element.data(),
            doc: element.id,
          ));
        });
      }
      return ApiResult.success(data: list);
    } catch (e) {
      return ApiResult.failure(error: e.toString(), statusCode: 0);
    }
  }

  @override
  Future<ApiResult<MessageModel>> sendMessage(
      {required MessageModel message, required String chatDocId}) async {
    store
        .collection("chat")
        .doc(chatDocId)
        .update({"time": Timestamp.now(), "lastMessage": message.message});
    final res = await store
        .collection("chat")
        .doc(chatDocId)
        .collection("message")
        .add(message.toJson());
    final messageRes = await res.get();
    return ApiResult.success(
        data: MessageModel.fromJson(messageRes.data(), messageRes.id));
  }

  @override
  Future<ApiResult<ChatModel>> createChat({required int? id}) async {
    try {
      final res = await store.collection("chat").add(
            ChatModel().toJson(senderId: id ?? 0, message: ''),
          );
      final chatRes = await res.get();
      return ApiResult.success(
          data: ChatModel.fromJson(
        chat: chatRes.data(),
        doc: chatRes.id,
      ));
    } catch (e) {
      return ApiResult.failure(error: e.toString(), statusCode: 0);
    }
  }

  @override
  void replyMessage(
      {required String chatDocId, required MessageModel message}) {
    store
        .collection("chat")
        .doc(chatDocId)
        .collection("message")
        .add(message.toJson());
  }

  @override
  Future<ApiResult<ChatModel>> getChat({required int senderId}) async {
    try {
      List<ChatModel> list = [];
      final res = await store.collection("chat").where("ids",
          arrayContainsAny: [LocalStorage.getUser()?.id, senderId]).get();
      for (var element in res.docs) {
        list.add(ChatModel.fromJson(
          chat: element.data(),
          doc: element.id,
        ));
      }
      if (list.isEmpty) {
        return const ApiResult.failure(error: "", statusCode: 0);
      }
      for (var element in list) {
        if (element.ownerId == LocalStorage.getUser()?.id &&
            element.senderId == senderId) {
          return ApiResult.success(data: element);
        }
      }

      return const ApiResult.failure(error: "", statusCode: 0);
    } catch (e) {
      return ApiResult.failure(error: e.toString(), statusCode: 0);
    }
  }

  @override
  Future<ApiResult<UserModel>> showChatUser({required int sellerId}) async {
    try {
      final data = {
        if (LocalStorage.getSelectedCurrency().id != null)
          'currency_id': LocalStorage.getSelectedCurrency().id,
        "lang": LocalStorage.getLanguage()?.locale ?? "en"
      };
      final client = inject<HttpService>().client(requireAuth: true);
      final response = await client.get(
          '/api/v1/dashboard/user/chat/users/$sellerId',
          queryParameters: data);
      return ApiResult.success(data: UserModel.fromJson(response.data));
    } catch (e) {
      debugPrint('==> get user chat details failure: $e');
      return ApiResult.failure(
          error: AppHelpers.errorHandler(e), statusCode: 0);
    }
  }
}
