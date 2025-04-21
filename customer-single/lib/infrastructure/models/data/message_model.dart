class MessageModel {
  final String? message;
  final DateTime? time;
  final bool read;
  final int senderId;
  final String? media;
  final String? type;
  final String? replyDocId;
  final String? doc;

  MessageModel(
      {required this.message,
      this.time,
      this.read = false,
      required this.senderId,
      this.media,
      this.type,
      this.replyDocId,
      required this.doc});

  factory MessageModel.fromJson(Map? message, String doc) {
    return MessageModel(
        message: message?["message"],
        time: DateTime.tryParse(message?["time"])?.toLocal(),
        read: message?["read"],
        senderId: message?["senderId"],
        media: message?["media"],
        type: message?["type"],
        replyDocId: message?["replyDocId"],
        doc: doc);
  }

  Map<String, dynamic> toJson() {
    return {
      "senderId": senderId,
      "message": message,
      "time": DateTime.now().toUtc().toString(),
      "read": read,
      if (media != null) "media": media,
      if (type != null) "type": type,
      if (replyDocId != null) "replyDocId": replyDocId,
    };
  }
}
