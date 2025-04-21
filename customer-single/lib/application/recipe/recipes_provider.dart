import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpodtemp/domain/di/dependency_manager.dart';

import 'recipes_notifier.dart';
import 'recipes_state.dart';


final recipesProvider =
    StateNotifierProvider<RecipesNotifier, RecipesState>(
  (ref) => RecipesNotifier(productsRepository),
);
