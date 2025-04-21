import 'package:auto_route/annotations.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/application/careers/careers_provider.dart';
import 'package:riverpodtemp/presentation/components/buttons/pop_button.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import 'package:riverpodtemp/presentation/components/loading.dart';
import 'package:riverpodtemp/presentation/pages/careers/widgets/careers_detail_body.dart';

@RoutePage()
class CareersDetailPage extends ConsumerStatefulWidget {
  final int? id;

  const CareersDetailPage({this.id, super.key});

  @override
  ConsumerState<CareersDetailPage> createState() => _BlogsDetailPageState();
}

class _BlogsDetailPageState extends ConsumerState<CareersDetailPage> {
  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback(
      (_) {
        ref.read(careersProvider.notifier).careerDetail(id: widget.id);
      },
    );
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(careersProvider);
    return CustomScaffold(
      body: (colors) => state.isLoading
          ? Center(child: Loading())
          : CareersDetailBody(
              model: state.careersDetail,
              colors: colors,
            ),
      floatingButtonLocation: FloatingActionButtonLocation.startFloat,
      floatingButton: (colors) => Padding(
        padding: EdgeInsets.symmetric(horizontal: 16.w),
        child: PopButton(colors: colors),
      ),
    );
  }
}

