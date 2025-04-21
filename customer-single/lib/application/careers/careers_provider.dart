

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpodtemp/application/careers/careers_notifier.dart';
import 'package:riverpodtemp/application/careers/careers_state.dart';
import 'package:riverpodtemp/domain/di/dependency_manager.dart';

final careersProvider = StateNotifierProvider<CareersNotifier, CareersState>(
      (ref) => CareersNotifier(careersRepository),
);
