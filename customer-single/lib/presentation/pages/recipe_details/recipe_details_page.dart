import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_widget_from_html/flutter_widget_from_html.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:riverpodtemp/application/shop_order/shop_order_provider.dart';
import 'package:riverpodtemp/infrastructure/models/data/recipe_data.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/blur_wrap.dart';
import 'package:riverpodtemp/presentation/components/custom_network_image.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import 'package:riverpodtemp/presentation/pages/recipe_details/common_material_button.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'open_ingredients_button.dart';
import 'recipe_product_item.dart';
import 'riverpod/provider/ingredients_to_cart_provider.dart';
import 'riverpod/provider/ingredients_visible_provider.dart';
import 'riverpod/provider/recipe_details_provider.dart';
import 'widgets/nutrition_item.dart';
import 'widgets/recipe_info_divider.dart';
import 'widgets/recipe_info_item.dart';

@RoutePage()
class RecipeDetailsPage extends ConsumerStatefulWidget {
  final int? shopId;
  final RecipeData recipe;

  const RecipeDetailsPage({super.key, required this.recipe, this.shopId});

  @override
  ConsumerState<RecipeDetailsPage> createState() => _RecipeDetailsPageState();
}

class _RecipeDetailsPageState extends ConsumerState<RecipeDetailsPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback(
      (_) {
        ref
            .read(ingredientsVisibleProvider.notifier)
            .toggleVisibility(value: false);
        ref.read(ingredientsToCartProvider.notifier).addedProducts(false);
        ref.read(recipeDetailsProvider.notifier).fetchRecipeDetails(
              recipeId: widget.recipe.id,
              checkYourNetwork: () {
                AppHelpers.showNoConnectionSnackBar(
                  context,
                );
              },
            );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return CustomScaffold(
      body: (colors) => Stack(
        children: [
          CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: <Widget>[
              SliverAppBar(
                pinned: true,
                snap: true,
                floating: true,
                expandedHeight: 300.r,
                toolbarHeight: 56.r,
                backgroundColor: AppStyle.bgGrey,
                automaticallyImplyLeading: false,
                elevation: 0,
                flexibleSpace: FlexibleSpaceBar(
                  titlePadding: const EdgeInsets.only(bottom: 8),
                  title: Container(
                    width: double.infinity,
                    height: 56.r,
                    margin: REdgeInsets.symmetric(horizontal: 16),
                    alignment: Alignment.center,
                    constraints: BoxConstraints(
                      minHeight: 56.r,
                    ),
                    decoration: BoxDecoration(
                      color: colors.buttonColor,
                      borderRadius: BorderRadius.circular(15.r),
                    ),
                    child: Text(
                      widget.recipe.translation?.title ?? "",
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w500,
                        fontSize: 16.sp,
                        letterSpacing: -14 * 0.02,
                        color: colors.textBlack,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  background: Container(
                    color: AppStyle.bgGrey,
                    child: Stack(
                      children: [
                        Positioned(
                          bottom: 32,
                          left: 0,
                          right: 0,
                          child: CustomNetworkImage(
                            url: widget.recipe.image ?? "",
                            width: double.infinity,
                            radius: 0,
                            height: 288.r,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              SliverList(
                delegate: SliverChildListDelegate(
                  [
                    Column(
                      children: [
                        16.verticalSpace,
                        Container(
                          height: 72.r,
                          padding: REdgeInsets.symmetric(horizontal: 16),
                          alignment: Alignment.center,
                          color: colors.buttonColor,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              RecipeInfoItem(
                                colors: colors,
                                title: AppHelpers.getTranslation(
                                  TrKeys.activeTime,
                                ),
                                value: '${widget.recipe.activeTime} min',
                              ),
                              const RecipeInfoDivider(),
                              RecipeInfoItem(
                                title:
                                    AppHelpers.getTranslation(TrKeys.totalTime),
                                value: '${widget.recipe.totalTime} min',
                                colors: colors,
                              ),
                              const RecipeInfoDivider(),
                              RecipeInfoItem(
                                colors: colors,
                                title:
                                    AppHelpers.getTranslation(TrKeys.calories),
                                value: '${widget.recipe.calories}',
                              ),
                            ],
                          ),
                        ),
                        Consumer(
                          builder: (context, ref, child) {
                            final state = ref.watch(recipeDetailsProvider);
                            return state.isLoading
                                ? Padding(
                                    padding: REdgeInsets.only(top: 34),
                                    child: Center(
                                      child: CircularProgressIndicator(
                                        color: AppStyle.primary,
                                        strokeWidth: 4.r,
                                      ),
                                    ),
                                  )
                                : Container(
                                    color: colors.buttonColor,
                                    width: double.infinity,
                                    padding:
                                        REdgeInsets.symmetric(horizontal: 16),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        34.verticalSpace,
                                        Text(
                                          AppHelpers.getTranslation(
                                              TrKeys.ingredientsList),
                                          style: GoogleFonts.inter(
                                            fontWeight: FontWeight.w600,
                                            fontSize: 16.sp,
                                            color: colors.textBlack,
                                            letterSpacing: -0.4,
                                          ),
                                        ),
                                        16.verticalSpace,
                                        HtmlWidget(
                                          state.recipeData?.ingredient?.title ??
                                              "",
                                          textStyle: AppStyle.interRegular(
                                            color: colors.textBlack,
                                          ),
                                        ),
                                        66.verticalSpace,
                                        Text(
                                          AppHelpers.getTranslation(
                                              TrKeys.instructions),
                                          style: GoogleFonts.inter(
                                            fontWeight: FontWeight.w600,
                                            fontSize: 16.sp,
                                            color: colors.textBlack,
                                            letterSpacing: -0.4,
                                          ),
                                        ),
                                        16.verticalSpace,
                                        (state.recipeData?.instructions != null
                                            ? HtmlWidget(
                                                state.recipeData?.instructions
                                                        ?.title ??
                                                    '',
                                                textStyle:
                                                    AppStyle.interRegular(
                                                  color: colors.textBlack,
                                                ),
                                              )
                                            : const SizedBox.shrink()),
                                        44.verticalSpace,
                                        Text(
                                          AppHelpers.getTranslation(
                                              TrKeys.nutritionInfo),
                                          style: GoogleFonts.inter(
                                            fontWeight: FontWeight.w600,
                                            fontSize: 16.sp,
                                            color: colors.textBlack,
                                            letterSpacing: -0.4,
                                          ),
                                        ),
                                        8.verticalSpace,
                                        (state.recipeData?.nutritions != null
                                            ? ListView.builder(
                                                itemCount: state.recipeData
                                                    ?.nutritions?.length,
                                                shrinkWrap: true,
                                                physics:
                                                    const NeverScrollableScrollPhysics(),
                                                itemBuilder: (context, index) {
                                                  return NutritionItem(
                                                    nutritions: state.recipeData
                                                        ?.nutritions?[index],
                                                  );
                                                },
                                              )
                                            : const SizedBox.shrink()),
                                        40.verticalSpace,
                                      ],
                                    ),
                                  );
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          Positioned(
            top: MediaQuery.of(context).padding.top,
            left: 16.r,
            child: BlurWrap(
              radius: BorderRadius.circular(20.r),
              child: GestureDetector(
                onTap: context.maybePop,
                child: Container(
                  width: 40.r,
                  height: 40.r,
                  decoration: BoxDecoration(
                    color: colors.textBlack.withOpacity(0.06),
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: Icon(
                    FlutterRemix.arrow_left_s_line,
                    color: AppStyle.white,
                    size: 24.r,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: (colors) => Consumer(
        builder: (context, ref, child) {
          final state = ref.watch(recipeDetailsProvider);
          final notifier = ref.read(recipeDetailsProvider.notifier);
          return state.isLoading || state.recipeData == null
              ? const SizedBox.shrink()
              : Stack(
                  alignment: Alignment.bottomCenter,
                  children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      height: ref.watch(ingredientsVisibleProvider).isVisible
                          ? ((state.recipeData?.recipeProducts?.length ?? 1) *
                                      108 +
                                  82)
                              .r
                          : 0,
                      margin: REdgeInsets.only(bottom: 100),
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: colors.scaffoldColor,
                      ),
                      child: ListView.builder(
                        itemCount:
                            state.recipeData?.recipeProducts?.length ?? 0,
                        shrinkWrap: true,
                        padding: REdgeInsets.symmetric(
                            horizontal: 16, vertical: 16),
                        physics: const BouncingScrollPhysics(),
                        itemBuilder: (context, index) {
                          return RecipeProductItem(
                            product: state.recipeData?.recipeProducts?[index],
                            onIncrease: () {
                              notifier.increaseRecipeProductCount(index);
                            },
                            onDecrease: () {
                              notifier.decreaseRecipeProductCount(index);
                            },
                            colors: colors,
                          );
                        },
                      ),
                    ),
                    Container(
                      height: 100.r,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: colors.buttonColor,
                      ),
                      padding: REdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        children: [
                          Expanded(
                            child: OpenIngredientsButton(
                              isVisible: ref
                                  .watch(ingredientsVisibleProvider)
                                  .isVisible,
                              onTap: () {
                                ref
                                    .read(ingredientsVisibleProvider.notifier)
                                    .toggleVisibility();
                              },
                              colors: colors,
                            ),
                          ),
                          20.horizontalSpace,
                          Expanded(
                            child: Consumer(
                              builder: (context, ref, child) {
                                final addedState =
                                    ref.watch(ingredientsToCartProvider);
                                return CommonMaterialButton(
                                  height: 50,
                                  color: AppStyle.primary,
                                  fontColor: colors.textBlack,
                                  text: addedState.added
                                      ? AppHelpers.getTranslation(TrKeys.add)
                                      : '${state.recipeData?.recipeProducts?.length} ${AppHelpers.getTranslation(TrKeys.add)}',
                                  horizontalPadding: 0,
                                  isLoading: addedState.isLoading,
                                  onTap: addedState.added
                                      ? null
                                      : () {
                                          return ref
                                              .read(ingredientsToCartProvider
                                                  .notifier)
                                              .insertProducts(
                                                shopId: widget.shopId,
                                                products: state
                                                    .recipeData?.recipeProducts,
                                                checkYourNetwork: () {
                                                  AppHelpers
                                                      .showNoConnectionSnackBar(
                                                    context,
                                                  );
                                                },
                                                success: () {
                                                  context.router.popUntilRoot();
                                                  ref
                                                      .read(shopOrderProvider
                                                          .notifier)
                                                      .getCart(context, () {},
                                                          isStart: true);
                                                },
                                              );
                                        },
                                );
                              },
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                );
        },
      ),
    );
  }
}
