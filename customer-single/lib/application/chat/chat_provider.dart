import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'chat_state.dart';
import 'chat_notifier.dart';

final chatProvider = StateNotifierProvider<ChatNotifier, MainState>(
  (ref) => ChatNotifier(),
);
