import 'package:flutter/material.dart';
import 'package:flutter_remix/flutter_remix.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:photo_view/photo_view.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';

class ImageChatPage extends StatelessWidget {
  final String image;

  const ImageChatPage({super.key, required this.image});

  @override
  Widget build(BuildContext context) {
    return CustomScaffold(
      body: (colors) =>  Column(
        children: [
          SafeArea(
            child: Row(
              children: [
                IconButton(
                    onPressed: () {
                      Navigator.pop(context);
                    },
                    icon: Icon(
                      FlutterRemix.close_circle_fill,
                      color: AppStyle.white,
                      size: 26.r,
                    )),
                const Spacer(),
              ],
            ),
          ),
          32.verticalSpace,
          SizedBox(
            width: double.infinity,
            height: MediaQuery.sizeOf(context).height / 2,
            child: PhotoView(
              imageProvider: NetworkImage(image),
            ),
          ),
        ],
      ),
    );
  }
}
