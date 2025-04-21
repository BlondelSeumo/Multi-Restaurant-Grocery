// dart format width=80
// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// AutoRouterGenerator
// **************************************************************************

// ignore_for_file: type=lint
// coverage:ignore-file

part of 'app_router.dart';

/// generated route for
/// [AllBranchesPage]
class AllBranchesRoute extends PageRouteInfo<void> {
  const AllBranchesRoute({List<PageRouteInfo>? children})
    : super(AllBranchesRoute.name, initialChildren: children);

  static const String name = 'AllBranchesRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const AllBranchesPage();
    },
  );
}

/// generated route for
/// [AllGalleriesPage]
class AllGalleriesRoute extends PageRouteInfo<AllGalleriesRouteArgs> {
  AllGalleriesRoute({
    Key? key,
    required GalleriesModel? galleriesModel,
    List<PageRouteInfo>? children,
  }) : super(
         AllGalleriesRoute.name,
         args: AllGalleriesRouteArgs(key: key, galleriesModel: galleriesModel),
         initialChildren: children,
       );

  static const String name = 'AllGalleriesRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      final args = data.argsAs<AllGalleriesRouteArgs>();
      return AllGalleriesPage(
        key: args.key,
        galleriesModel: args.galleriesModel,
      );
    },
  );
}

class AllGalleriesRouteArgs {
  const AllGalleriesRouteArgs({this.key, required this.galleriesModel});

  final Key? key;

  final GalleriesModel? galleriesModel;

  @override
  String toString() {
    return 'AllGalleriesRouteArgs{key: $key, galleriesModel: $galleriesModel}';
  }
}

/// generated route for
/// [AppInfoPage]
class AppInfoRoute extends PageRouteInfo<void> {
  const AppInfoRoute({List<PageRouteInfo>? children})
    : super(AppInfoRoute.name, initialChildren: children);

  static const String name = 'AppInfoRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const AppInfoPage();
    },
  );
}

/// generated route for
/// [AppSettingPage]
class AppSettingRoute extends PageRouteInfo<void> {
  const AppSettingRoute({List<PageRouteInfo>? children})
    : super(AppSettingRoute.name, initialChildren: children);

  static const String name = 'AppSettingRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const AppSettingPage();
    },
  );
}

/// generated route for
/// [BlogsDetailPage]
class BlogsDetailRoute extends PageRouteInfo<BlogsDetailRouteArgs> {
  BlogsDetailRoute({
    Key? key,
    required String uuid,
    List<PageRouteInfo>? children,
  }) : super(
         BlogsDetailRoute.name,
         args: BlogsDetailRouteArgs(key: key, uuid: uuid),
         initialChildren: children,
       );

  static const String name = 'BlogsDetailRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      final args = data.argsAs<BlogsDetailRouteArgs>();
      return BlogsDetailPage(key: args.key, uuid: args.uuid);
    },
  );
}

class BlogsDetailRouteArgs {
  const BlogsDetailRouteArgs({this.key, required this.uuid});

  final Key? key;

  final String uuid;

  @override
  String toString() {
    return 'BlogsDetailRouteArgs{key: $key, uuid: $uuid}';
  }
}

/// generated route for
/// [BlogsPage]
class BlogsRoute extends PageRouteInfo<void> {
  const BlogsRoute({List<PageRouteInfo>? children})
    : super(BlogsRoute.name, initialChildren: children);

  static const String name = 'BlogsRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const BlogsPage();
    },
  );
}

/// generated route for
/// [CareersDetailPage]
class CareersDetailRoute extends PageRouteInfo<CareersDetailRouteArgs> {
  CareersDetailRoute({int? id, Key? key, List<PageRouteInfo>? children})
    : super(
        CareersDetailRoute.name,
        args: CareersDetailRouteArgs(id: id, key: key),
        initialChildren: children,
      );

  static const String name = 'CareersDetailRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      final args = data.argsAs<CareersDetailRouteArgs>(
        orElse: () => const CareersDetailRouteArgs(),
      );
      return CareersDetailPage(id: args.id, key: args.key);
    },
  );
}

class CareersDetailRouteArgs {
  const CareersDetailRouteArgs({this.id, this.key});

  final int? id;

  final Key? key;

  @override
  String toString() {
    return 'CareersDetailRouteArgs{id: $id, key: $key}';
  }
}

/// generated route for
/// [CareersPage]
class CareersRoute extends PageRouteInfo<void> {
  const CareersRoute({List<PageRouteInfo>? children})
    : super(CareersRoute.name, initialChildren: children);

  static const String name = 'CareersRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const CareersPage();
    },
  );
}

/// generated route for
/// [ChatPage]
class ChatRoute extends PageRouteInfo<ChatRouteArgs> {
  ChatRoute({
    Key? key,
    required UserModel? sender,
    String? chatId,
    List<PageRouteInfo>? children,
  }) : super(
         ChatRoute.name,
         args: ChatRouteArgs(key: key, sender: sender, chatId: chatId),
         initialChildren: children,
       );

  static const String name = 'ChatRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      final args = data.argsAs<ChatRouteArgs>();
      return ChatPage(key: args.key, sender: args.sender, chatId: args.chatId);
    },
  );
}

class ChatRouteArgs {
  const ChatRouteArgs({this.key, required this.sender, this.chatId});

  final Key? key;

  final UserModel? sender;

  final String? chatId;

  @override
  String toString() {
    return 'ChatRouteArgs{key: $key, sender: $sender, chatId: $chatId}';
  }
}

/// generated route for
/// [CreateShopPage]
class CreateShopRoute extends PageRouteInfo<void> {
  const CreateShopRoute({List<PageRouteInfo>? children})
    : super(CreateShopRoute.name, initialChildren: children);

  static const String name = 'CreateShopRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const CreateShopPage();
    },
  );
}

/// generated route for
/// [HelpPage]
class HelpRoute extends PageRouteInfo<void> {
  const HelpRoute({List<PageRouteInfo>? children})
    : super(HelpRoute.name, initialChildren: children);

  static const String name = 'HelpRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const HelpPage();
    },
  );
}

/// generated route for
/// [LikePage]
class LikeRoute extends PageRouteInfo<void> {
  const LikeRoute({List<PageRouteInfo>? children})
    : super(LikeRoute.name, initialChildren: children);

  static const String name = 'LikeRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const LikePage();
    },
  );
}

/// generated route for
/// [LoginPage]
class LoginRoute extends PageRouteInfo<void> {
  const LoginRoute({List<PageRouteInfo>? children})
    : super(LoginRoute.name, initialChildren: children);

  static const String name = 'LoginRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const LoginPage();
    },
  );
}

/// generated route for
/// [MainPage]
class MainRoute extends PageRouteInfo<void> {
  const MainRoute({List<PageRouteInfo>? children})
    : super(MainRoute.name, initialChildren: children);

  static const String name = 'MainRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const MainPage();
    },
  );
}

/// generated route for
/// [MapSearchPage]
class MapSearchRoute extends PageRouteInfo<void> {
  const MapSearchRoute({List<PageRouteInfo>? children})
    : super(MapSearchRoute.name, initialChildren: children);

  static const String name = 'MapSearchRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const MapSearchPage();
    },
  );
}

/// generated route for
/// [NoConnectionPage]
class NoConnectionRoute extends PageRouteInfo<void> {
  const NoConnectionRoute({List<PageRouteInfo>? children})
    : super(NoConnectionRoute.name, initialChildren: children);

  static const String name = 'NoConnectionRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const NoConnectionPage();
    },
  );
}

/// generated route for
/// [NotificationListPage]
class NotificationListRoute extends PageRouteInfo<void> {
  const NotificationListRoute({List<PageRouteInfo>? children})
    : super(NotificationListRoute.name, initialChildren: children);

  static const String name = 'NotificationListRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const NotificationListPage();
    },
  );
}

/// generated route for
/// [OrderPage]
class OrderRoute extends PageRouteInfo<void> {
  const OrderRoute({List<PageRouteInfo>? children})
    : super(OrderRoute.name, initialChildren: children);

  static const String name = 'OrderRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const OrderPage();
    },
  );
}

/// generated route for
/// [OrderProgressPage]
class OrderProgressRoute extends PageRouteInfo<OrderProgressRouteArgs> {
  OrderProgressRoute({Key? key, num? orderId, List<PageRouteInfo>? children})
    : super(
        OrderProgressRoute.name,
        args: OrderProgressRouteArgs(key: key, orderId: orderId),
        initialChildren: children,
      );

  static const String name = 'OrderProgressRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      final args = data.argsAs<OrderProgressRouteArgs>(
        orElse: () => const OrderProgressRouteArgs(),
      );
      return OrderProgressPage(key: args.key, orderId: args.orderId);
    },
  );
}

class OrderProgressRouteArgs {
  const OrderProgressRouteArgs({this.key, this.orderId});

  final Key? key;

  final num? orderId;

  @override
  String toString() {
    return 'OrderProgressRouteArgs{key: $key, orderId: $orderId}';
  }
}

/// generated route for
/// [OrdersListPage]
class OrdersListRoute extends PageRouteInfo<void> {
  const OrdersListRoute({List<PageRouteInfo>? children})
    : super(OrdersListRoute.name, initialChildren: children);

  static const String name = 'OrdersListRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const OrdersListPage();
    },
  );
}

/// generated route for
/// [PolicyPage]
class PolicyRoute extends PageRouteInfo<void> {
  const PolicyRoute({List<PageRouteInfo>? children})
    : super(PolicyRoute.name, initialChildren: children);

  static const String name = 'PolicyRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const PolicyPage();
    },
  );
}

/// generated route for
/// [ProductListPage]
class ProductListRoute extends PageRouteInfo<ProductListRouteArgs> {
  ProductListRoute({
    Key? key,
    required String title,
    required int categoryId,
    List<PageRouteInfo>? children,
  }) : super(
         ProductListRoute.name,
         args: ProductListRouteArgs(
           key: key,
           title: title,
           categoryId: categoryId,
         ),
         initialChildren: children,
       );

  static const String name = 'ProductListRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      final args = data.argsAs<ProductListRouteArgs>();
      return ProductListPage(
        key: args.key,
        title: args.title,
        categoryId: args.categoryId,
      );
    },
  );
}

class ProductListRouteArgs {
  const ProductListRouteArgs({
    this.key,
    required this.title,
    required this.categoryId,
  });

  final Key? key;

  final String title;

  final int categoryId;

  @override
  String toString() {
    return 'ProductListRouteArgs{key: $key, title: $title, categoryId: $categoryId}';
  }
}

/// generated route for
/// [RecipeDetailsPage]
class RecipeDetailsRoute extends PageRouteInfo<RecipeDetailsRouteArgs> {
  RecipeDetailsRoute({
    Key? key,
    required RecipeData recipe,
    int? shopId,
    List<PageRouteInfo>? children,
  }) : super(
         RecipeDetailsRoute.name,
         args: RecipeDetailsRouteArgs(key: key, recipe: recipe, shopId: shopId),
         initialChildren: children,
       );

  static const String name = 'RecipeDetailsRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      final args = data.argsAs<RecipeDetailsRouteArgs>();
      return RecipeDetailsPage(
        key: args.key,
        recipe: args.recipe,
        shopId: args.shopId,
      );
    },
  );
}

class RecipeDetailsRouteArgs {
  const RecipeDetailsRouteArgs({this.key, required this.recipe, this.shopId});

  final Key? key;

  final RecipeData recipe;

  final int? shopId;

  @override
  String toString() {
    return 'RecipeDetailsRouteArgs{key: $key, recipe: $recipe, shopId: $shopId}';
  }
}

/// generated route for
/// [RecommendedPage]
class RecommendedRoute extends PageRouteInfo<RecommendedRouteArgs> {
  RecommendedRoute({
    Key? key,
    bool isNewsOfPage = false,
    bool isShop = false,
    List<PageRouteInfo>? children,
  }) : super(
         RecommendedRoute.name,
         args: RecommendedRouteArgs(
           key: key,
           isNewsOfPage: isNewsOfPage,
           isShop: isShop,
         ),
         initialChildren: children,
       );

  static const String name = 'RecommendedRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      final args = data.argsAs<RecommendedRouteArgs>(
        orElse: () => const RecommendedRouteArgs(),
      );
      return RecommendedPage(
        key: args.key,
        isNewsOfPage: args.isNewsOfPage,
        isShop: args.isShop,
      );
    },
  );
}

class RecommendedRouteArgs {
  const RecommendedRouteArgs({
    this.key,
    this.isNewsOfPage = false,
    this.isShop = false,
  });

  final Key? key;

  final bool isNewsOfPage;

  final bool isShop;

  @override
  String toString() {
    return 'RecommendedRouteArgs{key: $key, isNewsOfPage: $isNewsOfPage, isShop: $isShop}';
  }
}

/// generated route for
/// [RegisterConfirmationPage]
class RegisterConfirmationRoute
    extends PageRouteInfo<RegisterConfirmationRouteArgs> {
  RegisterConfirmationRoute({
    Key? key,
    required UserModel userModel,
    bool isResetPassword = false,
    required String verificationId,
    List<PageRouteInfo>? children,
  }) : super(
         RegisterConfirmationRoute.name,
         args: RegisterConfirmationRouteArgs(
           key: key,
           userModel: userModel,
           isResetPassword: isResetPassword,
           verificationId: verificationId,
         ),
         initialChildren: children,
       );

  static const String name = 'RegisterConfirmationRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      final args = data.argsAs<RegisterConfirmationRouteArgs>();
      return RegisterConfirmationPage(
        key: args.key,
        userModel: args.userModel,
        isResetPassword: args.isResetPassword,
        verificationId: args.verificationId,
      );
    },
  );
}

class RegisterConfirmationRouteArgs {
  const RegisterConfirmationRouteArgs({
    this.key,
    required this.userModel,
    this.isResetPassword = false,
    required this.verificationId,
  });

  final Key? key;

  final UserModel userModel;

  final bool isResetPassword;

  final String verificationId;

  @override
  String toString() {
    return 'RegisterConfirmationRouteArgs{key: $key, userModel: $userModel, isResetPassword: $isResetPassword, verificationId: $verificationId}';
  }
}

/// generated route for
/// [RegisterPage]
class RegisterRoute extends PageRouteInfo<RegisterRouteArgs> {
  RegisterRoute({
    Key? key,
    required bool isOnlyEmail,
    List<PageRouteInfo>? children,
  }) : super(
         RegisterRoute.name,
         args: RegisterRouteArgs(key: key, isOnlyEmail: isOnlyEmail),
         initialChildren: children,
       );

  static const String name = 'RegisterRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      final args = data.argsAs<RegisterRouteArgs>();
      return RegisterPage(key: args.key, isOnlyEmail: args.isOnlyEmail);
    },
  );
}

class RegisterRouteArgs {
  const RegisterRouteArgs({this.key, required this.isOnlyEmail});

  final Key? key;

  final bool isOnlyEmail;

  @override
  String toString() {
    return 'RegisterRouteArgs{key: $key, isOnlyEmail: $isOnlyEmail}';
  }
}

/// generated route for
/// [ReservationPage]
class ReservationRoute extends PageRouteInfo<void> {
  const ReservationRoute({List<PageRouteInfo>? children})
    : super(ReservationRoute.name, initialChildren: children);

  static const String name = 'ReservationRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const ReservationPage();
    },
  );
}

/// generated route for
/// [ResetPasswordPage]
class ResetPasswordRoute extends PageRouteInfo<void> {
  const ResetPasswordRoute({List<PageRouteInfo>? children})
    : super(ResetPasswordRoute.name, initialChildren: children);

  static const String name = 'ResetPasswordRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const ResetPasswordPage();
    },
  );
}

/// generated route for
/// [ResultFilterPage]
class ResultFilterRoute extends PageRouteInfo<void> {
  const ResultFilterRoute({List<PageRouteInfo>? children})
    : super(ResultFilterRoute.name, initialChildren: children);

  static const String name = 'ResultFilterRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const ResultFilterPage();
    },
  );
}

/// generated route for
/// [SettingPage]
class SettingRoute extends PageRouteInfo<void> {
  const SettingRoute({List<PageRouteInfo>? children})
    : super(SettingRoute.name, initialChildren: children);

  static const String name = 'SettingRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const SettingPage();
    },
  );
}

/// generated route for
/// [ShareReferralFaqPage]
class ShareReferralFaqRoute extends PageRouteInfo<ShareReferralFaqRouteArgs> {
  ShareReferralFaqRoute({
    Key? key,
    required String terms,
    List<PageRouteInfo>? children,
  }) : super(
         ShareReferralFaqRoute.name,
         args: ShareReferralFaqRouteArgs(key: key, terms: terms),
         initialChildren: children,
       );

  static const String name = 'ShareReferralFaqRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      final args = data.argsAs<ShareReferralFaqRouteArgs>();
      return ShareReferralFaqPage(key: args.key, terms: args.terms);
    },
  );
}

class ShareReferralFaqRouteArgs {
  const ShareReferralFaqRouteArgs({this.key, required this.terms});

  final Key? key;

  final String terms;

  @override
  String toString() {
    return 'ShareReferralFaqRouteArgs{key: $key, terms: $terms}';
  }
}

/// generated route for
/// [ShareReferralPage]
class ShareReferralRoute extends PageRouteInfo<void> {
  const ShareReferralRoute({List<PageRouteInfo>? children})
    : super(ShareReferralRoute.name, initialChildren: children);

  static const String name = 'ShareReferralRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const ShareReferralPage();
    },
  );
}

/// generated route for
/// [ShopDetailPage]
class ShopDetailRoute extends PageRouteInfo<ShopDetailRouteArgs> {
  ShopDetailRoute({
    Key? key,
    required ShopData shop,
    required String workTime,
    List<PageRouteInfo>? children,
  }) : super(
         ShopDetailRoute.name,
         args: ShopDetailRouteArgs(key: key, shop: shop, workTime: workTime),
         initialChildren: children,
       );

  static const String name = 'ShopDetailRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      final args = data.argsAs<ShopDetailRouteArgs>();
      return ShopDetailPage(
        key: args.key,
        shop: args.shop,
        workTime: args.workTime,
      );
    },
  );
}

class ShopDetailRouteArgs {
  const ShopDetailRouteArgs({
    this.key,
    required this.shop,
    required this.workTime,
  });

  final Key? key;

  final ShopData shop;

  final String workTime;

  @override
  String toString() {
    return 'ShopDetailRouteArgs{key: $key, shop: $shop, workTime: $workTime}';
  }
}

/// generated route for
/// [ShopPage]
class ShopRoute extends PageRouteInfo<ShopRouteArgs> {
  ShopRoute({
    Key? key,
    required int shopId,
    String? productId,
    ShopData? shop,
    List<PageRouteInfo>? children,
  }) : super(
         ShopRoute.name,
         args: ShopRouteArgs(
           key: key,
           shopId: shopId,
           productId: productId,
           shop: shop,
         ),
         initialChildren: children,
       );

  static const String name = 'ShopRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      final args = data.argsAs<ShopRouteArgs>();
      return ShopPage(
        key: args.key,
        shopId: args.shopId,
        productId: args.productId,
        shop: args.shop,
      );
    },
  );
}

class ShopRouteArgs {
  const ShopRouteArgs({
    this.key,
    required this.shopId,
    this.productId,
    this.shop,
  });

  final Key? key;

  final int shopId;

  final String? productId;

  final ShopData? shop;

  @override
  String toString() {
    return 'ShopRouteArgs{key: $key, shopId: $shopId, productId: $productId, shop: $shop}';
  }
}

/// generated route for
/// [ShopRecipesPage]
class ShopRecipesRoute extends PageRouteInfo<ShopRecipesRouteArgs> {
  ShopRecipesRoute({
    Key? key,
    int? categoryId,
    String? categoryTitle,
    List<PageRouteInfo>? children,
  }) : super(
         ShopRecipesRoute.name,
         args: ShopRecipesRouteArgs(
           key: key,
           categoryId: categoryId,
           categoryTitle: categoryTitle,
         ),
         initialChildren: children,
       );

  static const String name = 'ShopRecipesRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      final args = data.argsAs<ShopRecipesRouteArgs>(
        orElse: () => const ShopRecipesRouteArgs(),
      );
      return ShopRecipesPage(
        key: args.key,
        categoryId: args.categoryId,
        categoryTitle: args.categoryTitle,
      );
    },
  );
}

class ShopRecipesRouteArgs {
  const ShopRecipesRouteArgs({this.key, this.categoryId, this.categoryTitle});

  final Key? key;

  final int? categoryId;

  final String? categoryTitle;

  @override
  String toString() {
    return 'ShopRecipesRouteArgs{key: $key, categoryId: $categoryId, categoryTitle: $categoryTitle}';
  }
}

/// generated route for
/// [ShopsBannerPage]
class ShopsBannerRoute extends PageRouteInfo<ShopsBannerRouteArgs> {
  ShopsBannerRoute({
    Key? key,
    required int bannerId,
    required String title,
    List<PageRouteInfo>? children,
  }) : super(
         ShopsBannerRoute.name,
         args: ShopsBannerRouteArgs(key: key, bannerId: bannerId, title: title),
         initialChildren: children,
       );

  static const String name = 'ShopsBannerRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      final args = data.argsAs<ShopsBannerRouteArgs>();
      return ShopsBannerPage(
        key: args.key,
        bannerId: args.bannerId,
        title: args.title,
      );
    },
  );
}

class ShopsBannerRouteArgs {
  const ShopsBannerRouteArgs({
    this.key,
    required this.bannerId,
    required this.title,
  });

  final Key? key;

  final int bannerId;

  final String title;

  @override
  String toString() {
    return 'ShopsBannerRouteArgs{key: $key, bannerId: $bannerId, title: $title}';
  }
}

/// generated route for
/// [SingleShopPage]
class SingleShopRoute extends PageRouteInfo<void> {
  const SingleShopRoute({List<PageRouteInfo>? children})
    : super(SingleShopRoute.name, initialChildren: children);

  static const String name = 'SingleShopRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const SingleShopPage();
    },
  );
}

/// generated route for
/// [SplashPage]
class SplashRoute extends PageRouteInfo<void> {
  const SplashRoute({List<PageRouteInfo>? children})
    : super(SplashRoute.name, initialChildren: children);

  static const String name = 'SplashRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const SplashPage();
    },
  );
}

/// generated route for
/// [StoryListPage]
class StoryListRoute extends PageRouteInfo<StoryListRouteArgs> {
  StoryListRoute({
    Key? key,
    required int index,
    required RefreshController controller,
    List<PageRouteInfo>? children,
  }) : super(
         StoryListRoute.name,
         args: StoryListRouteArgs(
           key: key,
           index: index,
           controller: controller,
         ),
         initialChildren: children,
       );

  static const String name = 'StoryListRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      final args = data.argsAs<StoryListRouteArgs>();
      return StoryListPage(
        key: args.key,
        index: args.index,
        controller: args.controller,
      );
    },
  );
}

class StoryListRouteArgs {
  const StoryListRouteArgs({
    this.key,
    required this.index,
    required this.controller,
  });

  final Key? key;

  final int index;

  final RefreshController controller;

  @override
  String toString() {
    return 'StoryListRouteArgs{key: $key, index: $index, controller: $controller}';
  }
}

/// generated route for
/// [TermPage]
class TermRoute extends PageRouteInfo<void> {
  const TermRoute({List<PageRouteInfo>? children})
    : super(TermRoute.name, initialChildren: children);

  static const String name = 'TermRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const TermPage();
    },
  );
}

/// generated route for
/// [ViewMapPage]
class ViewMapRoute extends PageRouteInfo<ViewMapRouteArgs> {
  ViewMapRoute({
    Key? key,
    VoidCallback? onDelete,
    bool isParcel = false,
    bool isPop = true,
    bool isShopLocation = false,
    int? shopId,
    int? indexAddress,
    AddressNewModel? address,
    List<PageRouteInfo>? children,
  }) : super(
         ViewMapRoute.name,
         args: ViewMapRouteArgs(
           key: key,
           onDelete: onDelete,
           isParcel: isParcel,
           isPop: isPop,
           isShopLocation: isShopLocation,
           shopId: shopId,
           indexAddress: indexAddress,
           address: address,
         ),
         initialChildren: children,
       );

  static const String name = 'ViewMapRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      final args = data.argsAs<ViewMapRouteArgs>(
        orElse: () => const ViewMapRouteArgs(),
      );
      return ViewMapPage(
        key: args.key,
        onDelete: args.onDelete,
        isParcel: args.isParcel,
        isPop: args.isPop,
        isShopLocation: args.isShopLocation,
        shopId: args.shopId,
        indexAddress: args.indexAddress,
        address: args.address,
      );
    },
  );
}

class ViewMapRouteArgs {
  const ViewMapRouteArgs({
    this.key,
    this.onDelete,
    this.isParcel = false,
    this.isPop = true,
    this.isShopLocation = false,
    this.shopId,
    this.indexAddress,
    this.address,
  });

  final Key? key;

  final VoidCallback? onDelete;

  final bool isParcel;

  final bool isPop;

  final bool isShopLocation;

  final int? shopId;

  final int? indexAddress;

  final AddressNewModel? address;

  @override
  String toString() {
    return 'ViewMapRouteArgs{key: $key, onDelete: $onDelete, isParcel: $isParcel, isPop: $isPop, isShopLocation: $isShopLocation, shopId: $shopId, indexAddress: $indexAddress, address: $address}';
  }
}

/// generated route for
/// [WalletHistoryPage]
class WalletHistoryRoute extends PageRouteInfo<void> {
  const WalletHistoryRoute({List<PageRouteInfo>? children})
    : super(WalletHistoryRoute.name, initialChildren: children);

  static const String name = 'WalletHistoryRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const WalletHistoryPage();
    },
  );
}

/// generated route for
/// [WebViewPage]
class WebViewRoute extends PageRouteInfo<WebViewRouteArgs> {
  WebViewRoute({Key? key, required String url, List<PageRouteInfo>? children})
    : super(
        WebViewRoute.name,
        args: WebViewRouteArgs(key: key, url: url),
        initialChildren: children,
      );

  static const String name = 'WebViewRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      final args = data.argsAs<WebViewRouteArgs>();
      return WebViewPage(key: args.key, url: args.url);
    },
  );
}

class WebViewRouteArgs {
  const WebViewRouteArgs({this.key, required this.url});

  final Key? key;

  final String url;

  @override
  String toString() {
    return 'WebViewRouteArgs{key: $key, url: $url}';
  }
}
