import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'package:riverpodtemp/application/home/home_provider.dart';
import 'package:riverpodtemp/app_constants.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/components/app_bars/common_app_bar.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import 'package:riverpodtemp/presentation/components/loading.dart';
import 'package:riverpodtemp/presentation/pages/order/order_type/widgets/order_map.dart';

import '../../components/buttons/pop_button.dart';
import '../../theme/app_style.dart';
import 'widgets/market_item.dart';

@RoutePage()
class AllBranchesPage extends StatefulWidget {
  const AllBranchesPage({super.key});

  @override
  State<AllBranchesPage> createState() => _AllBranchesPageState();
}

class _AllBranchesPageState extends State<AllBranchesPage> {
  late RefreshController _refreshController;

  @override
  void initState() {
    _refreshController = RefreshController();
    super.initState();
  }

  @override
  void dispose() {
    _refreshController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CustomScaffold(
      body: (colors) => Consumer(
        builder: (BuildContext context, WidgetRef ref, Widget? child) {
          final state = ref.watch(homeProvider);
          final event = ref.read(homeProvider.notifier);
          return Column(
            children: [
              CommonAppBar(
                child: Text(
                  AppHelpers.getTranslation(TrKeys.shopInfo),
                  style: AppStyle.interNoSemi(
                    size: 18,
                    color: colors.textBlack,
                  ),
                ),
              ),
              state.isBranchesLoading
                  ? Padding(
                      padding: EdgeInsets.only(top: 64.r),
                      child: Loading(),
                    )
                  : Expanded(
                      child: SmartRefresher(
                        controller: _refreshController,
                        enablePullDown: true,
                        enablePullUp: false,
                        onRefresh: () {
                          event.fetchBranches(context, false);
                          _refreshController.refreshCompleted();
                        },
                        child: SingleChildScrollView(
                          child: Padding(
                            padding: EdgeInsets.symmetric(
                                horizontal: 16.r, vertical: 20.r),
                            child: Column(
                              children: [
                                OrderMap(
                                  colors: colors,
                                  markers: state.shopMarkers,
                                  latLng: const LatLng(
                                    AppConstants.demoLatitude,
                                    AppConstants.demoLongitude,
                                  ),
                                  height: 350,
                                  polylineCoordinates: const [],
                                  isLoading: false,
                                ),
                                ListView.builder(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  itemCount: state.branches.length,
                                  itemBuilder: (context, index) {
                                    return BranchItem(
                                      shop: state.branches[index],
                                      colors: colors,
                                    );
                                  },
                                )
                              ],
                            ),
                          ),
                        ),
                      ),
                    )
            ],
          );
        },
      ),
      floatingButtonLocation: FloatingActionButtonLocation.startFloat,
      floatingButton: (colors) => Padding(
        padding: EdgeInsets.symmetric(horizontal: 16.w),
        child: PopButton(colors: colors),
      ),
    );
  }
}
