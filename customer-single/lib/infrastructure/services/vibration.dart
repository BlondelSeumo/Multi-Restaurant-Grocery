import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

enum FeedbackType {
  success,
  error,
  warning,
  selection,
  impact,
  heavy,
  medium,
  light
}

class Vibrate {
  static const MethodChannel _channel = MethodChannel('vibrate');
  static const Duration defaultVibrationDuration = Duration(milliseconds: 500);

  static Future vibrate() => _channel.invokeMethod(
        'vibrate',
        {'duration': defaultVibrationDuration.inMilliseconds},
      );

  static Future<bool> get canVibrate async {
    final bool isOn = await _channel.invokeMethod('canVibrate');
    return isOn;
  }

  static void feedback(FeedbackType type) {
    try {
      switch (type) {
        case FeedbackType.impact:
          _channel.invokeMethod('impact');
          break;
        case FeedbackType.error:
          _channel.invokeMethod('error');
          break;
        case FeedbackType.success:
          _channel.invokeMethod('success');
          break;
        case FeedbackType.warning:
          _channel.invokeMethod('warning');
          break;
        case FeedbackType.selection:
          _channel.invokeMethod('selection');
          break;
        case FeedbackType.heavy:
          _channel.invokeMethod('heavy');
          break;
        case FeedbackType.medium:
          _channel.invokeMethod('medium');
          break;
        case FeedbackType.light:
          _channel.invokeMethod('light');
          break;
      }
    } catch (e) {
      debugPrint("Vibrate error: $e");
    }
  }

  static Future vibrateWithPauses(Iterable<Duration> pauses) async {
    for (final Duration d in pauses) {
      await vibrate();
      await Future.delayed(defaultVibrationDuration);
      await Future.delayed(d);
    }
    await vibrate();
  }
}
