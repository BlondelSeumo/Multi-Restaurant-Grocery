import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_place/google_place.dart';
import 'package:riverpodtemp/domain/di/dependency_manager.dart';
import 'package:riverpodtemp/presentation/components/buttons/pop_button.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import 'package:riverpodtemp/presentation/components/text_fields/search_text_field.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';

@RoutePage()
class MapSearchPage extends StatefulWidget {
  const MapSearchPage({super.key});

  @override
  State<MapSearchPage> createState() => _MapSearchPageState();
}

class _MapSearchPageState extends State<MapSearchPage> {
  List<AutocompletePrediction> searchResult = [];

  @override
  Widget build(BuildContext context) {
    return CustomScaffold(
      body: (colors) => SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.w),
          child: Column(
            children: [
              16.verticalSpace,
              SearchTextField(
                autofocus: true,
                isBorder: true,
                onChanged: (title) async {
                  final res = await googlePlace.autocomplete.get(title);
                  searchResult = res?.predictions ?? [];
                  setState(() {});
                }, colors: colors,
              ),
              Expanded(
                child: ListView.builder(
                    itemCount: searchResult.length,
                    padding: EdgeInsets.only(bottom: 22.h),
                    itemBuilder: (context, index) {
                      return InkWell(
                        onTap: () {
                          context.maybePop(searchResult[index].placeId);
                        },
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            22.verticalSpace,
                            Text(
                              searchResult[index]
                                      .structuredFormatting
                                      ?.mainText ??
                                  "",
                              style: AppStyle.interNormal(size: 14),
                            ),
                            Text(
                              searchResult[index]
                                      .structuredFormatting
                                      ?.secondaryText ??
                                  "",
                              style: AppStyle.interNormal(size: 14),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const Divider(
                              color: AppStyle.borderColor,
                            ),
                          ],
                        ),
                      );
                    }),
              )
            ],
          ),
        ),
      ),
      floatingButtonLocation: FloatingActionButtonLocation.startFloat,
      floatingButton: (colors) => Padding(
        padding: EdgeInsets.only(left: 16.w),
        child: PopButton(colors: colors),
      ),
    );
  }
}

// import 'package:auto_route/auto_route.dart';
// import 'package:flutter/material.dart';
// import 'package:flutter_screenutil/flutter_screenutil.dart';
// import 'package:google_place/google_place.dart';
// import 'package:riverpodtemp/domain/di/dependency_manager.dart';
// import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
// import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
//
// import '../../components/text_fields/search_text_field.dart';
// import 'package:riverpodtemp/presentation/theme/app_style.dart';
//
// @RoutePage()
// class MapSearchPage extends StatefulWidget {
//   const MapSearchPage({super.key});
//
//   @override
//   State<MapSearchPage> createState() => _MapSearchPageState();
// }
//
// class _MapSearchPageState extends State<MapSearchPage> {
//   List<AutocompletePrediction> searchResult = [];
//
//   @override
//   Widget build(BuildContext context) {
//     return CustomScaffold(
//       body: SafeArea(
//         child: Padding(
//           padding: EdgeInsets.symmetric(horizontal: 16.w),
//           child: Column(
//             children: [
//               16.verticalSpace,
//               SearchTextField(
//                 autofocus: true,
//                 isBorder: true,
//                 hintText: AppHelpers.getTranslation(TrKeys.search),
//
//                 onChanged: (title) async {
//
//                   try{
//                     if(title.isNotEmpty) {
//                       final res = await googlePlace.autocomplete.get(title);
//                     searchResult = res?.predictions ?? [];
//                     // print("list: ${res?.predictions?.join('\n')}");
//                     setState(() {});
//                   }}catch(e){
//                     // print("ERROR $e");
//                   }
//                 },
//               ),
//               Expanded(
//                 child: ListView.builder(
//                     itemCount: searchResult.length,
//                     padding: EdgeInsets.only(bottom: 22.h),
//                     itemBuilder: (context, index) {
//                       return InkWell(
//                         onTap: ()  {
//                           context.maybePop(searchResult[index].placeId);
//
//                         },
//                         child: Column(
//                           crossAxisAlignment: CrossAxisAlignment.start,
//                           children: [
//                             22.verticalSpace,
//                             Text(
//                               searchResult[index]
//                                   .structuredFormatting
//                                   ?.mainText ??
//                                   "",
//                               style: AppStyle.interNormal(size: 14),
//                             ),
//                             Text(
//                               searchResult[index]
//                                   .structuredFormatting
//                                   ?.secondaryText ??
//                                   "",
//                               style: AppStyle.interNormal(size: 14),
//                               maxLines: 2,
//                               overflow: TextOverflow.ellipsis,
//                             ),
//                             const Divider(
//                               color: AppStyle.borderColor,
//                             ),
//                           ],
//                         ),
//                       );
//                     }),
//               )
//             ],
//           ),
//         ),
//       ),
//     );
//   }
// }
