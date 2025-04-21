import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/application/recipe/recipes_provider.dart';
import 'package:riverpodtemp/presentation/components/app_bars/common_app_bar.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import '../../components/buttons/pop_button.dart';
import '../../theme/app_style.dart';
import 'grid_recipes_body.dart';

@RoutePage()
class ShopRecipesPage extends ConsumerStatefulWidget {
  final int? categoryId;
  final String? categoryTitle;

  const ShopRecipesPage({
    super.key,
    this.categoryId,
    this.categoryTitle,
  });

  @override
  ConsumerState<ShopRecipesPage> createState() => _ShopRecipesPageState();
}

class _ShopRecipesPageState extends ConsumerState<ShopRecipesPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback(
      (_) {
        ref
            .read(recipesProvider.notifier)
            .fetchRecipe(context, widget.categoryId ?? 0);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return CustomScaffold(
      body: (colors) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CommonAppBar(
            child: Text(
              widget.categoryTitle ?? "",
              style: AppStyle.interNoSemi(
                size: 18,
                color: colors.textBlack,
              ),
            ),
          ),
          Expanded(
            child: Consumer(
              builder: (context, ref, child) {
                final recipesState = ref.watch(recipesProvider);
                return GridRecipesBody(
                  isLoading: recipesState.isLoading,
                  recipes: recipesState.recipes,
                  bottomPadding: 24, colors: colors,
                );
              },
            ),
          ),
        ],
      ),
      floatingButtonLocation: FloatingActionButtonLocation.startFloat,
      floatingButton: (colors) => Padding(
        padding: EdgeInsets.only(left: 16.w),
        child: PopButton(colors: colors),
      ),
    );
  }
}
