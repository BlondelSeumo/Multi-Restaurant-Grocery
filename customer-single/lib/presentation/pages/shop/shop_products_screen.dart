import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpodtemp/application/shop/shop_provider.dart';
import 'package:riverpodtemp/presentation/pages/shop/widgets/make_tab_bar.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';
import '../../../application/shop/shop_notifier.dart';
import '../../../infrastructure/models/models.dart';
import 'widgets/product_list.dart';

class ShopProductsScreen extends ConsumerStatefulWidget {
  final bool isPopularProduct;
  final int currentIndex;
  final int shopId;
  final List<CategoryData>? listCategory;
  final CustomColorSet colors;

  const ShopProductsScreen({
    super.key,
    required this.colors,
    required this.isPopularProduct,
    required this.listCategory,
    required this.currentIndex,
    required this.shopId,
  });

  @override
  ConsumerState<ShopProductsScreen> createState() => _ShopProductsScreenState();
}

class _ShopProductsScreenState extends ConsumerState<ShopProductsScreen>
    with TickerProviderStateMixin {
  TabController? tabController;
  late ShopNotifier event;

  @override
  void initState() {
    if (widget.isPopularProduct) {
      tabController = TabController(
          length: ((widget.listCategory!.length) + 2), vsync: this)
        ..addListener(() {
          ref.read(shopProvider.notifier).changeIndex(tabController!.index);
        });
    } else {
      tabController = TabController(
          length: ((widget.listCategory!.length) + 1), vsync: this)
        ..addListener(() {
          ref.read(shopProvider.notifier).changeIndex(tabController!.index);
        });
    }
    super.initState();
  }

  @override
  void didChangeDependencies() {
    event = ref.read(shopProvider.notifier);
    super.didChangeDependencies();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        makeTabBarHeader(
          tabController: tabController,
          onTab: (val) {
            event.changeIndex(val);
          },
          index: widget.currentIndex,
          isPopularProduct: ref.watch(shopProvider).isPopularProduct,
          list: widget.listCategory,
          colors: widget.colors,
        ),
        Expanded(
          child: widget.isPopularProduct
              ? TabBarView(controller: tabController, children: [
                  ProductsList(
                    colors: widget.colors,
                    shopId: widget.shopId,
                    index: 1,
                  ),
                  ProductsList(
                    colors: widget.colors,
                    shopId: widget.shopId,
                    index: 0,
                  ),
                  ...widget.listCategory!.map(
                    (e) => ProductsList(
                      colors: widget.colors,
                      shopId: widget.shopId,
                      categoryData: e,
                    ),
                  )
                ])
              : TabBarView(
                  controller: tabController,
                  children: [
                    ProductsList(
                      colors: widget.colors,
                      shopId: widget.shopId,
                      index: 0,
                    ),
                    ...widget.listCategory!.map(
                      (e) => ProductsList(
                        colors: widget.colors,
                        shopId: widget.shopId,
                        categoryData: e,
                      ),
                    )
                  ],
                ),
        ),
      ],
    );
  }
}
