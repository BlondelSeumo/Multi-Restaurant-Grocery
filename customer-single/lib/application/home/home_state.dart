import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:riverpodtemp/infrastructure/models/data/address_new_data.dart';
import 'package:riverpodtemp/infrastructure/models/data/recipe_data.dart';
import 'package:riverpodtemp/infrastructure/models/models.dart';
import 'package:riverpodtemp/infrastructure/models/response/new_product_pagination.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';

import '../../infrastructure/models/data/story_data.dart';

part 'home_state.freezed.dart';

@freezed
class HomeState with _$HomeState {
  const factory HomeState({
    @Default(true) bool isCategoryLoading,
    @Default(true) bool isBannerLoading,
    @Default(true) bool isRecipesLoading,
    @Default(true) bool isProductLoading,
    @Default(true) bool isProductPopularLoading,
    @Default(true) bool isStoryLoading,
    @Default(true) bool isBranchesLoading,
    @Default(-1) int selectIndexCategory,
    @Default(0) int selectBranchId,
    @Default(0) int changeBranchId,
    @Default(0) int isSelectCategoryLoading,
    @Default(null) AddressNewModel? addressData,
    @Default([]) List<CategoryData> categories,
    @Default([]) List<BannerData> banners,
    @Default(null) BannerData? banner,
    @Default([]) List<List<StoryModel?>?> story,
    @Default([]) List<ProductData> filterProducts,
    @Default([]) List<ProductData> products,
    @Default([]) List<AllModel> allProducts,
    @Default([]) List<RecipeData> recipes,
    @Default([]) List<CategoryData> recipesCategory,
    @Default([]) List<ProductData> productsPopular,
    @Default([]) List<ShopData> branches,
    @Default({}) Set<Marker> shopMarkers,
    @Default(TrKeys.allShops) String shopFilter,
  }) = _HomeState;

  const HomeState._();

}