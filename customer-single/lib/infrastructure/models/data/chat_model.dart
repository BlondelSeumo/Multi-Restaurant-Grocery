import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'user.dart';

class ChatModel {
  final int? senderId;
  final int? ownerId;
  final String? docId;
  final Timestamp? lastTime;
  final String? lastMessage;
  final UserModel? user;

  ChatModel({
    this.senderId,
    this.ownerId,
    this.docId,
    this.lastMessage,
    this.lastTime,
    this.user,
  });

  factory ChatModel.fromJson({
    required Map? chat,
    required String doc,
    UserModel? user,
  }) {
    List list = chat?["ids"];
    if(!list.contains(LocalStorage.getUser()?.id ?? 0)){
      list.clear();
      list.add(-1);
    }
    list.remove(LocalStorage.getUser()?.id ?? 0);

    return ChatModel(
        senderId: list.first,
        ownerId: LocalStorage.getUser()?.id ?? 0,
        docId: doc,
        lastMessage: chat?["lastMessage"],
        lastTime: chat?["time"],
        user: user);
  }

  Map<String, dynamic> toJson(
      {required int senderId, required String message}) {
    return {
      "ids": [senderId, LocalStorage.getUser()?.id],
      "lastMessage": message,
      "time": Timestamp.now(),
    };
  }
}
